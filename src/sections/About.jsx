import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { 
  Cpu, Server, Database, Sparkles, User, FileText, 
  ArrowRight, X, MapPin, Briefcase, Globe, 
  BookOpen,
  Brain
} from "lucide-react";
import { defaultProfile } from "../utils/constants";

export default function About({ profile: passedProfile, projects: passedProjects }) {
  const containerRef = useRef(null);
  
  const profile = passedProfile || defaultProfile;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  
  const clipPathVal = useTransform(
    scrollYProgress,
    [0, 0.5],
    ["inset(0% 0% 0% 0%)", "inset(12% 28% 22% 28% rounded 24px)"]
  );

  const leftX = useTransform(scrollYProgress, [0, 0.4], ["-100vw", "0%"]);
  const rightX = useTransform(scrollYProgress, [0, 0.4], ["100vw", "0%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.35], [0, 1]);

  const bentoOpacity = useTransform(scrollYProgress, [0.55, 0.85], [0, 1]);
  const bentoY = useTransform(scrollYProgress, [0.55, 0.85], [40, 0]);

  const overlayOpacity = useTransform(
    scrollYProgress,
    [0.05, 0.65],
    [0.12, 0.72]
  );

  const bgScale = useTransform(
    scrollYProgress,
    [0, 0.8],
    [1.08, 1.0]
  );

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activePillar, setActivePillar] = useState(0);
  const [resumeMessage, setResumeMessage] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilerLogs, setCompilerLogs] = useState([]);

  const handleCompileResume = () => {
    const logStatements = [
      "[SYSTEM_COMPILER] Initializing Resume Engine...",
      "[SYSTEM_COMPILER] Loading Profile Metadata...",
      "[SYSTEM_COMPILER] Parsing Education Timeline...",
      "[SYSTEM_COMPILER] Extracting Technical Capabilities...",
      "[SYSTEM_COMPILER] Building Project Portfolio...",
      "[SYSTEM_COMPILER] Optimizing Layout Structure...",
      "[SYSTEM_COMPILER] Rendering PDF Document...",
      "[SYSTEM_COMPILER] Export Complete."
    ];

    setIsCompiling(true);
    setCompilerLogs([]);
    setResumeMessage("");

    logStatements.forEach((statement, index) => {
      setTimeout(() => {
        setCompilerLogs(prev => [...prev, statement]);
        
        if (index === logStatements.length - 1) {
          import("../utils/resumeGenerator").then(({ generateResumePDF }) => {
            generateResumePDF(profile, passedProjects || []);
          });
          
          setTimeout(() => {
            setIsCompiling(false);
          }, 1550);
        }
      }, (index + 1) * 300);
    });
  };
  
  const [bgLoaded, setBgLoaded] = useState(false);
  const [bgError, setBgError] = useState(false);
  const [drawerPortraitError, setDrawerPortraitError] = useState(false);

  const getOptimizedBgUrl = (url) => {
    if (!url) return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop";
    if (url.includes("lh3.googleusercontent.com")) {
      const base = url.split("=")[0];
      return `${base}=w1600`;
    }
    return url;
  };

  const getLowResBgUrl = (url) => {
    if (!url) return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=50&auto=format&fit=crop";
    if (url.includes("lh3.googleusercontent.com")) {
      const base = url.split("=")[0];
      return `${base}=w50`;
    }
    if (url.includes("unsplash.com")) {
      return url.replace("w=1200", "w=50").replace("w=1600", "w=50");
    }
    return url;
  };

  const [currentBgUrl, setCurrentBgUrl] = useState(getOptimizedBgUrl(profile.bgImageUrl));
  
  useEffect(() => {
    setDrawerPortraitError(false);
  }, [profile.imageUrl]);
  
  useEffect(() => {
    setBgLoaded(false);
    setBgError(false);
    setCurrentBgUrl(getOptimizedBgUrl(profile.bgImageUrl));
  }, [profile.bgImageUrl]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  
  useEffect(() => {
    if (isProfileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isProfileOpen]);
  
  const btnOpacity = useTransform(scrollYProgress, [0.82, 0.88, 0.96, 0.99], [0, 1, 1, 0]);
  const btnScale = useTransform(scrollYProgress, [0.82, 0.88], [0.8, 1]);
  const btnY = useTransform(scrollYProgress, [0.82, 0.88], [20, 0]);

  const pillars = [
    {
      icon: <Cpu className="w-6 h-6 text-emerald-400" />,
      title: "Systems & Core Programming",
      desc: "Exploring memory management, multithreading, concurrency, and low-level software architecture through C++ projects and experimentation."
    },
    {
      icon: <Server className="w-6 h-6 text-cyan-400" />,
      title: "Backend Engineering",
      desc: "Designing APIs, databases, authentication flows, and scalable server-side applications."
    },
    {
      icon: <Brain className="w-6 h-6 text-orange-400" />,
      title: "Problem Solving & Algorithms",
      desc: "Solving Data Structures & Algorithms problems, analyzing time complexity, and designing efficient solutions for real-world engineering challenges."
    },
    {
      icon: <BookOpen className="w-6 h-6 text-pink-400" />,
      title: "Computer Science Fundamentals",
      desc: "Studying operating systems, databases, computer networks, and software design to build strong engineering foundations."
    }
  ];

  return (
    <div id="about" className="bg-obsidian relative">
      <section ref={containerRef} className="relative h-[250vh]">
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center">
          
          <motion.div
            style={{ clipPath: isMobile ? "none" : clipPathVal }}
            className="absolute inset-0 z-0 w-full h-full shadow-[inset_0_0_80px_rgba(0,0,0,0.8)]"
          >
            
            <motion.img
              style={{ scale: isMobile ? 1 : bgScale }}
              src={getLowResBgUrl(profile.bgImageUrl)}
              alt="Subhendu Prasad Hembram Portrait Low-Res"
              className={`absolute inset-0 w-full h-full object-cover select-none filter blur-2xl transition-opacity duration-1000 ${
                bgLoaded ? "opacity-30 pointer-events-none" : "opacity-100"
              }`}
              referrerPolicy="no-referrer"
            />
            
            <motion.img
              style={{ scale: isMobile ? 1 : bgScale }}
              src={currentBgUrl}
              alt="Subhendu Prasad Hembram Portrait"
              className={`w-full h-full object-cover select-none transition-opacity duration-1000 ${
                bgLoaded && !bgError ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setBgLoaded(true)}
              onError={() => {
                const rawUrl = profile.bgImageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop";
                if (currentBgUrl !== rawUrl) {
                  console.warn("[SYSTEM] Optimized background image failed to load. Falling back to raw URL.");
                  setCurrentBgUrl(rawUrl);
                } else {
                  setBgError(true);
                }
              }}
              referrerPolicy="no-referrer"
            />
            
            {!bgLoaded && !bgError && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10 font-mono text-center select-none pointer-events-none">
                <div className="w-10 h-10 rounded-full border border-emerald-500/20 bg-zinc-950/80 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.15)] backdrop-blur-sm">
                  <Cpu className="w-5 h-5 text-emerald-400 animate-spin" style={{ animationDuration: "3s" }} />
                </div>
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  LOADING_CYBER_VISUAL_REGISTRY
                </span>
                <span className="text-[7.5px] text-zinc-400 uppercase tracking-wider font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  BUFFERING MATRIX BUFFER ROUTE
                </span>
              </div>
            )}

            {bgError && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10 font-mono text-center select-none pointer-events-none">
                <div className="w-10 h-10 rounded-full border border-red-500/20 bg-zinc-950/80 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.15)] backdrop-blur-sm">
                  <Cpu className="w-5 h-5 text-red-400" />
                </div>
                <span className="text-[9px] text-red-400 font-bold uppercase tracking-widest leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  SYS_TEXTURE_FALLBACK_ACTIVE
                </span>
                <span className="text-[7.5px] text-zinc-400 uppercase tracking-wider font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  CDN_TIMEOUT 
                </span>
              </div>
            )}
            
            <motion.div 
              style={{ opacity: overlayOpacity }}
              className="absolute inset-0 bg-obsidian pointer-events-none" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-obsidian/50 pointer-events-none" />
          </motion.div>
          
          <div className="absolute z-10 w-full h-full pointer-events-none flex flex-col justify-between p-12">
            <motion.div
              style={{ x: isMobile ? 0 : leftX, opacity: isMobile ? 1 : textOpacity }}
              className="absolute top-[18%] left-[6vw] lg:left-[10vw]"
            >
              <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-white font-sans drop-shadow-2xl">
                Who
              </h1>
            </motion.div>

            <motion.div
              style={{ x: isMobile ? 0 : rightX, opacity: isMobile ? 1 : textOpacity }}
              className="absolute top-[28%] right-[6vw] lg:right-[10vw]"
            >
              <h1
                className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-transparent font-sans drop-shadow-2xl"
                style={{ WebkitTextStroke: "2px rgba(255,255,255,0.7)" }}
              >
                I Am
              </h1>
            </motion.div>
          </div>
          
          <motion.div
            style={{ opacity: bentoOpacity, y: bentoY }}
            className="absolute inset-x-[4vw] lg:inset-x-[10vw] z-20 max-w-5xl mx-auto flex flex-col items-center gap-4 md:gap-6 text-center select-none"
          >
            <div className="max-w-2xl mb-2 md:mb-4">
              <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight uppercase mb-2 md:mb-4">
                THE MULTI-THREADED DEV
              </h2>
              <p className="text-[10px] md:text-sm text-gray-400 font-mono">
                
              </p>
            </div>
            
            <div className="hidden md:grid grid-cols-2 gap-4 w-full text-left">
              {pillars.map((pillar, idx) => (
                <div
                  key={idx}
                  className="p-5 md:p-6 rounded-2xl border border-white/5 bg-charcoal/80 backdrop-blur-md shadow-xl hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.05)] transition-all duration-300 flex gap-4"
                >
                  <div className="p-3 h-fit rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                    {pillar.icon}
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-white mb-2 tracking-wide font-sans">
                      {pillar.title}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-400 leading-relaxed font-light">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex md:hidden flex-col gap-3 w-full px-2">
              
              <div className="grid grid-cols-4 gap-2 w-full">
                {pillars.map((pillar, idx) => {
                  const isActive = activePillar === idx;
                  let activeColor = "border-emerald-500/50 bg-emerald-500/10 text-emerald-400";
                  let glowColor = "shadow-[0_0_12px_rgba(16,185,129,0.1)]";
                  
                  if (idx === 1) {
                    activeColor = "border-cyan-500/50 bg-cyan-500/10 text-cyan-400";
                    glowColor = "shadow-[0_0_12px_rgba(6,182,212,0.1)]";
                  } else if (idx === 2) {
                    activeColor = "border-orange-500/50 bg-orange-500/10 text-orange-400";
                    glowColor = "shadow-[0_0_12px_rgba(249,115,22,0.1)]";
                  } else if (idx === 3) {
                    activeColor = "border-pink-500/50 bg-pink-500/10 text-pink-400";
                    glowColor = "shadow-[0_0_12px_rgba(236,72,153,0.1)]";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => setActivePillar(idx)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-300 active:scale-95 ${
                        isActive
                          ? `${activeColor} ${glowColor} scale-105`
                          : "bg-charcoal/40 border-white/5 text-gray-500 hover:border-white/10 hover:text-gray-400"
                      }`}
                    >
                      {React.cloneElement(pillar.icon, {
                        className: `w-4.5 h-4.5 transition-colors ${
                          isActive ? "" : "text-gray-500"
                        }`
                      })}
                      <span className="text-[6.5px] font-mono uppercase tracking-widest font-black truncate max-w-full">
                        {idx === 0 && "SYSTEMS"}
                        {idx === 1 && "BACKEND"}
                        {idx === 2 && "DATA"}
                        {idx === 3 && "MOTION"}
                      </span>
                    </button>
                  );
                })}
              </div>
              
              <div 
                className={`p-4 rounded-xl border bg-charcoal/90 backdrop-blur-md shadow-xl flex gap-3 text-left transition-all duration-300 min-h-[96px] ${
                  activePillar === 0 ? "border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.02)]" :
                  activePillar === 1 ? "border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.02)]" :
                  activePillar === 2 ? "border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.02)]" :
                  "border-pink-500/20 shadow-[0_0_20px_rgba(236,72,153,0.02)]"
                }`}
              >
                <div className="p-2.5 h-fit rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                  {pillars[activePillar].icon}
                </div>
                <div>
                  <h3 className={`text-xs font-bold mb-1 tracking-wide font-sans uppercase ${
                    activePillar === 0 ? "text-emerald-400" :
                    activePillar === 1 ? "text-cyan-400" :
                    activePillar === 2 ? "text-orange-400" :
                    "text-pink-400"
                  }`}>
                    {pillars[activePillar].title}
                  </h3>
                  <p className="text-[10px] text-gray-400 leading-normal font-light font-mono select-text">
                    {pillars[activePillar].desc}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-[10px] md:text-xs text-gray-500 max-w-xl font-light italic mt-3 md:mt-4 select-text leading-relaxed px-4 md:px-0">
              "Whether optimizing pointer registers in C++ thread-loops or rendering geometric shaders in Blender, I thrive at the critical intersection of logical performance and responsive digital interfaces."
            </p>

            <button
              onClick={() => setIsProfileOpen(true)}
              className="mt-4 flex md:hidden items-center justify-center gap-2.5 px-6 py-3.5 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/30 hover:border-emerald-500/50 rounded-xl text-emerald-400 font-mono text-[10px] uppercase font-black tracking-widest cursor-pointer active:scale-95 transition-all w-full max-w-[280px] shadow-[0_0_20px_rgba(16,185,129,0.05)] relative overflow-hidden group"
            >
              <User className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
              <span>SYS_PROFILE</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform shrink-0" />
            </button>

          </motion.div>

          {!isMobile && (
            <motion.button
              style={{ opacity: btnOpacity, scale: btnScale, y: btnY }}
              onClick={() => setIsProfileOpen(true)}
              className="absolute bottom-8 right-8 md:bottom-10 md:right-[4vw] lg:right-[10vw] z-30 hidden md:flex items-center gap-2.5 text-white/60 hover:text-emerald-400 font-mono text-[10px] md:text-xs uppercase font-black tracking-widest bg-transparent border-0 outline-none cursor-pointer group select-none active:scale-95 transition-all duration-300"
            >
              <User className="w-4 h-4 text-white/60 group-hover:text-emerald-400 transition-colors duration-300 shrink-0" />
              <span className="relative py-1">
                SYS_PROFILE 
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-emerald-400 group-hover:w-full transition-all duration-300 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-white/60 group-hover:text-emerald-400 transform group-hover:translate-x-1 transition-all duration-300 shrink-0" />
            </motion.button>
          )}
        </div>
      </section>

      <AnimatePresence>
        {isProfileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999]"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 260 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-2xl bg-[#0a0a0c]/98 border-l border-white/5 shadow-[20px_0_60px_rgba(0,0,0,0.9)] z-[10000] p-6 md:p-8 overflow-y-auto flex flex-col gap-6 md:gap-8 select-text text-white font-mono scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
            >
              
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%)] bg-[size:100%_4px] z-10 opacity-30"></div>

              <div className="flex justify-between items-center pb-4 border-b border-white/5 relative z-20">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <div>
                    <span className="text-[8px] text-gray-500 uppercase block font-bold leading-none mb-1">SECURE_SHELL</span>
                    <h3 className="text-xs md:text-sm font-black uppercase text-white tracking-widest leading-none">{profile.name}</h3>
                  </div>
                </div>
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="p-2 rounded-lg bg-white/5 border border-white/5 hover:border-red-500/30 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all cursor-pointer shrink-0"
                  title="Close Profile Registry"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-6 relative z-20" itemScope itemType="http://schema.org/Person">
                
                <div className="flex flex-col items-center md:items-start gap-4 shrink-0 w-full md:w-48 text-center md:text-left">
                  <div className="w-40 h-40 rounded-2xl overflow-hidden border border-emerald-500/20 relative shadow-[0_0_25px_rgba(16,185,129,0.05)] bg-charcoal/20 flex items-center justify-center">
                    {!drawerPortraitError && profile.imageUrl ? (
                      <img
                        itemProp="image"
                        src={profile.imageUrl}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                        onError={() => setDrawerPortraitError(true)}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#0a0a0c] border border-emerald-500/20 flex flex-col items-center justify-center p-3 text-center relative overflow-hidden select-none">
                        
                        <div 
                          className="absolute inset-0 opacity-[0.06] mix-blend-screen"
                          style={{
                            backgroundImage: `
                              linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)
                            `,
                            backgroundSize: "12px 12px",
                          }}
                        />
                        <div className="w-12 h-12 rounded-full border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-center mb-1.5 shadow-[0_0_12px_rgba(16,185,129,0.15)] z-10">
                          <User className="w-6 h-6 text-emerald-400 animate-pulse" />
                        </div>
                        <span className="text-[7.5px] text-emerald-400 font-bold uppercase tracking-widest leading-none z-10">
                          PORTRAIT_NODE
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
                  </div>
                  <div className="flex flex-col gap-1 w-full">
                    <h4 className="text-[8px] text-emerald-400 font-bold uppercase tracking-widest">IDENTITY_LEDGER</h4>
                    <div className="text-white font-black text-sm uppercase tracking-wider block" itemProp="name">{profile.name}</div>
                    <div className="text-[10px] text-gray-500 leading-normal" itemProp="jobTitle">{profile.jobTitle}</div>
                  </div>
                  
                  
                  <div className="w-full bg-black/40 border border-white/5 rounded-xl p-3.5 flex flex-col gap-2.5 text-[9px] text-gray-400 font-mono">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span itemProp="address">{(!profile.address || profile.address === "Bhubaneswar, India") ? "Mayurbhanj, India" : profile.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{(!profile.college || profile.college === "IIT Bhubaneswar") ? "GIFT Autonomous" : profile.college}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate w-full">
                      <Globe className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                      <a href={profile.websiteUrl} target="_blank" rel="noreferrer" className="hover:underline text-white truncate" itemProp="url">{profile.website}</a>
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-5 text-left">
                  
                  <div className="flex flex-col gap-2">
                    <span className="text-[8px] uppercase tracking-widest text-gray-500 font-bold px-1">BIOGRAPHICAL_OVERVIEW</span>
                    <p className="text-[10px] md:text-[11px] text-gray-300 leading-relaxed font-light font-mono bg-black/30 border border-white/5 rounded-xl p-4 shadow-inner" itemProp="description">
                      {profile.bio}
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <span className="text-[8px] uppercase tracking-widest text-gray-500 font-bold px-1">SYSTEMS_EXPERIENCE_LOG</span>
                    <div className="flex flex-col gap-3.5">
                      {(profile.experiences || []).map((exp, idx) => (
                        <div 
                          key={idx} 
                          className={`flex gap-3 items-start border-l pl-4 py-0.5 relative ${
                            exp.isPresent ? "border-emerald-500/20" : "border-white/5"
                          }`}
                        >
                          {exp.isPresent && <span className="absolute -left-1 top-2.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>}
                          <span className={`absolute -left-1 top-2.5 w-2 h-2 rounded-full ${exp.isPresent ? "bg-emerald-500" : "bg-gray-600"}`}></span>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1 text-[10px]">
                              <span className="text-white font-bold uppercase">{exp.role}</span>
                              <span className={`font-semibold font-mono ${exp.isPresent ? "text-emerald-400" : "text-gray-500"}`}>{exp.duration}</span>
                            </div>
                            <div className="text-[8px] text-gray-500 mb-1.5 uppercase font-bold">
                              {exp.company === "IIT Bhubaneswar" ? "GIFT Autonomous" : exp.company}
                            </div>
                            <p className="text-[10px] text-gray-400 leading-relaxed font-light">
                              {exp.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2.5">
                    <span className="text-[8px] uppercase tracking-widest text-gray-500 font-bold px-1">TECHNICAL_CAPABILITIES</span>
                    <div className="flex flex-wrap gap-2">
                      {(profile.capabilities || []).map((tech, tIdx) => (
                        <span key={tIdx} className="px-2 py-1 border border-white/5 bg-charcoal/40 text-cyan-300 text-[8px] rounded uppercase font-bold tracking-widest shadow-inner">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {resumeMessage && (
                <div className="p-4 border border-rose-500/20 bg-rose-500/5 rounded-xl flex gap-3 items-start text-[10px] text-rose-400 font-mono tracking-wide leading-relaxed relative z-20 shadow-[0_0_15px_rgba(244,63,94,0.05)] select-text animate-pulse">
                  <Cpu className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-bold uppercase block mb-1 text-rose-300">DOWNLOAD_FAILURE_LOGGER</span>
                    <span>{resumeMessage}</span>
                  </div>
                  <button 
                    onClick={() => setResumeMessage("")} 
                    className="text-rose-400 hover:text-white font-bold uppercase text-[9px] cursor-pointer animate-none"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {isCompiling && (
                <div className="p-4 border border-emerald-500/20 bg-zinc-950/90 rounded-xl flex gap-3 items-start text-[10px] text-emerald-400 font-mono tracking-wide leading-relaxed relative z-20 shadow-[0_0_20px_rgba(16,185,129,0.05)] select-text">
                  <Cpu className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 animate-spin" style={{ animationDuration: "2s" }} />
                  <div className="flex-1">
                    <span className="font-bold uppercase block mb-1 text-emerald-300">SYSTEM_COMPILER_LOGGER</span>
                    <div className="flex flex-col gap-1 max-h-[120px] overflow-y-auto pr-1">
                      {compilerLogs.map((log, idx) => (
                        <div key={idx} className="flex gap-1.5 items-center">
                          <span className="text-emerald-500/60 font-bold">&gt;&gt;</span>
                          <span>{log}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-auto border-t border-white/5 pt-5 flex flex-col sm:flex-row justify-between items-center gap-4 relative z-20">
                <span className="text-[8px] text-gray-600 uppercase font-mono tracking-widest leading-none">
                  SECURE PROFILE ACCESS AUTHORIZED 
                </span>
                {profile.showResume !== false && (
                  <div className="flex flex-wrap gap-2.5 sm:gap-3">
                    <button
                      onClick={handleCompileResume}
                      disabled={isCompiling}
                      className={`flex items-center gap-1.5 px-4 h-9 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/25 active:scale-95 text-emerald-400 text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer font-mono ${isCompiling ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <Cpu className="w-3.5 h-3.5 animate-pulse" />
                      <span>Compile Resume</span>
                    </button>
                    <button
                      onClick={() => {
                        if (profile.resumeUrl) {
                          window.open(profile.resumeUrl, "_blank");
                        } else {
                          const contactEmail = profile.email || import.meta.env.VITE_ADMIN_EMAIL || "";
                          const emailMsg = contactEmail ? `email me at ${contactEmail}` : "email the administrator";
                          setResumeMessage(`SECURE RESUME PACKAGE TRANSFER ERROR: Resume document is not yet registered by the administrator. Please request it directly by sending a message on the contact terminal or ${emailMsg}.`);
                        }
                      }}
                      className="flex items-center gap-1.5 px-4 h-9 rounded-lg border border-pink-500/30 bg-pink-500/10 hover:bg-pink-500/25 active:scale-95 text-pink-400 text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer font-mono"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Full Resume</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      <div className="h-[20vh] bg-obsidian"></div>
    </div>
  );
}
