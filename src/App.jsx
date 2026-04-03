import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Scale, Bell, Globe, ArrowRight, MessageCircle, FileText, Users, LayoutDashboard, CheckCircle2, AlertTriangle, ShieldCheck, Download, ExternalLink, Play, Search, PlusCircle, History, Settings, LogOut, Phone } from 'lucide-react';
import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage';
import DocumentsPage from './pages/DocumentsPage';
import LawyersPage from './pages/LawyersPage';
import DashboardPage from './pages/DashboardPage';
import AboutPage from './pages/AboutPage';
import AuthPage from './pages/AuthPage';
import LegalLiteracyApp from './features/legal-literacy';

// Navbar Component
const Navbar = ({ isLoggedIn, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isAboutPage = location.pathname === '/about';
  const isLawyersPage = location.pathname === '/lawyers';
  const isLearnPage = location.pathname === '/learn';
  const isChatPage = location.pathname === '/chat';

  // Landing routes (Public)
  const isLandingSection = ['/', '/about', '/login', '/signup'].includes(location.pathname);
  // Product routes (Authenticated)
  const isProductSection = ['/chat', '/lawyers', '/learn', '/dashboard', '/documents'].includes(location.pathname);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const landingLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Features', path: '/#features' },
  ];

  const productLinks = [
    { name: 'AI Tools', path: '/chat' },
    { name: 'Lawyers', path: '/lawyers' },
    { name: 'LexArena ⚖️', path: '/learn' },
    { name: 'Dashboard', path: '/dashboard' },
  ];

  const navLinks = isProductSection ? productLinks : landingLinks;

  // Navbar Styling Logic
  const navDark = isProductSection || isAboutPage || isLawyersPage || isScrolled;
  const hideNav = false; // Always visible as per request

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${navDark ? (isProductSection ? 'bg-forest shadow-lg' : 'bg-forest/95 backdrop-blur-md shadow-lg') : 'bg-transparent'} py-3`}
      style={{ transform: hideNav ? 'translateY(-100%)' : 'translateY(0)' }}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-lime p-2 rounded-lg group-hover:rotate-12 transition-transform">
            <Scale className="text-forest" size={24} />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">ny<span className="text-lime">AI</span></span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path} 
              onClick={(e) => {
                if (link.name === 'Home' && location.pathname === '/') {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else if (link.name === 'Features' && location.pathname === '/') {
                  e.preventDefault();
                  const target = document.getElementById('features');
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="text-offwhite/80 hover:text-lime transition-colors font-medium cursor-pointer"
            >
              {link.name}
            </Link>
          ))}
          {isLoggedIn && !isProductSection && (
            <Link to="/chat" className="text-offwhite/80 hover:text-lime transition-colors font-medium">
              Dashboard
            </Link>
          )}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button className="text-offwhite hover:text-white font-medium p-2"><Globe size={20} /></button>
          
          {!isLoggedIn && (
            <>
              <Link to="/login" className="text-offwhite hover:text-white font-medium px-4">Login</Link>
              <Link to="/signup" className="bg-lime hover:bg-lime-hover text-forest font-bold px-6 py-2.5 rounded-lg transition-all shadow-md">
                Try for Free
              </Link>
            </>
          )}

          {isLoggedIn && (
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-lime flex items-center justify-center text-forest font-bold text-xs uppercase">YS</div>
              <button 
                onClick={onLogout}
                className="text-offwhite/60 hover:text-white transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white">
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-forest border-t border-white/10 p-6 flex flex-col gap-6 md:hidden"
          >
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  if (link.name === 'Home' && location.pathname === '/') {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else if (link.name === 'Features' && location.pathname === '/') {
                    e.preventDefault();
                    const target = document.getElementById('features');
                    if (target) target.scrollIntoView({ behavior: 'smooth' });
                  }
                }} 
                className="text-xl text-offwhite"
              >
                {link.name}
              </Link>
            ))}
            
            <div className="flex flex-col gap-4 pt-4 border-t border-white/10">
              {isLoggedIn ? (
                <button 
                  onClick={() => { onLogout(); setMobileMenuOpen(false); }} 
                  className="flex items-center gap-3 text-lime text-xl font-bold py-2"
                >
                  <LogOut size={20} /> Logout
                </button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-offwhite text-lg font-medium">Login</Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="bg-lime text-forest font-bold px-6 py-3 rounded-lg text-center">Try for Free</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// SOS Button Component
const SOSButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-[100] bg-red-600 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl group hover:scale-110 active:scale-95 transition-all"
      >
        <div className="absolute inset-0 bg-red-600 rounded-full animate-ping opacity-25 group-hover:opacity-40"></div>
        <Phone className="text-white fill-white" size={32} />
        <span className="absolute bottom-full right-0 mb-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          EMERGENCY HELP
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-2xl p-8 overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 heading-display">Emergency Help</h2>
                  <p className="text-gray-500 mt-1">Connect with a lawyer instantly.</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4 mb-8">
                {[1, 2, 3].map((l) => (
                  <div key={l} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 group hover:border-red-500 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                        <img src={`https://i.pravatar.cc/150?u=${l+10}`} alt="lawyer" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Adv. Rajesh Sharma</h4>
                        <p className="text-xs text-gray-500">Criminal Law • 🟢 Available</p>
                      </div>
                    </div>
                    <button className="bg-red-600 text-white p-2 rounded-full group-hover:scale-110 transition-transform">
                      <Phone size={20} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-6">
                <p className="text-center text-sm font-medium text-red-800">
                  Calling a lawyer may incur charges depending on your plan.
                </p>
              </div>

              <div className="space-y-3">
                <button className="w-full bg-red-600 text-white font-bold py-4 rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200">
                  Connect to Next Available
                </button>
                <div className="flex items-center gap-4">
                  <hr className="flex-1" />
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Or Call Helpline</span>
                  <hr className="flex-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-gray-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                    <Phone size={16} /> 100
                  </button>
                  <button className="bg-gray-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                    <Phone size={16} /> 181
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

// Footer Component
const Footer = () => (
  <footer className="bg-charcoal text-offwhite pt-20 pb-10 px-6 border-t border-white/5">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
      <div>
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-lime p-2 rounded-lg">
            <Scale className="text-forest" size={24} />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">ny<span className="text-lime">AI</span></span>
        </div>
        <p className="text-offwhite/60 leading-relaxed mb-8">
          Democratizing access to justice for every Indian citizen through multimodal AI and multilingual support.
        </p>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-lime hover:text-forest transition-colors cursor-pointer">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-lime hover:text-forest transition-colors cursor-pointer">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-white font-bold mb-6 text-lg">Product</h4>
        <ul className="space-y-4 text-offwhite/60">
          <li><Link to="/chat" className="hover:text-lime transition-colors">AI Chatbot</Link></li>
          <li><Link to="/documents" className="hover:text-lime transition-colors">Document Analyzer</Link></li>
          <li><Link to="/documents" className="hover:text-lime transition-colors">Doc Generator</Link></li>
          <li><Link to="/lawyers" className="hover:text-lime transition-colors">Lawyer Connect</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="text-white font-bold mb-6 text-lg">Company</h4>
        <ul className="space-y-4 text-offwhite/60">
          <li><Link to="/about" className="hover:text-lime transition-colors">About nyAI</Link></li>
          <li><Link to="/blog" className="hover:text-lime transition-colors">Legal Blog</Link></li>
          <li><Link to="/mission" className="hover:text-lime transition-colors">SDG Impact</Link></li>
          <li><Link to="/contact" className="hover:text-lime transition-colors">Contact Us</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="text-white font-bold mb-6 text-lg">Legal</h4>
        <ul className="space-y-4 text-offwhite/60">
          <li><Link to="/terms" className="hover:text-lime transition-colors">Terms of Service</Link></li>
          <li><Link to="/privacy" className="hover:text-lime transition-colors">Privacy Policy</Link></li>
          <li><Link to="/disclaimer" className="hover:text-lime transition-colors">Disclaimer</Link></li>
          <li className="pt-4">
            <select className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-lime">
              <option>English</option>
              <option>Hindi (हिन्दी)</option>
              <option>Tamil (தமிழ்)</option>
              <option>Telugu (తెలుగు)</option>
            </select>
          </li>
        </ul>
      </div>
    </div>

    <div className="max-w-7xl mx-auto pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
      <p className="text-offwhite/40 text-sm">
        &copy; 2026 nyAI Technologies. All rights reserved. Made with ❤️ for Bharat.
      </p>
      <div className="bg-lime/10 border border-lime/20 px-4 py-2 rounded-full">
        <p className="text-xs text-lime font-medium italic">
          "nyAI provides general legal information, not legal advice."
        </p>
      </div>
    </div>
  </footer>
);

const ProtectedRoute = ({ children, isLoggedIn }) => {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Load user from localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem('nyai_user_email');
    if (savedEmail) {
      setIsLoggedIn(true);
      setUserEmail(savedEmail);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail(null);
    localStorage.removeItem('nyai_user_email');
    navigate('/');
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const isChatPage = location.pathname === '/chat';

  return (
    <div className="min-h-screen bg-offwhite selection:bg-lime selection:text-forest">
      {!isAuthPage && <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <ChatPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/documents" 
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <DocumentsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/lawyers" 
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <LawyersPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<AuthPage setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/signup" element={<AuthPage setIsLoggedIn={setIsLoggedIn} />} />
        <Route 
          path="/learn" 
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <LegalLiteracyApp userEmail={userEmail} />
            </ProtectedRoute>
          } 
        />
      </Routes>
      {!(isAuthPage || isChatPage) && <Footer />}
      {!(isAuthPage || isChatPage) && <SOSButton />}
    </div>
  );
}

export default App;
