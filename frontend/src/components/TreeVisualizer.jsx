import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function TreeVisualizer({ treeData }) {
  const svgRef = useRef();

  useEffect(() => {
    if (!treeData) return;

    const width = 800;
    const height = 500;
    const margin = { top: 40, right: 50, bottom: 50, left: 50 };

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .call(d3.zoom().on("zoom", (event) => {
         svgGroup.attr("transform", event.transform);
      }))
      .append("g");

    const svgGroup = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const treeMap = d3.tree().size([width - margin.left - margin.right, height - margin.top - margin.bottom]);

    const root = d3.hierarchy(treeData);
    const treeDataStructured = treeMap(root);

    const nodes = treeDataStructured.descendants();
    const links = treeDataStructured.links();

    // Links
    svgGroup.selectAll(".link")
      .data(links)
      .enter().append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#475569")
      .attr("stroke-width", 2)
      .attr("d", d3.linkVertical()
        .x(d => d.x)
        .y(d => d.y)
      );

    // Edge Labels
    svgGroup.selectAll(".edge-label")
      .data(links)
      .enter().append("text")
      .attr("class", "edge-label")
      .attr("x", d => (d.source.x + d.target.x) / 2)
      .attr("y", d => (d.source.y + d.target.y) / 2 - 5)
      .attr("text-anchor", "middle")
      .attr("fill", "#94a3b8")
      .text(d => d.target.data.edge || "");

    // Nodes
    const node = svgGroup.selectAll(".node")
      .data(nodes)
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y})`);

    // Node Circles
    node.append("circle")
      .attr("r", 20)
      .attr("fill", d => d.children ? "#1e293b" : "#3b82f6")
      .attr("stroke", d => d.children ? "#64748b" : "#60a5fa")
      .attr("stroke-width", 2);

    // Node Text
    node.append("text")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "12px")
      .text(d => d.data.name === 'Int' ? d.data.freq : d.data.name.replace(/'/g, ''));

  }, [treeData]);

  if (!treeData) return null;

  return (
    <div className="glass-dark rounded-2xl p-8 overflow-hidden w-full mt-8">
      <h2 className="text-xl font-semibold mb-4 text-blue-400">Advanced Huffman Tree (Interactive)</h2>
      <p className="text-sm text-slate-400 mb-4">Scroll to zoom, drag to pan.</p>
      <div className="cursor-move border border-slate-700/50 rounded-xl bg-slate-900/50">
        <svg ref={svgRef} className="mx-auto block w-full"></svg>
      </div>
    </div>
  );
}
