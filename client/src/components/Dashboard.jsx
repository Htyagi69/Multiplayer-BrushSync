import { useParams } from 'react-router-dom';
import { useEffect,useState, useMemo, useContext} from 'react';
import { io } from 'socket.io-client';
import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'
import Users from '../userBlocks/users';
import { authClient } from '@/lib/auth-client';
import { UserProfile } from './logout';
import { PenLine, PenOff, Video, VideoOff } from 'lucide-react';
import { themeProvider } from './Context';
import ToggleTheme from './shadcn-space/toggle/toggle-01';


function Dashboard(){
    const {theme,setTheme,sidebarOpen,setSidebarOpen,whiteboardOpen,setWhiteboardOpen}=useContext(themeProvider)
    const {data:session}=authClient.useSession();
    const user=session?.user;
    const {roomid}=useParams()
    const [cursors, setCursors] = useState({}); // { userId: {x, y} }
    const socket = useMemo(() => io(import.meta.env.VITE_SERVER_URL, {
    transports: ['polling', 'websocket'], // Start with polling, then upgrade
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 5,
}), []);


const [pos, setPos] = useState({ x: 78, y: 67 }); // top-left corner, in pixels
const [dragging, setDragging] = useState(false);

const [isMobile, setIsMobile] = useState(
    () => window.matchMedia('(max-width: 640px)').matches
);

useEffect(() => {
    const media = window.matchMedia('(max-width: 640px)');
    const update = () => setIsMobile(media.matches);

    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
}, []);

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
    const unlisten = editor.store.listen((event) => {
        if (event.source !== 'user') return;
        socket.emit('drawing-change', {
            roomid, 
            changes: event.changes,
        });
    });

    socket.on('drawing-change', (data) => {
        editor.store.mergeRemoteChanges(() => {
            editor.store.applyDiff(data.changes);
        });
    });

    return () => {
        unlisten();
        socket.off('drawing-change');
    };
};
       useEffect(()=>{
              function handleMouseMove(e){
                  const x=e.clientX/window.innerWidth;
                  const y=e.clientY/window.innerHeight;
                  socket.emit('mouse-move',{x,y,roomId:roomid,name:user?.name});
              }
              window.addEventListener('mousemove',handleMouseMove);
              return ()=>window.removeEventListener('mousemove',handleMouseMove)
          },[socket,roomid,user?.name])

           useEffect(() => {
              socket.on('user-mouse-moved', (data) => {
                  setCursors(prev => ({
                      ...prev,
                      [data.userId]: { x: data.x, y: data.y ,name:data.name}
                  }));
              });
          
              return () => socket.off('user-mouse-moved');
          }, [socket]);

   const cursorColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
   const colorForId = (id) => {
       let hash = 0;
       for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
       return cursorColors[Math.abs(hash) % cursorColors.length];
   };
   
   

