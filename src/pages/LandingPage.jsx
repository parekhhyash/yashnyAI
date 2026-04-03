import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, CheckCircle2, MessageCircle, FileText, Users, 
  ShieldCheck, AlertTriangle, Scale, Zap, Globe, Handshake, 
  Search, Gavel, FileCheck, Brain, LayoutDashboard, Plus, Minus,
  Phone, PlusCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Typewriter = ({ strings, speed = 100, pauseBetween = 2000 }) => {
  const [currentStringIndex, setCurrentStringIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const string = strings[currentStringIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (currentText.length < string.length) {
          setCurrentText(string.substring(0, currentText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), pauseBetween);
        }
      } else {
        if (currentText.length > 0) {
          setCurrentText(string.substring(0, currentText.length - 1));
        } else {
          setIsDeleting(false);
          setCurrentStringIndex((currentStringIndex + 1) % strings.length);
        }
      }
    }, isDeleting ? speed / 2 : speed);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentStringIndex, strings, speed, pauseBetween]);

  return <span>{currentText}<span className="animate-pulse border-r-4 border-lime ml-1"></span></span>;
};

const FeatureCard = ({ icon: Icon, title, desc, to = "/chat" }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:border-lime/50 transition-all duration-300 group shadow-xl"
  >
    <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/10 bg-forest/50 text-lime">
      <Icon size={28} className="group-hover:scale-110 transition-transform" />
    </div>
    <div className="flex items-center gap-2 mb-3">
      <h3 className="text-xl font-bold text-white">{title}</h3>
    </div>
    <p className="text-offwhite/60 leading-relaxed text-sm mb-6">{desc}</p>
    <Link to={to} className="flex items-center gap-2 text-lime font-bold text-sm hover:gap-3 transition-all">
      Launch Tool <ArrowRight size={16} />
    </Link>
  </motion.div>
);

