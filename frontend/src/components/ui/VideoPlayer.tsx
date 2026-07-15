"use client";

import { useState, useCallback } from "react";

interface VideoPlayerProps {
  videoId: string;
  title: string;
  onComplete?: () => void;
}

export function VideoPlayer({ videoId, title }: VideoPlayerProps) {
  const [loaded, setLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);

  const handleLoad = useCallback(() => setLoaded(true), []);

  if (!videoId) {
    return (
      <div
        className="relative w-full rounded-2xl overflow-hidden"
        style={{ aspectRatio: "16/9" }}
      >
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3"
          style={{
            background: "linear-gradient(135deg, rgba(46,60,142,0.08), rgba(37,192,210,0.08))",
            border: "1px solid rgba(26,26,26,0.06)",
            borderRadius: "16px",
          }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: "rgba(37,192,210,0.1)" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M8 5v14l11-7L8 5z" fill="var(--ox-accent)" />
            </svg>
          </div>
          <p className="text-[13px] font-medium" style={{ color: "var(--ox-muted)" }}>
            No video available for this lesson
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
      {!loaded && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(46,60,142,0.06), rgba(37,192,210,0.06))",
            borderRadius: "16px",
          }}
        >
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "var(--ox-accent)", borderTopColor: "transparent" }}
            />
            <span className="text-[12px]" style={{ color: "var(--ox-muted)" }}>
              Loading video...
            </span>
          </div>
        </div>
      )}

      {!playing && loaded && (
        <button
          onClick={() => setPlaying(true)}
          className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer group"
          style={{ background: "rgba(10,10,10,0.15)" }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
            style={{
              background: "rgba(255,255,255,0.95)",
              boxShadow: "0 8px 32px rgba(10,10,10,0.2)",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M8 5v14l11-7L8 5z" fill="var(--ox-indigo)" />
            </svg>
          </div>
          <span
            className="absolute bottom-4 left-4 text-[13px] font-medium px-3 py-1 rounded-full"
            style={{ background: "rgba(255,255,255,0.86)", color: "var(--ox-indigo)", backdropFilter: "blur(8px)", border: "1px solid var(--ox-line)" }}
          >
            {title}
          </span>
        </button>
      )}

      <iframe
        src={`https://iframe.mediadelivery.net/embed/${videoId}?autoplay=${playing ? "true" : "false"}&preload=true`}
        className="w-full h-full"
        style={{
          border: "none",
          borderRadius: "16px",
          background: "var(--ox-bg-dark)",
        }}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        onLoad={handleLoad}
        title={title}
      />
    </div>
  );
}
