import { useEffect, useRef, useState } from "react";
import {
  Captions,
  Maximize,
  Minimize,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SPEEDS = [0.75, 1, 1.25, 1.5, 2] as const;

export interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  /** CSS aspect-ratio shorthand. Defaults to 16/9. */
  aspectRatio?: string;
}

export function VideoPlayer({
  src,
  poster,
  className,
  aspectRatio = "16 / 9",
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speedIdx, setSpeedIdx] = useState(1);
  const [captionsOn, setCaptionsOn] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  }

  function skip(seconds: number) {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + seconds));
  }

  function replay() {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.play().catch(() => {});
  }

  function cycleSpeed() {
    const next = (speedIdx + 1) % SPEEDS.length;
    setSpeedIdx(next);
    if (videoRef.current) videoRef.current.playbackRate = SPEEDS[next];
  }

  function toggleMute() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }

  async function toggleFullscreen() {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement === el) {
      await document.exitFullscreen();
    } else {
      await el.requestFullscreen?.();
    }
  }

  function seekTo(e: React.MouseEvent<HTMLDivElement>) {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    if (videoRef.current) videoRef.current.currentTime = pct * duration;
  }

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTime = () => setCurrentTime(v.currentTime);
    const onLoaded = () => setDuration(v.duration || 0);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onLoaded);
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onLoaded);
    };
  }, []);

  useEffect(() => {
    const handler = () =>
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-black text-white",
        className,
      )}
      style={{ aspectRatio }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="size-full object-cover"
        playsInline
        onClick={togglePlay}
      />

      {!playing && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Play"
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="flex size-16 items-center justify-center rounded-full bg-white/95 shadow-xl transition-transform hover:scale-105">
            <Play className="size-7 translate-x-0.5 fill-current text-foreground" />
          </span>
        </button>
      )}

      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-6 pt-12 pb-5 transition-opacity",
          playing && "opacity-0 group-hover:opacity-100",
        )}
      >
        <div
          role="slider"
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={currentTime}
          tabIndex={0}
          onClick={seekTo}
          className="pointer-events-auto h-1 cursor-pointer rounded-full bg-white/30"
        >
          <div
            style={{ width: `${progress}%` }}
            className="h-full rounded-full bg-white transition-[width] duration-150"
          />
        </div>
        <div className="pointer-events-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ControlButton onClick={togglePlay} label={playing ? "Pause" : "Play"}>
              {playing ? (
                <Pause className="size-5 fill-current" />
              ) : (
                <Play className="size-5 fill-current" />
              )}
            </ControlButton>
            <ControlButton onClick={() => skip(-10)} label="Back 10 seconds">
              <RotateCcw className="size-5" />
            </ControlButton>
            <ControlButton onClick={() => skip(10)} label="Forward 10 seconds">
              <RotateCw className="size-5" />
            </ControlButton>
            <ControlButton onClick={replay} label="Replay">
              <RefreshCw className="size-5" />
            </ControlButton>
            <button
              type="button"
              onClick={cycleSpeed}
              className="rounded-md px-2 text-sm font-medium tabular-nums hover:bg-white/15"
              aria-label="Playback speed"
            >
              {SPEEDS[speedIdx]}x
            </button>
            <ControlButton onClick={toggleMute} label={muted ? "Unmute" : "Mute"}>
              {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
            </ControlButton>
          </div>
          <div className="flex items-center gap-1">
            <ControlButton
              onClick={() => setCaptionsOn(!captionsOn)}
              label="Captions"
              active={captionsOn}
            >
              <Captions className="size-5" />
            </ControlButton>
            <ControlButton onClick={toggleFullscreen} label="Fullscreen">
              {isFullscreen ? (
                <Minimize className="size-5" />
              ) : (
                <Maximize className="size-5" />
              )}
            </ControlButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function ControlButton({
  children,
  onClick,
  label,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "flex size-8 items-center justify-center rounded-md transition-colors hover:bg-white/15",
        active && "bg-white/20",
      )}
    >
      {children}
    </button>
  );
}
