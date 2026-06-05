import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Terminal, Cpu, Database, Activity, GitBranch, AlertTriangle, X } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const SystemGraph = ({ color = "#10b981", speed = 0.05, amplitude = 15 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationId;
    let offset = 0;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth || 200;
      canvas.height = 40;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      
      ctx.strokeStyle = color;
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x++) {
        
        const y = 
          canvas.height / 2 + 
          Math.sin(x * 0.03 + offset) * amplitude * 0.6 + 
          Math.sin(x * 0.08 - offset * 2) * (amplitude * 0.3) +
          Math.cos(x * 0.15 + offset) * (amplitude * 0.1);
        
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      offset += speed;
      animationId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [color, speed, amplitude]);

  return <canvas ref={canvasRef} className="w-full h-[40px] opacity-60 pointer-events-none select-none rounded" />;
};

const isLinkNotGiven = (url) => {
  if (!url) return true;
  const cleanUrl = url.trim().replace(/\/$/, "").toLowerCase();
  return cleanUrl === "" || cleanUrl === "https://github.com/subhenduprasad";
};

const ProjectList = ({ projects, onLinkClick }) => {
  const cardsRef = useRef([]);
  cardsRef.current = [];

  const addToRefs = (el) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el);
    }
  };

  useEffect(() => {
    if (cardsRef.current.length === 0) return;
    
    const anim = gsap.fromTo(
      cardsRef.current,
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardsRef.current[0],
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      }
    );
    return () => anim.kill();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-12 select-none">
      {projects.map((project, idx) => {
        const isLive = project.status === "live";
        const themeColor = isLive ? "#10b981" : "#06b6d4"; 

        return (
          <div
            key={idx}
            ref={addToRefs}
            className="flex flex-col p-6 rounded-2xl border border-white/5 bg-charcoal/50 backdrop-blur-md hover:border-white/15 transition-all duration-300 w-full shadow-lg group relative overflow-hidden"
          >
            
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5 text-xs font-mono text-gray-500">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-emerald-500" />
                <span>SRV_PORT: {8080 + idx}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span 
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ backgroundColor: themeColor }}
                  ></span>
                  <span 
                    className="relative inline-flex rounded-full h-2 w-2"
                    style={{ backgroundColor: themeColor }}
                  ></span>
                </span>
                <span style={{ color: themeColor }} className="font-semibold uppercase tracking-wider text-[10px]">
                  {isLive ? "ONLINE // ACTIVE" : "STABLE // MOUNTED"}
                </span>
              </div>
            </div>

            
            <div className="flex-1 mb-6">
              <h3 className="text-xl md:text-2xl font-black text-white group-hover:text-emerald-400 transition-colors tracking-wide font-sans mb-3 flex items-center gap-2.5">
                {project.projectName}
              </h3>
              
              <p className="text-xs md:text-sm text-gray-400 font-light leading-relaxed mb-5 min-h-[64px]">
                {project.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {project.languages.map((lang, lIdx) => (
                  <span 
                    key={lIdx}
                    className="px-2.5 py-0.5 border border-white/5 bg-white/5 text-cyan-300 font-mono text-[10px] rounded"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 mb-5 flex flex-col gap-3 font-mono">
              <div className="flex justify-between items-center text-[10px] text-gray-400">
                <span className="flex items-center gap-1"><Activity className="w-3 h-3 text-cyan-400" /> REAL-TIME ANALYTICS</span>
                <span className="text-white/40">CPU_CORE: ACTIVE</span>
              </div>
              
              <SystemGraph color={themeColor} speed={isLive ? 0.06 : 0.03} amplitude={isLive ? 14 : 9} />

              <div className="grid grid-cols-3 gap-2 text-center text-[10px] border-t border-white/5 pt-2">
                {Object.entries(project.stats).map(([statName, statVal]) => (
                  <div key={statName} className="flex flex-col gap-0.5">
                    <span className="text-gray-500 uppercase text-[8px]">{statName}</span>
                    <span className="text-gray-300 font-semibold">{statVal}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
              <a 
                href={project.links.code}
                target="_blank" 
                rel="noreferrer"
                onClick={(e) => {
                  if (isLinkNotGiven(project.links.code)) {
                    e.preventDefault();
                    onLinkClick("code", project.projectName);
                  }
                }}
                className="flex items-center gap-1.5 text-xs font-mono text-gray-400 hover:text-emerald-400 transition-colors"
              >
                <GitBranch className="w-4 h-4" />
                <span>GIT_REPO</span>
              </a>
              
              <a 
                href={project.links.demo}
                target="_blank" 
                rel="noreferrer"
                onClick={(e) => {
                  if (isLinkNotGiven(project.links.demo)) {
                    e.preventDefault();
                    onLinkClick("demo", project.projectName);
                  }
                }}
                className="px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs font-mono font-medium hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400 transition-all duration-300 flex items-center gap-1.5"
              >
                <span>SYS_LAUNCH</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>

          </div>
        );
      })}
    </div>
  );
};

export default function Projects({ projects }) {
  const [activeAlert, setActiveAlert] = useState(null); 

  const handleLinkClick = (type, projectName) => {
    setActiveAlert({ type, projectName });
  };

  useEffect(() => {
    if (activeAlert) {
      gsap.fromTo(
        ".alert-modal",
        { scale: 0.85, opacity: 0, y: 15 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" }
      );
    }
  }, [activeAlert]);

  const handleCloseAlert = () => {
    gsap.to(".alert-modal", {
      scale: 0.9,
      opacity: 0,
      y: 10,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => setActiveAlert(null)
    });
  };

  return (
    <div id="projects" className="py-24 w-full bg-obsidian px-[var(--defaultPaddingMob)] lg:px-[var(--defaultPadding)] text-white flex flex-col items-start overflow-x-hidden relative">
      
      <div className="absolute top-1/2 right-[-10%] w-[50vw] h-[50vw] bg-emerald-500/5 rounded-full blur-[140px] -z-10 pointer-events-none"></div>

      <div className="w-full max-w-5xl mx-auto flex flex-col items-start z-10">
        
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 font-mono text-[10px] text-gray-400 rounded-full mb-6">
          <Database className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span>PORTFOLIO_SERVICES</span>
        </div>

        <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase font-sans mb-4">
          SYSTEMS & <span className="text-emerald-400">ARCHITECTURES</span>
        </h2>
        <p className="text-sm md:text-base text-gray-400 max-w-xl font-light leading-relaxed">
          Detailed telemetry, code repos, and diagnostic specifications for database engines, API routing networks, and job queue portals.
        </p>

        <section className="w-full">
          <ProjectList projects={projects} onLinkClick={handleLinkClick} />
        </section>
      </div>
      
      {activeAlert && (
        <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center font-mono p-4">
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(16,185,129,0.01),rgba(6,182,212,0.005),rgba(16,185,129,0.01))] bg-[size:100%_3px,3px_100%] z-20"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none"></div>
          <div className="alert-modal w-full max-w-[460px] p-6 rounded-2xl border border-emerald-500/20 bg-charcoal/40 backdrop-blur-xl relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-500/50 animate-pulse-slow"></div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/5 text-[9px] text-gray-500">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>PORTAL_SECURITY_GATEWAY</span>
              </span>
              <button 
                onClick={handleCloseAlert}
                className="text-gray-500 hover:text-white transition-colors cursor-pointer"
                title="CLOSE_ALERT"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex flex-col items-center text-center my-6 gap-4">
              <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                {activeAlert.type === "code" ? (
                  <GitBranch className="w-6 h-6 text-emerald-400" />
                ) : (
                  <Cpu className="w-6 h-6 text-cyan-400" />
                )}
              </div>

              <h3 className="text-base font-black tracking-wider text-white uppercase mt-2">
                {activeAlert.type === "code" ? (
                  <span>[ REPO STATE: COMING SOON ]</span>
                ) : (
                  <span>[ SYS BOOT: UNDER ACTIVE DEV ]</span>
                )}
              </h3>

              <div className="text-xs text-gray-400 leading-relaxed font-light text-left bg-black/40 border border-white/5 p-4 rounded-xl w-full">
                {activeAlert.type === "code" ? (
                  <>
                    The codebase for <strong className="text-emerald-400">{activeAlert.projectName}</strong> is currently undergoing dynamic code-decoupling and security audits.
                    <span className="block mt-3 text-[10px] text-gray-500 font-mono">
                      &gt; git pull --locked 
                    </span>
                  </>
                ) : (
                  <>
                    The live runtime container for <strong className="text-cyan-400">{activeAlert.projectName}</strong> is currently hosted in a secure development sandbox.
                    <span className="block mt-3 text-[10px] text-gray-500 font-mono">
                      &gt; node server.js --local 
                    </span>
                  </>
                )}
              </div>
            </div>
            
            <button
              onClick={handleCloseAlert}
              className="w-full h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 active:scale-[0.98] text-xs font-bold uppercase tracking-widest cursor-pointer transition-all duration-300 flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.02)] font-mono"
            >
              <span>TERMINATE_ALERT</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}