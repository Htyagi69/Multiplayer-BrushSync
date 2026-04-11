import { useState } from "react";
import LoginPage from './Login'
import SignupPage from './Signup'

export default function AuthPages() {
  const [page, setPage] = useState("signup");
  

  return page === "signup"
    ? <SignupPage  onSwitch={() => setPage("login")} />
    : <LoginPage  onSwitch={() => setPage("signup")} />;
}