import './App.css'
import { BrowserRouter, Routes,Route,Navigate } from 'react-router-dom';
import AuthPages from './components/AuthPages';
import { authClient } from './lib/auth-client';
import Dashboard from './components/Dashboard';
import { Toaster } from 'sonner';
import { Video } from 'lucide-react';

function App() { 
        const {data:session,isPending,error}=authClient.useSession();
        console.log("Session:", session);
    console.log("Is Pending:", isPending);
    console.log("Error:", error);
       if (isPending) {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="flex flex-col items-center">
                <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                        <Video
                            size={30}
                            className="text-white"
                        />
                    </div>

                    {/* Pulse */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-blue-500 animate-ping opacity-20" />
                </div>

                {/* App name */}
                <h1 className="text-xl font-semibold text-white">
                    MultiplayerBrushSync 
                </h1>

                {/* Loading indicator */}
                <div className="flex items-center gap-2 mt-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                    <div
                        className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"
                        style={{ animationDelay: "150ms" }}
                    />
                    <div
                        className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"
                        style={{ animationDelay: "300ms" }}
                    />
                </div>

                <p className="text-slate-500 text-xs mt-3">
                    Connecting...
                </p>

            </div>
        </div>
    );
}
  return(
  <BrowserRouter>
  <Toaster richColors closeButton/>
     <Routes>
       <Route path='/auth' element={<AuthPages/>}/>
       <Route path='/'  element={session?<Dashboard/>:<Navigate to="/auth"/>}/>
       <Route path='/:roomid' element={session?<Dashboard/>:<Navigate to="/auth"/>}/>
     </Routes>
  </BrowserRouter>
  )
}

export default App
