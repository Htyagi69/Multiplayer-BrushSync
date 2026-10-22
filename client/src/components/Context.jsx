import React, { createContext, useContext, useState } from 'react'

export const themeProvider=createContext()
function Context({children}) {
    const [theme,setTheme]=useState(()=>{
        const savedTheme=localStorage.getItem("theme")
        return savedTheme==="true"
      })
      const [sidebarOpen, setSidebarOpen] = useState(()=>{
        const scene=localStorage.getItem("scene")
        return scene==="true"
      });
      const [whiteboardOpen, setWhiteboardOpen] = useState(()=>{
        const board=localStorage.getItem("board")
        return board==="true"
    });
    return (
      <themeProvider.Provider value={{theme,setTheme,sidebarOpen,setSidebarOpen,whiteboardOpen,setWhiteboardOpen}}>
        {children}
      </themeProvider.Provider>
    )
}

export default Context
