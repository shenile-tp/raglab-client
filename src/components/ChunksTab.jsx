import React, { useState, useMemo, useEffect } from "react";

// Placeholder components to keep the example focused on the core logic.
// In a full application, you would replace these with your actual components.
const ControlBar = ({
  setSearch,
  setJumpIndex,
  handleJump,
  copyToClipboard,
  copied,
  showDataPanel,
  setShowDataPanel,
  groupBySource,
  setGroupBySource,
  filteredLength,
}) => (
  <div className="bg-gray-100 p-4 border-b border-gray-300 flex items-center justify-between flex-wrap gap-2">
    <div className="flex-1 min-w-[200px]">
      <input
        type="text"
        placeholder="Search chunks..."
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-md p-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <div className="flex items-center gap-2">
      <input
        type="text"
        placeholder="Jump to index..."
        onChange={(e) => setJumpIndex(e.target.value)}
        className="w-32 rounded-md p-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleJump}
        className="rounded-md bg-blue-500 text-white px-4 py-2 hover:bg-blue-600 transition-colors"
      >
        Jump
      </button>
    </div>
    <div className="flex items-center gap-2">
      <button
        onClick={copyToClipboard}
        className="rounded-md bg-green-500 text-white px-4 py-2 hover:bg-green-600 transition-colors"
      >
        {copied ? "Copied!" : "Copy Chunk"}
      </button>
      <button
        onClick={() => setShowDataPanel((prev) => !prev)}
        className="rounded-md bg-gray-500 text-white px-4 py-2 hover:bg-gray-600 transition-colors"
      >
        {showDataPanel ? "Hide Data Panel" : "Show Data Panel"}
      </button>
      <button
        onClick={() => setGroupBySource((prev) => !prev)}
        className="rounded-md bg-purple-500 text-white px-4 py-2 hover:bg-purple-600 transition-colors"
      >
        {groupBySource ? "Ungroup" : "Group by Source"}
      </button>
    </div>
  </div>
);

const NavigationBar = ({ goPrev, goNext, page, filteredLength }) => (
  <div className="bg-gray-200 p-2 flex items-center justify-between">
    <button
      onClick={goPrev}
      className="rounded-md bg-gray-400 text-white px-4 py-1 hover:bg-gray-500 transition-colors"
    >
      Prev
    </button>
    <span className="text-sm font-semibold">
      Chunk {page + 1} of {filteredLength}
    </span>
    <button
      onClick={goNext}
      className="rounded-md bg-gray-400 text-white px-4 py-1 hover:bg-gray-500 transition-colors"
    >
      Next
    </button>
  </div>
);

const SourceNavigation = ({
  groupedChunks,
  activeSource,
  setActiveSource,
  filtered,
  setPage,
}) => {
  const handleSourceClick = (source) => {
    setActiveSource(source);
    // Find the index of the first chunk in the new source group
    const firstChunkInGroup = groupedChunks[source][0];
    const newPageIndex = filtered.findIndex(
      (chunk) => JSON.stringify(chunk) === JSON.stringify(firstChunkInGroup)
    );
    if (newPageIndex !== -1) {
      setPage(newPageIndex);
    }
  };

  return (
    <div className="w-full overflow-x-auto p-2 bg-gray-100 border-b border-gray-300 flex space-x-2">
      {Object.keys(groupedChunks).map((source) => (
        <button
          key={source}
          onClick={() => handleSourceClick(source)}
          className={`whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ${
            activeSource === source
              ? "bg-blue-600 text-white"
              : "bg-gray-300 text-gray-800"
          } hover:bg-blue-500 hover:text-white transition-colors`}
        >
          {source} ({groupedChunks[source].length})
        </button>
      ))}
    </div>
  );
};

