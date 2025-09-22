import React, { useMemo } from "react";

export default function DataPanel({
  currentChunk,
  groupStats,
  groupBySource
}) {
  const chunkStats = useMemo(() => {
    if (!currentChunk) return null;
    
    const text = currentChunk.text;
    const words = text.trim().split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    const charFrequency = {};
    const cleanText = text.replace(/\s/g, '').toLowerCase();
    for (let char of cleanText) {
      charFrequency[char] = (charFrequency[char] || 0) + 1;
    }
    
    const topChars = Object.entries(charFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    return {
      characterCount: text.length,
      wordCount: words.length,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
      avgWordLength: words.reduce((sum, word) => sum + word.length, 0) / words.length,
      avgSentenceLength: words.length / sentences.length,
      readingTime: Math.ceil(words.length / 200),
      topCharacters: topChars,
      source: currentChunk.source_name,
      fileName: currentChunk.source_name,
      metadataFieldCount: currentChunk.metadata ? Object.keys(currentChunk.metadata).length : 0
    };
  }, [currentChunk]);

  if (!currentChunk) {
    return (
      <div className="w-1/3 border-l border-gray-300 overflow-y-auto p-3 text-xs">
        <div className="text-gray-500">No chunk selected or available.</div>
      </div>
    );
  }

  return (
    <div className="w-1/3 border-l border-gray-300 overflow-y-auto p-3 text-xs">
      <h3 className="font-bold text-sm mb-3 border-b pb-1">CHUNK ANALYSIS</h3>
      
      <div className="space-y-4">
        {groupBySource && groupStats && (
          <GroupStatistics groupStats={groupStats} />
        )}
        
        <ChunkStatistics chunkStats={chunkStats} />
        <CharacterFrequency chunkStats={chunkStats} />
        <TextStructure currentChunk={currentChunk} />
        
        {currentChunk.metadata && (
          <MetadataAnalysis metadata={currentChunk.metadata} />
        )}
      </div>
    </div>
  );
}

// GroupStatistics.jsx
export function GroupStatistics({ groupStats }) {
  return (
    <div>
      <h4 className="font-medium mb-2 text-blue-700">GROUP STATISTICS</h4>
      <div className="bg-blue-50 p-2 rounded border border-blue-100 mb-3">
        <div className="grid grid-cols-2 gap-2">
          <div>Source:</div>
          <div className="text-right font-medium">{groupStats.source}</div>
          
          <div>Total Chunks:</div>
          <div className="text-right">{groupStats.chunkCount}</div>
          
          <div>Total Characters:</div>
          <div className="text-right">{groupStats.totalChars.toLocaleString()}</div>
          
          <div>Total Words:</div>
          <div className="text-right">{groupStats.totalWords.toLocaleString()}</div>
          
          <div>Avg. Chars/Chunk:</div>
          <div className="text-right">{groupStats.avgCharsPerChunk.toFixed(0)}</div>
          
          <div>Avg. Words/Chunk:</div>
          <div className="text-right">{groupStats.avgWordsPerChunk.toFixed(0)}</div>
          
          <div>Unique Metadata Fields:</div>
          <div className="text-right">{groupStats.metadataFieldCount}</div>
        </div>
        
        {groupStats.uniqueMetadataFields.length > 0 && (
          <div className="mt-2">
            <div className="font-medium">Metadata Fields:</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {groupStats.uniqueMetadataFields.map(field => (
                <span key={field} className="px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                  {field}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ChunkStatistics.jsx
export function ChunkStatistics({ chunkStats }) {
  return (
    <div>
      <h4 className="font-medium mb-2">CURRENT CHUNK</h4>
      <div className="grid grid-cols-2 gap-2">
        <div>Source:</div>
        <div className="text-right">{chunkStats.source}</div>

        <div>File Name:</div>
        <div className="text-right">{chunkStats.fileName}</div>

        <div>Characters:</div>
        <div className="text-right">{chunkStats.characterCount}</div>
        
        <div>Words:</div>
        <div className="text-right">{chunkStats.wordCount}</div>
        
        <div>Sentences:</div>
        <div className="text-right">{chunkStats.sentenceCount}</div>
        
        <div>Paragraphs:</div>
        <div className="text-right">{chunkStats.paragraphCount}</div>
        
        <div>Avg. Word Length:</div>
        <div className="text-right">{chunkStats.avgWordLength.toFixed(2)} chars</div>
        
        <div>Avg. Sentence Length:</div>
        <div className="text-right">{chunkStats.avgSentenceLength.toFixed(2)} words</div>
        
        <div>Reading Time:</div>
        <div className="text-right">{chunkStats.readingTime} min</div>
        
        <div>Metadata Fields:</div>
        <div className="text-right">{chunkStats.metadataFieldCount}</div>
      </div>
    </div>
  );
}

// CharacterFrequency.jsx
export function CharacterFrequency({ chunkStats }) {
  return (
    <div>
      <h4 className="font-medium mb-2">Top Characters</h4>
      <div className="space-y-1">
        {chunkStats.topCharacters.map(([char, count]) => (
          <div key={char} className="flex justify-between">
            <span>{char === " " ? "[space]" : char}:</span>
            <span>{count} ({((count / chunkStats.characterCount) * 100).toFixed(1)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// TextStructure.jsx
export function TextStructure({ currentChunk }) {
  return (
    <div>
      <h4 className="font-medium mb-2">Text Structure</h4>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Line Count:</span>
          <span>{currentChunk.text.split('\n').length}</span>
        </div>
        <div className="flex justify-between">
          <span>Has Markdown:</span>
          <span>{/[#*\-_\[\]]/.test(currentChunk.text) ? "Yes" : "No"}</span>
        </div>
        <div className="flex justify-between">
          <span>Has URLs:</span>
          <span>{/(https?:\/\/[^\s]+)/.test(currentChunk.text) ? "Yes" : "No"}</span>
        </div>
        <div className="flex justify-between">
          <span>Has Numbers:</span>
          <span>{/\d/.test(currentChunk.text) ? "Yes" : "No"}</span>
        </div>
      </div>
    </div>
  );
}

// MetadataAnalysis.jsx
export function MetadataAnalysis({ metadata }) {
  return (
    <div>
      <h4 className="font-medium mb-2">Metadata Analysis</h4>
      <div className="space-y-1">
        {Object.entries(metadata).map(([key, value]) => (
          <div key={key}>
            <div className="font-medium">{key}:</div>
            <div className="truncate text-gray-600 ml-2">{String(value)}</div>
            <div className="text-gray-500 text-xs ml-2">
              Type: {typeof value}, Length: {String(value).length}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}