const LandingPage = () => {
  const [activeFaq, setActiveFaq] = useState(0);

  const typewriterStrings = [
    "Know Your Rights.",
    "समझें अपने अधिकार।",
    "உங்கள் உரிமைகளை அறிந்துகொள்ளுங்கள்।",
    "ನಿಮ್ಮ ಹಕ್ಕುಗಳನ್ನು ತಿಳಿದುಕೊಳ್ಳಿ.",
    "మీ హక్కులను తెలుసుకోండి.",
    "உங்கள் உரிமைகள்."
  ];

  const problemCards = [
    { 
      icon: "🧑🌾", 
      title: "Lack of Legal Literacy", 
      stat: "72%", 
      desc: "of Indians are unaware of their basic consumer rights and common legal processes." 
    },
    { 
      icon: "💸", 
      title: "Cost Barrier", 
      stat: "₹50k/hr", 
      desc: "Average lawyer fees can be unaffordable for handling small, day-to-day legal issues." 
    },
    { 
      icon: "🌐", 
      title: "Language Barriers", 
      stat: "22+", 
      desc: "Official languages but one legal system primarily in English/Hindi, causing misunderstanding." 
    }
  ];

  const faqItems = [
    { q: "Is nyAI a replacement for a real lawyer?", a: "No. nyAI is an informational tool built to provide legal education and document support. For representation in court or specific legal advice, always consult a verified advocate." },
    { q: "What languages does nyAI support?", a: "nyAI supports over 50+ languages including Hindi, Tamil, Telugu, Marathi, Bengali, and even local dialects via mBart-50 integration." },
    { q: "How is my data kept private and secure?", a: "We use enterprise-grade encryption. Your case documents are never used for training our models unless you explicitly opt into our research program." },
    { q: "Can I use nyAI for court submissions?", a: "The documents generated are high-quality drafts. However, we recommend having them vetted by a lawyer through our marketplace before actual submission." },
    { q: "How does the lawyer connect work?", a: "It works like a direct marketplace. Connect with verified lawyers vetted by our team for instant legal consultation." }
  ];

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] bg-forest noise-overlay pt-32 pb-20 px-6 flex items-center">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-8">
              <span className="w-2 h-2 rounded-full bg-lime animate-pulse"></span>
              <span className="text-offwhite/80 text-sm font-medium">India's First AI Legal Companion</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 heading-display leading-[1.1]">
              <Typewriter strings={typewriterStrings} />
            </h1>
            
            <p className="text-xl text-offwhite/70 mb-10 max-w-lg leading-relaxed">
              Your AI-powered legal companion — democratizing knowledge, unlocking rights, and bridging the language gap in justice.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link to="/chat" className="btn-primary flex items-center gap-2">
                Ask nyAI Now <ArrowRight size={20} />
              </Link>
              <button className="btn-ghost">See How It Works</button>
            </div>

            <div className="mt-16 grid grid-cols-3 gap-6">
              {[
                { label: "50+ Languages", value: "Verified" },
                { label: "1,00,000+", value: "Questions" },
                { label: "Constitution", value: "Trained" }
              ].map((stat, i) => (
                <div key={i} className="border-l border-white/10 pl-6">
                  <p className="text-lime text-2xl font-bold">{stat.label}</p>
                  <p className="text-offwhite/40 text-sm uppercase tracking-wider font-bold mt-1">{stat.value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:block hidden"
          >
            <div className="bg-charcoal/40 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-3xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex items-center gap-2 text-offwhite/20">
                  <ShieldCheck size={16} />
                  <span className="text-[10px] font-bold tracking-widest">ENCRYPTED SESSION</span>
                </div>
              </div>
              
              <div className="space-y-6 mb-8">
                <div className="flex justify-end">
                  <div className="bg-white/5 p-4 rounded-2xl rounded-tr-none max-w-[80%] border border-white/10">
                    <p className="text-offwhite text-sm">My landlord is refusing to return my security deposit. What are my rights?</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-lime flex-shrink-0 flex items-center justify-center">
                    <Scale size={20} className="text-forest" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-forest p-5 rounded-2xl rounded-tl-none border border-lime/20 relative">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lime text-[10px] font-bold tracking-widest uppercase italic">AI Response</span>
                        <div className="h-0.5 flex-1 bg-lime/10"></div>
                      </div>
                      <p className="text-offwhite text-sm leading-relaxed mb-4">
                        Under <span className="text-lime font-bold">Section 108</span> of the Transfer of Property Act, 1882, your landlord is legally obligated to...
                      </p>
                      <div className="flex gap-2">
                        <div className="h-1.5 w-12 bg-lime/30 rounded-full animate-pulse"></div>
                        <div className="h-1.5 w-24 bg-white/10 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-offwhite/30 text-sm italic">
                  Analyzing legal statutes...
                </div>
                <div className="w-12 h-12 bg-lime rounded-xl flex items-center justify-center shadow-lg shadow-lime/20 cursor-not-allowed">
                  <Zap size={20} className="text-forest" />
                </div>
              </div>
            </div>

            {/* Floating Overlay Cards */}
            <motion.div 
               animate={{ y: [0, -10, 0] }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="absolute -top-10 -right-10 bg-white p-4 rounded-2xl shadow-2xl border border-gray-100 flex items-center gap-4 hidden xl:flex"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Case Solved</p>
                <p className="text-gray-900 font-bold">Security Deposit Recovered</p>
              </div>
            </motion.div>

            <motion.div 
               animate={{ y: [0, 10, 0] }}
               transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
               className="absolute -bottom-10 -left-10 bg-white p-4 rounded-2xl shadow-2xl border border-gray-100 flex items-center gap-4 hidden xl:flex"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <FileText size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Draft Ready</p>
                <p className="text-gray-900 font-bold">Legal Notice PDF Generated</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SVG Divider */}
      <div className="relative h-20 bg-forest">
        <svg className="absolute bottom-0 w-full h-20" preserveAspectRatio="none" viewBox="0 0 1440 320">
          <path fill="#F5F0E8" fillOpacity="1" d="M0,96L80,117.3C160,139,320,181,480,186.7C640,192,800,160,960,144C1120,128,1280,128,1360,128L1440,128L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
        </svg>
      </div>

      {/* Logos Strip */}
      <section className="bg-offwhite py-12 px-6 overflow-hidden border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-10">Trusted by institutions & innovators</p>
          <div className="flex flex-wrap justify-center gap-12 lg:gap-24 opacity-40 grayscale hover:opacity-100 transition-all duration-1000">
            {['IIT Bombay', 'TISS', 'Bar Council', 'MeitY', 'YourStory', 'Niti Aayog'].map(logo => (
              <span key={logo} className="text-3xl font-black text-gray-900 font-serif italic hover:grayscale-0 transition-all cursor-default">{logo}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="bg-offwhite py-32 px-6">
        <div className="max-w-7xl mx-auto text-center mb-20">
          <h2 className="heading-display text-5xl md:text-6xl mb-6 text-gray-900 uppercase">Legal help shouldn't <br/><span className="italic">be a luxury.</span></h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">Access to justice is a fundamental right. nyAI ensures every citizen can navigate the legal landscape without fear or massive debt.</p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {problemCards.map((card, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ scale: 1.02 }}
              className="bg-white p-10 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col items-center text-center"
            >
              <div className="text-6xl mb-6 transform group-hover:rotate-12 transition-transform">{card.icon}</div>
              <h3 className="text-4xl font-black text-forest mb-2">{card.stat}</h3>
              <h4 className="text-xl font-bold text-gray-900 mb-4">{card.title}</h4>
              <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 text-forest font-black uppercase tracking-tighter text-2xl group cursor-pointer hover:gap-6 transition-all">
            nyAI changes this <ArrowRight size={32} className="text-lime" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-charcoal py-32 px-6 relative">
        <div className="max-w-7xl mx-auto mb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <h2 className="heading-display text-5xl md:text-7xl text-white mb-6 uppercase">Everything Legal. <br/><span className="text-lime italic lowercase">All in one place.</span></h2>
              <p className="text-xl text-offwhite/50 max-w-lg">From simple questions to complex document analysis, we've built a suite of tools for the modern citizen.</p>
            </div>
            <div className="flex gap-4">
               <div className="px-6 py-4 rounded-xl bg-forest border border-lime/30 text-center">
                 <p className="text-3xl font-bold text-lime">15+</p>
                 <p className="text-[10px] text-offwhite/40 font-bold uppercase tracking-widest">Doc Templates</p>
               </div>
               <div className="px-6 py-4 rounded-xl bg-forest border border-lime/30 text-center">
                 <p className="text-3xl font-bold text-lime">50+</p>
                 <p className="text-[10px] text-offwhite/40 font-bold uppercase tracking-widest">Languages</p>
               </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard 
             icon={MessageCircle} 
             title="AI Legal Chatbot" 
             desc="Ask anything about Indian law, rights, or the constitution in your own language. Get instant clarity with citations." 
             to="/chat"
          />
          <FeatureCard 
             icon={Search} 
             title="Legal Glossary" 
             desc="Decode complex legal jargon into plain, everyday English. Never be confused by 'legalese' again." 
             to="/chat"
          />
          <FeatureCard 
             icon={Phone} 
             title="Emergency SOS" 
             desc="Connect to a verified lawyer instantly in crisis situations. One click away from expert legal help." 
             to="/lawyers"
          />
          <FeatureCard 
             icon={FileCheck} 
             title="Document Analyzer" 
             desc="Upload any contract or legal notice. AI highlights risky clauses and hidden terms in seconds." 
             to="/documents"
          />
          <FeatureCard 
             icon={PlusCircle} 
             title="Doc Generator" 
             desc="Create rental agreements, rental notices, wills, and contracts automatically based on your state laws." 
             to="/documents"
          />
          <FeatureCard 
             icon={Brain} 
             title="Outcome Predictor" 
             desc="AI analyzes past case data from Indian courts to predict potential outcomes for your legal dispute." 
             to="/chat"
          />
        </div>

        {/* Coming Soon Teaser */}
        <div className="max-w-7xl mx-auto mt-12">
          <div className="bg-lime/5 border border-lime/10 p-6 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-4 text-lime">
              <ShieldCheck size={24} />
              <p className="font-bold">Coming Soon: Fake Document Detector & National Database Integration</p>
            </div>
            <Link to="/about" className="text-lime/60 text-sm font-bold border-b border-lime/20 hover:text-lime">View Roadmap</Link>
          </div>
        </div>
      </section>

      {/* Lawyer Preview Section */}
      <section className="bg-forest py-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-lime/5 -skew-x-12 transform origin-right"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
          <div>
            <h2 className="heading-display text-5xl md:text-6xl text-white mb-8">Real Lawyers. <br/><span className="text-lime italic">When you really need one.</span></h2>
            <p className="text-xl text-offwhite/60 mb-10 leading-relaxed">Like Astrotalk, but for justice. Verified advocates ready to help you at a moment's notice.</p>
            
            <ul className="space-y-6 mb-12">
               {[
                 "Verified Advocate Profiles",
                 "Pay-per-consultation (₹/min)",
                 "Crisis SOS Priority Connect",
                 "Specialized: Family, Criminal, Tax"
               ].map((item, i) => (
                 <li key={i} className="flex items-center gap-4 text-white">
                   <div className="w-6 h-6 rounded-full bg-lime/20 flex items-center justify-center text-lime">
                     <CheckCircle2 size={16} />
                   </div>
                   <span className="font-medium">{item}</span>
                 </li>
               ))}
            </ul>

            <Link to="/lawyers" className="btn-primary">Connect with an Advocate</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {[1, 2, 3].map(i => (
               <motion.div 
                 key={i}
                 whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 1 : -1 }}
                 className="bg-charcoal p-6 rounded-3xl border border-white/5"
               >
                 <div className="flex items-center gap-4 mb-6">
                    <img src={`https://i.pravatar.cc/150?u=${i+20}`} alt="lawyer" className="w-16 h-16 rounded-2xl object-cover" />
                    <div>
                      <h4 className="text-white font-bold">Adv. Anjali Deshmukh</h4>
                      <p className="text-[10px] text-lime font-bold uppercase tracking-widest mt-1 italic">Family Law Expert</p>
                    </div>
                 </div>
                 <div className="flex justify-between items-center mb-6">
                    <div className="flex text-lime">
                      {[...Array(5)].map((_, i) => <Scale key={i} size={12} className="fill-current" />)}
                    </div>
                    <p className="text-white/40 text-xs font-bold font-mono tracking-widest">4.9 (420+ Reviews)</p>
                 </div>
                 <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-offwhite font-bold hover:bg-white/10 transition-colors">
                   Book Consultation
                 </button>
               </motion.div>
             ))}
             <Link to="/lawyers" className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl p-10 group hover:border-lime/50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-lime group-hover:text-forest transition-colors">
                  <ArrowRight />
                </div>
                <p className="text-white/40 font-bold uppercase tracking-widest text-xs">View 500+ More</p>
             </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-offwhite py-32 px-6">
         <div className="max-w-7xl mx-auto text-center mb-20">
            <h2 className="heading-display text-5xl md:text-6xl mb-6">Justice for All. <br/><span className="italic">Our clients' voices.</span></h2>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="flex -space-x-3">
                 {[1, 2, 3, 4, 5].map(i => (
                   <img key={i} src={`https://i.pravatar.cc/150?u=${i+30}`} className="w-12 h-12 rounded-full border-4 border-offwhite" alt="user" />
                 ))}
              </div>
              <p className="text-gray-500 font-bold text-sm ml-4">500+ citizens helped this week</p>
            </div>
         </div>

         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-10 rounded-4xl border border-gray-100 shadow-xl shadow-gray-200/50">
                <div className="flex mb-6 text-lime">
                   {[...Array(5)].map((_, i) => <Zap key={i} size={16} className="fill-current" />)}
                </div>
                <p className="text-gray-600 text-lg leading-relaxed mb-8 italic">
                  "nyAI helped me understand my rental agreement in 2 minutes. My landlord was trying to hide an unfair eviction clause, and the AI caught it immediately. Saved me so much stress!"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div>
                    <h5 className="font-bold text-gray-900">Siddharth Varma</h5>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Bengaluru, India</p>
                  </div>
                </div>
              </div>
            ))}
         </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-32 px-6 border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="heading-display text-5xl text-center mb-16">Frequently <span className="italic">Asked.</span></h2>
          <div className="space-y-4">
            {faqItems.map((item, idx) => (
              <div key={idx} className="border-b border-gray-100 last:border-0">
                <button 
                  onClick={() => setActiveFaq(activeFaq === idx ? -1 : idx)}
                  className="w-full py-6 flex justify-between items-center text-left focus:outline-none group"
                >
                  <span className={`text-xl font-bold transition-colors ${activeFaq === idx ? 'text-forest' : 'text-gray-400 group-hover:text-gray-900'}`}>
                    <span className="font-serif italic mr-4 text-lime">0{idx + 1}</span> {item.q}
                  </span>
                  {activeFaq === idx ? <Minus size={20} className="text-forest" /> : <Plus size={20} className="text-gray-400" />}
                </button>
                <AnimatePresence>
                  {activeFaq === idx && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-8 text-gray-500 leading-relaxed pl-10 pr-10">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-lime py-32 px-6 text-center overflow-hidden relative">
        <motion.div 
           animate={{ scale: [1, 1.2, 1], rotate: [0, 5, 0] }}
           transition={{ duration: 10, repeat: Infinity }}
           className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
        >
          <Scale size={800} className="text-forest absolute -top-40 -left-40" />
        </motion.div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="heading-display text-6xl md:text-8xl text-forest mb-12">Join the revolution <br/><span className="italic">of justice.</span></h2>
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/signup" className="text-offwhite bg-forest px-10 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-transform shadow-2xl shadow-forest/40">
              Get started for free
            </Link>
            <Link to="/about" className="text-forest border-2 border-forest/20 px-10 py-5 rounded-2xl font-black text-xl hover:bg-forest/5 transition-colors">
              Read Our Vision
            </Link>
          </div>
          <p className="text-forest/60 font-medium mt-12">Empowering 1.4B Indians with AI-driven justice.</p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
