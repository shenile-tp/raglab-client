import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function RagConsole() {
  const [query, setQuery] = useState("");
  const [context, setContext] = useState([]);
  const [response, setResponse] = useState("");

  console.log("context : ", context);

  const handleSend = async () => {
    const res = await fetch("http://localhost:8000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: query }),
    });
    const data = await res.json();
    setContext(data.context);
    setResponse(data.answer);
  };
  return (
    <div
      className="grid grid-cols-3 grid-cols-[300px_300px_auto] grid-rows-[40px_40px_auto_110px] gap-1 
                    h-full w-full p-1 text-sm"
    >
      <div className="italic col-span-3 bg-white p-2 text-xs border border-gray-200 rounded-lg ">
        Top Bar [ NOT IMPLEMENTED ]
      </div>
      <div className="italic text-xs col-span-2 bg-white row-span-1 w-full h-full border border-gray-200 rounded-lg text-center">
        [GOTTA PUT SOMETHIG HERE.]
      </div>
      <div className="row-span-2 bg-white px-0 overflow-y-auto border border-gray-200 rounded-lg">
        <ContextBlock context={context} />
      </div>
      <div className="col-span-2 bg-white row-span-1 overflow-y-auto border border-gray-200 rounded-lg">
        <ResponseBlock response={response} />
      </div>
      <div className=" bg-white col-span-3 border border-gray-200 rounded-lg">
        <QueryBlock query={query} setQuery={setQuery} handleSend={handleSend} />
      </div>
    </div>
  );
}

function QueryBlock({ setQuery, query, handleSend }) {
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
        className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700 shadow-lg flex items-center justify-center"
        onClick={handleSend}
      >
        <span className="material-symbols-outlined text-white">send</span>
      </button>
    </div>
  );
}


function ContextBlock({ context }) {
  if (!Array.isArray(context) || context.length === 0)
    return <p className="text-gray-500">No context available.</p>;

  return (
    <div className="flex flex-col gap-2">
      <div className="w-full p-4 font-semibold sticky top-0 z-10 bg-white border-b border-gray-200">
        Chunks Used for Context
      </div>
      <div className="px-2 space-y-4">
        {context.map((chunk, idx) => (
          <div key={idx} className="p-4 bg-white border-b border-gray-200">
            {chunk.source && (
              <p className="text-[10px]  mb-2 text-blue-600">
                Source: {chunk.source}
              </p>
            )}
            <p className="text-sm text-gray-700">{chunk.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResponseBlock({ response }) {
  if (!response) return <p className="text-gray-500">No response yet.</p>;

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
