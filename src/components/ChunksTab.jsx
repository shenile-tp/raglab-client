import React, { useEffect, useState, useMemo } from "react";
import ChunkViewer from "./ChunkViewer";
import ChunkComparator from "./ChunkComparator";
import ChunkSetAnalyzer from "./ChunkSetAnalyzer";

export default function ChunksTab() {
  const [originalChunks, setOriginalChunks] = useState([]);
  const [optimizedChunks, setOptimizedChunks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("comparator"); // "original", "optimized", "comparator", "analyzer"

  useEffect(() => {
    const fetchChunks = async () => {
      try {
        // Fetch original chunks
        const res1 = await fetch("http://127.0.0.1:8000/chunks");
        const data1 = await res1.json();
        setOriginalChunks(data1.chunks || []);

        // Fetch optimized chunks (replace with your optimized endpoint)
        const res2 = await fetch("http://127.0.0.1:8000/get-optimized-chunks");
        const data2 = await res2.json();
        setOptimizedChunks(data2 || []);
      } catch (err) {
        console.error("Failed to load chunks:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchChunks();
  }, []);

  if (loading) return <p className="p-8 text-center">Loading chunks...</p>;

  return (
    <div className="w-full h-full p-2">
      <div className="flex p-1 text-sm border-b border-gray-300">
        <button
          onClick={() => setViewMode("original")}
          className={`rounded-md px-2 py-1 mr-2 ${
            viewMode === "original" ? "bg-blue-500 text-white" : "bg-white"
          }`}
        >
          Original
        </button>
        <button
          onClick={() => setViewMode("optimized")}
          className={`rounded-md px-2 py-1 mr-2 ${
            viewMode === "optimized" ? "bg-blue-500 text-white" : "bg-white"
          }`}
        >
          Optimized
        </button>
        <button
          onClick={() => setViewMode("comparator")}
          className={`rounded-md px-2 py-1 mr-2 ${
            viewMode === "comparator" ? "bg-blue-500 text-white" : "bg-white"
          }`}
        >
          Compare
        </button>
        <button
          onClick={() => setViewMode("analyzer")}
          className={`rounded-md px-2 py-1 ${
            viewMode === "analyzer" ? "bg-blue-500 text-white" : "bg-white"
          }`}
        >
          Analyze Corpus
        </button>
      </div>

      {viewMode === "original" && <ChunkViewer chunks={originalChunks} />}
      {viewMode === "optimized" && <ChunkViewer chunks={optimizedChunks} />}
      {viewMode === "comparator" && (
        <ChunkComparator
          originalChunks={originalChunks}
          optimizedChunks={optimizedChunks}
        />
      )}
      {viewMode === "analyzer" && (
        <ChunkSetAnalyzer
          originalChunks={originalChunks}
          optimizedChunks={optimizedChunks}
        />
      )}
    </div>
  );
}
