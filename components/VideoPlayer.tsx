
import React, { useMemo, useEffect, useRef } from 'react';

interface VideoPlayerProps {
  url: string;
  title?: string;
  className?: string;
  autoPlay?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, title, className = "", autoPlay = true }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Memoize a URL processada
  const processedUrl = useMemo(() => {
    if (!url) return "";

    if (url.startsWith('blob:') || url.startsWith('data:video')) {
      return url;
    }

    // Lógica para YouTube
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (ytMatch) {
      const videoId = ytMatch[1];
      // Adicionado mute=0 e autoplay=1 para YouTube
      return `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}&rel=0&modestbranding=1&enablejsapi=1&origin=${window.location.origin}`;
    }

    // Lógica para Vimeo
    const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/);
    if (vimeoMatch) {
      const vimeoId = vimeoMatch[1];
      return `https://player.vimeo.com/video/${vimeoId}?autoplay=${autoPlay ? 1 : 0}&transparent=0&badge=0`;
    }

    return url;
  }, [url, autoPlay]);

  // Efeito para forçar o play em vídeos diretos/blobs
  useEffect(() => {
    if (autoPlay && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Autoplay bloqueado pelo navegador, aguardando interação.", error);
        });
      }
    }
  }, [processedUrl, autoPlay]);

  const isDirectVideo = (inputUrl: string) => {
    return inputUrl.startsWith('blob:') || 
           inputUrl.toLowerCase().endsWith('.mp4') || 
           inputUrl.toLowerCase().endsWith('.webm') || 
           inputUrl.toLowerCase().endsWith('.m3u8') ||
           inputUrl.startsWith('data:video');
  };

  if (!url) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-500 text-sm">
        URL de vídeo não configurada
      </div>
    );
  }

  if (isDirectVideo(processedUrl)) {
    return (
      <video 
        ref={videoRef}
        src={processedUrl} 
        controls 
        autoPlay={autoPlay}
        className={`w-full h-full object-contain bg-black ${className}`}
        playsInline
        onError={(e) => console.error("Erro ao carregar vídeo direto:", e)}
      >
        <p>Seu navegador não suporta a reprodução deste formato de vídeo.</p>
      </video>
    );
  }

  return (
    <div className={`relative w-full h-full bg-black overflow-hidden ${className}`}>
      <iframe
        className="absolute inset-0 w-full h-full"
        src={processedUrl}
        title={title || "TxopelaTv Video Player"}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowFullScreen
        loading="lazy"
      ></iframe>
    </div>
  );
};

export default VideoPlayer;
