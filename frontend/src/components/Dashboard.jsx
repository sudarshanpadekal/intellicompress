import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Upload, FileText, Zap, Shield, ChevronDown, CheckCircle } from 'lucide-react';
import TreeVisualizer from './TreeVisualizer';
import BitVisualizer from './BitVisualizer';
import ComparisonEngine from './ComparisonEngine';

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [textPreview, setTextPreview] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [treeData, setTreeData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [algorithm, setAlgorithm] = useState('huffman');
  const [password, setPassword] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onload = (e) => {
        setTextPreview(e.target.result.substring(0, 1000));
      };
      reader.readAsText(selected);
      analyzeFile(selected);
    }
  };

  const analyzeFile = async (selectedFile) => {
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await axios.post('http://localhost:5000/api/analyze', formData);
      setAnalysis(res.data.analysis);
      setTreeData(res.data.tree);
      if (res.data.analysis.recommendation) {
        setAlgorithm(res.data.analysis.recommendation.toLowerCase());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsCompressing(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('algorithm', algorithm);
    if (password) formData.append('password', password);

    try {
      const res = await axios.post('http://localhost:5000/api/compress', formData, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `compressed.${algorithm}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
    } catch (err) {
      console.error(err);
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-dark rounded-2xl p-8 flex flex-col md:flex-row gap-8 items-start"
      >
        <div className="flex-1 w-full">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Upload className="text-blue-400" />
            Upload File
          </h2>
          <label className="border-2 border-dashed border-slate-600 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800/50 transition-colors">
            <FileText size={48} className="text-slate-400 mb-4" />
            <span className="text-slate-300 font-medium">Click to upload .txt file</span>
            <input type="file" accept=".txt" className="hidden" onChange={handleFileChange} />
          </label>
          
          {file && (
            <div className="mt-4 p-4 glass rounded-lg border-l-4 border-l-blue-500">
              <p className="font-medium text-blue-100">{file.name}</p>
              <p className="text-sm text-slate-400">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
          )}
        </div>

        {/* AI Recommendation Panel */}
        <div className="flex-1 w-full bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Zap className="text-yellow-400" />
            AI Analysis & Recommendation
          </h2>
          
          {isAnalyzing ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
            </div>
          ) : analysis ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <p className="text-sm text-slate-400 mb-1">Entropy</p>
                  <p className="text-2xl font-bold">{analysis.entropy}</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <p className="text-sm text-slate-400 mb-1">Redundancy</p>
                  <p className="text-2xl font-bold text-green-400">{analysis.redundancy}%</p>
                </div>
              </div>
              
              <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="text-blue-400" size={20} />
                  <span className="font-semibold text-blue-300">Recommended: {analysis.recommendation}</span>
                </div>
                <p className="text-sm text-blue-200/80">{analysis.explanation}</p>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500 py-10">
              Upload a file to see AI recommendations.
            </div>
          )}
        </div>
      </motion.div>

      {/* Settings & Action */}
      {file && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-dark rounded-2xl p-8"
        >
          <h2 className="text-xl font-semibold mb-6">Compression Settings</h2>
          <div className="flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1 w-full space-y-2">
              <label className="text-sm text-slate-400">Algorithm</label>
              <div className="relative">
                <select 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 appearance-none focus:outline-none focus:border-blue-500"
                  value={algorithm}
                  onChange={(e) => setAlgorithm(e.target.value)}
                >
                  <option value="huffman">Huffman Coding</option>
                  <option value="rle">Run-Length Encoding (RLE)</option>
                  <option value="lzw">LZW Compression</option>
                </select>
                <ChevronDown className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" size={20} />
              </div>
            </div>

            <div className="flex-1 w-full space-y-2">
              <label className="text-sm text-slate-400 flex items-center gap-1">
                <Shield size={14} /> Secure Mode (Optional Password)
              </label>
              <input 
                type="password"
                placeholder="Leave blank for no encryption"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 focus:outline-none focus:border-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              onClick={handleCompress}
              disabled={isCompressing}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transform transition hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isCompressing ? 'Compressing...' : 'Compress & Download'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Visualizers */}
      {/* Visualizers */}
      {treeData && algorithm === 'huffman' && (
        <>
          <TreeVisualizer treeData={treeData} />
          <BitVisualizer originalText={textPreview} treeData={treeData} />
        </>
      )}

      {file && <ComparisonEngine file={file} />}
    </div>
  );
}
