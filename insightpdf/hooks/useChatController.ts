import { useState, useCallback, useEffect, useRef } from 'react';
import { AppStatus, ChatMessage, LocatorResult } from '../types';
import { fileToGenerativePart, chatWithPdf, uploadFileToGemini } from '../services/geminiService';
import { saveFileToDB, getFileFromDB, storage } from '../services/storageService';

export const useChatController = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeResult, setActiveResult] = useState<LocatorResult | null>(null);
  const [model, setModel] = useState<string>('gemini-3-flash-preview');
  const [useFilesApi, setUseFilesApi] = useState<boolean>(true);
  const [uploadedFileUri, setUploadedFileUri] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Avoid saving during hydration
  const initialLoadRef = useRef(true);

  // --- Hydration (Load from Storage) ---
  useEffect(() => {
    const loadState = async () => {
      try {
        // Load Settings
        const savedModel = storage.getModel('gemini-3-flash-preview');
        const savedUseFilesApi = storage.getUseFilesApi(true);
        setModel(savedModel);
        setUseFilesApi(savedUseFilesApi);

        // Load Metadata
        const savedMessages = storage.getMessages();
        const savedActiveResult = storage.getActiveResult();
        const savedUri = storage.getUploadedUri();

        setMessages(savedMessages);
        setActiveResult(savedActiveResult);
        setUploadedFileUri(savedUri);

        // Load File from IndexedDB
        const savedFile = await getFileFromDB();
        if (savedFile) {
          setFile(savedFile);
        }

        if (savedMessages.length > 0 || savedFile) {
          // If we restored state, ensure we aren't stuck in a loading state
          setStatus(AppStatus.SUCCESS);
        }
      } catch (error) {
        console.error("Failed to hydrate state:", error);
      } finally {
        setIsHydrated(true);
        // Small delay to ensure the initial render doesn't trigger save effects immediately with empty state if anything was async
        setTimeout(() => { initialLoadRef.current = false; }, 100);
      }
    };

    loadState();
  }, []);

  // --- Persistence Effects ---

  // Save Messages
  useEffect(() => {
    if (!initialLoadRef.current && isHydrated) {
      storage.saveMessages(messages);
    }
  }, [messages, isHydrated]);

  // Save Active Result
  useEffect(() => {
    if (!initialLoadRef.current && isHydrated) {
      storage.saveActiveResult(activeResult);
    }
  }, [activeResult, isHydrated]);

  // Save Model
  useEffect(() => {
    if (isHydrated) {
      storage.saveModel(model);
    }
  }, [model, isHydrated]);

  // Save UseFilesApi
  useEffect(() => {
    if (isHydrated) {
      storage.saveUseFilesApi(useFilesApi);
    }
  }, [useFilesApi, isHydrated]);

  // Save Uploaded URI
  useEffect(() => {
    if (!initialLoadRef.current && isHydrated) {
      storage.saveUploadedUri(uploadedFileUri);
    }
  }, [uploadedFileUri, isHydrated]);


  // --- Handlers ---

  const toggleFilesApi = useCallback(() => {
    setUseFilesApi(prev => !prev);
  }, []);

  const handleFileUpload = useCallback(async (uploadedFile: File) => {
    setFile(uploadedFile);
    setUploadedFileUri(null); 
    setMessages([]); 
    setActiveResult(null);
    
    // Clear old data from storage
    storage.clearAllMetadata();
    
    // Save new file to IDB
    saveFileToDB(uploadedFile).catch(err => console.error("Failed to save file to DB", err));
    
    if (useFilesApi) {
      setStatus(AppStatus.PROCESSING_FILE);
      try {
        const uri = await uploadFileToGemini(uploadedFile);
        setUploadedFileUri(uri);
        setStatus(AppStatus.IDLE);
      } catch (error) {
        console.error("File upload failed:", error);
        setStatus(AppStatus.ERROR);
      }
    } else {
      setStatus(AppStatus.IDLE);
    }
  }, [useFilesApi]);

  const handleClearChat = useCallback(() => {
    setMessages([]);
    setActiveResult(null);
    setStatus(AppStatus.IDLE);
    // Note: We deliberately do NOT clear the file, uploaded URI, or IDB entry here.
    // The user just wants to restart the conversation with the same file.

    // Clear Storage (Chat only)
    storage.clearChatSession();
  }, []);

  const handleViewLocation = useCallback((result: LocatorResult) => {
    // Force reference update to ensure PdfViewer effect triggers even if clicking the same location
    setActiveResult({ ...result });
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    if (!file) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: query,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setStatus(AppStatus.SEARCHING);

    try {
      let filePart;

      if (useFilesApi) {
        let currentUri = uploadedFileUri;
        
        // Fallback: If not uploaded yet (e.g. toggled setting on after upload), upload now
        if (!currentUri) {
          setStatus(AppStatus.PROCESSING_FILE);
          currentUri = await uploadFileToGemini(file);
          setUploadedFileUri(currentUri);
          setStatus(AppStatus.SEARCHING);
        }

        filePart = {
          fileData: {
            mimeType: file.type,
            fileUri: currentUri
          }
        };
      } else {
        // Use inline base64
        filePart = await fileToGenerativePart(file);
      }

      // Pass the selected model to the service
      const result = await chatWithPdf(filePart, query, model);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: result.answer,
        locationData: result,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMsg]);
      
      // If location found, auto-select it
      if (result.pageNumber) {
        setActiveResult(result);
      }
      
      setStatus(AppStatus.SUCCESS);
    } catch (error) {
      console.error(error);
      setStatus(AppStatus.ERROR);
    }
  }, [file, model, useFilesApi, uploadedFileUri]);

  return {
    file,
    status,
    messages,
    activeResult,
    model,
    useFilesApi,
    setModel,
    handleFileUpload,
    handleClearChat,
    handleSearch,
    handleViewLocation,
    toggleFilesApi,
    isHydrated // Exposed for UI loading states if needed
  };
};