if (!whiteboardOpen && !sidebarOpen) {
    return (
        <div
            className={`relative flex h-screen w-full flex-col overflow-hidden transition-colors duration-300 ${
                theme ? "bg-white text-black" : "bg-zinc-950 text-white"}`} >
            <div className="relative z-10 flex shrink-0 items-center justify-end gap-2 border-b border-slate-200/20 px-4 py-3">
                <ToggleTheme theme={theme} setTheme={setTheme} />
                <UserProfile user={user} />
            </div>

            <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-4 pb-24 text-center">
                <img src="/video_chat.svg" alt="Video conference illustration" className="w-full max-w-sm h-auto object-contain"/>

                <h2 className="mt-4 text-xl font-semibold">
                    Your Canvas. Your Crew. Your Creativity.
                </h2>

                <p className={`mt-2 max-w-md text-sm ${  theme ? "text-gray-500" : "text-gray-400" }`} >
                    Discuss ideas, collaborate on the board, and connect with
                    your team in real time.
                </p>
            </div>

            <div onMouseDown={() => setDragging(true)} style={{ right: 20, bottom: 20, left: "auto", top: "auto", }} className={`fixed z-10001 flex items-center gap-2 rounded-full border border-slate-200/50 px-3 py-2 shadow-xl backdrop-blur select-none cursor-move ${
                    theme ? "bg-white/95" : "bg-zinc-900/95"
                }`}
            >
                <button onClick={() => {
                        const boardState = !whiteboardOpen;
                        setWhiteboardOpen(boardState);
                        localStorage.setItem("board", String(boardState));
                    }}
                    className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition-colors ${
                        whiteboardOpen
                            ? theme
                                ? "text-slate-700 hover:bg-slate-100"
                                : "text-white hover:bg-slate-800"
                            : "bg-red-50 text-red-600 hover:bg-red-100" }`}
                    title={ whiteboardOpen ? "Close whiteboard" : "Open whiteboard"}>
                    {whiteboardOpen ? ( <PenLine size={16} />) : ( <PenOff size={16} /> )}
                    <span className="hidden sm:inline">Whiteboard</span>
                </button>

                <span className="h-6 w-px bg-slate-300/50" />

                <button
                    onClick={() => {
                        const videoState = !sidebarOpen;
                        setSidebarOpen(videoState);
                        localStorage.setItem("scene", String(videoState));
                    }}
                    className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition-colors ${
                        sidebarOpen
                            ? theme
                                ? "text-slate-700 hover:bg-slate-100"
                                : "text-white hover:bg-slate-800"
                            : "bg-red-50 text-red-600 hover:bg-red-100"
                    }`}
                    title={
                        sidebarOpen ? "Close video panel" : "Open video panel"
                    }
                >
                    {sidebarOpen ? ( <Video size={16} /> ) : (<VideoOff size={16} />)}
                    <span className="hidden sm:inline">Video</span>
                </button>
            </div>
        </div>
    );
}

   return (
        <div className="relative flex h-screen w-screen overflow-hidden bg-linear-to-br from-slate-100 to-slate-200">
            <div
                className={`h-full relative z-0 overflow-hidden transition-all duration-300 ease-in-out ${
                    whiteboardOpen ? 'flex-1 min-w-0' : 'w-0 flex-none'}`}>
                <div className="h-200 w-full min-w-[320px] relative" style={{touchAction:'none',overscrollBehavior:"contain"}}>
                    <div className="absolute inset-0 z-9999 pointer-events-none overflow-hidden">
                        {Object.entries(cursors).map(([id, pos]) => {
                            const color = colorForId(id);
                            return (
                                <div key={id} className="absolute transition-all duration-75 ease-out" style={{
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

                    <Tldraw licenseKey={import.meta.env.VITE_TLDRAW_LICENSE_KEY} onMount={handleMount} autoFocus     forceMobile={isMobile}/>
                </div>
            </div>

            <div
                className={`h-full bg-white/95 backdrop-blur border-l border-slate-200 shadow-xl flex flex-col z-10000 transition-all duration-300 ease-in-out overflow-hidden  ${
                    sidebarOpen ? (whiteboardOpen ? 'w-80' : 'w-full') : 'w-0'} ${theme?"text-black":"bg-zinc-950 text-white"}`}
            >
                <div className={`h-full flex flex-col ${whiteboardOpen ? 'w-80' : 'w-full'}`}>
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
                        <h2 className={`text-sm font-semibold tracking-wide ${theme?"text-slate-800":"text-white"}`}>Collaborators</h2>
                         <div className='flex justify-center items-center gap-2'>
                            <ToggleTheme theme={theme} setTheme={setTheme}/>
                          <UserProfile user={user}/>
                         </div>
                    </div>

                    <div className={`flex-1 overflow-y-auto p-4 ${whiteboardOpen ? '' : 'max-w-3xl mx-auto w-full'}`}>
                        <Users socket={socket} fullscreen={!whiteboardOpen} />
                    </div>
                </div>
            </div>

<div
    onMouseDown={() => setDragging(true)}
    style={{right:20, bottom:60, left: "auto", top:"auto"}}
    className={`${theme?"bg-white/95":"bg-transparent"} fixed z-10001 flex items-center gap-2 backdrop-blur px-3 py-2 rounded-full shadow-xl border border-slate-200 cursor-move select-none`}
>
    <button
        onClick={() =>{
            const boardState=!whiteboardOpen
            setWhiteboardOpen(boardState)
             localStorage.setItem("board",boardState)
        }}
        className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold transition-colors ${
            whiteboardOpen
                ? `${theme?'text-slate-700 hover:bg-slate-100':'text-white hover:bg-slate-900'}`
                : 'text-red-600 bg-red-50 hover:bg-red-100'
        }`}
        title={whiteboardOpen ? 'Close whiteboard' : 'Open whiteboard'}
    >
        {whiteboardOpen ? <PenLine size={16} /> : <PenOff size={16} />}
        <span className="hidden sm:inline">Whiteboard</span>
    </button>

    <span className="h-6 w-px bg-slate-200" />

    <button
        onClick={() => {
            const videoState=!sidebarOpen
            setSidebarOpen(videoState)
             localStorage.setItem("scene",videoState)
        }}
        className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold transition-colors ${
            sidebarOpen
                ? `${theme?'text-slate-700 hover:bg-slate-100':'text-white hover:bg-slate-900'}`
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
