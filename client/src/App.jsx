import './App.css'
import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'
import Users from './userBlocks/users';
import { BrowserRouter, Routes,Route } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useEffect,useState, useMemo} from 'react';
import { io } from 'socket.io-client';

function MainLayout(){
   const {roomid}=useParams()
      const [cursors, setCursors] = useState({}); // { userId: {x, y} }
        const socket=useMemo(()=>io('https://multiplayer-brushsync-1.onrender.com'),[]);

        // --- DRAWING SYNC LOGIC ---
    const handleMount = (editor) => {
        // 1. Send your drawings to others
        editor.store.listen((event) => {
            // Only sync if the change came from the user (not a remote update)
            if (event.source !== 'user') return;

            socket.emit('drawing-change', {
                roomid,
                changes: event.changes,
            });
        });

        // 2. Receive drawings from others
        socket.on('drawing-change', (data) => {
            // Apply the remote changes to your local board
            editor.store.mergeRemoteChanges(() => {
                editor.store.applyDiff(data.changes);
            });
        });
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

   return (
        <div className="flex h-screen w-screen overflow-hidden bg-gray-50"> 
            <div className="flex-1 h-full relative z-0 overflow-hidden">
        
        {/* REMOTE CURSORS LAYER */}
        {/* We wrap all cursors in a single absolute container with the highest z-index */}
       <div className="absolute inset-0 z-9999 pointer-events-none overflow-hidden">
            {Object.entries(cursors).map(([id, pos]) => (
                <div
                    key={id}
                    className="absolute transition-all duration-75 ease-out"
                    style={{
                        left: `${pos.x * 100}%`,
                        top: `${pos.y * 100}%`,
                    }}
                >
                    {/* The Cursor Arrow */}
                    <svg
                        className="h-5 w-5 text-blue-500 fill-current drop-shadow-md"
                        viewBox="0 0 24 24"
                    >
                        <path d="M7 2l12 11.2l-5.8 0.5l3.3 7.3l-2.2 1l-3.2-7.4L7 19V2z" />
                    </svg>
                    
                    {/* User Label */}
                    <div className="ml-3 mt-1 rounded bg-blue-500 px-1.5 py-0.5 text-[10px] text-white font-bold shadow-md whitespace-nowrap">
                         {pos.name}
                    </div>
                </div>
            ))}
        </div>

        {/* TLDRAW BOARD */}
       <Tldraw onMount={handleMount} autoFocus />
      </div>

      {/* Sidebar Area */}
      <div className="w-80 h-full bg-white border-l border-gray-200 shadow-lg flex flex-col z-10000">
                <div className="flex-1 overflow-y-auto p-4">
                    <Users socket={socket} />
                </div>
            </div>

    </div>
)
}

function App() { 
  return(
  <BrowserRouter>
     <Routes>
       <Route path='/' element={<MainLayout/>}/>
       <Route path='/:roomid' element={<MainLayout/>}/>
     </Routes>
  </BrowserRouter>
  )
}

export default App
