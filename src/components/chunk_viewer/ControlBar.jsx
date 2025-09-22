import React from "react";

export default function ControlBar({
  search,
  setSearch,
  jumpIndex,
  setJumpIndex,
  handleJump,
  copied,
  copyToClipboard,
  showDataPanel,
  setShowDataPanel,
  groupBySource,
  setGroupBySource,
  filteredLength,
  groupedChunks,
}) {
  return (
    <div className="flex items-center gap-1 p-2 border-b border-gray-300">
      <input
        type="text"
        placeholder="Search text or metadata..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 px-2 py-1 border border-gray-300 rounded-sm text-sm"
      />
      
      <label className="flex items-center text-xs text-gray-600 ml-2">
        <input
          type="checkbox"
          checked={groupBySource}
          onChange={(e) => setGroupBySource(e.target.checked)}
          className="mr-1"
        />
        Group by source
      </label>
      
      <input
        type="number"
        placeholder="Jump to #"
        value={jumpIndex}
        onChange={(e) => setJumpIndex(e.target.value)}
        className="w-20 px-2 py-1 border border-gray-300 rounded-sm text-sm"
        min="1"
        max={filteredLength}
      />
      <button
        onClick={handleJump}
        className="px-2 py-1 bg-gray-100 border border-gray-300 rounded-sm text-sm hover:bg-gray-200"
      >
        Go
      </button>
      <button
        onClick={copyToClipboard}
        className="px-2 py-1 bg-gray-100 border border-gray-300 rounded-sm text-sm hover:bg-gray-200"
        title="Copy chunk content"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
      <button
        onClick={() => setShowDataPanel(!showDataPanel)}
        className="px-2 py-1 bg-gray-100 border border-gray-300 rounded-sm text-sm hover:bg-gray-200"
        title="Toggle data panel"
      >
        {showDataPanel ? "◀ Data" : "Data ▶"}
      </button>
      <div className="text-xs text-gray-600 pl-2">
        {filteredLength} results
        {groupBySource && groupedChunks && ` (${Object.keys(groupedChunks).length} sources)`}
      </div>
    </div>
  );
}