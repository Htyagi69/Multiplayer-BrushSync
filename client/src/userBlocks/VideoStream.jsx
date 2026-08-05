import React, { useEffect, useState } from 'react'
import { useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, X, Maximize, Minimize } from 'lucide-react';

function VideoStream({ stream, onClose }) {
    const VideoRef = useRef();
    const containerRef = useRef();
    const [videoOn, setVideoOn] = useState(true);
    const [audioOn, setAudioOn] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        if (VideoRef.current) VideoRef.current.srcObject = stream;
    }, [stream]);

    useEffect(() => {
        const handleChange = () => setIsFullscreen(!!document.fullscreenElement && document.fullscreenElement === containerRef.current);
        document.addEventListener('fullscreenchange', handleChange);
        return () => document.removeEventListener('fullscreenchange', handleChange);
    }, []);

    const toggleVideo = () => {
        stream?.getVideoTracks().forEach(track => {
            track.enabled = !track.enabled;
        });
        setVideoOn(prev => !prev);
    };

    const toggleAudio = () => {
        stream?.getAudioTracks().forEach(track => {
            track.enabled = !track.enabled;
        });
        setAudioOn(prev => !prev);
    };

    const handleClose = () => {
        stream?.getTracks().forEach(track => track.stop());
        if (onClose) onClose();
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    };

    return (
   <div ref={containerRef} className={`relative rounded-xl overflow-hidden bg-slate-800 shadow-sm ${
        isFullscreen
            ? 'fixed inset-0 w-screen h-screen flex items-center justify-center bg-black rounded-none z-99999'
            : 'w-full aspect-video'
    }`}
>
    {/* video */}
    <video
        ref={VideoRef} // or videoRef for MyVideoTile
        autoPlay
        className={isFullscreen ? 'w-full h-full object-contain' : 'w-full h-full object-cover'}
    />

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 px-3 py-1.5 rounded-full">
                <button onClick={toggleAudio} className="text-white hover:text-amber-300">
                    {audioOn ? <Mic size={18} /> : <MicOff size={18} />}
                </button>
                <button onClick={toggleVideo} className="text-white hover:text-amber-300">
                    {videoOn ? <Video size={18} /> : <VideoOff size={18} />}
                </button>
                <button onClick={toggleFullscreen} className="text-white hover:text-amber-300">
                    {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </button>
                <button onClick={handleClose} className="text-white hover:text-red-400">
                    <X size={18} />
                </button>
            </div>
        </div>
    )
}

export default VideoStream