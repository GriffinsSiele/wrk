"use client";

import { useState, useCallback } from "react";

interface VideoPlayerProps {
  videoId: string;
  title: string;
  onComplete?: () => void;
}

function buildEmbedSrc(videoId: string, autoplay: boolean): string | null {
  const raw = (videoId || "").trim();
  if (!raw) return null;
  const libraryId = (process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID || "").trim();
  // Accept either "guid" + library env, or "libraryId/guid" pasted as one value.
  const path = raw.includes("/") ? raw : libraryId ? `${libraryId}/${raw}` : raw;
  if (!path.includes("/") && !libraryId) {
    return null;
  }
  return `https://iframe.mediadelivery.net/embed/${path}?autoplay=${autoplay ? "true" : "false"}&preload=true`;
}

export function VideoPlayer({ videoId, title }: VideoPlayerProps) {
  const [loaded, setLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const embedSrc = buildEmbedSrc(videoId, playing);

  const handleLoad = useCallback(() => setLoaded(true), []);

  if (!embedSrc) {
    return (
      <div
        className="relative w-full rounded-2xl overflow-hidden"
        style={{ aspectRatio: "16/9" }}
      >
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3"
          style={{
            background: "rgba(12,15,18,0.04)",
            border: "1px solid rgba(150,118,43,0.35)",
            borderRadius: 2,
          }}
        >
          <div
            className="w-16 h-16 flex items-center justify-center"
            style={{ background: "rgba(217,172,74,0.12)", borderRadius: 2 }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M8 5v14l11-7L8 5z" fill="var(--ox-accent)" />
            </svg>
          </div>
          <p className="text-[13px] font-medium" style={{ color: "var(--ox-muted)" }}>
            {videoId
              ? "Set NEXT_PUBLIC_BUNNY_LIBRARY_ID to play this video"
              : "No video available for this lesson"}
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
            background: "rgba(12,15,18,0.04)",
            borderRadius: 2,
          }}
        >
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }}
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
              background: "var(--gold)",
              borderRadius: 2,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M8 5v14l11-7L8 5z" fill="var(--ink)" />
            </svg>
          </div>
          <span
            className="absolute bottom-4 left-4 text-[13px] font-display px-3 py-1"
            style={{ background: "var(--cream)", color: "var(--ink)", border: "1px solid rgba(150,118,43,0.4)", borderRadius: 2 }}
          >
            {title}
          </span>
        </button>
      )}

      <iframe
        src={embedSrc}
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
