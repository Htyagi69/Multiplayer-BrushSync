import './App.css'
import { BrowserRouter, Routes,Route,Navigate } from 'react-router-dom';
import AuthPages from './components/AuthPages';
import { authClient } from './lib/auth-client';
import Dashboard from './components/Dashboard';
import { Toaster } from 'sonner';

function App() { 
        const {data:session,isPending,error}=authClient.useSession();
        console.log("Session:", session);
    console.log("Is Pending:", isPending);
    console.log("Error:", error);
        if(isPending) return <div>Loading...</div>
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
