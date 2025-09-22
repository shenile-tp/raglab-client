import React from "react";

export default function NavigationBar({
  goPrev,
  goNext,
  page,
  filteredLength,
  currentChunk,
  groupBySource
}) {
  return (
    <div className="flex items-center justify-between p-2 border-t border-gray-300">
      <button
        onClick={goPrev}
        disabled={page === 0}
        className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-sm text-sm disabled:opacity-30 hover:bg-gray-200"
      >
        ← Previous
      </button>
      
      <div className="text-xs text-gray-600">
        {filteredLength > 0 ? (
          <span>
            <span className="font-medium">{page + 1}</span> of{" "}
            <span className="font-medium">{filteredLength}</span>
            {groupBySource && currentChunk && (
              <span className="ml-2">
                (Source: {currentChunk.source_name || "Unknown"})
              </span>
            )}
          </span>
        ) : (
          "No chunks"
        )}
      </div>
      
      <button
        onClick={goNext}
        disabled={page === filteredLength - 1 || filteredLength === 0}
        className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-sm text-sm disabled:opacity-30 hover:bg-gray-200"
      >
        Next →
      </button>
    </div>
  );
}