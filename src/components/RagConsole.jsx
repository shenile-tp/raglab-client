import React, { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";

// Define a default prompt template to be used if the user doesn't specify one
const DEFAULT_PROMPT = `
Based on the following context, please answer the question.
If the information is not available in the context, state that.

Context:
{context}

Question:
{question}
`;

export default function RagConsole() {
  const [query, setQuery] = useState("");
  // --- NEW STATES ---
  const [corpusName, setCorpusName] = useState(""); // Selected corpus filename
  const [corporaList, setCorporaList] = useState([]); // List of available corpora
  const [promptTemplate, setPromptTemplate] = useState(DEFAULT_PROMPT); // User-defined prompt
  // ------------------
  const [context, setContext] = useState([]);
  const [response, setResponse] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null); // New state for API errors

  // 1. Fetch the list of available corpora on component mount
  const fetchCorpora = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("http://localhost:8000/api/v1/corpora");
      if (!res.ok) {
        throw new Error(`Failed to fetch corpora: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      const names = data.corpora.map(c => c.filename);
      setCorporaList(names);
      // Automatically select the first corpus if available
      if (names.length > 0) {
        setCorpusName(names[0]);
      }
    } catch (err) {
      console.error("Error fetching corpora:", err);
      setError("Failed to load corpora list. Check API is running.");
      setCorporaList([]);
    }
  }, []);

  useEffect(() => {
    fetchCorpora();
  }, [fetchCorpora]);

  // 2. Updated handleSend to call the /v1/answer route
  const handleSend = async () => {
    if (!corpusName) {
      setError("Please select a knowledge corpus first.");
      return;
    }
    if (!query.trim()) {
      setError("Please enter a question.");
      return;
    }

    setLoading(true);
    setError(null);
    setResponse("");
    setContext([]);

    try {
      const payload = {
        question: query,
        corpus_name: corpusName,
        // Only send the custom prompt if it's different from the default
        custom_prompt_template: promptTemplate,
      };
      console.log(payload)

      const res = await fetch("http://localhost:8000/api/v1/chat", { // ⚠️ TARGETING /v1/answer
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle API error response (e.g., HTTPException details)
        const detail = data.detail || `Server error: ${res.status} ${res.statusText}`;
        throw new Error(detail);
      }

      // The API returns 'chunks' and 'answer'
      setContext(data.context || []);
      setResponse(data.answer || "No answer generated.");
    } catch (err) {
      console.error("Error while sending request:", err);
      setError(`⚠️ RAG Error: ${err.message}`);
      setResponse("⚠️ Something went wrong. See error message above.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="grid grid-cols-3 grid-cols-[300px_300px_auto] grid-rows-[40px_110px_auto_110px] gap-1 
                       h-full w-full p-1 text-sm"
    >
      <div className="italic col-span-3 bg-white p-2 text-xs border border-gray-200 rounded-lg ">
        RAG Console - Querying Corpus for Answer Generation
      </div>

      {/* 3. New Component for Corpus Selection and Prompt Template Input */}
      <CorpusAndPromptBlock
        corporaList={corporaList}
        corpusName={corpusName}
        setCorpusName={setCorpusName}
        promptTemplate={promptTemplate}
        setPromptTemplate={setPromptTemplate}
        error={error}
      />
      
      <div className="row-span-2 bg-white px-0 overflow-y-auto border border-gray-200 rounded-lg">
        <ContextBlock context={context} isLoading={isLoading} />
      </div>

      {/* Adjusted row-span for the ResponseBlock */}
      <div className="col-span-2 bg-white row-span-1 overflow-y-auto border border-gray-200 rounded-lg">
        <ResponseBlock response={response} isLoading={isLoading} />
      </div>

      <div className="bg-white col-span-3 border border-gray-200 rounded-lg">
        <QueryBlock
          query={query}
          setQuery={setQuery}
          handleSend={handleSend}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

// 4. NEW/Modified Components

function CorpusAndPromptBlock({ corporaList, corpusName, setCorpusName, promptTemplate, setPromptTemplate, error }) {
  // Use a state to toggle between Corpus Selection and Prompt Template view
  const [activeTab, setActiveTab] = useState('corpus'); 

  const isCorpusSelected = corpusName.length > 0;
  
  return (
    <div className="col-span-2 row-span-2 flex flex-col bg-white border border-gray-200 rounded-lg">
      <div className="flex border-b border-gray-200">
        <TabButton 
          label="1. Select Corpus" 
          active={activeTab === 'corpus'} 
          onClick={() => setActiveTab('corpus')} 
          valid={isCorpusSelected}
        />
        <TabButton 
          label="2. Prompt Template" 
          active={activeTab === 'prompt'} 
          onClick={() => setActiveTab('prompt')}
        />
      </div>
      
      <div className="p-4 flex-grow overflow-y-auto">
        {activeTab === 'corpus' && (
          <div>
            <label htmlFor="corpus-select" className="block text-xs font-medium text-gray-700 mb-2">
              Choose Knowledge Corpus:
            </label>
            <select
              id="corpus-select"
              value={corpusName}
              onChange={(e) => setCorpusName(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
            >
              {corporaList.length === 0 ? (
                <option value="">No Corpora Found</option>
              ) : (
                corporaList.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))
              )}
            </select>
            {error && !isCorpusSelected && <p className="mt-2 text-red-500 text-xs">{error}</p>}
          </div>
        )}

        {activeTab === 'prompt' && (
          <div>
            <label htmlFor="prompt-template" className="block text-xs font-medium text-gray-700 mb-2">
              Custom Prompt Template (Use {'{context}'} and {'{question}'}):
            </label>
            <textarea
              id="prompt-template"
              value={promptTemplate}
              onChange={(e) => setPromptTemplate(e.target.value)}
              className="w-full h-24 p-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-blue-400 resize-none"
              placeholder="E.g., Based on {context}, answer {question}."
            />
            <p className="text-[10px] text-gray-500 mt-1">Leave as default to use the system's standard prompt.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ label, active, onClick, valid = true }) {
  const baseClasses = "px-4 py-2 text-xs font-medium cursor-pointer transition-colors duration-150";
  const activeClasses = "bg-gray-100 border-t-2 border-blue-500 text-blue-600";
  const inactiveClasses = "bg-white text-gray-500 hover:bg-gray-50 border-t-2 border-transparent";
  const validationIndicator = valid ? "✅" : "⚠️";

  return (
    <button
      className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}
      onClick={onClick}
    >
      {label} {label.includes("Corpus") && validationIndicator}
    </button>
  );
}

// --- The rest of the original components remain the same, but are included below for completeness ---

function QueryBlock({ setQuery, query, handleSend, isLoading }) {
    return (
      <div className="flex items-center gap-3 p-4 h-full px-60">
        <textarea
          className="flex-grow p-4 h-full bg-white rounded-2xl border border-gray-300
                       focus:outline-none focus:ring-1 focus:ring-blue-400
                       resize-none placeholder-gray-400 text-sm shadow-sm"
          placeholder="Type your question here..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={1}
        />
        <button
          type="button"
          className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700 shadow-lg flex items-center justify-center disabled:opacity-50"
          onClick={handleSend}
          disabled={isLoading}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <span className="material-symbols-outlined text-white">send</span>
          )}
        </button>
      </div>
    );
  }
  
  function ContextBlock({ context, isLoading }) {
    if (isLoading) return <CSSSkeleton />;
    if (!Array.isArray(context) || context.length === 0)
      return <p className="text-gray-500 p-4">No context available.</p>;
  
    return (
      <div className="flex flex-col gap-2">
        <div className="w-full p-4 font-semibold sticky top-0 z-10 bg-white border-b border-gray-200">
          Chunks Used for Context ({context.length} retrieved)
        </div>
  
        <div className="px-2 space-y-4">
          {context.map((chunk, idx) => (
            <div key={idx} className="p-4 bg-white border-b border-gray-200">
              {chunk.source && (
                <p className="text-[10px] mb-2 text-blue-600">
                  Source: {chunk.source}
                </p>
              )}
              {/* Assuming chunk.text is the content */}
              <p className="text-sm text-gray-700">{chunk.text || chunk.content}</p> 
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  function ResponseBlock({ response, isLoading }) {
    if (isLoading) return <CSSSkeleton />;
    if (!response) return <p className="text-gray-500 p-4">No response yet.</p>;
  
    return (
      <div className="w-full h-full overflow-y-auto prose prose-sm text-gray-700">
        <div className="w-full p-4 font-semibold sticky top-0 z-10 bg-white border-b border-gray-200">
          Assistant Response
        </div>
  
        <div className="p-6 text-gray-800">
          <ReactMarkdown>{response}</ReactMarkdown>
        </div>
      </div>
    );
  }
  
  function CSSSkeleton() {
    return (
      <div className="p-4">
        <div role="status" class="max-w-sm animate-pulse">
          <div class="h-2.5 bg-gray-100 rounded-full dark:bg-gray-200 w-48 mb-4"></div>
          <div class="h-2 bg-gray-100 rounded-full dark:bg-gray-200 max-w-[360px] mb-2.5"></div>
          <div class="h-2 bg-gray-100 rounded-full dark:bg-gray-200 mb-2.5"></div>
          <div class="h-2 bg-gray-100 rounded-full dark:bg-gray-200 max-w-[330px] mb-2.5"></div>
          <div class="h-2 bg-gray-100 rounded-full dark:bg-gray-200 max-w-[300px] mb-2.5"></div>
          <div class="h-2 bg-gray-100 rounded-full dark:bg-gray-200 max-w-[360px]"></div>
          <span class="sr-only">Loading...</span>
        </div>
      </div>
    );
  }