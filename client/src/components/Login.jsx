import React,{useState} from 'react'
import {BrandLogo,InputField,EyeIcon,GoogleIcon} from './Icons'
import { authClient } from '../lib/auth-client';
import { toast } from 'sonner';

const LoginPage = ({ onSwitch,from,navigate }) => {
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(false);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSignInWithEmail=async()=>{
    const { data, error } = await authClient.signIn.email({
        email:form.email,
        password:form.password,
        callbackURL: `${import.meta.env.VITE_CLIENT_URL}${from}`, // A URL to redirect to after the user verifies their email (optional)
        /**
         * remember the user session after the browser is closed. 
         * @default true
         */
        rememberMe: false
},{
     onSuccess: () => {
            toast.success(`Welcome!:${from}`);
            navigate(from)
        },
        onError: (ctx) => {
            toast.error(ctx.error.message || "Something went wrong");
        }
})
  }
const handleGoogleAuth=async()=>{
  try{
    await authClient.signIn.social({
    provider: "google",
    callbackURL:`${import.meta.env.VITE_CLIENT_URL}${from}`,
    errorCallbackURL: `${import.meta.env.VITE_CLIENT_URL}/error`,
    newUserCallbackURL: import.meta.env.VITE_CLIENT_URL,
})
  }catch (e) {
        toast.error("Failed to initiate Google login");
    }
}

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-10 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200 shadow-sm px-9 py-10 animate-[fadeUp_0.35s_ease_both]">
        {/* <BrandLogo /> */}
         <img src="/brush.png" className='w-12' />
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight mb-1">Welcome back</h1>
        <p className="text-sm text-gray-400 mb-7">Sign in to continue to your account.</p>

        {/* Google Button */}
        <button 
        className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 border border-stone-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-stone-50 hover:border-stone-300 transition-all mb-6"
        onClick={handleGoogleAuth}>
          <GoogleIcon />
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-stone-200" />
          <span className="text-xs text-gray-400">or sign in with email</span>
          <div className="flex-1 h-px bg-stone-200" />
        </div>

        {/* Fields */}
        <InputField label="Email address" type="email" placeholder="jane@example.com" value={form.email} onChange={set("email")} />
        <InputField
          label="Password"
          type={showPw ? "text" : "password"}
          placeholder="Enter your password"
          value={form.password}
          onChange={set("password")}
        >
          <button
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <EyeIcon open={showPw} />
          </button>
        </InputField>

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between mb-5 mt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={() => setRemember(!remember)}
              className={`w-4 h-4 rounded flex items-center justify-center border transition-all cursor-pointer ${
                remember ? "bg-gray-900 border-gray-900" : "border-gray-300 bg-white"
              }`}
            >
              {remember && (
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                  <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="text-xs text-gray-500 font-medium">Remember me</span>
          </label>
          <a href="#" className="text-xs text-gray-500 font-medium hover:text-gray-900 border-b border-transparent hover:border-gray-400 transition-all">
            Forgot password?
          </a>
        </div>

        {/* Submit */}
        <button className="w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 active:scale-[0.985] transition-all"
        onClick={handleSignInWithEmail}>
          Sign in
        </button>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400 mt-5">
          Don't have an account?{" "}
          <button onClick={onSwitch} className="text-gray-900 font-medium border-b border-gray-300 hover:border-gray-900 transition-colors">
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};


export default LoginPage
