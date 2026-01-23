import { useState, useEffect, useRef } from 'react';
import { storage, getFileFromDB, saveFileToDB } from '../services/storageService';

export const useFileHandler = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFileUri, setUploadedFileUri] = useState<string | null>(null);
  const [isFileHydrated, setIsFileHydrated] = useState(false);
  
  // Use a ref to track if we are past the initial load to avoid overwriting storage during hydration
  const initialLoadRef = useRef(true);

  // Hydrate File and URI
  useEffect(() => {
    const loadFileState = async () => {
      try {
        const savedUri = storage.getUploadedUri();
        setUploadedFileUri(savedUri);

        const savedFile = await getFileFromDB();
        if (savedFile) {
          setFile(savedFile);
        }
      } catch (error) {
        console.error("Failed to hydrate file state:", error);
      } finally {
        setIsFileHydrated(true);
        setTimeout(() => { initialLoadRef.current = false; }, 100);
      }
    };
    loadFileState();
  }, []);

  // Persist Uploaded URI
  useEffect(() => {
    if (!initialLoadRef.current && isFileHydrated) {
      storage.saveUploadedUri(uploadedFileUri);
    }
  }, [uploadedFileUri, isFileHydrated]);

  const saveFile = async (newFile: File) => {
    setFile(newFile);
    await saveFileToDB(newFile);
  };

  return {
    file,
    setFile,
    saveFile,
    uploadedFileUri,
    setUploadedFileUri,
    isFileHydrated
  };
};