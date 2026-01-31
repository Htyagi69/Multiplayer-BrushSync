import React, { useEffect, useState } from 'react'
import {io} from 'socket.io-client'
import { useNavigate, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { useRef } from 'react';
import {Peer} from 'peerjs'
import VideoStream from './VideoStream';
import { videoShapeMigrations } from 'tldraw';

function Users() {
    const navigate=useNavigate()
    const {roomid}=useParams()
    const socket=useMemo(()=>io('http://localhost:3000'),[]);
    const myVideoRef=useRef();
    const [mystream,setmyStream]=useState(null)
    // State to keep track of all remote streams
    const [remoteStreams,setRemoteStreams]=useState([]);
    

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
                socket.emit('join-room',roomid,id)
                
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
    },[socket,roomid])

    const addRemoteStream=(stream,id)=>{
        setRemoteStreams((prev)=>{
            // Check if stream already exists to avoid duplicates
            if(prev.find(s=>s.id===id)) return prev;
            return [...prev,{id,stream}]
        })
    }


    async function roomCreation(){
        if(!roomid){
        const response=await fetch('http://localhost:3000/room',{
            method:'GET',
        })
        const res = await response.json();  
        let  Room_ID=res.roomId;
        console.log("Rommid:",Room_ID);
         navigate(`/${Room_ID}`)
    }
    }
    return (
        <div>
            <button onClick={roomCreation} className="p-4 bg-blue-500 text-white">
                Create and Join Room
            </button>
        <div className=' w-67 h-56 rounded-2xl text-amber-300  '>
           {/* 3. The video tag MUST have autoPlay and muted (for local) */}
                <video 
                    ref={myVideoRef} 
                    autoPlay   
                    muted 
                    className="w-full h-full object-cover transform -scale-x-100"
                />
        </div>
        {remoteStreams.map((obj)=>(
            <VideoStream key={obj.id} stream={obj.stream}/>
        ))
        }
        </div>
    )
}

export default Users
