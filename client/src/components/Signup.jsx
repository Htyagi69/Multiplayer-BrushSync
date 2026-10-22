
import React, { useState } from 'react';
import { InputField, EyeIcon, GoogleIcon } from './Icons';
import { authClient } from '../lib/auth-client';
import { toast } from 'sonner';

const SignupPage = ({ onSwitch, navigate, from }) => {
    const [showPw, setShowPw] = useState(false);
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
    });

    const [dark, setDark] = useState(
        () => localStorage.getItem('loginTheme') === 'dark'
    );

    const toggleTheme = () => {
        setDark((prev) => {
            const next = !prev;
            localStorage.setItem('loginTheme', next ? 'dark' : 'light');
            return next;
        });
    };

    const set = (key) => (e) =>
        setForm((prev) => ({ ...prev, [key]: e.target.value }));

    const handleSignUpWithEmail = async () => {
        if (!form.name.trim() || !form.email.trim() || !form.password) {
            toast.error('Please fill in all fields');
            return;
        }

        if (form.password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        try {
            await authClient.signUp.email(
                {
                    email: form.email,
                    password: form.password,
                    name: form.name,
                    callbackURL: `${import.meta.env.VITE_CLIENT_URL}${from}`,
                },
                {
                    onRequest: () => {
                        toast.loading('Creating your account...', {
                            id: 'signup',
                        });
                    },
                    onSuccess: () => {
                        toast.success('Welcome to BrushSync!', {
                            id: 'signup',
                        });
                        navigate(from);
                    },
                    onError: (ctx) => {
                        toast.error(
                            ctx.error?.message || 'Failed to create account',
                            { id: 'signup' }
                        );
                    },
                }
            );
        } catch (error) {
            toast.error(error?.message || 'Something went wrong', {
                id: 'signup',
            });
        }
    };

    const handleGoogleAuth = async () => {
        try {
            await authClient.signIn.social({
                provider: 'google',
                callbackURL: `${import.meta.env.VITE_CLIENT_URL}${from}`,
                errorCallbackURL: `${import.meta.env.VITE_CLIENT_URL}/error`,
                newUserCallbackURL: import.meta.env.VITE_CLIENT_URL,
            });
        } catch (error) {
            toast.error('Failed to initiate Google login');
        }
    };

    return (
        <div
            className={`min-h-screen flex items-center justify-center px-4 py-10 font-sans transition-colors duration-300 ${
                dark ? 'bg-zinc-950' : 'bg-stone-50'
            }`}
        >
            <div
                className={`relative w-full max-w-md rounded-2xl border shadow-xl px-6 sm:px-9 py-10 animate-[fadeUp_0.35s_ease_both] transition-colors duration-300 ${
                    dark
                        ? 'bg-zinc-900 border-zinc-800 text-white'
                        : 'bg-white border-stone-200 text-gray-900 shadow-stone-200/50'
                }`}
            >
                {/* Theme toggle */}
                <button
                    type="button"
                    onClick={toggleTheme}
                    aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                    title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                    className={`absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                        dark
                            ? 'border-zinc-700 bg-zinc-800 text-amber-300 hover:bg-zinc-700'
                            : 'border-stone-200 bg-stone-50 text-zinc-700 hover:bg-stone-100'
                    }`}
                >
                    {dark ? (
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="12" cy="12" r="4" />
                            <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
                        </svg>
                    ) : (
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" />
                        </svg>
                    )}
                </button>

                <img
                    src="/brush.png"
                    alt="BrushSync logo"
                    className="w-12 h-auto mb-5"
                />

                <h1
                    className={`text-2xl font-semibold tracking-tight mb-1 ${
                        dark ? 'text-white' : 'text-gray-900'
                    }`}
                >
                    Create your account
                </h1>

                <p
                    className={`text-sm mb-7 ${
                        dark ? 'text-zinc-400' : 'text-gray-400'
                    }`}
                >
                    Get started — it's completely free.
                </p>

                <button
                    type="button"
                    onClick={handleGoogleAuth}
                    className={`w-full flex items-center justify-center gap-2.5 py-2.5 px-4 border rounded-xl text-sm font-medium transition-all mb-6 ${
                        dark
                            ? 'border-zinc-700 text-zinc-100 bg-zinc-800 hover:bg-zinc-700'
                            : 'border-stone-200 text-gray-700 bg-white hover:bg-stone-50 hover:border-stone-300'
                    }`}
                >
                    <GoogleIcon />
                    Continue with Google
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div
                        className={`flex-1 h-px ${
                            dark ? 'bg-zinc-700' : 'bg-stone-200'
                        }`}
                    />
                    <span
                        className={`text-xs ${
                            dark ? 'text-zinc-500' : 'text-gray-400'
                        }`}
                    >
                        or sign up with email
                    </span>
                    <div
                        className={`flex-1 h-px ${
                            dark ? 'bg-zinc-700' : 'bg-stone-200'
                        }`}
                    />
                </div>

                {/* Inputs */}
                <div
                    className={
                        dark
                            ? '[&_input]:bg-zinc-800! [&_input]:border-zinc-700! [&_input]:text-white! [&_input]:placeholder:text-zinc-500! [&_label]:text-zinc-300!'
                            : ''
                    }
                >
                    <InputField
                        label="Full name"
                        placeholder="Jane Smith"
                        value={form.name}
                        onChange={set('name')}
                    />

                    <InputField
                        label="Email address"
                        type="email"
                        placeholder="jane@example.com"
                        value={form.email}
                        onChange={set('email')}
                    />

                    <InputField  label="Password"  type={showPw ? 'text' : 'password'}  placeholder="Min. 8 characters"  value={form.password}  onChange={set('password')}>
                        <button type="button" onClick={() => setShowPw((prev) => !prev)} className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                                dark
                                    ? 'text-zinc-400 hover:text-white'
                                    : 'text-gray-400 hover:text-gray-600'
                            }`}
                            aria-label={showPw ? 'Hide password' : 'Show password'}
                        >
                            <EyeIcon open={showPw} />
                        </button>
                    </InputField>
                </div>

                <button  type="button"  onClick={handleSignUpWithEmail}  className={`w-full mt-4 py-3 text-white text-sm font-medium rounded-xl active:scale-[0.985] transition-all ${
                        dark
                            ? 'bg-blue-600 hover:bg-blue-500'
                            : 'bg-gray-900 hover:bg-gray-800'
                    }`}
                >
                    Create account
                </button>
                <p className={`text-center text-sm mt-5 ${ dark ? 'text-zinc-400' : 'text-gray-400' }`}>
                    Already have an account?{' '}
                    <button
                        type="button"
                        onClick={onSwitch}
                        className={`font-medium border-b transition-colors ${
                            dark
                                ? 'text-white border-zinc-600 hover:border-white'
                                : 'text-gray-900 border-gray-300 hover:border-gray-900'
                        }`}
                    >
                        Sign in
                    </button>
                </p>

                <p
                    className={`text-center text-xs mt-3 leading-relaxed ${
                        dark ? 'text-zinc-500' : 'text-gray-300'
                    }`}
                >
                    By signing up, you agree to our{' '}
                    <a href="#" className="underline hover:opacity-80 transition-opacity" >
                        Terms
                    </a>{' '}
                    and{' '}
                    <a  href="#"  className="underline hover:opacity-80 transition-opacity"  >
                        Privacy Policy
                    </a>.
                </p>
            </div>
        </div>
    );
};

export default SignupPage;
