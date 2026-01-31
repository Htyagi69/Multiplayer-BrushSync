import React, { useEffect } from 'react'
import { useRef } from 'react';

function VideoStream({stream}) {
    const  VideoRef=useRef();
    useEffect(()=>{
        if(VideoRef.current) VideoRef.current.srcObject=stream;
    },[stream])
    return (
        <div className=' w-67 h-56 rounded-2xl text-amber-300 '>
             <video 
                    ref={VideoRef} 
                    autoPlay 
                    className="w-full h-full object-cover "
                />
        </div>
    )
}

export default VideoStream
