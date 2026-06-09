import React, { useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export default function ComparisonEngine({ file }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await axios.post('http://localhost:5000/api/compare', formData);
      setData(res.data.comparison);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-dark rounded-2xl p-8 mt-8"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-purple-400">Algorithm Comparison Engine</h2>
          <p className="text-sm text-slate-400">Compare Huffman, RLE, and LZW performance on your file.</p>
        </div>
        <button 
          onClick={handleCompare}
          disabled={!file || loading}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-6 py-2.5 rounded-lg text-sm font-semibold transition"
        >
          {loading ? 'Running Tests...' : 'Run Comparison'}
        </button>
      </div>

      {data && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="h-64 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-300 mb-4 text-center">Compression Ratio</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="algorithm" stroke="#94a3b8" axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                />
                <Bar dataKey="ratio" fill="#8b5cf6" radius={[4, 4, 0, 0]} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="h-64 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-300 mb-4 text-center">Execution Time (ms)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="algorithm" stroke="#94a3b8" axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                />
                <Bar dataKey="time_taken" fill="#3b82f6" radius={[4, 4, 0, 0]} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      
      {!data && !loading && (
        <div className="text-center text-slate-500 py-12 bg-slate-900/30 rounded-xl border border-dashed border-slate-700/50">
          Upload a file and click "Run Comparison" to generate benchmarks.
        </div>
      )}
    </motion.div>
  );
}
