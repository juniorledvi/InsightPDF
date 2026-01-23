import { useState, useEffect, useRef, useCallback } from 'react';
import { AppStatus, ChatMessage, LocatorResult } from '../types';
import { storage } from '../services/storageService';

export const useChatSession = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeResult, setActiveResult] = useState<LocatorResult | null>(null);
  const [isChatHydrated, setIsChatHydrated] = useState(false);
  
  const initialLoadRef = useRef(true);

  // Hydrate Chat Session
  useEffect(() => {
    const loadChatState = async () => {
      try {
        const savedMessages = storage.getMessages();
        const savedActiveResult = storage.getActiveResult();
        
        setMessages(savedMessages);
        setActiveResult(savedActiveResult);

        // If we restored messages, update status to show content
        if (savedMessages.length > 0) {
          setStatus(AppStatus.SUCCESS);
        }
      } catch (error) {
        console.error("Failed to hydrate chat session:", error);
      } finally {
        setIsChatHydrated(true);
        setTimeout(() => { initialLoadRef.current = false; }, 100);
      }
    };
    loadChatState();
  }, []);

  // Persist Messages
  useEffect(() => {
    if (!initialLoadRef.current && isChatHydrated) {
      storage.saveMessages(messages);
    }
  }, [messages, isChatHydrated]);

  // Persist Active Result
  useEffect(() => {
    if (!initialLoadRef.current && isChatHydrated) {
      storage.saveActiveResult(activeResult);
    }
  }, [activeResult, isChatHydrated]);

  const clearSession = useCallback(() => {
    setMessages([]);
    setActiveResult(null);
    setStatus(AppStatus.IDLE);
    storage.clearChatSession();
  }, []);

  return {
    status,
    setStatus,
    messages,
    setMessages,
    activeResult,
    setActiveResult,
    clearSession,
    isChatHydrated
  };
};