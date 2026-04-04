import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scale, ArrowRight, ShieldCheck, Mail, Lock, 
  User, CheckCircle2, History, Zap, Sparkles, ShieldAlert
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { GoogleLogin } from '@react-oauth/google';
import {jwtDecode} from 'jwt-decode';

const AuthPage = ({ setIsLoggedIn, setUserEmail }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const payload = isLogin ? { email, password } : { email, password, name };
      
      const response = await fetch(`http://127.0.0.1:5001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("nyai_user_email", email);
        if (setUserEmail) setUserEmail(email);
        setIsLoggedIn(true);
        navigate('/chat');
      } else {
        setError(data.error || "Authentication failed");
      }
    } catch (err) {
      setError("Server connection failed. Is the backend on 5001?");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setError("");
    
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      console.log("Decoded Google User:", decoded);

      const response = await fetch('http://127.0.0.1:5001/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("nyai_user_email", decoded.email);
        if (setUserEmail) setUserEmail(decoded.email);
        setIsLoggedIn(true);
        navigate('/chat');
      } else {
        setError(data.error || "Google login failed sync.");
      }
    } catch (err) {
      console.error("Auth Exception:", err);
      setError("Sync failed. Check connection to backend on port 5001.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-offwhite flex flex-col md:flex-row relative overflow-hidden">
      {/* Branding Side */}
      <div className="w-full md:w-1/2 bg-forest noise-overlay p-12 lg:p-24 flex flex-col justify-between items-center md:items-start text-center md:text-left relative z-10">
         <div className="relative z-10">
            <Link to="/" className="flex items-center justify-center md:justify-start gap-4 mb-20 group">
               <div className="bg-lime p-3 rounded-2xl group-hover:rotate-12 transition-transform">
                  <Scale size={32} className="text-forest" />
               </div>
               <span className="text-4xl font-black text-white tracking-tighter">ny<span className="text-lime">AI</span></span>
            </Link>

            <h1 className="text-5xl lg:text-8xl font-black text-white heading-display lowercase tracking-tighter mb-12 leading-[0.9]">the future <br/><span className="text-lime italic underline decoration-lime/20 decoration-8 underline-offset-8">of justice.</span></h1>
            
            <div className="space-y-8 max-w-sm">
               <div className="flex items-start gap-6">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lime flex-shrink-0 animate-pulse-slow"><CheckCircle2 size={24} /></div>
                  <p className="text-offwhite/60 text-sm italic font-bold">"Your privacy is our baseline. All sessions are encrypted with enterprise-grade standards."</p>
               </div>
               <div className="flex items-start gap-6">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lime flex-shrink-0 animate-pulse-slow delay-500"><ShieldCheck size={24} /></div>
                  <p className="text-offwhite/60 text-sm italic font-bold">"Built for 1.4B Indians. Supporting 50+ languages via advanced LLMs like Zephyr-7B."</p>
               </div>
            </div>
         </div>

         <div className="relative z-10 mt-20 md:mt-0">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em] mb-4">SDG Impact Platform</p>
            <div className="flex gap-6 opacity-30">
               <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-forest font-black italic">4</div>
               <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-forest font-black italic">8</div>
               <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-forest font-black italic">10</div>
            </div>
         </div>

         {/* Decorative History Spiral */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
            <History size={1000} className="scale-150 rotate-45" />
         </div>
      </div>

      {/* Form Side */}
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center p-12 lg:p-24 relative overflow-hidden">
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="w-full max-w-md relative z-10"
         >
            <div className="mb-12">
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-8 h-px bg-gray-200"></div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{isLogin ? 'Welcome Back' : 'Create Account'}</p>
                  <div className="w-8 h-px bg-gray-200"></div>
               </div>
               <h2 className="text-5xl font-black text-gray-900 heading-display lowercase tracking-tighter mb-4">{isLogin ? 'Login to system.' : 'Join the studio.'}</h2>
               <p className="text-gray-400 font-bold text-sm italic">
                  {isLogin ? "Access your documents and cases." : "Start your 7-day free pro trial."}
               </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-red-50 border border-red-100 rounded-2xl text-[10px] font-black text-red-600 flex items-center gap-2 uppercase tracking-widest"
                  >
                    <ShieldAlert size={16} /> {error}
                  </motion.div>
                )}

                <AnimatePresence mode="wait">
                   {!isLogin && (
                     <motion.div 
                       initial={{ height: 0, opacity: 0 }}
                       animate={{ height: 'auto', opacity: 1 }}
                       exit={{ height: 0, opacity: 0 }}
                       className="space-y-6 overflow-hidden"
                     >
                        <div className="relative group">
                           <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-forest transition-colors" size={24} />
                           <input 
                              type="text" 
                              placeholder="Full Legal Name" 
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-100 py-6 pl-16 pr-8 rounded-[2rem] text-lg font-medium focus:ring-0 focus:border-lime transition-all focus:bg-white"
                              required 
                           />
                        </div>
                     </motion.div>
                   )}
                </AnimatePresence>

                <div className="relative group">
                   <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-forest transition-colors" size={24} />
                   <input 
                      type="email" 
                      placeholder="Email Address" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 py-6 pl-16 pr-8 rounded-[2rem] text-lg font-medium focus:ring-0 focus:border-lime transition-all focus:bg-white"
                      required 
                   />
                </div>

                <div className="relative group">
                   <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-forest transition-colors" size={24} />
                   <input 
                      type="password" 
                      placeholder="Password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 py-6 pl-16 pr-8 rounded-[2rem] text-lg font-medium focus:ring-0 focus:border-lime transition-all focus:bg-white"
                      required 
                   />
                </div>

                <button 
                   type="submit" 
                   disabled={isLoading}
                   className="w-full bg-forest text-offwhite font-black py-6 rounded-[2.5rem] text-xl shadow-2xl shadow-forest/20 flex items-center justify-center gap-4 hover:bg-forest-light transform hover:scale-[1.02] active:scale-95 transition-all relative overflow-hidden group"
                >
                   {isLoading ? (
                     <div className="flex items-center gap-4">
                        <div className="w-6 h-6 border-4 border-lime border-t-transparent rounded-full animate-spin"></div>
                        <span className="uppercase tracking-widest text-[10px] font-black italic">Processing...</span>
                     </div>
                   ) : (
                     <>
                        {isLogin ? 'Login to nyAI' : 'Create Free Account'}
                        <ArrowRight size={24} className="text-lime group-hover:translate-x-2 transition-transform" />
                     </>
                   )}
                </button>

                <div className="relative py-2">
                   <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                   <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-gray-300 bg-white px-4">Social Entry</div>
                </div>

                <div className="flex flex-col gap-4 items-center">
                   <div className="w-full flex justify-center">
                      <GoogleLogin 
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError("Google Authentication Failed")}
                        theme="filled_black"
                        shape="pill"
                        size="large"
                        text="continue_with"
                        width="300"
                      />
                   </div>

                   {/* Mock Auth Bypass for Testing without Google Client ID Setup */}
                   <button 
                     type="button"
                     onClick={() => {
                        const mockPayload = JSON.stringify({ 
                           email: email || "tester@nyai.com", 
                           name: name || "Developer Mode", 
                           picture: "https://i.pravatar.cc/150" 
                        });
                        handleGoogleSuccess({
                           credential: `mock_header.${btoa(mockPayload)}.mock_signature`
                        });
                     }}
                     className="text-[10px] font-black text-lime uppercase tracking-widest bg-forest px-4 py-2 rounded-full hover:bg-forest/80 transition-all opacity-40 hover:opacity-100"
                   >
                     🚀 Enter as Tester (Mock OAuth)
                   </button>
                   
                   <p className="text-[9px] text-gray-300 font-bold max-w-[200px] text-center italic mt-2 uppercase tracking-tight">
                     Server Persistence: All details stored in <span className="text-lime">backend/users.json</span>
                   </p>
                </div>
             </form>

            <div className="mt-12 text-center">
               <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm font-black text-gray-400 uppercase tracking-widest underline decoration-lime decoration-2 underline-offset-4 hover:text-forest transition-colors italic"
               >
                  {isLogin ? "Need an account? Sign up free." : "Already joining us? Login here."}
               </button>
            </div>
         </motion.div>

         {/* Decorative Sparkle */}
         <div className="absolute bottom-20 right-20 opacity-10 pointer-events-none">
            <Sparkles size={200} className="text-lime" />
         </div>
         <div className="absolute top-20 left-20 opacity-10 pointer-events-none">
            <Zap size={100} className="text-forest scale-x-[-1]" />
         </div>
      </div>
    </div>
  );
};

export default AuthPage;
