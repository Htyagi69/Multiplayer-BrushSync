import { useParams } from 'react-router-dom';
import { useEffect,useState, useMemo} from 'react';
import { io } from 'socket.io-client';
import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'
import Users from '../userBlocks/users';
import { PenLine, PenOff, Video, VideoOff } from 'lucide-react';


function Dashboard(){
   const {roomid}=useParams()
      const [cursors, setCursors] = useState({}); // { userId: {x, y} }
      const [sidebarOpen, setSidebarOpen] = useState(true);
      const [whiteboardOpen, setWhiteboardOpen] = useState(true);
       const socket = useMemo(() => io(import.meta.env.VITE_SERVER_URL, {
    transports: ['polling', 'websocket'], // Start with polling, then upgrade
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 5,
}), []);


// Add these two lines near your other useState calls
const [pos, setPos] = useState({ x: 78, y: 67 }); // top-left corner, in pixels
const [dragging, setDragging] = useState(false);

// Add this one useEffect
useEffect(() => {
    if (!dragging) return;
    const move = (e) => setPos({ x: e.clientX - 60, y: e.clientY - 20 });
    const up = () => setDragging(false);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => {
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
    };
}, [dragging]);

const handleMount = (editor) => {
    // 1. Send drawings
    const unlisten = editor.store.listen((event) => {
        if (event.source !== 'user') return;
        socket.emit('drawing-change', {
            roomid, 
            changes: event.changes,
        });
    });

    // 2. Receive drawings
    socket.on('drawing-change', (data) => {
        editor.store.mergeRemoteChanges(() => {
            editor.store.applyDiff(data.changes);
        });
    });

    // Clean up when component unmounts
    return () => {
        unlisten();
        socket.off('drawing-change');
    };
};
       useEffect(()=>{
              function handleMouseMove(e){
                  const x=e.clientX/window.innerWidth;
                  const y=e.clientY/window.innerHeight;
                  socket.emit('mouse-move',{x,y,roomId:roomid});
              }
              window.addEventListener('mousemove',handleMouseMove);
              return ()=>window.removeEventListener('mousemove',handleMouseMove)
          },[socket,roomid])

           useEffect(() => {
              socket.on('user-mouse-moved', (data) => {
                  setCursors(prev => ({
                      ...prev,
                      [data.userId]: { x: data.x, y: data.y ,name:data.name}
                  }));
              });
          
              return () => socket.off('user-mouse-moved');
          }, [socket]);

   // Color palette for remote cursors, derived deterministically from userId
   const cursorColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
   const colorForId = (id) => {
       let hash = 0;
       for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
       return cursorColors[Math.abs(hash) % cursorColors.length];
   };

   return (
        <div className="relative flex h-screen w-screen overflow-hidden bg-linear-to-br from-slate-100 to-slate-200">

            {/* CANVAS / WHITEBOARD PANEL — slides closed towards the left */}
            <div
                className={`h-full relative z-0 overflow-hidden transition-all duration-300 ease-in-out ${
                    whiteboardOpen ? 'flex-1 min-w-0' : 'w-0 flex-none'
                }`}
            >
                <div className="h-full w-full min-w-[320px] relative">

                    {roomid && (
                        <div className="absolute top-3 left-3 z-9998 flex items-center gap-2 rounded-full bg-white/90 backdrop-blur px-3 py-1.5 shadow-md border border-slate-200 pointer-events-none">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-medium text-slate-600">Room</span>
                            <span className="text-xs font-mono font-semibold text-slate-800">{roomid}</span>
                        </div>
                    )}

                    <div className="absolute inset-0 z-9999 pointer-events-none overflow-hidden">
                        {Object.entries(cursors).map(([id, pos]) => {
                            const color = colorForId(id);
                            return (
                                <div
                                    key={id}
                                    className="absolute transition-all duration-75 ease-out"
                                    style={{
                                        left: `${pos.x * 100}%`,
                                        top: `${pos.y * 100}%`,
                                    }}
                                >
                                    <svg
                                        className="h-5 w-5 fill-current drop-shadow-md"
                                        style={{ color }}
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M7 2l12 11.2l-5.8 0.5l3.3 7.3l-2.2 1l-3.2-7.4L7 19V2z" />
                                    </svg>

                                    <div
                                        className="ml-3 mt-1 rounded-md px-1.5 py-0.5 text-[10px] text-white font-semibold shadow-md whitespace-nowrap"
                                        style={{ backgroundColor: color }}
                                    >
                                        {pos.name}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <Tldraw licenseKey={import.meta.env.VITE_TLDRAW_LICENSE_KEY} onMount={handleMount} autoFocus />
                </div>
            </div>

            {/* SIDEBAR / VIDEO PANEL — expands to cover whole screen when whiteboard is closed */}
            <div
                className={`h-full bg-white/95 backdrop-blur border-l border-slate-200 shadow-xl flex flex-col z-10000 transition-all duration-300 ease-in-out overflow-hidden ${
                    sidebarOpen ? (whiteboardOpen ? 'w-80' : 'w-full') : 'w-0'
                }`}
            >
                <div className={`h-full flex flex-col ${whiteboardOpen ? 'w-80' : 'w-full'}`}>
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
                        <h2 className="text-sm font-semibold text-slate-800 tracking-wide">Collaborators</h2>
                    </div>

                    <div className={`flex-1 overflow-y-auto p-4 ${whiteboardOpen ? '' : 'max-w-3xl mx-auto w-full'}`}>
                        <Users socket={socket} fullscreen={!whiteboardOpen} />
                    </div>
                </div>
            </div>

            {/* ZOOM-STYLE BOTTOM CONTROL BAR */}
           <div
    onMouseDown={() => setDragging(true)}
    style={{ left: pos.x, top: pos.y }}
    className="fixed z-10001 flex items-center gap-2 bg-white/95 backdrop-blur px-3 py-2 rounded-full shadow-xl border border-slate-200 cursor-move select-none"
>
    <button
        onClick={() => setWhiteboardOpen(prev => !prev)}
        className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold transition-colors ${
            whiteboardOpen
                ? 'text-slate-700 hover:bg-slate-100'
                : 'text-red-600 bg-red-50 hover:bg-red-100'
        }`}
        title={whiteboardOpen ? 'Close whiteboard' : 'Open whiteboard'}
    >
        {whiteboardOpen ? <PenLine size={16} /> : <PenOff size={16} />}
        <span className="hidden sm:inline">Whiteboard</span>
    </button>

    <span className="h-6 w-px bg-slate-200" />

    <button
        onClick={() => setSidebarOpen(prev => !prev)}
        className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold transition-colors ${
            sidebarOpen
                ? 'text-slate-700 hover:bg-slate-100'
                : 'text-red-600 bg-red-50 hover:bg-red-100'
        }`}
        title={sidebarOpen ? 'Close video panel' : 'Open video panel'}
    >
        {sidebarOpen ? <Video size={16} /> : <VideoOff size={16} />}
        <span className="hidden sm:inline">Video</span>
    </button>
</div>
        </div>
    )
}

export default Dashboard