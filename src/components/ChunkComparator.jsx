import React, { useState, useMemo, useEffect } from "react";

export default function ChunkComparator({ originalChunks, optimizedChunks }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [showDiff, setShowDiff] = useState(true);

  // Group chunks by source name
  const groupedChunks = useMemo(() => {
    // Group original chunks by source
    const originalBySource = {};
    originalChunks.forEach(chunk => {
      if (!originalBySource[chunk.source_name]) {
        originalBySource[chunk.source_name] = [];
      }
      originalBySource[chunk.source_name].push(chunk);
    });

    // Group optimized chunks by source
    const optimizedBySource = {};
    optimizedChunks.forEach(chunk => {
      if (!optimizedBySource[chunk.source_name]) {
        optimizedBySource[chunk.source_name] = [];
      }
      optimizedBySource[chunk.source_name].push(chunk);
    });

    // Get all unique source names
    const allSources = new Set([
      ...Object.keys(originalBySource),
      ...Object.keys(optimizedBySource)
    ]);

    // Calculate stats for each source
    const sourcesWithStats = Array.from(allSources).map(source => {
      const originalChunksForSource = originalBySource[source] || [];
      const optimizedChunksForSource = optimizedBySource[source] || [];
      
      // Calculate total stats for this source
      const originalTotalChars = originalChunksForSource.reduce((sum, chunk) => sum + chunk.no_of_char, 0);
      const originalTotalWords = originalChunksForSource.reduce((sum, chunk) => sum + chunk.no_of_words, 0);
      const optimizedTotalChars = optimizedChunksForSource.reduce((sum, chunk) => sum + chunk.no_of_char, 0);
      const optimizedTotalWords = optimizedChunksForSource.reduce((sum, chunk) => sum + chunk.no_of_words, 0);
      
      return {
        source,
        originalChunks: originalChunksForSource,
        optimizedChunks: optimizedChunksForSource,
        stats: {
          charReduction: originalTotalChars - optimizedTotalChars,
          wordReduction: originalTotalWords - optimizedTotalWords,
          charRatio: optimizedTotalChars / originalTotalChars * 100,
          wordRatio: optimizedTotalWords / originalTotalWords * 100,
          originalChunkCount: originalChunksForSource.length,
          optimizedChunkCount: optimizedChunksForSource.length,
          chunkReduction: originalChunksForSource.length - optimizedChunksForSource.length
        }
      };
    });

    return sourcesWithStats;
  }, [originalChunks, optimizedChunks]);

  // Filter sources based on search
  const filtered = useMemo(() => {
    return groupedChunks.filter(
      (group) =>
        group.source.toLowerCase().includes(search.toLowerCase()) ||
        group.originalChunks.some(chunk => 
          chunk.text.toLowerCase().includes(search.toLowerCase())
        ) ||
        group.optimizedChunks.some(chunk => 
          chunk.text.toLowerCase().includes(search.toLowerCase())
        )
    );
  }, [groupedChunks, search]);

  const currentSource = filtered[page] || { originalChunks: [], optimizedChunks: [], stats: {} };

  // Calculate text differences for the first chunks (simplified)
  const textDiff = useMemo(() => {
    if (!showDiff || currentSource.originalChunks.length === 0 || currentSource.optimizedChunks.length === 0)
      return null;

    // For simplicity, compare the first chunk of each
    const originalText = currentSource.originalChunks[0].text;
    const optimizedText = currentSource.optimizedChunks[0].text;

    // Simple diff implementation
    const originalWords = originalText.split(/\s+/);
    const optimizedWords = optimizedText.split(/\s+/);

    const diff = [];
    let i = 0, j = 0;

    while (i < originalWords.length || j < optimizedWords.length) {
      if (
        i < originalWords.length &&
        j < optimizedWords.length &&
        originalWords[i] === optimizedWords[j]
      ) {
        diff.push({ type: "unchanged", text: originalWords[i] });
        i++;
        j++;
      } else {
        // Look ahead to find the next match
        let foundMatch = false;
        for (let k = 1; k <= 5; k++) {
          if (
            i + k < originalWords.length &&
            optimizedWords[j] === originalWords[i + k]
          ) {
            for (let l = 0; l < k; l++) {
              diff.push({ type: "removed", text: originalWords[i + l] });
            }
            i += k;
            foundMatch = true;
            break;
          }
          if (
            j + k < optimizedWords.length &&
            originalWords[i] === optimizedWords[j + k]
          ) {
            for (let l = 0; l < k; l++) {
              diff.push({ type: "added", text: optimizedWords[j + l] });
            }
            j += k;
            foundMatch = true;
            break;
          }
        }

        if (!foundMatch) {
          if (i < originalWords.length) {
            diff.push({ type: "removed", text: originalWords[i] });
            i++;
          }
          if (j < optimizedWords.length) {
            diff.push({ type: "added", text: optimizedWords[j] });
            j++;
          }
        }
      }
    }

    return diff;
  }, [currentSource, showDiff]);

  const goNext = () => setPage((p) => Math.min(p + 1, filtered.length - 1));
  const goPrev = () => setPage((p) => Math.max(p - 1, 0));

  // Reset to first page when search changes
  useEffect(() => {
    setPage(0);
  }, [search]);

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Control Bar */}
      <div className="flex items-center gap-2 p-2 border-b border-gray-300">
        <input
          type="text"
          placeholder="Search sources or content..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-2 py-1 border border-gray-300 rounded-sm text-sm"
        />

        <label className="flex items-center text-xs text-gray-600">
          <input
            type="checkbox"
            checked={showDiff}
            onChange={(e) => setShowDiff(e.target.checked)}
            className="mr-1"
          />
          Show Diff
        </label>

        <div className="text-xs text-gray-600">{filtered.length} sources</div>
      </div>

      {/* Source Header with Stats */}
      {currentSource.source && (
        <div className="border-b border-gray-300 p-2 bg-blue-50">
          <h2 className="text-lg font-medium">{currentSource.source}</h2>
          <div className="text-xs grid grid-cols-4 gap-2 mt-1">
            <div>
              <span className="font-medium">Char Reduction:</span>{" "}
              {currentSource.stats.charReduction}
            </div>
            <div>
              <span className="font-medium">Word Reduction:</span>{" "}
              {currentSource.stats.wordReduction}
            </div>
            <div>
              <span className="font-medium">Char Ratio:</span>{" "}
              {currentSource.stats.charRatio.toFixed(1)}%
            </div>
            <div>
              <span className="font-medium">Word Ratio:</span>{" "}
              {currentSource.stats.wordRatio.toFixed(1)}%
            </div>
            <div>
              <span className="font-medium">Original Chunks:</span>{" "}
              {currentSource.stats.originalChunkCount}
            </div>
            <div>
              <span className="font-medium">Optimized Chunks:</span>{" "}
              {currentSource.stats.optimizedChunkCount}
            </div>
            <div>
              <span className="font-medium">Chunk Reduction:</span>{" "}
              {currentSource.stats.chunkReduction}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Original Chunks */}
        <div className="w-1/2 border-r border-gray-300 overflow-auto p-4">
          <h3 className="text-sm font-medium mb-2 text-red-600">
            Original Chunks ({currentSource.originalChunks.length})
          </h3>
          {currentSource.originalChunks.length > 0 ? (
            currentSource.originalChunks.map((chunk, index) => (
              <div key={index} className="mb-4 p-2 border-b border-gray-200">
                <div className="text-xs text-gray-500 mb-2">
                  Page: {chunk.page} | Chars: {chunk.no_of_char} | Words: {chunk.no_of_words}
                </div>
                <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {chunk.text}
                </pre>
                {chunk.metadata && (
                  <div className="mt-2 text-xs text-gray-600">
                    <div className="font-medium">Metadata:</div>
                    <pre>
                      {JSON.stringify(chunk.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-gray-400 italic">No original chunks for this source</div>
          )}
        </div>

        {/* Optimized Chunks */}
        <div className="w-1/2 overflow-auto p-4">
          <h3 className="text-sm font-medium mb-2 text-green-600">
            Optimized Chunks ({currentSource.optimizedChunks.length})
          </h3>
          {currentSource.optimizedChunks.length > 0 ? (
            currentSource.optimizedChunks.map((chunk, index) => (
              <div key={index} className="mb-4 p-2 border-b border-gray-200">
                <div className="text-xs text-gray-500 mb-2">
                  Page: {chunk.page} | Chars: {chunk.no_of_char} | Words: {chunk.no_of_words}
                </div>
                {showDiff && textDiff && index === 0 ? (
                  <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                    {textDiff.map((part, idx) => (
                      <span
                        key={idx}
                        className={
                          part.type === "added"
                            ? "bg-green-200"
                            : part.type === "removed"
                            ? "bg-red-200 line-through"
                            : ""
                        }
                      >
                        {part.text}{" "}
                      </span>
                    ))}
                  </pre>
                ) : (
                  <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                    {chunk.text}
                  </pre>
                )}
                {chunk.metadata && (
                  <div className="mt-2 text-xs text-gray-600">
                    <div className="font-medium">Metadata:</div>
                    <pre>
                      {JSON.stringify(chunk.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-gray-400 italic">No optimized chunks for this source</div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between p-2 border-t border-gray-300">
        <button
          onClick={goPrev}
          disabled={page === 0}
          className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-sm text-sm disabled:opacity-30 hover:bg-gray-200"
        >
          ← Previous
        </button>

        <div className="text-xs text-gray-600">
          {filtered.length > 0 ? (
            <span>
              <span className="font-medium">{page + 1}</span> of{" "}
              <span className="font-medium">{filtered.length}</span>
            </span>
          ) : (
            "No sources"
          )}
        </div>

        <button
          onClick={goNext}
          disabled={page === filtered.length - 1 || filtered.length === 0}
          className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-sm text-sm disabled:opacity-30 hover:bg-gray-200"
        >
          Next →
        </button>
      </div>
    </div>
  );
}