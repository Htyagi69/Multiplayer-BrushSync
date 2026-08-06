import { useRef,useState,useEffect } from "react";
import { VideoOff,Video,Mic,Minimize,Maximize,ScreenShare,X } from "lucide-react";

export function MyVideoTile({ stream, shrink , shareScreen}) {
    const videoRef = useRef();
    const containerRef = useRef();
    const [videoOn, setVideoOn] = useState(true);
    const [audioOn, setAudioOn] = useState(true);
    const [closed, setClosed] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    // Re-attach the stream to the video element whenever it changes
    useEffect(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
    }, [stream]);

    // Keep state in sync if user exits fullscreen via Esc
    useEffect(() => {
        const handleChange = () => setIsFullscreen(!!document.fullscreenElement && document.fullscreenElement === containerRef.current);
        document.addEventListener('fullscreenchange', handleChange);
        return () => document.removeEventListener('fullscreenchange', handleChange);
    }, []);

    const toggleVideo = () => {
        stream?.getVideoTracks().forEach(track => { track.enabled = !track.enabled; });
        setVideoOn(prev => !prev);
    };

    const toggleAudio = () => {
        stream?.getAudioTracks().forEach(track => { track.enabled = !track.enabled; });
        setAudioOn(prev => !prev);
    };

    const handleClose = () => {
        stream?.getTracks().forEach(track => track.stop());
        setClosed(true);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    };

    return (
       <div
    ref={containerRef}
    className={`relative rounded-xl overflow-hidden bg-slate-800 shadow-sm ${
        isFullscreen
            ? 'fixed inset-0 w-screen h-screen flex items-center justify-center bg-black rounded-none z-99999'
            : 'w-full aspect-video'
    }`}>
            {closed ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-400">
                    <VideoOff size={22} />
                    <span className="text-[10px] font-medium">Camera closed</span>
                </div>
            ) : (
                <video
                    ref={videoRef} // or videoRef for MyVideoTile
                    autoPlay
                    style={{ transform: 'scaleX(-1)' }} 
                    className={isFullscreen ? 'w-full h-full object-contain' : 'w-full h-full object-cover'}
    />)}
            <span className="absolute bottom-1.5 left-1.5 text-[10px] font-semibold text-white bg-black/50 px-1.5 py-0.5 rounded">
                You
            </span>

            {!closed && (
                <div className="absolute bottom-1.5 right-1.5 flex gap-1.5 bg-black/50 px-2 py-1 rounded-full">
                    <button onClick={toggleAudio} className="text-white hover:text-amber-300">
                        {audioOn ? <Mic size={14} /> : <MicOff size={14} />}
                    </button>
                    <button onClick={toggleVideo} className="text-white hover:text-amber-300">
                        {videoOn ? <Video size={14} /> : <VideoOff size={14} />}
                    </button>
                    <button onClick={toggleFullscreen} className="text-white hover:text-amber-300">
                        {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
                    </button>
                    <button onClick={shareScreen} className="text-white hover:text-red-400">
                        <ScreenShare size={14} />
                    </button>
                    <button onClick={handleClose} className="text-white hover:text-red-400">
                        <X size={14} />
                    </button>
                    
                </div>
            )}
        </div>
    );
}