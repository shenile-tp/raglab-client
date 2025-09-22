import React, { useMemo, useState } from "react";

const ChunkSetAnalyzer = ({ originalChunks, optimizedChunks }) => {
  const [activeTab, setActiveTab] = useState("overview");

  // Calculate corpus statistics
  const corpusStats = useMemo(() => {
    if (!originalChunks.length || !optimizedChunks.length) return null;

    // Calculate overall stats
    const totalOriginalChars = originalChunks.reduce((sum, chunk) => sum + chunk.no_of_char, 0);
    const totalOptimizedChars = optimizedChunks.reduce((sum, chunk) => sum + chunk.no_of_char, 0);
    const totalOriginalWords = originalChunks.reduce((sum, chunk) => sum + chunk.no_of_words, 0);
    const totalOptimizedWords = optimizedChunks.reduce((sum, chunk) => sum + chunk.no_of_words, 0);
    
    // Calculate metadata statistics
    const allMetadata = optimizedChunks.map(chunk => chunk.metadata || {});
    const fieldPresence = {};
    const fieldValues = {};
    
    allMetadata.forEach(metadata => {
      Object.keys(metadata).forEach(field => {
        if (!fieldPresence[field]) fieldPresence[field] = 0;
        fieldPresence[field]++;
        
        if (!fieldValues[field]) fieldValues[field] = new Set();
        fieldValues[field].add(metadata[field]);
      });
    });
    
    // Find fields with 100% presence
    const consistentFields = Object.keys(fieldPresence)
      .filter(field => fieldPresence[field] === optimizedChunks.length)
      .map(field => ({
        field,
        value: Array.from(fieldValues[field])[0] // Get the single value
      }));

    return {
      // Overall stats
      totalOriginalChars,
      totalOptimizedChars,
      totalOriginalWords,
      totalOptimizedWords,
      charRatio: (totalOptimizedChars / totalOriginalChars) * 100,
      wordRatio: (totalOptimizedWords / totalOriginalWords) * 100,
      chunkReduction: originalChunks.length - optimizedChunks.length,
      
      // Metadata analysis
      consistentFields,
      totalChunks: optimizedChunks.length,
      metadataFields: Object.keys(fieldPresence)
    };
  }, [originalChunks, optimizedChunks]);

  if (!corpusStats) return <div className="p-4">Loading corpus analysis...</div>;

  return (
    <div className="w-full p-4">
      <h1 className="text-xl font-bold mb-4">Corpus Analysis</h1>
      
      {/* Tabs */}
      <div className="flex border-b mb-4">
        <button
          className={`py-1 px-3 mr-2 ${activeTab === "overview" ? "border-b-2 border-blue-500" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`py-1 px-3 ${activeTab === "metadata" ? "border-b-2 border-blue-500" : ""}`}
          onClick={() => setActiveTab("metadata")}
        >
          Metadata
        </button>
      </div>

      {activeTab === "overview" && <OverviewTab corpusStats={corpusStats} />}
      {activeTab === "metadata" && <MetadataTab corpusStats={corpusStats} />}
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ corpusStats }) => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Optimization Results</h2>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-2 border rounded">
          <div className="font-medium">Char Retention</div>
          <div className="text-xl">{corpusStats.charRatio.toFixed(1)}%</div>
        </div>
        <div className="p-2 border rounded">
          <div className="font-medium">Word Retention</div>
          <div className="text-xl">{corpusStats.wordRatio.toFixed(1)}%</div>
        </div>
        <div className="p-2 border rounded">
          <div className="font-medium">Chunks Reduced</div>
          <div className="text-xl">{corpusStats.chunkReduction}</div>
        </div>
        <div className="p-2 border rounded">
          <div className="font-medium">Chars Saved</div>
          <div className="text-xl">
            {((corpusStats.totalOriginalChars - corpusStats.totalOptimizedChars) / 1000).toFixed(1)}K
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-medium mb-2">Size Metrics</h3>
        <div className="text-sm grid grid-cols-2 gap-2">
          <div>Original Chars: {corpusStats.totalOriginalChars.toLocaleString()}</div>
          <div>Optimized Chars: {corpusStats.totalOptimizedChars.toLocaleString()}</div>
          <div>Original Words: {corpusStats.totalOriginalWords.toLocaleString()}</div>
          <div>Optimized Words: {corpusStats.totalOptimizedWords.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};

// Metadata Tab Component
const MetadataTab = ({ corpusStats }) => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Metadata Analysis</h2>
      
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-2">
          Analyzed {corpusStats.totalChunks} chunks with {corpusStats.metadataFields.length} metadata fields
        </div>
      </div>

      {corpusStats.consistentFields.length > 0 ? (
        <div>
          <h3 className="font-medium mb-2">Consistent Fields (100% Presence)</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-1">Field Name</th>
                <th className="text-left py-1">Value</th>
              </tr>
            </thead>
            <tbody>
              {corpusStats.consistentFields.map((field, index) => (
                <tr key={field.field} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="py-1 pr-2">{field.field}</td>
                  <td className="py-1">{field.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-sm text-gray-600">No metadata fields with 100% presence across all chunks.</div>
      )}
    </div>
  );
};

export default ChunkSetAnalyzer;