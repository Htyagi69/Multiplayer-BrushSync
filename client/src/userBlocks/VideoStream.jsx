import React, { useEffect } from 'react'
import { useRef } from 'react';

function VideoStream({stream}) {
    const  VideoRef=useRef();
    useEffect(()=>{
        if(VideoRef.current) VideoRef.current.srcObject=stream;
    },[stream])
    return (
        <div className=' w-70 h-67 rounded-2xl text-amber-300 border-4'>
             <video 
                    ref={VideoRef} 
                    autoPlay 
                    className="w-full h-full object-cover rounded-2xl "
                />
        </div>
    )
}

export default VideoStream
