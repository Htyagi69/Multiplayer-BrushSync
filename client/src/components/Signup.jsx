import React,{useState} from 'react'
import {BrandLogo,InputField,EyeIcon,GoogleIcon} from './Icons'
import {authClient} from '../lib/auth-client'
import { toast } from 'sonner';

const SignupPage = ({ onSwitch,navigate,from }) => {
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSignUpWithEmail=async()=>{
      const { data, error } = await authClient.signUp.email({
          email:form.email, // user email address
          password:form.password, 
          name:form.name, // user display name
          callbackURL: `${import.meta.env.VITE_CLIENT_URL}${from}`, // A URL to redirect to after the user verifies their email (optional)
        }, {
        onRequest: (ctx) => {
            console.log("Loading",ctx);
        },
        onSuccess: async(ctx) => {
            navigate(from);
            toast.success("Welcome to BrushSync")
            console.log("Successfully done",ctx);
        },
        onError: (ctx) => {
            toast.error(ctx.error.message);
        },
    });
    console.log("data",data);
    if(error)  console.log("err",error);
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
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight mb-1">Create your account</h1>
        <p className="text-sm text-gray-400 mb-7">Get started — it's completely free.</p>

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
          <span className="text-xs text-gray-400">or sign up with email</span>
          <div className="flex-1 h-px bg-stone-200" />
        </div>

        {/* Fields */}
        <InputField label="Full name" placeholder="Jane Smith" value={form.name} onChange={set("name")} />
        <InputField label="Email address" type="email" placeholder="jane@example.com" value={form.email} onChange={set("email")} />
        <InputField
          label="Password"
          type={showPw ? "text" : "password"}
          placeholder="Min. 8 characters"
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

        {/* Submit */}
        <button 
        className="w-full mt-1 py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 active:scale-[0.985] transition-all"
        onClick={handleSignUpWithEmail}>
          Create account
        </button>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400 mt-5">
          Already have an account?{" "}
          <button onClick={onSwitch} className="text-gray-900 font-medium border-b border-gray-300 hover:border-gray-900 transition-colors">
            Sign in
          </button>
        </p>
        <p className="text-center text-xs text-gray-300 mt-3 leading-relaxed">
          By signing up, you agree to our{" "}
          <a href="#" className="underline hover:text-gray-500 transition-colors">Terms</a> and{" "}
          <a href="#" className="underline hover:text-gray-500 transition-colors">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
};

export default SignupPage
