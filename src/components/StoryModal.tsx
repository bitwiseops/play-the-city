"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { Story, POI } from "@/types/index";

interface StoryModalProps {
  story: Story;
  poi: POI;
  onClose: () => void;
}

export default function StoryModal({ story, poi, onClose }: StoryModalProps) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, []);

  const toggleAudio = useCallback(() => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().catch(() => {
        /* autoplay blocked */
      });
      setPlaying(true);
    }
  }, [playing]);

  const onTimeUpdate = useCallback(() => {
    if (!audioRef.current) return;
    const { currentTime, duration } = audioRef.current;
    if (duration > 0) {
      setProgress((currentTime / duration) * 100);
    }
  }, []);

  const onAudioEnded = useCallback(() => {
    setPlaying(false);
    setProgress(0);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-slate-900">
      <div className="safe-top" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-lg font-bold">{poi.name}</h2>
        <button
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-800 text-xl text-slate-400"
          aria-label="Chiudi"
        >
          &times;
        </button>
      </div>

      {/* POI Image */}
      {poi.imageUrl && (
        <div className="mx-4 mb-4 overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={poi.imageUrl}
            alt={poi.name}
            className="h-48 w-full object-cover"
          />
        </div>
      )}

      {/* Story text */}
      <div className="flex-1 px-4">
        <p className="text-base leading-relaxed text-slate-200">
          {story.text}
        </p>
      </div>

      {/* Audio player */}
      {story.audioUrl && (
        <div className="mx-4 mt-6 mb-4 rounded-xl bg-slate-800 p-4">
          <audio
            ref={audioRef}
            src={story.audioUrl}
            onTimeUpdate={onTimeUpdate}
            onEnded={onAudioEnded}
            preload="metadata"
          />

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggleAudio}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white active:bg-blue-500"
              aria-label={playing ? "Pausa" : "Riproduci"}
            >
              {playing ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <rect x="4" y="3" width="4" height="14" rx="1" />
                  <rect x="12" y="3" width="4" height="14" rx="1" />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M6 4l10 6-10 6V4z" />
                </svg>
              )}
            </button>

            <div className="flex-1">
              <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="safe-bottom" />
    </div>
  );
}
