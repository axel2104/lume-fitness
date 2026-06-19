/**
 * VideoPlayer — HLS-capable video component
 *
 * Supporta:
 * - HLS streams (.m3u8) via hls.js nei browser moderni
 * - HLS nativo su Safari / iOS (che lo supporta nativamente)
 * - Fallback a <video> normale per MP4 diretti
 *
 * Uso:
 *   <VideoPlayer
 *     src="https://your-bunny-stream.b-cdn.net/video/playlist.m3u8"
 *     poster="https://your-cdn.com/poster.jpg"
 *     autoPlay muted loop className="absolute inset-0 w-full h-full object-cover"
 *   />
 */

import { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  /** URL del video: .m3u8 per HLS, oppure .mp4 per normale */
  src: string;
  /** Immagine poster mostrata prima del play / durante il caricamento */
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  playsInline?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Callback quando il video può iniziare a riprodursi */
  onCanPlay?: () => void;
  /** Callback in caso di errore */
  onError?: (err: string) => void;
}

export default function VideoPlayer({
  src,
  poster,
  autoPlay = false,
  muted = true,
  loop = false,
  controls = false,
  playsInline = true,
  className,
  style,
  onCanPlay,
  onError,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef   = useRef<import('hls.js').default | null>(null);
  const [ready, setReady] = useState(false);

  const isHLS = src.includes('.m3u8') || src.includes('/playlist');

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let destroyed = false;

    const setup = async () => {
      if (isHLS) {
        // Controlla se Safari/iOS supporta HLS nativamente
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else {
          // Usa hls.js per tutti gli altri browser
          const Hls = (await import('hls.js')).default;

          if (!Hls.isSupported()) {
            onError?.('HLS non supportato in questo browser');
            return;
          }

          const hls = new Hls({
            // Config ottimizzata per hero video background
            autoStartLoad: true,
            startPosition: -1,
            maxBufferLength: 30,
            maxMaxBufferLength: 600,
            lowLatencyMode: false,
          });

          hlsRef.current = hls;
          hls.loadSource(src);
          hls.attachMedia(video);

          hls.on(Hls.Events.ERROR, (_, data) => {
            if (data.fatal) onError?.(data.details);
          });

          if (destroyed) { hls.destroy(); return; }
        }
      } else {
        // MP4 o altro formato diretto
        video.src = src;
      }
    };

    setup();

    video.addEventListener('canplay', () => {
      setReady(true);
      onCanPlay?.();
    });

    return () => {
      destroyed = true;
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, isHLS]);

  return (
    <video
      ref={videoRef}
      poster={poster}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      controls={controls}
      playsInline={playsInline}
      className={className}
      style={{
        ...style,
        // Transizione opacity per evitare il "flash" iniziale
        opacity: ready || !poster ? 1 : 0,
        transition: 'opacity .5s ease',
      }}
    />
  );
}
