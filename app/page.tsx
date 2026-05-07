"use client";

import { useState } from "react";
import { getVideoId } from "../lib/youtube";

export default function Home() {
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    if (!url) return alert("Enter YouTube URL");

    setLoading(true);
    setSummary("");

    const videoId = getVideoId(url);

    const res = await fetch("/api/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ videoId }),
    });

    const data = await res.json();
    setSummary(data.summary);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 flex items-center justify-center p-4 text-white">
      
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20">

        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-6">
          🎥 AI YouTube Summarizer
        </h1>

        {/* Input */}
        <input
          type="text"
          placeholder="Paste YouTube video link..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full p-3 rounded-lg bg-white/20 placeholder-gray-300 outline-none mb-4"
        />

        {/* Button */}
        <button
          onClick={handleSummarize}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 transition p-3 rounded-lg font-semibold shadow-lg"
        >
          {loading ? "Processing..." : "Summarize"}
        </button>

        {/* Summary */}
        {summary && (
          <div className="mt-6 bg-white/10 p-4 rounded-lg border border-white/20">
            <h2 className="font-semibold mb-2 text-lg">Summary:</h2>
 <p className="whitespace-pre-wrap text-gray-200 leading-7">
  {summary}
</p>         </div>
        )}
      </div>
    </div>
  );
}