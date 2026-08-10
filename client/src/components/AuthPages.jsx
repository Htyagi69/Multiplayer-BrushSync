import { useState } from "react";
import LoginPage from './Login'
import SignupPage from './Signup'
import {useNavigate,useLocation} from 'react-router-dom'

export default function AuthPages() {
  const [page, setPage] = useState("login");
  const location=useLocation()
   const navigate=useNavigate()
  const from=location.state?.from || "/";
   console.log("AUTH LOCATION:", location);
  console.log("AUTH FROM:", from);

  return page === "signup"
    ? <SignupPage from={from} navigate={navigate} onSwitch={() => setPage("login")} />
    : <LoginPage from={from}  navigate={navigate} onSwitch={() => setPage("signup")} />;
}
