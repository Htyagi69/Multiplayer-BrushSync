import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { useRef } from 'react';
import {Peer} from 'peerjs'
import VideoStream from './VideoStream';
import { User,LogOut, Mic, MicOff, Video, VideoOff, X, Maximize, Minimize,ScreenShare } from 'lucide-react';
import { authClient } from '../lib/auth-client';
import { UserProfile } from '../components/logout';
import { toast } from 'sonner';

// Stable, top-level component (NOT defined inside Users) so it never gets
// remounted on re-render — that was the bug causing the video to disappear.
function MyVideoTile({ stream, shrink }) {
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
                    <button onClick={handleClose} className="text-white hover:text-red-400">
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

function Users({socket, fullscreen}) {
    const {data:session}=authClient.useSession();
    const user=session?.user;
    const navigate=useNavigate()
    const {roomid}=useParams()
    // const socket=useMemo(()=>io('http://localhost:3000'),[]);
    const myVideoRef=useRef();
    const [mystream,setmyStream]=useState(null)
    const [cursors, setCursors] = useState({}); // { userId: {x, y} }
    // State to keep track of all remote streams
    const [remoteStreams,setRemoteStreams]=useState([]);
    const [state,setState]=useState(false);
    let [name,setName]=useState('User123')
    
    const BASE_LINK=import.meta.env.VITE_CLIENT_URL

    // We use a ref for the peer instance so it persists across renders correctly
     const peers=useRef({})

     useEffect(()=>{
        const peer=new Peer(undefined,{
           host:import.meta.env.VITE_PEER_HOST_URL,
           path:'/peerjs',
           port:import.meta.env.VITE_PEER_PORT,
           secure:true,
        })

      peer.on('open',(id)=>{
          console.log(`My peer id is:${id}`);

          if(roomid){

              //take the localstream
              navigator.mediaDevices.getUserMedia({
                  video:true,
                  audio:true,
                }).then((localstream)=>{
                setmyStream(localstream)
                if(myVideoRef.current){
                    myVideoRef.current.srcObject= localstream;
                }
                //then we answer the call by sending our stream first and collectiong the remotestreams
                peer.on('call',call=>{
                    call.answer(localstream);
                    call.on('stream',remotestream=>{
                        addRemoteStream(remotestream,call.peer)
                    })
                })
                
                //Now join the room 
                socket.emit('join-room',roomid,id,name)
                
                //Listen for new users and send the stream
                socket.on('user-connected',(userId)=>{
                    console.log(`A new user is connected having the userId : ${userId}`);
                    setTimeout(() => {
                        const call=peer.call(userId,localstream)
                        call.on('stream',(userVideostream)=>{
                            addRemoteStream(userVideostream,userId)
                        })
                        peers.current[userId]=call;
                    }, 1000);
                })
            })
        }
    })

        socket.on('user-disconnected',(userId)=>{
            console.log(`${userId} leaves the room`);
            if(peers.current[userId]) peers.current[userId].close();
                    // Remove the stream from the UI
                    setRemoteStreams(prev=>prev.filter(s=>s.id!==userId))
               })
        return () =>{
            peer.destroy();
            socket.off('user-connected') 
            socket.off('user-disconnected') 
            socket.off('user-mouse-moved'); 
        }
    },[roomid,name])

    useEffect(()=>{
        function handleMouseMove(e){
            const x=e.clientX/window.innerWidth;
            const y=e.clientY/window.innerHeight;
            socket.emit('mouse-move',{x,y,roomId:roomid});
        }
        window.addEventListener('mousemove',handleMouseMove);
        return ()=>window.removeEventListener('mousemove',handleMouseMove)
    },[socket,roomid])

    const addRemoteStream=(stream,id)=>{
        setRemoteStreams((prev)=>{
            // Check if stream already exists to avoid duplicates
            if(prev.find(s=>s.id===id)) return prev;
            return [...prev,{id,stream}]
        })
    }

    useEffect(() => {
    socket.on('user-mouse-moved', (data) => {
        setCursors(prev => ({
            ...prev,
            [data.userId]: { x: data.x, y: data.y }
        }));
    });

    return () => socket.off('user-mouse-moved');
}, [socket]);

    async function roomCreation(){
        if(!roomid){
        const response=await fetch(`${import.meta.env.VITE_SERVER_URL}/room`,{
            method:'GET',
        })
        const res = await response.json(); 

         toast.success("Share this link")
        let  Room_ID=res.roomId;
        console.log("Rommid:",Room_ID);
        setState(true);
        await  LinkofMeet(`${BASE_LINK}/${Room_ID}`) 
         navigate(`/${Room_ID}`)
    }
    }

    async function LinkofMeet(link){
        try{
        await navigator.clipboard.writeText(link)
        }catch(err){
            console.error("Failed to copy",err)
        }
    }

    function handleName(e){
        console.log("name",e.target.value);   
      setName(e.target.value)
    }

    // --- Grid layout math (only used when fullscreen) ---
    const totalTiles = remoteStreams.length + 1;
    const gridCols = useMemo(() => {
        if (totalTiles <= 1) return 1;
        if (totalTiles <= 4) return 2;
        if (totalTiles <= 9) return 3;
        if (totalTiles <= 16) return 4;
        return 5;
    }, [totalTiles]);

    return (
        <div className="relative w-full h-full flex flex-col overflow-hidden">

        {/* Cursor dots (kept as-is) */}
        {Object.entries(cursors).map(([id, pos]) => (
            <div
                key={id}
                style={{
                    position: 'absolute',
                    left: `${pos.x * 100}%`,
                    top: `${pos.y * 100}%`,
                    width: '10px',
                    height: '10px',
                    backgroundColor: 'red',
                    borderRadius: '50%',
                    pointerEvents: 'none', // Important: don't block clicks
                    zIndex: 100,
                    transition: 'all 0.1s ease-out' // Makes the movement smooth
                }}
            />
        ))}

        <div className='flex gap-2 justify-between items-center shrink-0'>
            <button onClick={roomCreation} className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-xs font-semibold shadow-sm transition-colors">
                {state ? `Invite your friends` : `Create and Join Room`}
            </button>

           <UserProfile user={user}/>
        </div>

        {fullscreen ? (
            /* GRID VIEW — whiteboard closed, video panel has the full screen */
            <div
                className="mt-3 flex-1 min-h-0 grid gap-2 auto-rows-fr overflow-y-auto pr-1"
                style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
            >
                <MyVideoTile stream={mystream} />

                {remoteStreams.map((obj)=>(
                    <VideoStream key={obj.id} stream={obj.stream}/>
                ))
                 }
            </div>
        ) : (
            /* QUEUE VIEW — whiteboard open, panel is narrow, tiles stack vertically and scroll */
            <div className="mt-3 flex-1 min-h-0 flex flex-col gap-2 overflow-y-auto pr-1">
                <MyVideoTile stream={mystream} shrink />

                {remoteStreams.map((obj)=>(
                    <div key={obj.id} className="shrink-0">
                        <VideoStream stream={obj.stream}/>
                    </div>
                ))
                 }
            </div>
        )}
    </div>
    )
}

export default Users