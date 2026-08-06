import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { useRef } from 'react';
import {Peer} from 'peerjs'
import VideoStream from './VideoStream';
import { authClient } from '../lib/auth-client';
import { UserProfile } from '../components/logout';
import { toast } from 'sonner';
import { MyVideoTile } from './MyVideoTile';


function Users({socket, fullscreen}) {
    const {data:session}=authClient.useSession();
    const user=session?.user;
    const navigate=useNavigate()
    const {roomid}=useParams()
    // const socket=useMemo(()=>io('http://localhost:3000'),[]);
    // const myVideoRef=useRef();
    const [presenter,setPresenter]=useState(null)
    const [mystream,setmyStream]=useState(null)
    const [cursors, setCursors] = useState({}); // { userId: {x, y} }
    // State to keep track of all remote streams
    const [remoteStreams,setRemoteStreams]=useState([]);
    const [state,setState]=useState(false);
    let [name,setName]=useState('User123')
    
    const BASE_LINK=import.meta.env.VITE_CLIENT_URL

    // We use a ref for the peer instance so it persists across renders correctly
     const peers=useRef({})
     const peerId=useRef(null)
     const cameraStreamRef=useRef(null)
     const currentStreamRef=useRef(null)
     
     const shareScreen=async()=>{
        setPresenter(peerId.current)
        const screen=await navigator.mediaDevices.getDisplayMedia({
            video:true,
            audio:true,
        })
        currentStreamRef.current=screen
        setmyStream(screen)
        const screenTrack=screen.getVideoTracks()[0];
        Object.values(peers.current).forEach((call)=>{
            if(!call.peerConnection){
                console.log("peerConnection is not Ready");
                return;
            }
            const sender=call.peerConnection.getSenders().find((s)=>s.track?.kind==="video");
            sender?.replaceTrack(screenTrack)
        })
        socket.emit('presentation-start',{
            roomId:roomid,
            presenter:peerId.current
        })
        screenTrack.onended=()=>{
            socket.emit('presentation-stop',roomid)
            setPresenter(null)
            const cameraTrack=cameraStreamRef.current.getVideoTracks()[0];
            currentStreamRef.current=cameraStreamRef.current;
            setmyStream(cameraStreamRef.current)

            Object.values(peers.current).forEach((call)=>{
                const sender=call.peerConnection.getSenders().find((s)=>s.track?.kind==="video");
                sender?.replaceTrack(cameraTrack)
            })
        }
     }
     
     useEffect(()=>{
        const start=id=>setPresenter(id)
        const stop=()=>setPresenter(null)
        socket.on('presentation-start',start)
        socket.on('presentation-stop',stop)
        return()=>{
            socket.off('presentation-start',start)
            socket.off('presentation-stop',stop)
        }
     },[socket])

     useEffect(()=>{
        const peer=new Peer(undefined,{
           host:import.meta.env.VITE_PEER_HOST_URL,
           path:'/peerjs',
           port:import.meta.env.VITE_PEER_PORT,
           secure:import.meta.env.VITE_CONNECTION_SECURE==="true",//import.meta.env always return string not boolean or integer
        })

      peer.on('open',async (id)=>{
          console.log(`My peer id is:${id}`);
          peerId.current=id

          if(roomid){
              //take the localstream
           const camera = await navigator.mediaDevices.getUserMedia({
                  video:true,
                  audio:true,
                })
                cameraStreamRef.current=camera
                currentStreamRef.current=camera
                setmyStream(currentStreamRef.current)
                //then we answer the call by sending our stream first and collectiong the remotestreams
                peer.on('call',call=>{
                    call.answer(currentStreamRef.current);
                    call.on('stream',remotestream=>{
                        addRemoteStream(remotestream,call.peer)
                    })
                        peers.current[call.peer]=call
                })
                
                //Now join the room 
                socket.emit('join-room',roomid,id,name)
                
                //Listen for new users and send the stream
                socket.on('user-connected',(userId)=>{
                    console.log(`A new user is connected having the userId : ${userId}`);
                    setTimeout(() => {
                        const call=peer.call(userId,currentStreamRef.current)
                        call.on('stream',(userVideostream)=>{
                            addRemoteStream(userVideostream,userId)
                        })
                        peers.current[userId]=call;
                    }, 1000);
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

    const totalTiles = remoteStreams.length + 1;
    const gridCols = useMemo(() => {
        if (totalTiles <= 1) return 1;
        if (totalTiles <= 4) return 2;
        if (totalTiles <= 9) return 3;
        if (totalTiles <= 16) return 4;
        return 5;
    }, [totalTiles]);

    let presenterStream=
                         presenter==peerId.current?mystream : remoteStreams.find(s=>s.id===presenter)?.stream
    let others=
                presenter===peerId.current?remoteStreams:remoteStreams.filter(s=>s.id!==presenter)
    const isPresentationMode=presenter!==null
    return (
        <div className="relative w-full h-full flex flex-col ">

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
       {isPresentationMode?(
           <div>
                <div className='col-span-full h-[75vh]'>
                     <VideoStream  stream={presenterStream} name="Host" isPresentationMode={isPresentationMode}/>
                 </div>
                 <div className="flex gap-2 overflow-x-auto">
                    {others.map(User => (
                        <div key={User.id} className="w-80">
                             <VideoStream
                                  stream={User.stream}
                                   name={user.name}
                                />
                          </div>
                         ))}
            </div>
         </div>
             ):(
                  fullscreen ? (
                           <div
                              className="mt-3 flex-1 min-h-0 grid gap-2 auto-rows-fr overflow-y-auto pr-1"
                               style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
                             >
                             <MyVideoTile  stream={mystream} shareScreen={shareScreen}/>
                                 {remoteStreams.map((obj)=>(
                                     <VideoStream name={user.name} stream={obj.stream}/>
                                 ))}
                            </div>
                          ) : (
                           <div className="mt-3 flex-1 min-h-0 flex flex-col gap-2 overflow-y-auto pr-1">
                                <MyVideoTile stream={mystream} shrink shareScreen={shareScreen}/>
                
                                {remoteStreams.map((obj)=>(
                                    <div key={obj.id} className="shrink-0">
                                        <VideoStream name={user.name} stream={obj.stream}/>
                                    </div>
                                )) }
                          </div>
        )
 )}
    </div>
    )
}

export default Users