"use client";

import { useState, useCallback, useMemo } from "react";
import { 
  Upload, 
  File, 
  FileText, 
  FileImage, 
  FileAudio, 
  FileVideo, 
  Download, 
  Trash2, 
  Share2, 
  X, 
  Search, 
  Smartphone, 
  Monitor, 
  QrCode, 
  CheckCircle2, 
  WifiIcon,
  MoreVertical,
  Clock,
  Folder
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";

interface SharedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  data: string;
}

export default function FileShareApp() {
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<SharedFile | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <FileImage className="w-6 h-6 text-pink-500" />;
    if (type.startsWith("video/")) return <FileVideo className="w-6 h-6 text-purple-500" />;
    if (type.startsWith("audio/")) return <FileAudio className="w-6 h-6 text-green-500" />;
    if (type.includes("pdf") || type.includes("document")) return <FileText className="w-6 h-6 text-blue-500" />;
    return <File className="w-6 h-6 text-gray-500" />;
  };

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    
    const newFiles: SharedFile[] = [];
    
    Array.from(selectedFiles).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const sharedFile: SharedFile = {
          id: Date.now() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date(),
          data: e.target?.result as string,
        };
        
        setFiles(prev => [...prev, sharedFile]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const deleteFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (selectedFile?.id === id) {
      setSelectedFile(null);
    }
  }, [selectedFile]);

  const downloadFile = useCallback((file: SharedFile) => {
    const link = document.createElement("a");
    link.href = file.data;
    link.download = file.name;
    link.click();
  }, []);

  const shareFile = useCallback((file: SharedFile) => {
    setSelectedFile(file);
    setShowQRModal(true);
  }, []);

  const filteredFiles = useMemo(() => {
    if (!searchQuery) return files;
    return files.filter(f => 
      f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [files, searchQuery]);

  const getLocalIP = () => {
    return window.location.origin;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <WifiIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  局域网文件共享
                </h1>
                <p className="text-xs text-slate-500">快速 · 安全 · 简单</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5">
                <Monitor className="w-4 h-4 text-slate-600" />
                <span className="text-sm text-slate-600">PC端</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-100 rounded-lg px-3 py-1.5">
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-600 font-medium">全平台兼容</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div 
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`mb-8 transition-all duration-300 ${
            isDragging 
              ? "ring-4 ring-blue-400 scale-[1.01]" 
              : ""
          }`}
        >
          <div className="bg-white rounded-2xl shadow-xl border-2 border-dashed border-slate-300 p-8 sm:p-12 text-center hover:border-blue-400 transition-colors">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">上传文件</h2>
            <p className="text-slate-600 mb-6">拖拽文件到此处，或点击选择文件</p>
            <label className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium cursor-pointer hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              <Upload className="w-5 h-5" />
              选择文件
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
            </label>
          </div>
        </div>

        {files.length > 0 && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="搜索文件..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        )}

        {filteredFiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredFiles.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-xl p-4 shadow-lg border border-slate-200 hover:shadow-xl transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      {getFileIcon(file.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 truncate" title={file.name}>
                        {file.name}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">{formatSize(file.size)}</p>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {file.uploadedAt.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => downloadFile(file)}
                      className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      下载
                    </button>
                    <button
                      onClick={() => shareFile(file)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <QrCode className="w-4 h-4" />
                      扫码
                    </button>
                    <button
                      onClick={() => deleteFile(file.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : files.length > 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">未找到匹配的文件</p>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Folder className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">暂无文件</h3>
            <p className="text-slate-500">上传文件后即可在此处管理</p>
          </div>
        )}
      </main>

      <AnimatePresence>
        {showQRModal && selectedFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowQRModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <QrCode className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">扫码下载</h2>
                    <p className="text-sm text-slate-500 truncate max-w-[200px]">
                      {selectedFile.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-8 text-center">
                <div className="bg-white p-4 rounded-xl inline-block shadow-inner">
                  <QRCodeSVG
                    value={getLocalIP()}
                    size={200}
                    level="H"
                    includeMargin
                    fgColor="#1e293b"
                    bgColor="#ffffff"
                  />
                </div>
                <p className="mt-6 text-slate-600">
                  使用手机扫描二维码访问
                </p>
                <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-2">或访问以下地址：</p>
                  <code className="text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg break-all">
                    {getLocalIP()}
                  </code>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-200">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => downloadFile(selectedFile)}
                    className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-4 py-3 rounded-xl font-medium transition-all shadow-sm hover:shadow"
                  >
                    <Download className="w-5 h-5" />
                    直接下载
                  </button>
                  <button
                    onClick={() => setShowQRModal(false)}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    完成
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="bg-white/80 backdrop-blur-xl border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-500 text-sm">
            © 2024 局域网文件共享平台 · 安全高效的跨设备文件传输
          </p>
        </div>
      </footer>
    </div>
  );
}
