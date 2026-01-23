import React, { useRef, useEffect, useState } from 'react';
import { AppStatus, ChatMessage, LocatorResult } from '../types';
import { Upload, Send, FileText, Loader2, MapPin, Bot, User, RotateCcw, Zap, BrainCircuit, ChevronDown, Check, Settings, Moon, Sun, CloudLightning, Github, Star, Key, Globe } from 'lucide-react';
import { storage } from '../services/storageService';
import Toggle from './Toggle';
import ReactMarkdown from 'react-markdown';

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
  const [starCount, setStarCount] = useState<number | null>(null);
  const [customConfig, setCustomConfig] = useState<{enabled: boolean, apiKey: string, baseUrl: string}>({
    enabled: false, apiKey: '', baseUrl: ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  // Load Custom Config
  useEffect(() => {
    setCustomConfig(storage.getCustomConfig());
  }, []);

  const handleCustomConfigChange = (key: keyof typeof customConfig, value: any) => {
    const newConfig = { ...customConfig, [key]: value };
    setCustomConfig(newConfig);
    storage.saveCustomConfig(newConfig);
  };

  // Fetch GitHub stars
  useEffect(() => {
    fetch('https://api.github.com/repos/yeahhe365/InsightPDF')
      .then(response => {
        if (response.ok) return response.json();
        throw new Error('Network response was not ok');
      })
      .then(data => setStarCount(data.stargazers_count))
      .catch(error => console.log('Failed to fetch GitHub stars:', error));
  }, []);

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
      setQuery('');
    }
  };

  const isLoading = status === AppStatus.PROCESSING_FILE || status === AppStatus.SEARCHING;
  const isUploading = status === AppStatus.PROCESSING_FILE;

  const models = [
    { id: 'gemini-3-flash-preview', name: '3 Flash', icon: Zap },
    { id: 'gemini-3-pro-preview', name: '3 Pro', icon: BrainCircuit },
  ];
  
  const activeModel = models.find(m => m.id === selectedModel) || models[0];

  return (
    <div className="w-full h-full bg-white dark:bg-gray-900 flex flex-col z-30 shadow-lg relative transition-colors duration-300">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100 tracking-tight">
              InsightPDF
            </h1>
            
            {/* Model Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                  onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-md transition-all text-xs font-medium text-gray-700 dark:text-gray-200 group"
              >
                  <activeModel.icon className="w-3.5 h-3.5 text-indigo-500 group-hover:text-indigo-600" />
                  <span className="group-hover:text-gray-900 dark:group-hover:text-white">{activeModel.name}</span>
                  <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isModelDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-left">
                      <div className="px-2 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Select Model</div>
                       {models.map((model) => (
                           <button
                              key={model.id}
                              onClick={() => {
                                  onModelSelect(model.id);
                                  setIsModelDropdownOpen(false);
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                  selectedModel === model.id 
                                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' 
                                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                              }`}
                           >
                              <span className="flex-1 text-left">{model.name}</span>
                              {selectedModel === model.id && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                           </button>
                       ))}
                  </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             {/* Settings Button */}
             <div className="relative" ref={settingsRef}>
                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>
                {isSettingsOpen && (
                  <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right max-h-[85vh] overflow-y-auto">
                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">Settings</div>
                    
                    {/* Theme Toggle */}
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-750 rounded-lg mb-2">
                      <span className="text-xs text-gray-600 dark:text-gray-300">Theme</span>
                      <button 
                        onClick={onToggleTheme}
                        className="flex items-center gap-1.5 p-1 bg-white dark:bg-gray-600 rounded shadow-sm border border-gray-200 dark:border-gray-500 min-w-[60px] justify-center"
                        title="Toggle Theme"
                      >
                         {theme === 'light' ? (
                           <>
                             <Sun className="w-3.5 h-3.5 text-orange-500" />
                             <span className="text-[10px] font-medium text-gray-600">Light</span>
                           </>
                         ) : (
                           <>
                             <Moon className="w-3.5 h-3.5 text-indigo-400" />
                             <span className="text-[10px] font-medium text-gray-200">Dark</span>
                           </>
                         )}
                      </button>
                    </div>

                    {/* Files API Toggle */}
                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-750 rounded-lg mb-3">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">Use Files API</span>
                        <span className="text-[9px] text-gray-400 dark:text-gray-500">Faster for large PDFs</span>
                      </div>
                      <Toggle 
                        checked={useFilesApi} 
                        onChange={onToggleFilesApi} 
                        label="Toggle Files API"
                      />
                    </div>

                    {/* Custom API Config */}
                    <div className="p-2 bg-gray-50 dark:bg-gray-750 rounded-lg mb-3 space-y-2">
                       <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">Custom API</span>
                          <Toggle 
                            checked={customConfig.enabled} 
                            onChange={() => handleCustomConfigChange('enabled', !customConfig.enabled)} 
                            label="Toggle Custom API"
                          />
                       </div>
                       
                       {customConfig.enabled && (
                         <div className="space-y-2 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                            <div className="space-y-1">
                              <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">API Key</label>
                              <div className="relative">
                                <Key className="absolute left-2 top-1.5 w-3 h-3 text-gray-400" />
                                <input 
                                  type="password"
                                  value={customConfig.apiKey}
                                  onChange={(e) => handleCustomConfigChange('apiKey', e.target.value)}
                                  placeholder="sk-..."
                                  className="w-full pl-7 pr-2 py-1.5 text-xs bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded focus:border-indigo-500 outline-none transition-colors dark:text-gray-100"
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Base URL</label>
                              <div className="relative">
                                <Globe className="absolute left-2 top-1.5 w-3 h-3 text-gray-400" />
                                <input 
                                  type="text"
                                  value={customConfig.baseUrl}
                                  onChange={(e) => handleCustomConfigChange('baseUrl', e.target.value)}
                                  placeholder="https://..."
                                  className="w-full pl-7 pr-2 py-1.5 text-xs bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded focus:border-indigo-500 outline-none transition-colors dark:text-gray-100"
                                />
                              </div>
                            </div>
                         </div>
                       )}
                    </div>

                    {/* GitHub Link */}
                    <a
                      href="https://github.com/yeahhe365/InsightPDF"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-750 rounded-lg mb-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group decoration-0"
                    >
                      <div className="flex items-center gap-2">
                        <Github className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Open Source</span>
                      </div>
                      <div className="flex items-center gap-1 bg-white dark:bg-gray-600 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-500 shadow-sm">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-[10px] font-medium text-gray-600 dark:text-gray-200">
                          {starCount !== null ? starCount.toLocaleString() : '...'}
                        </span>
                      </div>
                    </a>

                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-[10px] text-gray-400">
                      <span>InsightPDF</span>
                      <span>v1.0.0</span>
                    </div>
                  </div>
                )}
             </div>

             {messages.length > 0 && (
              <button 
                onClick={onClearChat}
                className="p-1.5 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                title="Reset Chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            <input
              type="file"
              accept="application/pdf"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 border border-indigo-100 dark:border-indigo-900/30"
            >
              <Upload className="w-3 h-3" />
              {currentFile ? 'Change' : 'Upload'}
            </button>
          </div>
        </div>
      </div>

      {/* File Indicator */}
      {currentFile && (
        <div className={`px-4 py-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2 transition-colors ${isUploading ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
          {isUploading ? (
             <Loader2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 animate-spin" />
          ) : useFilesApi ? (
            <CloudLightning className="w-3.5 h-3.5 text-amber-500" title="Using Files API" />
          ) : (
             <FileText className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
          )}
          
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <span className={`text-xs font-medium truncate flex-1 ${isUploading ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-200'}`}>
                {currentFile.name}
            </span>
            {isUploading && (
                <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded-full font-medium animate-pulse whitespace-nowrap">
                    Uploading...
                </span>
            )}
          </div>
          
          <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
              {(currentFile.size / 1024 / 1024).toFixed(1)}MB
          </span>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4 bg-gray-50 dark:bg-gray-950 relative">
        {!currentFile && messages.length === 0 && (
           <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 opacity-60">
             <Upload className="w-12 h-12 mb-2" />
             <p className="text-sm">Upload a PDF to start chatting</p>
           </div>
        )}

        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'ai' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
              {msg.role === 'ai' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            
            <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div 
                className={`p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md whitespace-pre-wrap' 
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-tl-sm shadow-sm'
                }`}
              >
                {msg.role === 'ai' ? (
                  <ReactMarkdown
                    className="space-y-2"
                    components={{
                      a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline break-words" />,
                      p: ({node, ...props}) => <p {...props} className="mb-2 last:mb-0 leading-relaxed" />,
                      ul: ({node, ...props}) => <ul {...props} className="list-disc pl-5 mb-2 space-y-1" />,
                      ol: ({node, ...props}) => <ol {...props} className="list-decimal pl-5 mb-2 space-y-1" />,
                      li: ({node, ...props}) => <li {...props} className="pl-1" />,
                      strong: ({node, ...props}) => <strong {...props} className="font-semibold" />,
                      pre: ({node, ...props}) => <pre {...props} className="bg-gray-800 dark:bg-gray-900/50 text-gray-100 p-3 rounded-lg overflow-x-auto my-2 text-xs font-mono border border-gray-700" />,
                      code: ({node, className, children, ...props}) => {
                        const isBlock = /language-(\w+)/.exec(className || '');
                        if (isBlock) {
                             return <code {...props} className={`font-mono text-xs ${className}`}>{children}</code>
                        }
                        return <code {...props} className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-xs font-mono text-pink-600 dark:text-pink-400 break-all">{children}</code>
                      }
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>

              {/* Location Card if AI found something */}
              {msg.role === 'ai' && msg.locationData?.pageNumber && (
                <button
                  onClick={() => onViewLocation(msg.locationData!)}
                  className="mt-2 bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-900/50 rounded-xl p-3 shadow-sm hover:shadow-md transition-all text-left group w-full max-w-[280px]"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 uppercase tracking-wider">
                      <MapPin className="w-3 h-3" /> Found on Page {msg.locationData.pageNumber}
                    </span>
                    <span className="text-xs text-indigo-400 dark:text-indigo-500 group-hover:translate-x-1 transition-transform">View &rarr;</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 italic truncate border-l-2 border-indigo-100 dark:border-indigo-800 pl-2">
                    "{msg.locationData.snippet}"
                  </div>
                </button>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
               <Bot className="w-5 h-5" />
             </div>
             <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
               <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
               <span className="text-sm text-gray-500 dark:text-gray-300">
                  {status === AppStatus.PROCESSING_FILE ? "Uploading to Gemini..." : "Thinking..."}
               </span>
             </div>
          </div>
        )}
        
        {status === AppStatus.ERROR && (
           <div className="flex justify-center">
             <span className="text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">Error generating response. Please try again.</span>
           </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-2 pt-0 pointer-events-none">
        <form onSubmit={handleSubmit} className="pointer-events-auto relative flex items-center gap-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-indigo-100/50 dark:shadow-none border border-gray-100 dark:border-gray-700 p-1.5 transition-all focus-within:shadow-2xl focus-within:border-indigo-100 dark:focus-within:border-indigo-900 focus-within:ring-4 focus-within:ring-indigo-500/5 dark:focus-within:ring-indigo-500/20">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={currentFile ? "Ask about the PDF..." : "Upload a file first"}
            disabled={!currentFile || isLoading}
            className="flex-1 p-3 bg-transparent border-none focus:ring-0 outline-none text-sm text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!currentFile || isLoading || !query.trim()}
            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-300 dark:disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ControlPanel;