const ChunkContent = ({ currentChunk, showDataPanel }) => (
  <div
    className={`p-4 flex-1 overflow-y-auto ${
      showDataPanel ? "md:w-3/4" : "w-full"
    }`}
  >
    {currentChunk ? (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-2">Chunk Text</h2>
        <pre className="whitespace-pre-wrap text-gray-700 font-sans">
          {currentChunk.text}
        </pre>
        {currentChunk.metadata && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-800">Metadata</h3>
            <ul className="list-disc pl-5 mt-2 text-gray-600">
              {Object.entries(currentChunk.metadata).map(([key, value]) => (
                <li key={key}>
                  <strong>{key}:</strong> {String(value)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    ) : (
      <p className="text-center text-gray-500 text-lg mt-8">
        No chunk selected or found. Please select a corpus file.
      </p>
    )}
  </div>
);

const DataPanel = ({ currentChunk, groupStats }) => (
  <div className="w-full md:w-1/4 bg-gray-50 p-4 border-l border-gray-300 overflow-y-auto">
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-2">
        Data Panel
      </h3>
      {currentChunk ? (
        <>
          <p className="text-sm text-gray-600">
            <strong>ID:</strong> {currentChunk.metadata?.chunk_id}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Document ID:</strong> {currentChunk.metadata?.document_id}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Source Path:</strong> {currentChunk.metadata?.source_path}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Content Type:</strong> {currentChunk.metadata?.content_type}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Page Number:</strong> {currentChunk.metadata?.page_number}
          </p>
          {groupStats && (
            <div className="mt-4 border-t pt-2">
              <h4 className="font-semibold text-gray-700">Source Stats:</h4>
              <p className="text-xs text-gray-500">
                <strong>Source:</strong> {groupStats.source}
              </p>
              <p className="text-xs text-gray-500">
                <strong>Chunk Count:</strong> {groupStats.chunkCount}
              </p>
              <p className="text-xs text-gray-500">
                <strong>Total Chars:</strong> {groupStats.totalChars}
              </p>
              <p className="text-xs text-gray-500">
                <strong>Avg. Words:</strong>{" "}
                {Math.round(groupStats.avgWordsPerChunk)}
              </p>
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-gray-500 text-sm mt-4">
          Select a chunk to see details.
        </p>
      )}
    </div>
  </div>
);

// This component now contains all the logic from both the original `ChunksTab` and `ChunkViewer`.
function ChunkViewer({ chunks, title = "Chunk Viewer" }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [jumpIndex, setJumpIndex] = useState("");
  const [copied, setCopied] = useState(false);
  const [showDataPanel, setShowDataPanel] = useState(false);
  const [groupBySource, setGroupBySource] = useState(false);
  const [activeSource, setActiveSource] = useState(null);
  const [message, setMessage] = useState(null);

  // Filter chunks based on search and new metadata structure
  const filtered = useMemo(() => {
    const chunksToFilter = chunks;
    if (!search) return chunksToFilter;

    return chunksToFilter.filter(
      (c) =>
        c.text.toLowerCase().includes(search.toLowerCase()) ||
        (c.metadata &&
          JSON.stringify(c.metadata)
            .toLowerCase()
            .includes(search.toLowerCase()))
    );
  }, [search, chunks]);

  // Group chunks by source file name
  const groupedChunks = useMemo(() => {
    if (!groupBySource) return null;
    const groups = {};
    chunks.forEach((chunk) => {
      const source = (chunk.metadata && chunk.metadata.source) || "Unknown";
      if (!groups[source]) {
        groups[source] = [];
      }
      groups[source].push(chunk);
    });
    return Object.keys(groups)
      .sort()
      .reduce((sorted, key) => {
        sorted[key] = groups[key];
        return sorted;
      }, {});
  }, [chunks, groupBySource]);

  // Calculate group statistics when grouped by source
  const groupStats = useMemo(() => {
    if (!groupBySource || !groupedChunks) return null;
    const currentChunk = filtered[page];
    if (!currentChunk) return null;

    const currentSource =
      (currentChunk.metadata && currentChunk.metadata.source) || "Unknown";
    const sourceChunks = groupedChunks[currentSource] || [];
    if (sourceChunks.length === 0) return null;

    let totalChars = 0;
    let totalWords = 0;
    sourceChunks.forEach((chunk) => {
      const text = chunk.text;
      totalChars += text.length;
      totalWords += text.trim().split(/\s+/).length;
    });

    return {
      source: currentSource,
      chunkCount: sourceChunks.length,
      totalChars,
      totalWords,
      avgCharsPerChunk: totalChars / sourceChunks.length,
      avgWordsPerChunk: totalWords / sourceChunks.length,
    };
  }, [groupBySource, groupedChunks, filtered, page]);

  const currentChunk = filtered[page] || null;

  const goNext = () => setPage((p) => Math.min(p + 1, filtered.length - 1));
  const goPrev = () => setPage((p) => Math.max(p - 1, 0));

  const handleJump = () => {
    const idx = parseInt(jumpIndex, 10) - 1;
    if (!isNaN(idx) && idx >= 0 && idx < filtered.length) {
      setPage(idx);
    } else {
      setMessage("Chunk index out of range.");
    }
    setJumpIndex("");
  };

  const copyToClipboard = () => {
    if (!currentChunk) return;

    const textToCopy =
      currentChunk.text +
      (currentChunk.metadata
        ? "\n\nMetadata:\n" +
          Object.entries(currentChunk.metadata)
            .map(([k, v]) => `${k}: ${String(v)}`)
            .join("\n")
        : "");

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
        setMessage("Failed to copy to clipboard.");
      });
  };

  // Reset page when search changes or grouping changes
  useEffect(() => {
    setPage(0);
  }, [search, groupBySource]);

  // Set active source when current chunk changes
  useEffect(() => {
    if (currentChunk && groupBySource) {
      setActiveSource(currentChunk.metadata?.source || "Unknown");
    }
  }, [currentChunk, groupBySource]);

  return (
    <div className="w-full h-screen flex flex-col bg-white">
      {message && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg bg-red-100 text-red-700">
          <p className="font-semibold">{message}</p>
          <button
            onClick={() => setMessage(null)}
            className="ml-4 text-xs font-bold text-red-500"
          >
            Dismiss
          </button>
        </div>
      )}
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

// Placeholder component for ChunkComparator
function ChunkComparator({ originalChunks, optimizedChunks }) {
  return (
    <div className="w-full h-full p-8 text-center text-gray-500">
      <p className="text-lg">
        Comparison view is not yet implemented for the new data structure.
      </p>
    </div>
  );
}

// Main ChunksTab component combining UI and new functionality
export default function ChunksTab() {
  const [corporaList, setCorporaList] = useState([]);
  const [selectedCorpus, setSelectedCorpus] = useState("");
  const [originalChunks, setOriginalChunks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // Fetch the list of available corpora on component mount
  useEffect(() => {
    const fetchCorporaList = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8000/api/v1/corpora");
        if (!res.ok) {
          throw new Error(`Server responded with status: ${res.status}`);
        }
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const textResponse = await res.text();
          throw new Error(
            `Expected JSON but received '${contentType}'. Response content: '${textResponse.substring(
              0,
              50
            )}...'`
          );
        }
        const data = await res.json();
        if (data.status === "success" && data.corpora) {
          setCorporaList(data.corpora);
          // Automatically select the first corpus if available
          if (data.corpora.length > 0) {
            setSelectedCorpus(data.corpora[0].filename);
          }
        }
      } catch (err) {
        console.error("Failed to load corpora list:", err);
        setMessage(
          `Error: Failed to fetch corpora list. The server may not be running or the endpoint is not returning JSON. Details: ${err.message}`
        );
      } finally {
        setLoading(false);
      }
    };
    fetchCorporaList();
  }, []);

  console.log("selected corpus", selectedCorpus);

  // Fetch the chunks from the selected corpus file
  useEffect(() => {
    if (!selectedCorpus) {
      setOriginalChunks([]);
      return;
    }
    const fetchChunks = async () => {
      console.log("selected corpus", selectedCorpus);

      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:8000/api/v1/corpora/${selectedCorpus}`
        );
        if (!res.ok) {
          throw new Error(`Server responded with status: ${res.status}`);
        }
        const data = await res.text();
        // Parse the JSONL file line by line
        const parsedChunks = data
          .split("\n")
          .filter((line) => line.trim() !== "")
          .map((line) => JSON.parse(line));

        setOriginalChunks(parsedChunks);
      } catch (err) {
        console.error("Failed to load chunks:", err);
        setMessage(
          `Failed to load file. Please check the file path and format. Details: ${err.message}`
        );
        setOriginalChunks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchChunks();
  }, [selectedCorpus]);

  if (loading) return <p className="p-8 text-center">Loading chunks...</p>;

  return (
    <div className="w-full h-full p-2">
      {message && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg bg-red-100 text-red-700">
          <p className="font-semibold">{message}</p>
          <button
            onClick={() => setMessage(null)}
            className="ml-4 text-xs font-bold text-red-500"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex p-2 items-center space-x-2 bg-gray-100 border-b border-gray-300 shadow-sm">
        <label
          htmlFor="corpus-select"
          className="text-sm font-medium text-gray-700"
        >
          Select Corpus:
        </label>
        <select
          id="corpus-select"
          value={selectedCorpus}
          onChange={(e) => setSelectedCorpus(e.target.value)}
          className="rounded-md px-3 py-1 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {corporaList.map((corpus) => (
            <option key={corpus.filename} value={corpus.filename}>
              {corpus.filename}
            </option>
          ))}
        </select>
      </div>

      <ChunkViewer chunks={originalChunks} />
    </div>
  );
}
