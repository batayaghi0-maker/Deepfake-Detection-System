/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Shield, 
  Upload, 
  FileVideo, 
  FileAudio, 
  FileImage,
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Activity,
  Search,
  Lock,
  Eye,
  Zap,
  History,
  Trash2,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeMedia, AnalysisResult } from './services/gemini';
import { cn } from './lib/utils';

interface HistoryItem {
  id: string;
  fileName: string;
  fileType: string;
  timestamp: number;
  result: AnalysisResult;
}

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('deepguard_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Save history to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem('deepguard_history', JSON.stringify(history));
  }, [history]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setResult(null);
      setError(null);
    }
  }, []);

  // @ts-ignore - Dropzone types mismatch in this environment
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': [],
      'audio/*': [],
      'image/*': []
    },
    multiple: false
  });

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    setError(null);
    try {
      const analysisResult = await analyzeMedia(file);
      setResult(analysisResult);
      
      // Add to history
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        fileName: file.name,
        fileType: file.type,
        timestamp: Date.now(),
        result: analysisResult
      };
      setHistory(prev => [newItem, ...prev].slice(0, 10)); // Keep last 10
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setAnalyzing(false);
    }
  };

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear your scan history?')) {
      setHistory([]);
    }
  };

  const loadFromHistory = (item: HistoryItem) => {
    setResult(item.result);
    setFile(null); // Clear current file selection to show result
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#E4E4E7] font-sans selection:bg-orange-500/30">
      {/* Grid Background Effect */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Header */}
      <header className="relative border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
              <Shield className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold tracking-tighter uppercase italic">DeepGuard</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium uppercase tracking-widest opacity-50">
            <a href="#" className="hover:opacity-100 transition-opacity">Forensics</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Identity Protection</a>
            <a href="#" className="hover:opacity-100 transition-opacity">API Docs</a>
          </nav>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-tighter">System Online</span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-5 space-y-8">
            <section>
              <h1 className="text-5xl font-bold tracking-tighter mb-4 leading-none">
                DIGITAL <span className="text-orange-500 italic">INTEGRITY</span> ANALYSIS
              </h1>
              <p className="text-lg text-white/40 leading-relaxed">
                Advanced forensic tool for detecting deepfakes, voice clones, and AI-generated media. Protect your digital identity with neural analysis.
              </p>
            </section>

            <div className="space-y-4">
              <div 
                {...getRootProps()} 
                className={cn(
                  "relative group cursor-pointer border-2 border-dashed rounded-2xl p-12 transition-all duration-300 flex flex-col items-center justify-center gap-4",
                  isDragActive ? "border-orange-500 bg-orange-500/5" : "border-white/10 hover:border-white/20 hover:bg-white/5",
                  file ? "border-solid border-white/20" : ""
                )}
              >
                <input {...getInputProps()} />
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {file ? (
                    file.type.startsWith('video') ? <FileVideo className="w-8 h-8 text-orange-500" /> : 
                    file.type.startsWith('audio') ? <FileAudio className="w-8 h-8 text-orange-500" /> :
                    <FileImage className="w-8 h-8 text-orange-500" />
                  ) : (
                    <Upload className="w-8 h-8 text-white/20" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">
                    {file ? file.name : "Drop media file here"}
                  </p>
                  <p className="text-xs text-white/40 mt-1">
                    MP4, MOV, MP3, WAV, JPG (Max 50MB)
                  </p>
                </div>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={!file || analyzing}
                className={cn(
                  "w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3",
                  !file || analyzing 
                    ? "bg-white/5 text-white/20 cursor-not-allowed" 
                    : "bg-orange-500 text-black hover:bg-orange-400 active:scale-[0.98]"
                )}
              >
                {analyzing ? (
                  <>
                    <Activity className="w-5 h-5 animate-spin" />
                    Analyzing Neural Patterns...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Start Forensic Scan
                  </>
                )}
              </button>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Eye, label: "Visual Artifacts", desc: "Pixel-level consistency" },
                { icon: Activity, label: "Audio Biometrics", desc: "Voice frequency analysis" },
                { icon: Search, label: "Metadata Scan", desc: "Origin & edit history" },
                { icon: Lock, label: "Secure Vault", desc: "Encrypted processing" },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <item.icon className="w-5 h-5 text-orange-500 mb-2" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">{item.label}</h3>
                  <p className="text-[10px] text-white/30 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Scan History Section */}
            <section className="pt-8 border-t border-white/5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-orange-500" />
                  <h2 className="text-sm font-bold uppercase tracking-widest">Recent Scans</h2>
                </div>
                {history.length > 0 && (
                  <button 
                    onClick={clearHistory}
                    className="text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-red-500 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {history.length === 0 ? (
                  <div className="p-8 rounded-xl border border-dashed border-white/5 text-center">
                    <p className="text-xs text-white/20 uppercase tracking-widest">No recent history</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => loadFromHistory(item)}
                      className="w-full p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-all text-left group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {item.fileType.startsWith('video') ? (
                            <FileVideo className="w-3 h-3 text-orange-500" />
                          ) : item.fileType.startsWith('audio') ? (
                            <FileAudio className="w-3 h-3 text-orange-500" />
                          ) : (
                            <FileImage className="w-3 h-3 text-orange-500" />
                          )}
                          <span className="text-xs font-bold truncate max-w-[150px]">{item.fileName}</span>
                        </div>
                        <div className={cn(
                          "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-tighter",
                          item.result.isFake ? "bg-red-500/20 text-red-500" : "bg-green-500/20 text-green-500"
                        )}>
                          {item.result.isFake ? "Fake" : "Real"}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[10px] text-white/20">
                          <Clock className="w-3 h-3" />
                          {new Date(item.timestamp).toLocaleDateString()}
                        </div>
                        <span className="text-[10px] text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity uppercase font-bold">View Details →</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7">
            <div className="relative min-h-[500px] rounded-3xl bg-white/5 border border-white/10 overflow-hidden">
              <AnimatePresence mode="wait">
                {!result && !analyzing && !error && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                      <Activity className="w-10 h-10 text-white/10" />
                    </div>
                    <h2 className="text-xl font-bold uppercase tracking-tight mb-2">Awaiting Input</h2>
                    <p className="text-sm text-white/30 max-w-xs">
                      Upload a file to begin neural forensic analysis. Our system will scan for inconsistencies in visual and audio data.
                    </p>
                  </motion.div>
                )}

                {analyzing && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-12"
                  >
                    <div className="w-full max-w-md space-y-8">
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <p className="text-xs font-mono text-orange-500 uppercase">Scanning Neural Layers</p>
                          <h2 className="text-2xl font-bold tracking-tighter">PROCESSING...</h2>
                        </div>
                        <p className="text-xs font-mono opacity-50">EST: 12s</p>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-orange-500"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 10, ease: "linear" }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-[10px] font-mono opacity-30 uppercase">Layer 1: Frequency Analysis</div>
                        <div className="text-[10px] font-mono opacity-30 uppercase text-right">Layer 2: Pixel Cohesion</div>
                        <div className="text-[10px] font-mono opacity-30 uppercase">Layer 3: Temporal Sync</div>
                        <div className="text-[10px] font-mono opacity-30 uppercase text-right">Layer 4: Metadata Integrity</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {result && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 space-y-8"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center",
                          result.isFake ? "bg-red-500/20 text-red-500" : "bg-green-500/20 text-green-500"
                        )}>
                          {result.isFake ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold tracking-tighter uppercase">
                            {result.isFake ? "Deepfake Detected" : "Authentic Media"}
                          </h2>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs font-mono opacity-50 uppercase tracking-widest">
                              Confidence: {result.confidence}%
                            </p>
                            {result.isFake && (
                              <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-500 text-[8px] font-bold uppercase tracking-tighter">
                                {result.type === 'ai_generated' ? 'AI Generated' : 'Manually Edited'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-mono opacity-30 uppercase">Scan ID</p>
                        <p className="text-xs font-mono">DG-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                          <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Visual Findings</h3>
                          <ul className="space-y-2">
                            {result.details.visualInconsistencies.map((item, i) => (
                              <li key={i} className="text-xs flex items-start gap-2">
                                <div className="w-1 h-1 rounded-full bg-orange-500 mt-1.5" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                          <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Audio Findings</h3>
                          <ul className="space-y-2">
                            {result.details.audioInconsistencies.map((item, i) => (
                              <li key={i} className="text-xs flex items-start gap-2">
                                <div className="w-1 h-1 rounded-full bg-orange-500 mt-1.5" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 h-full">
                          <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Forensic Summary</h3>
                          <p className="text-sm leading-relaxed text-white/70 italic">
                            "{result.reasoning}"
                          </p>
                          <div className="mt-6 pt-6 border-t border-white/5">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Metadata Analysis</h3>
                            <p className="text-xs text-white/50">{result.details.metadataAnalysis}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button className="flex-1 py-3 rounded-lg bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">
                        Download Report
                      </button>
                      <button 
                        onClick={() => setResult(null)}
                        className="flex-1 py-3 rounded-lg bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
                      >
                        New Scan
                      </button>
                    </div>
                  </motion.div>
                )}

                {error && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                      <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold uppercase tracking-tight mb-2">Analysis Error</h2>
                    <p className="text-sm text-red-500/60 max-w-xs mb-6">
                      {error}
                    </p>
                    <button 
                      onClick={() => setError(null)}
                      className="px-6 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
                    >
                      Try Again
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2 opacity-30">
          <Shield className="w-4 h-4" />
          <span className="text-[10px] font-mono uppercase tracking-widest">DeepGuard Forensic v2.4.0</span>
        </div>
        <div className="flex gap-8 text-[10px] font-mono uppercase tracking-widest opacity-30">
          <a href="#" className="hover:opacity-100">Privacy Policy</a>
          <a href="#" className="hover:opacity-100">Terms of Service</a>
          <a href="#" className="hover:opacity-100">Security Audit</a>
        </div>
      </footer>
    </div>
  );
}
