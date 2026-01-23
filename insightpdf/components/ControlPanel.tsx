import React, { useRef, useEffect, useState } from 'react';
import { AppStatus, ChatMessage, LocatorResult } from '../types';
import { Upload, Send, FileText, Loader2, MapPin, Bot, User, RotateCcw, Zap, BrainCircuit, ChevronDown, Check, Settings, Moon, Sun, CloudLightning, Github, Star, Key, Globe, Copy, X } from 'lucide-react';
import { storage } from '../services/storageService';
import Toggle from './Toggle';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

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
  errorMessage: string | null;
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
  onToggleFilesApi,
  errorMessage
}) => {
  const [query, setQuery] = React.useState('');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [starCount, setStarCount] = useState<number | null>(null);
  const [customConfig, setCustomConfig] = useState<{enabled: boolean, apiKey: string, baseUrl: string}>({
    enabled: false, apiKey: '', baseUrl: ''
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // settingsRef will now be attached to the modal content
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
      // For settings modal, we handle "click outside" to close
      if (isSettingsOpen && settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        // Ensure we aren't clicking the settings trigger button itself (although the overlay usually covers it)
        setIsSettingsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSettingsOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  const isLoading = status === AppStatus.PROCESSING_FILE || status === AppStatus.SEARCHING;
  const isUploading = status === AppStatus.PROCESSING_FILE;
  const isSearching = status === AppStatus.SEARCHING;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Allow input during upload, but prevent submit until upload is complete
    if (query.trim() && currentFile && !isSearching && !isUploading) {
      onSearch(query);
      setQuery('');
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const models = [
    { id: 'gemini-3-flash-preview', name: '3 Flash', icon: Zap },
    { id: 'gemini-3-pro-preview', name: '3 Pro', icon: BrainCircuit },
  ];
  
  const activeModel = models.find(m => m.id === selectedModel) || models[0];

  return (
    <>
      {/* Settings Modal - Rendered outside main flow via fixed positioning */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div 
            ref={settingsRef}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">设置</h2>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Theme Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">外观主题</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">切换深色或浅色模式</span>
                </div>
                <button 
                  onClick={onToggleTheme}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                    {theme === 'light' ? (
                      <>
                        <Sun className="w-4 h-4 text-amber-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-200">浅色</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-200">深色</span>
                      </>
                    )}
                </button>
              </div>

              {/* Files API Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">使用 Files API</span>
                    <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">推荐</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">上传大文件时更稳定，适合长文档</span>
                </div>
                <Toggle 
                  checked={useFilesApi} 
                  onChange={onToggleFilesApi} 
                  label="切换 Files API"
                />
              </div>

              <hr className="border-gray-100 dark:border-gray-700" />

              {/* Custom API Config */}
              <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">自定义 API</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">使用自己的 Gemini API Key</span>
                    </div>
                    <Toggle 
                      checked={customConfig.enabled} 
                      onChange={() => handleCustomConfigChange('enabled', !customConfig.enabled)} 
                      label="切换自定义 API"
                    />
                  </div>
                  
                  {customConfig.enabled && (
                    <div className="space-y-3 pt-2 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">API 密钥 (API Key)</label>
                        <div className="relative">
                          <Key className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                          <input 
                            type="password"
                            value={customConfig.apiKey}
                            onChange={(e) => handleCustomConfigChange('apiKey', e.target.value)}
                            placeholder="sk-..."
                            className="w-full pl-10 pr-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-gray-100"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Base URL (例如 .../v1beta)</label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                          <input 
                            type="text"
                            value={customConfig.baseUrl}
                            onChange={(e) => handleCustomConfigChange('baseUrl', e.target.value)}
                            placeholder="https://generativelanguage.googleapis.com/v1beta"
                            className="w-full pl-10 pr-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-gray-100"
                          />
                        </div>
                      </div>
                    </div>
                  )}
              </div>

              <hr className="border-gray-100 dark:border-gray-700" />

              {/* About / Github */}
              <a
                href="https://github.com/yeahhe365/InsightPDF"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group decoration-0"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                     <Github className="w-5 h-5 text-gray-800 dark:text-gray-200" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">InsightPDF 开源仓库</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">给项目点个 Star 支持一下</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 px-2.5 py-1 rounded-md border border-gray-200 dark:border-gray-600 shadow-sm">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                    {starCount !== null ? starCount.toLocaleString() : '...'}
                  </span>
                </div>
              </a>

              <div className="flex justify-center pt-2">
                 <p className="text-xs text-gray-400 dark:text-gray-500">Version 1.0.1 • Made with Gemini 3 Flash</p>
              </div>

            </div>
          </div>
        </div>
      )}

      <div className="w-full h-full bg-white dark:bg-gray-900 flex flex-col z-30 shadow-lg relative transition-colors duration-300">
        {/* Header */}
        <div className="relative p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 z-20">
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
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-left max-h-[60vh] overflow-y-auto">
                        <div className="px-2 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">选择模型</div>
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
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                title="设置"
              >
                <Settings className="w-4 h-4" />
              </button>

              {messages.length > 0 && (
                <button 
                  onClick={onClearChat}
                  className="p-1.5 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                  title="重置对话"
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
                {currentFile ? '更换' : '上传'}
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
              <CloudLightning className="w-3.5 h-3.5 text-amber-500" title="使用 Files API" />
            ) : (
              <FileText className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
            )}
            
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <span className={`text-xs font-medium truncate flex-1 ${isUploading ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-200'}`}>
                  {currentFile.name}
              </span>
              {isUploading && (
                  <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded-full font-medium animate-pulse whitespace-nowrap">
                      上传中...
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
              <p className="text-sm">上传 PDF 以开始对话</p>
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
                  className={`p-3 rounded-2xl text-sm leading-relaxed relative group ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md whitespace-pre-wrap pr-10' 
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-tl-sm shadow-sm pr-10'
                  }`}
                >
                  <button
                    onClick={() => copyToClipboard(msg.text, msg.id)}
                    className={`absolute top-2 right-2 p-1.5 rounded-md transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 ${
                      msg.role === 'user'
                        ? 'text-white/70 hover:text-white hover:bg-white/10'
                        : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    title="复制消息"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {msg.role === 'ai' ? (
                    <ReactMarkdown
                      className="space-y-2"
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
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
                        <MapPin className="w-3 h-3" /> 发现于第 {msg.locationData.pageNumber} 页
                      </span>
                      <span className="text-xs text-indigo-400 dark:text-indigo-500 group-hover:translate-x-1 transition-transform">查看 &rarr;</span>
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
                    {status === AppStatus.PROCESSING_FILE ? "正在上传至 Gemini..." : "思考中..."}
                </span>
              </div>
            </div>
          )}
          
          {status === AppStatus.ERROR && (
            <div className="flex flex-col items-center justify-center gap-1.5 py-4 animate-in fade-in slide-in-from-bottom-2 px-4">
              <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2.5 py-1 rounded-md border border-red-100 dark:border-red-900/30 flex items-center gap-1.5">
                 <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  生成回复出错
              </span>
              {errorMessage && (
                 <div className="text-xs text-red-500 dark:text-red-400 text-center break-words w-full font-mono bg-red-50/50 dark:bg-red-900/10 p-2 rounded border border-red-100 dark:border-red-900/20">
                    {errorMessage}
                 </div>
              )}
              <button 
                onClick={() => {
                   // Optional: add retry logic via prop or just re-submit manually
                   // Since we don't have retry prop, user has to re-submit
                }}
                className="text-[10px] text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 mt-1"
              >
                请尝试更换模型或重新发送
              </button>
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
              placeholder={currentFile ? "询问关于 PDF 的内容..." : "请先上传文件"}
              disabled={!currentFile || isSearching}
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
    </>
  );
};

export default ControlPanel;