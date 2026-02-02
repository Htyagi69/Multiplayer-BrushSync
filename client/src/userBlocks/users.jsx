import React, { useEffect, useState } from 'react'
import {io} from 'socket.io-client'
import { useNavigate, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { useRef } from 'react';
import {Peer} from 'peerjs'
import VideoStream from './VideoStream';

function Users({socket}) {
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
    
    const BASE_LINK='http://localhost:5173/'

    // We use a ref for the peer instance so it persists across renders correctly
     const peers=useRef({})

     useEffect(()=>{
        const peer=new Peer(undefined,{
           host:'localhost',
           path:'/peerjs',
           port:3001,
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
        }
    },[socket,roomid,name])

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
        const response=await fetch('http://localhost:3000/room',{
            method:'GET',
        })
        const res = await response.json(); 
        let  Room_ID=res.roomId;
        console.log("Rommid:",Room_ID);
        setState(true);
        await  LinkofMeet(`${BASE_LINK}${Room_ID}`) 
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

    return (
        <div className="relative w-screen h-screen overflow-hidden">
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
            <button onClick={roomCreation} className="p-4 bg-blue-500 text-white rounded-2xl">
                {state ? `Invite your friends` : `Create and Join Room`}
                <br/>
                   {state? `(you got the link)`:``}
            </button>

        <input type='text' id='naam' value={name}  onChange={(e)=>handleName(e)} className='text-black'/>

        <div className=' w-67 h-56 rounded-2xl text-amber-300  '>
           {/* 3. The video tag MUST have autoPlay and muted (for local) */}
                <video 
                    ref={myVideoRef} 
                    autoPlay   
                    muted 
                    className="w-full h-full object-cover transform -scale-x-100 rounded-2xl "
                />
        </div>
        <div className='border-4 text-black w-65 flex flex-wrap justify-evenly'>

        {remoteStreams.map((obj)=>(
            <VideoStream key={obj.id} stream={obj.stream}/>
        ))
         }
    </div>
        </div>
    )
}

export default Users
