"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Square, Loader2, Sparkles, X, Volume2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface VoiceRecorderProps {
  onTranscribe: (text: string) => void;
  disabled?: boolean;
}

export function VoiceRecorder({ onTranscribe, disabled = false }: VoiceRecorderProps) {
  const [state, setState] = useState<"idle" | "recording" | "transcribing">("idle");
  const [duration, setDuration] = useState(0);
  const [audioLevels, setAudioLevels] = useState<number[]>([15, 25, 40, 20, 30]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up all streams and timers on unmount
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Audio level visualizer loop
  const startVisualizer = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 32;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const update = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Sample 5 distinct frequency ranges for 5 visualizer bars
        const levels = [
          Math.max(12, Math.round((dataArray[1] / 255) * 100)),
          Math.max(15, Math.round((dataArray[3] / 255) * 100)),
          Math.max(12, Math.round((dataArray[5] / 255) * 100)),
          Math.max(18, Math.round((dataArray[7] / 255) * 100)),
          Math.max(14, Math.round((dataArray[9] / 255) * 100)),
        ];
        setAudioLevels(levels);
        animationFrameRef.current = requestAnimationFrame(update);
      };

      update();
    } catch {
      // Audio visualizer failure shouldn't block recording
    }
  };

  // Find best supported recording mimeType
  const getSupportedMimeType = () => {
    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/ogg",
      "audio/mp4",
      "audio/wav",
    ];
    for (const t of candidates) {
      if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) {
        return t;
      }
    }
    return "";
  };

  const startRecording = async () => {
    if (disabled) return;

    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Audio recording is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      audioChunksRef.current = [];

      const mimeType = getSupportedMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.start(250); // Slice every 250ms
      mediaRecorderRef.current = recorder;

      setDuration(0);
      setState("recording");
      startVisualizer(stream);

      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          if (prev >= 300) {
            // Cap at 5 minutes
            stopRecording();
            return 300;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        toast.error("Microphone access denied. Please enable mic permissions in your browser.");
      } else {
        toast.error("Could not access microphone: " + (err.message || "Unknown error"));
      }
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;

    setState("transcribing");

    recorder.onstop = async () => {
      cleanup();

      const mimeType = recorder.mimeType || "audio/webm";
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

      if (audioBlob.size < 1000) {
        toast.warning("Audio was too short or silent. Please try speaking again.");
        setState("idle");
        return;
      }

      const formData = new FormData();
      formData.append("audio", audioBlob, "answer.webm");

      try {
        const res = await fetch("/api/mock-interview/transcribe", {
          method: "POST",
          body: formData,
        });

        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || "Transcription failed");
        }

        const text = (json.text || "").trim();
        if (!text) {
          toast.warning("No clear speech detected. Please speak louder or closer to the mic.");
        } else {
          onTranscribe(text);
          toast.success("Voice transcribed with filler words removed!", {
            icon: "✨",
          });
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to convert speech to text");
      } finally {
        setState("idle");
        audioChunksRef.current = [];
      }
    };

    recorder.stop();
  };

  const cancelRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = null;
      recorder.stop();
    }
    cleanup();
    audioChunksRef.current = [];
    setState("idle");
    setDuration(0);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Transcribing state
  if (state === "transcribing") {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-primary/30 bg-primary/[0.06] px-3.5 py-2 text-xs text-primary shadow-xs">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="font-medium">Converting speech to text & removing filler words...</span>
      </div>
    );
  }

  // Active recording state
  if (state === "recording") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/[0.05] p-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-red-500">
            <span>Recording</span>
            <span>•</span>
            <span>{formatTime(duration)}</span>
            <span className="text-[10px] text-muted-foreground font-normal">/ 05:00</span>
          </div>

          {/* Dynamic Audio Wave Bars */}
          <div className="flex h-5 items-end gap-1 px-1">
            {audioLevels.map((lvl, idx) => (
              <span
                key={idx}
                className="w-1 rounded-full bg-red-500 transition-all duration-75"
                style={{ height: `${Math.min(100, Math.max(15, lvl))}%` }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={stopRecording}
            className="h-8 gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs"
          >
            <Square className="h-3 w-3 fill-current" /> Stop & Transcribe
          </Button>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={cancelRecording}
            className="h-8 w-8 rounded-lg p-0 text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
            title="Cancel recording"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Idle state
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={startRecording}
        disabled={disabled}
        className="h-8 gap-1.5 rounded-lg border-primary/30 bg-primary/5 px-3 text-xs font-medium text-primary hover:bg-primary/10 transition-colors shadow-2xs"
      >
        <Mic className="h-3.5 w-3.5 text-primary" />
        <span>Record Answer</span>
        <span className="hidden sm:inline-flex items-center gap-0.5 rounded-full bg-primary/15 px-1.5 py-0.2 text-[10px] font-semibold text-primary">
          <Sparkles className="h-2.5 w-2.5" /> AI Clean
        </span>
      </Button>
    </div>
  );
}
