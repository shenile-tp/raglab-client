import React, { useState, useEffect } from "react";

export default function IngestionEngine() {
  const [schema, setSchema] = useState(null);
  const [corpora, setCorpora] = useState([]);
  const [loading, setLoading] = useState({
    schema: false,
    corpora: false,
    job: false,
    viewing: false,
  });
  const [jobStatus, setJobStatus] = useState({ message: "", type: "" });
  const [formData, setFormData] = useState({
    CONNECTOR_TYPE: "web",
    SOURCE_PATH: "",
    WEB_MAX_RECURSION_DEPTH: 1,
    CORPUS_FILENAME: "",
  });
  const [viewedCorpus, setViewedCorpus] = useState(null);
  const [viewedCorpusContent, setViewedCorpusContent] = useState("");

  // Base URL for the FastAPI API
  const API_BASE = "http://127.0.0.1:8000/api/v1";

  // Fetch the system schema from the API
  const fetchSchema = async () => {
    setLoading((prev) => ({ ...prev, schema: true }));
    try {
      const response = await fetch(`${API_BASE}/schema`);
      const data = await response.json();
      setSchema(data);
    } catch (error) {
      console.error("Error fetching schema:", error);
      setSchema({ error: "Failed to fetch schema. Is the API running?" });
    } finally {
      setLoading((prev) => ({ ...prev, schema: false }));
    }
  };

  // Fetch the list of available corpora
  const fetchCorpora = async () => {
    setLoading((prev) => ({ ...prev, corpora: true }));
    try {
      const response = await fetch(`${API_BASE}/corpora`);
      const data = await response.json();
      setCorpora(data.corpora || []);
    } catch (error) {
      console.error("Error fetching corpora:", error);
      setCorpora([]);
    } finally {
      setLoading((prev) => ({ ...prev, corpora: false }));
    }
  };

  // Handle viewing a corpus
  const handleViewCorpus = async (corpus) => {
    setLoading((prev) => ({ ...prev, viewing: true }));
    setViewedCorpus(corpus);
    setViewedCorpusContent(""); // Clear previous content
    try {
      const response = await fetch(`${API_BASE}/corpora/${corpus.filename}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();
      setViewedCorpusContent(text);
    } catch (error) {
      console.error("Error fetching corpus content:", error);
      setViewedCorpusContent(
        `Failed to load content for ${corpus.filename}. Error: ${error.message}`
      );
    } finally {
      setLoading((prev) => ({ ...prev, viewing: false }));
    }
  };

  // Handle closing the corpus viewer
  const handleCloseViewer = () => {
    setViewedCorpus(null);
    setViewedCorpusContent("");
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle job submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, job: true }));
    setJobStatus({ message: "Submitting job...", type: "" });

    // Prepare payload, excluding empty fields
    const payload = {};
    for (const key in formData) {
      if (formData[key] !== "" && formData[key] !== null) {
        payload[key] = formData[key];
      }
    }

    // Convert depth to integer if it exists
    if (payload.WEB_MAX_RECURSION_DEPTH) {
      payload.WEB_MAX_RECURSION_DEPTH = parseInt(
        payload.WEB_MAX_RECURSION_DEPTH,
        10
      );
    }

    try {
      const response = await fetch(`${API_BASE}/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setJobStatus({
          message: `Ingestion successful! Processed ${data.total_chunks} chunks.`,
          type: "success",
        });
        fetchCorpora(); // Refresh corpora list
      } else {
        setJobStatus({
          message: `Error: ${data.detail || "Ingestion failed."}`,
          type: "error",
        });
      }
    } catch (error) {
      setJobStatus({
        message: `Network error: ${error.message}. Is the API running?`,
        type: "error",
      });
    } finally {
      setLoading((prev) => ({ ...prev, job: false }));
    }
  };

  // Fetch initial data on component mount
  useEffect(() => {
    fetchSchema();
    fetchCorpora();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center pt-8 pb-4">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Data Ingestion Engine
          </h1>
          <p className="text-gray-600">
            Manage and monitor data ingestion pipelines
          </p>
        </header>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Ingestion Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Ingestion Form */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  New Ingestion Job
                </h2>
                <div
                  className={`h-2 w-2 rounded-full ${
                    loading.job ? "bg-blue-500 animate-pulse" : "bg-transparent"
                  }`}
                ></div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Connector Type
                    </label>
                    <select
                      name="CONNECTOR_TYPE"
                      value={formData.CONNECTOR_TYPE}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="web">Web Crawler</option>
                      <option value="local">Local Files</option>
                    </select>
                  </div>

                  {formData.CONNECTOR_TYPE === "web" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Depth
                      </label>
                      <input
                        type="number"
                        name="WEB_MAX_RECURSION_DEPTH"
                        value={formData.WEB_MAX_RECURSION_DEPTH}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.CONNECTOR_TYPE === "web"
                      ? "Source URL"
                      : "Source Path"}
                  </label>
                  <input
                    type="text"
                    name="SOURCE_PATH"
                    value={formData.SOURCE_PATH}
                    onChange={handleInputChange}
                    placeholder={
                      formData.CONNECTOR_TYPE === "web"
                        ? "https://example.com"
                        : "/path/to/documents"
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Output Filename (Optional)
                  </label>
                  <input
                    type="text"
                    name="CORPUS_FILENAME"
                    value={formData.CORPUS_FILENAME}
                    onChange={handleInputChange}
                    placeholder="my_corpus"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading.job}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {loading.job ? "Processing..." : "Start Ingestion"}
                </button>
              </form>

              {jobStatus.message && (
                <div
                  className={`mt-4 p-4 rounded-lg border ${
                    jobStatus.type === "success"
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}
                >
                  {jobStatus.message}
                </div>
              )}
            </section>

            {/* Corpora List */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Available Corpora
                </h2>
                <button
                  onClick={fetchCorpora}
                  disabled={loading.corpora}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
                >
                  <span>Refresh</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </div>

              {loading.corpora ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : corpora.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg
                    className="w-12 h-12 mx-auto text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="mt-2">No corpora found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {corpora.map((corpus) => (
                    <div
                      key={corpus.filename}
                      className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {corpus.filename}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(corpus.size_bytes / 1024).toFixed(1)} KB •
                          {new Date(
                            corpus.modified_time * 1000
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleViewCorpus(corpus)}
                        className="ml-4 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-200 rounded-md hover:border-blue-300 transition-colors"
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Column - Schema Viewer */}
          <div className="lg:col-span-1">
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  System Schema
                </h2>
                <button
                  onClick={fetchSchema}
                  disabled={loading.schema}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
                >
                  <span>Refresh</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </div>

              {loading.schema ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : schema ? (
                <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-auto">
                  <pre className="text-sm text-gray-200 font-mono whitespace-pre-wrap">
                    {JSON.stringify(schema, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg
                    className="w-12 h-12 mx-auto text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="mt-2">Schema not available</p>
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Corpus Viewer Modal */}
        {viewedCorpus && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl h-full max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  Viewing: {viewedCorpus.filename}
                </h3>
                <button
                  onClick={handleCloseViewer}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex-grow overflow-y-auto bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {loading.viewing ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  viewedCorpusContent
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
