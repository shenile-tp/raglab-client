import React from "react";

export default function SourceNavigation({
  groupedChunks,
  activeSource,
  setActiveSource,
  filtered,
  setPage
}) {
  return (
    <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 overflow-x-auto">
      <span className="text-xs text-gray-600 whitespace-nowrap">Sources:</span>
      {Object.keys(groupedChunks).map(source => (
        <button
          key={source}
          className={`px-2 py-1 text-xs border rounded-sm whitespace-nowrap ${
            activeSource === source
              ? "bg-blue-100 border-blue-300 text-blue-700"
              : "bg-white border-gray-300 hover:bg-gray-100"
          }`}
          onClick={() => {
            const firstChunkIndex = filtered.findIndex(chunk => 
              chunk.source_name === source
            );
            if (firstChunkIndex >= 0) {
              setPage(firstChunkIndex);
              setActiveSource(source);
            }
          }}
          title={`${groupedChunks[source].length} chunks from ${source}`}
        >
          {source} ({groupedChunks[source].length})
        </button>
      ))}
    </div>
  );
}