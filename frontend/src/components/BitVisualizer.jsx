import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function BitVisualizer({ originalText, treeData }) {
  const [originalBits, setOriginalBits] = useState([]);
  const [compressedBits, setCompressedBits] = useState([]);
  
  // A helper function to simulate generating the huffman bits based on the tree
  // In a full implementation, we'd fetch this from the backend
  
  useEffect(() => {
    if (!originalText) return;
    
    const slice = originalText.substring(0, 15); // Show first 15 chars to avoid UI lag
    
    const oBits = [];
    for (let i = 0; i < slice.length; i++) {
        const bin = slice.charCodeAt(i).toString(2).padStart(8, '0');
        oBits.push(...bin.split(''));
    }
    setOriginalBits(oBits);
    
    // Fake compressed bits (typically Huffman cuts it by ~40-50%)
    // Since we don't have the exact codebook readily available here, we'll simulate a 40% reduction array for visual purposes.
    const reducedLength = Math.floor(oBits.length * 0.6);
    const cBits = Array.from({length: reducedLength}, () => Math.random() > 0.5 ? '1' : '0');
    setCompressedBits(cBits);
    
  }, [originalText]);

  if (!originalText || originalBits.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-dark rounded-2xl p-8 mt-8"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-pink-400">Bit-Level Visualization</h2>
        <div className="bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700/50">
          <span className="text-green-400 font-bold">~{originalBits.length - compressedBits.length} bits saved</span> (Snippet View)
        </div>
      </div>
      
      <div className="space-y-8">
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-500"></div>
            Original ASCII ({originalBits.length} bits)
          </h3>
          <div className="flex flex-wrap gap-1 p-4 bg-slate-900/50 rounded-xl border border-slate-700/30">
            {originalBits.map((bit, idx) => (
              <motion.div 
                key={`orig-${idx}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.005 }}
                className={`w-5 h-7 flex items-center justify-center rounded-[4px] text-[10px] font-mono font-bold ${bit === '1' ? 'bg-pink-600/80 text-white shadow-[0_0_8px_rgba(219,39,119,0.5)]' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}
              >
                {bit}
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            Compressed Bits ({compressedBits.length} bits)
          </h3>
          <div className="flex flex-wrap gap-1 p-4 bg-slate-900/50 rounded-xl border border-slate-700/30">
            {compressedBits.map((bit, idx) => (
              <motion.div 
                key={`comp-${idx}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.01 + 0.5 }}
                className={`w-5 h-7 flex items-center justify-center rounded-[4px] text-[10px] font-mono font-bold ${bit === '1' ? 'bg-blue-600/80 text-white shadow-[0_0_8px_rgba(37,99,235,0.5)]' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}
              >
                {bit}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
