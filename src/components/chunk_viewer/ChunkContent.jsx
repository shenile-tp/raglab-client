import React from "react";

export default function ChunkContent({
  showDataPanel,
  currentChunk,
  groupBySource,
  groupedChunks
}) {
  if (!currentChunk) {
    return (
      <div className={`${showDataPanel ? "w-2/3" : "w-full"} overflow-auto p-1`}>
        <div className="text-center text-gray-500 mt-10 text-sm">
          No chunks match your search.
        </div>
      </div>
    );
  }

  return (
    <div className={`${showDataPanel ? "w-2/3" : "w-full"} overflow-auto p-1`}>
      <div className="max-w-full mx-auto">
        {groupBySource && (
          <div className="px-6 pt-4 pb-2 border-b border-gray-200">
            <div className="text-xs font-medium text-gray-500">
              Source: {currentChunk.source_name || "Unknown"}
              {groupedChunks && currentChunk.source_name && (
                <span className="ml-2 text-gray-400">
                  ({groupedChunks[currentChunk.source_name]?.length || 0} chunks)
                </span>
              )}
            </div>
          </div>
        )}
        
        <div className="px-6 py-4">
          <pre className="text-sm leading-relaxed text-gray-900 whitespace-pre-wrap font-sans max-w-none">
            {currentChunk.text}
          </pre>
        </div>
        
        {currentChunk.metadata && (
          <div className="mt-2 px-6 py-3 border-t border-gray-200 text-xs text-gray-600">
            <div className="font-medium mb-1">METADATA:</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {Object.entries(currentChunk.metadata).map(([k, v]) => (
                <div key={k} className="flex">
                  <span className="font-medium mr-1">{k}:</span>
                  <span className="flex-1">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}