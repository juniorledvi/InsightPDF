
import React, { useRef, useEffect, useState } from 'react';
import { AppStatus, ChatMessage, LocatorResult } from '../types';
import { Upload, Send, FileText, Loader2, MapPin, Bot, User, RotateCcw, Zap, BrainCircuit, ChevronDown, Check, Settings, Moon, Sun, CloudLightning } from 'lucide-react';

interface ControlPanelProps {
  onFileUpload: (file: File) => void;
  onSearch: (query: string) => void;
  onViewLocation: (result: LocatorResult) => void;
  onClearChat: () => void;
  status: AppStatus;
  messages: ChatMessage[];
  currentFile: File | null;
  selectedModel: string;
  onModelSelect: (model: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  useFilesApi: boolean;
  onToggleFilesApi: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  onFileUpload, 
  onSearch, 
  onViewLocation,
  onClearChat,
  status, 
  messages, 
  currentFile,
  selectedModel,
  onModelSelect,
  theme,
  onToggleTheme,
  useFilesApi,
  onToggleFilesApi
}) => {
  const [query, setQuery] = React.useState('');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && currentFile && status !== AppStatus.SEARCHING) {
      onSearch(query);
      set