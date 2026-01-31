import './App.css'
import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'
import Users from './userBlocks/users';
import { BrowserRouter, Routes,Route } from 'react-router-dom';

function MainLayout(){
   return (
   <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      
      {/* 2. Whiteboard Area: 'flex-1' forces it to fill all remaining space */}
      <div className="flex-1 h-full relative z-0">
        <Tldraw />
      </div>

      {/* 3. Users Sidebar: Fixed width, white background, shadow for depth */}
      <div className="w-80 h-full bg-white border-l border-gray-200 shadow-lg flex flex-col z-10">
        
        {/* Optional Header for the sidebar */}
        <div className="p-4 border-b border-gray-100 font-semibold text-gray-700">
          Team Members
        </div>
        
        {/* User list container with scroll if list gets long */}
        <div className="flex-1 overflow-y-auto p-4">
          <Users />
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
