import { useCallback, useEffect } from 'react';
import { AppStatus, ChatMessage, LocatorResult } from '../types';
import { fileToGenerativePart, chatWithPdf, uploadFileToGemini } from '../services/geminiService';
import { storage } from '../services/storageService';
import { useSettings } from './useSettings';
import { useFileHandler } from './useFileHandler';
import { useChatSession } from './useChatSession';

export const useChatController = () => {
  // Use modular hooks
  const { 
    model, 
    setModel, 
    useFilesApi, 
    toggleFilesApi, 
    isSettingsHydrated 
  } = useSettings();

  const { 
    file, 
    setFile, 
    saveFile, 
    uploadedFileUri, 
    setUploadedFileUri, 
    isFileHydrated 
  } = useFileHandler();

  const { 
    status, 
    setStatus, 
    messages, 
    setMessages, 
    activeResult, 
    setActiveResult, 
    errorMessage,
    setErrorMessage,
    clearSession, 
    isChatHydrated 
  } = useChatSession();

  const isHydrated = isSettingsHydrated && isFileHydrated && isChatHydrated;

  // Sync initial status if file exists but no messages (e.g., cleared chat but kept file)
  useEffect(() => {
    if (isHydrated && file && status === AppStatus.IDLE && messages.length === 0) {
      // Keep IDLE or set to SUCCESS if you want to show the viewer immediately?
      // Currently, if there is a file, the viewer renders. 
      // If we reloaded the page with a file but no messages, IDLE is appropriate.
      // If we reloaded with messages, useChatSession sets SUCCESS.
    }
  }, [isHydrated, file, status, messages.length]);

  const handleFileUpload = useCallback(async (uploadedFile: File) => {
    // 1. Reset Chat Session
    clearSession();
    
    // 2. Save File State (IDB)
    try {
      await saveFile(uploadedFile);
    } catch (err) {
      console.error("Failed to save file to DB", err);
    }

    // 3. Clear old URI since we have a new file
    setUploadedFileUri(null);
    setErrorMessage(null);

    // 4. Handle Upload if using Files API
    if (useFilesApi) {
      setStatus(AppStatus.PROCESSING_FILE);
      try {
        const uri = await uploadFileToGemini(uploadedFile);
        setUploadedFileUri(uri);
        setStatus(AppStatus.IDLE);
      } catch (error: any) {
        console.error("File upload failed:", error);
        setErrorMessage(error.message || "File upload failed.");
        setStatus(AppStatus.ERROR);
      }
    } else {
      setStatus(AppStatus.IDLE);
    }
  }, [useFilesApi, clearSession, saveFile, setStatus, setUploadedFileUri, setErrorMessage]);

  const handleClearChat = useCallback(() => {
    // Just clear the conversation, keep the file
    clearSession();
    // Re-set status to IDLE is handled by clearSession, but strictly speaking 
    // if a file is present we might want to ensure we don't look "empty"
    // However, AppStatus.IDLE with a file present is a valid state.
  }, [clearSession]);

  const handleViewLocation = useCallback((result: LocatorResult) => {
    setActiveResult({ ...result });
  }, [setActiveResult]);

  const handleSearch = useCallback(async (query: string) => {
    if (!file) return;

    setErrorMessage(null);

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
          setStatus(AppStatus.SEARCHING); // Restore searching status
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
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "An error occurred while generating content.");
      setStatus(AppStatus.ERROR);
    }
  }, [file, model, useFilesApi, uploadedFileUri, setMessages, setStatus, setActiveResult, setUploadedFileUri, setErrorMessage]);

  return {
    file,
    status,
    messages,
    activeResult,
    model,
    useFilesApi,
    errorMessage,
    setModel,
    handleFileUpload,
    handleClearChat,
    handleSearch,
    handleViewLocation,
    toggleFilesApi,
    isHydrated
  };
};