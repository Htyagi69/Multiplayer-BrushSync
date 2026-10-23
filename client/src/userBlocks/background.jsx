import React, { useContext } from 'react';
import { backGroundImages } from '../assets/constants';
import { themeProvider } from '@/components/Context';

function Background({ setBgChange, backgroundId, setBgBox }) {
    const {whiteboardOpen,theme}=useContext(themeProvider)
  const BackgroundId = (id) => {
    backgroundId.current = id;
    setBgChange((prev) => !prev);
    setBgBox(false);
    console.log('Background selected:', id);
  };

  return (
    <div className="w-full">
      <h3 className={`mb-3 text-sm font-semibold ${theme?"text-black":"text-white"}`}>
        Choose Background
      </h3>

      <div className={`grid ${whiteboardOpen?"grid-cols-3":"grid-cols-5"} gap-3`}>
        {backGroundImages.map((obj, index) => {
          const image = Object.values(obj)[0];
          return (
            <button
              key={index}
              type="button"
              onClick={() => BackgroundId(image)}
              className="aspect-video min-w-0 overflow-hidden rounded-xl cursor-pointer
                         ring-1 ring-white/10 hover:ring-2 hover:ring-blue-400
                         transition-all duration-200"
            >
              <img
                src={image}
                alt={`Background option ${index + 1}`}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Background;
