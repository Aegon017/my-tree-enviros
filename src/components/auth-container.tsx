"use client";

import { useState } from "react";
import { SigninForm } from "./sign-in-form";
import { SignupForm } from "./sign-up-form";

export function AuthContainer() {
    const [ isSignIn, setIsSignIn ] = useState( true );

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center p-4 overflow-hidden relative">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="w-full max-w-6xl relative z-10">
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">

                    {/* Left side - Hero content */ }
                    <div className="hidden md:flex flex-col justify-center">
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-emerald-600 mb-4">
                                    My Tree Enviros
                                </h1>
                                <p className="text-lg text-gray-600">
                                    Connect with nature, grow your community, and plant positive change.
                                </p>
                            </div>

                            {/* Features */ }
                            <div className="space-y-4 pt-8">
                                <div className="flex gap-4 items-start">
                                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                        <span className="text-green-700 font-bold">🌱</span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Track Growth</h3>
                                        <p className="text-sm text-gray-600">Monitor your environmental impact</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start">
                                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                        <span className="text-emerald-700 font-bold">🌍</span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Global Community</h3>
                                        <p className="text-sm text-gray-600">Join millions of tree lovers worldwide</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start">
                                    <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                                        <span className="text-teal-700 font-bold">🌳</span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Make Impact</h3>
                                        <p className="text-sm text-gray-600">Every action counts toward a greener future</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Auth Card */ }
                    <div className="w-full max-w-md mx-auto">
                        <div className="bg-white rounded-2xl shadow-2xl backdrop-blur-xl border border-white/20 overflow-hidden">

                            {/* Card Header */ }
                            <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 px-8 pt-8 pb-20">
                                <h2 className="text-3xl font-bold text-white mb-2">
                                    { isSignIn ? "Welcome Back" : "Let's Get Started" }
                                </h2>
                                <p className="text-green-50">
                                    { isSignIn
                                        ? "Sign in to your account to continue"
                                        : "Create an account to join the movement" }
                                </p>
                            </div>

                            {/* Toggle Switch */ }
                            <div className="relative -mt-10 px-8 mb-8">
                                <div className="flex gap-2 bg-gray-100 p-1 rounded-full">
                                    <button
                                        onClick={ () => setIsSignIn( true ) }
                                        className={ `flex-1 py-3 px-4 rounded-full font-semibold transition-all duration-300 ${ isSignIn
                                                ? "bg-white text-green-700 shadow-lg"
                                                : "text-gray-600 hover:text-gray-900"
                                            }` }
                                    >
                                        Sign In
                                    </button>
                                    <button
                                        onClick={ () => setIsSignIn( false ) }
                                        className={ `flex-1 py-3 px-4 rounded-full font-semibold transition-all duration-300 ${ !isSignIn
                                                ? "bg-white text-green-700 shadow-lg"
                                                : "text-gray-600 hover:text-gray-900"
                                            }` }
                                    >
                                        Sign Up
                                    </button>
                                </div>
                            </div>

                            {/* Form Section with smooth transitions */ }
                            <div className="px-8 pb-8">
                                <div className="relative min-h-80">
                                    { isSignIn ? (
                                        <div
                                            className="animate-in fade-in slide-in-from-right-4 duration-500"
                                            key="signin"
                                        >
                                            <SigninForm />
                                        </div>
                                    ) : (
                                        <div
                                            className="animate-in fade-in slide-in-from-left-4 duration-500"
                                            key="signup"
                                        >
                                            <SignupForm />
                                        </div>
                                    ) }
                                </div>

                                {/* Footer */ }
                                <div className="mt-8 pt-6 border-t border-gray-200">
                                    <p className="text-xs text-gray-500 text-center">
                                        By continuing, you agree to our{ " " }
                                        <a href="#" className="text-green-600 hover:underline font-medium">
                                            Terms
                                        </a>{ " " }
                                        and{ " " }
                                        <a href="#" className="text-green-600 hover:underline font-medium">
                                            Privacy
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
