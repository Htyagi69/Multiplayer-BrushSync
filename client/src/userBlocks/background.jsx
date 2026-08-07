import React from 'react'
import {backGroundImages} from '../assets/constants'

function Background({setBgChange,backgroundId,setBgBox}) {
    const BackgroundId=(id)=>{
        backgroundId.current=id;
        setBgChange(prev=>!prev)
        setBgBox(prev=>!prev)
        console.log("Id",backgroundId.current);
    }
 return (
        <div className="h-auto w-full p-2">
            <div className="grid grid-cols-5 gap-2">
                {backGroundImages.map((obj, index) => {
                    const image = Object.values(obj)[0];
                    return (
                        <button
                            key={index}
                            onClick={() => BackgroundId(image)}
                            className="rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-400"
                        >
                            <img
                                src={image}
                                alt="background option"
                                className="w-full aspect-video object-cover rounded-xl"
                            />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}


export default Background
