import React, { useState, useEffect } from "react";

export default function RagMaster() {
  const [dataset, setDataset] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load dataset
  useEffect(() => {
    const fetchDataset = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("http://localhost:8000/dataset");
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const data = await res.json();
        setDataset(data.items || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load dataset.");
      } finally {
        setLoading(false);
      }
    };
    fetchDataset();
  }, []);

  // Save dataset
  const saveChanges = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8000/dataset", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataset),
      });
      if (!res.ok) throw new Error(`Save failed: ${res.status}`);
      alert("Changes saved!");
    } catch (err) {
      console.error(err);
      setError("Failed to save changes.");
    } finally {
      setLoading(false);
    }
  };

  const currentData = dataset[currentIndex] || {};

  const setLabel = (value) => {
    const updated = [...dataset];
    updated[currentIndex] = { ...currentData, label: value };
    setDataset(updated);
  };

  const prev = () => setCurrentIndex((i) => Math.max(i - 1, 0));
  const next = () =>
    setCurrentIndex((i) => Math.min(i + 1, dataset.length - 1));

  return (
    <div
      className="grid grid-cols-2
                 grid-rows-[40px_50px_125px_auto_100px]
                 w-full h-full max-h-screen text-sm bg-white"
    >
      <div className="col-span-2 border border-gray-200 flex justify-between items-center px-2">
        <button onClick={prev} disabled={currentIndex === 0}>
          Prev
        </button>
        <span>
          {currentIndex + 1} / {dataset.length}
        </span>
        <button onClick={next} disabled={currentIndex === dataset.length - 1}>
          Next
        </button>
      </div>

      <div className="col-span-2 border border-gray-200 flex justify-end items-center px-2">
        <button onClick={saveChanges}>Save All</button>
      </div>

      <div className="col-span-2 border border-gray-200">
        <QuestionBlock question={currentData.question} />
      </div>

      <div className="border border-gray-200">
        <ResponseBlock response={currentData["response_llama3.1_8B"]} />
      </div>
      <div className="border border-gray-200">
        <AnswerBlock answer={currentData.answer} />
      </div>

      <div
        className="relative col-span-2 flex gap-4 items-center pb-4
  border border-gray-200 flex justify-center gap-4 p-2 font-semibold text-white relative"
      >
        {currentData.label ? (
          <span className="absolute top-0 right-0 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
            Labeled TRUE
          </span>
        ):(
          <span className="absolute top-0 left-0 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
            Labeled FALSE
          </span>
        )}
        <button
          onClick={() => setLabel(false)}
          className="w-full bg-red-500 h-fit py-3 rounded-lg"
        >
          Decline
        </button>
        <button
          onClick={() => setLabel(true)}
          className="w-full bg-green-500 h-fit py-3 rounded-lg"
        >
          Accept
        </button>
      </div>
    </div>
  );
}

function QuestionBlock({ question }) {
  return (
    <div className="p-4 h-full overflow-y-auto">
      {question || "(No question)"}
    </div>
  );
}

function ResponseBlock({ response }) {
  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="pb-2 mb-2 border-b border-gray-200">AI Response</div>
      <div>{response || "(No response)"}</div>
    </div>
  );
}

function AnswerBlock({ answer }) {
  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="pb-2 mb-2 border-b border-gray-200">Correct Answer</div>
      <div>{answer || "(No answer)"}</div>
    </div>
  );
}
