import { useState, useEffect, useCallback } from 'react';
import { storage } from '../services/storageService';

export const useSettings = () => {
  const [model, setModel] = useState<string>('gemini-3-flash-preview');
  const [useFilesApi, setUseFilesApi] = useState<boolean>(true);
  const [isSettingsHydrated, setIsSettingsHydrated] = useState(false);

  useEffect(() => {
    const savedModel = storage.getModel('gemini-3-flash-preview');
    const savedUseFilesApi = storage.getUseFilesApi(true);
    setModel(savedModel);
    setUseFilesApi(savedUseFilesApi);
    setIsSettingsHydrated(true);
  }, []);

  useEffect(() => {
    if (isSettingsHydrated) {
      storage.saveModel(model);
    }
  }, [model, isSettingsHydrated]);

  useEffect(() => {
    if (isSettingsHydrated) {
      storage.saveUseFilesApi(useFilesApi);
    }
  }, [useFilesApi, isSettingsHydrated]);

  const toggleFilesApi = useCallback(() => {
    setUseFilesApi(prev => !prev);
  }, []);

  return {
    model,
    setModel,
    useFilesApi,
    toggleFilesApi,
    isSettingsHydrated
  };
};