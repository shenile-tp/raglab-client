// components/ChunkViewer.jsx
import React, { useState, useMemo, useEffect } from "react";
import ControlBar from "./chunk_viewer/ControlBar";
import SourceNavigation from "./chunk_viewer/SourceNavigation";
import ChunkContent from "./chunk_viewer/ChunkContent";
import DataPanel from "./chunk_viewer/DataPanel";
import NavigationBar from "./chunk_viewer/NavigationBar";

export default function ChunkViewer({ chunks, title = "Chunk Viewer" }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [jumpIndex, setJumpIndex] = useState("");
  const [copied, setCopied] = useState(false);
  const [showDataPanel, setShowDataPanel] = useState(false);
  const [groupBySource, setGroupBySource] = useState(false);
  const [activeSource, setActiveSource] = useState(null);

  // Extract unique source file names
  const sourceFiles = useMemo(() => {
    const sources = new Set();
    chunks.forEach(chunk => {
      if (chunk.source_name) {
        sources.add(chunk.source_name);
      }
    });
    return Array.from(sources).sort();
  }, [chunks]);

  // Group chunks by source file name
  const groupedChunks = useMemo(() => {
    if (!groupBySource) return null;
    
    const groups = {};
    chunks.forEach(chunk => {
      const source = chunk.source_name || "Unknown";
      if (!groups[source]) {
        groups[source] = [];
      }
      groups[source].push(chunk);
    });
    
    return Object.keys(groups).sort().reduce((sorted, key) => {
      sorted[key] = groups[key];
      return sorted;
    }, {});
  }, [chunks, groupBySource]);

  // Filter chunks based on search
  const filtered = useMemo(() => {
    const chunksToFilter = groupBySource && groupedChunks 
      ? Object.values(groupedChunks).flat() 
      : chunks;
    
    return chunksToFilter.filter(
      (c) =>
        c.text.toLowerCase().includes(search.toLowerCase()) ||
        JSON.stringify(c.metadata || {})
          .toLowerCase()
          .includes(search.toLowerCase())
    );
  }, [search, chunks, groupBySource, groupedChunks]);

  const currentChunk = filtered[page] || null;

  // ... rest of the ChunkViewer component remains the same
  // (the logic you already have)

  // Calculate group statistics when grouped by source
  const groupStats = useMemo(() => {
    if (!groupBySource || !groupedChunks || !currentChunk) return null;
    
    const currentSource = currentChunk.source_name || "Unknown";
    const sourceChunks = groupedChunks[currentSource] || [];
    
    if (sourceChunks.length === 0) return null;
    
    let totalChars = 0;
    let totalWords = 0;
    let totalSentences = 0;
    let totalParagraphs = 0;
    const metadataFields = new Set();
    
    sourceChunks.forEach(chunk => {
      const text = chunk.text;
      totalChars += text.length;
      totalWords += text.trim().split(/\s+/).length;
      totalSentences += text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
      totalParagraphs += text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
      
      if (chunk.metadata) {
        Object.keys(chunk.metadata).forEach(field => {
          metadataFields.add(field);
        });
      }
    });
    
    return {
      source: currentSource,
      chunkCount: sourceChunks.length,
      totalChars,
      totalWords,
      totalSentences,
      totalParagraphs,
      avgCharsPerChunk: totalChars / sourceChunks.length,
      avgWordsPerChunk: totalWords / sourceChunks.length,
      uniqueMetadataFields: Array.from(metadataFields),
      metadataFieldCount: metadataFields.size
    };
  }, [groupBySource, groupedChunks, currentChunk]);

  const goNext = () => setPage((p) => Math.min(p + 1, filtered.length - 1));
  const goPrev = () => setPage((p) => Math.max(p - 1, 0));

  const handleJump = () => {
    if (!jumpIndex) return;
    const idx = parseInt(jumpIndex, 10) - 1;
    if (idx >= 0 && idx < filtered.length) {
      setPage(idx);
    } else {
      alert("Chunk index out of range.");
    }
    setJumpIndex("");
  };

  const copyToClipboard = () => {
    if (!currentChunk) return;
    
    const textToCopy = currentChunk.text + 
      (currentChunk.metadata ? 
        "\n\nMetadata:\n" + 
        Object.entries(currentChunk.metadata)
          .map(([k, v]) => `${k}: ${String(v)}`)
          .join("\n") 
        : ""
      );
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Reset page when search changes or grouping changes
  useEffect(() => {
    setPage(0);
  }, [search, groupBySource]);

  // Set active source when current chunk changes
  useEffect(() => {
    if (currentChunk && groupBySource) {
      setActiveSource(currentChunk.source_name || "Unknown");
    }
  }, [currentChunk, groupBySource]);

  return (
    <div className="w-full h-screen flex flex-col bg-white">
      
      <ControlBar
        search={search}
        setSearch={setSearch}
        jumpIndex={jumpIndex}
        setJumpIndex={setJumpIndex}
        handleJump={handleJump}
        copied={copied}
        copyToClipboard={copyToClipboard}
        showDataPanel={showDataPanel}
        setShowDataPanel={setShowDataPanel}
        groupBySource={groupBySource}
        setGroupBySource={setGroupBySource}
        filteredLength={filtered.length}
        groupedChunks={groupedChunks}
      />

      <NavigationBar
        goPrev={goPrev}
        goNext={goNext}
        page={page}
        filteredLength={filtered.length}
        currentChunk={currentChunk}
        groupBySource={groupBySource}
      />

      {groupBySource && groupedChunks && (
        <SourceNavigation
          groupedChunks={groupedChunks}
          activeSource={activeSource}
          setActiveSource={setActiveSource}
          filtered={filtered}
          setPage={setPage}
        />
      )}

      <div className="flex-1 flex overflow-hidden">
        <ChunkContent
          showDataPanel={showDataPanel}
          currentChunk={currentChunk}
          groupBySource={groupBySource}
          groupedChunks={groupedChunks}
        />

        {showDataPanel && (
          <DataPanel
            currentChunk={currentChunk}
            groupStats={groupStats}
            groupBySource={groupBySource}
          />
        )}
      </div>

      
    </div>
  );
}