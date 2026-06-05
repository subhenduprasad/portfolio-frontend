import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { skills } from "../utils/constants";
import { Cpu, Database, Layout, Sparkles, Terminal } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function Skills() {
  const cardsRef = useRef([]);
  cardsRef.current = [];

  const [selectedLog, setSelectedLog] = useState("[READY] Systems online. Click on any active skill node to compile diagnostic diagnostics.");
  const [consoleCommand, setConsoleCommand] = useState("system_query --list-nodes");

  const addToRefs = (el) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el);
    }
  };

  useEffect(() => {
    if (cardsRef.current.length === 0) return;
    
    const anim = gsap.fromTo(
      cardsRef.current,
      { y: 30, opacity: 0, scale: 0.95 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.6,
        stagger: 0.05,
        ease: "power2.out",
        scrollTrigger: {
          trigger: cardsRef.current[0],
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      }
    );

    return () => anim.kill();
  }, []);

  const handleSkillClick = (skillName, logInfo) => {
    
    const normalizedName = skillName.toLowerCase().replace(" ", "_");
    setConsoleCommand(`query_stack --node=${normalizedName}`);
    
    setSelectedLog("[COMPILING] Connecting socket to registry node...");
    setTimeout(() => {
      setSelectedLog(logInfo);
    }, 250);
  };
  
  const categories = [
    {
      title: "Systems & Core Code",
      type: "development",
      color: "border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.1)]",
      icon: <Cpu className="w-5 h-5 text-emerald-400" />
    },
    {
      title: "Databases & Cache",
      type: "database",
      color: "border-cyan-500/20 hover:border-cyan-500/40 text-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)]",
      icon: <Database className="w-5 h-5 text-cyan-400" />
    },
    {
      title: "Integrations & Frontend",
      type: "frontend",
      color: "border-purple-500/20 hover:border-purple-500/40 text-purple-400 hover:shadow-[0_0_15px_rgba(168,85,247,0.1)]",
      icon: <Layout className="w-5 h-5 text-purple-400" />
    },
    {
      title: "Creative Visual Suite",
      type: "creative",
      color: "border-pink-500/20 hover:border-pink-500/40 text-pink-400 hover:shadow-[0_0_15px_rgba(244,114,182,0.1)]",
      icon: <Sparkles className="w-5 h-5 text-pink-400" />
    }
  ];

  return (
    <div 
      id="skills" 
      className="py-24 w-full bg-obsidian px-[var(--defaultPaddingMob)] lg:px-[var(--defaultPadding)] text-white flex flex-col items-start overflow-x-hidden relative"
    >
      
      <div className="absolute bottom-1/2 left-[-15%] w-[45vw] h-[45vw] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="w-full max-w-5xl mx-auto flex flex-col items-start z-10 select-none">
        
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 font-mono text-[10px] text-gray-400 rounded-full mb-6">
          <Cpu className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span>RESOURCE_MONITOR</span>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase font-sans mb-4">
          ENGINEERING & <span className="text-emerald-400">DESIGN</span> STACK
        </h2>
        <p className="text-sm md:text-base text-gray-400 max-w-xl font-light leading-relaxed mb-12">
          Interactive registry detailing language proficiencies, cache setups, database structures, and creative styling suites.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-12">
          {categories.map((cat, cIdx) => (
            <div 
              key={cIdx}
              className="p-6 rounded-2xl border border-white/5 bg-charcoal/30 flex flex-col gap-5"
            >
              
              <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                <span className="p-2 rounded-lg bg-white/5 border border-white/5">
                  {cat.icon}
                </span>
                <span className="text-sm font-bold tracking-wider uppercase text-white font-mono">{cat.title}</span>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {skills
                  .filter(s => s.type === cat.type)
                  .map((item, idx) => (
                    <button
                      key={idx}
                      ref={addToRefs}
                      onClick={() => handleSkillClick(item.skill, item.logInfo)}
                      className={`px-4 py-2.5 rounded-xl border bg-charcoal/50 flex items-center gap-3 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer ${cat.color}`}
                    >
                      <img
                        src={item.icon}
                        alt={item.skill}
                        className="w-5 h-5 object-contain select-none pointer-events-none"
                      />
                      <span className="text-xs font-mono font-medium text-gray-300 group-hover:text-white">
                        {item.skill}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="w-full rounded-2xl border border-white/10 bg-charcoal/80 shadow-[0_0_30px_rgba(0,0,0,0.4)] overflow-hidden font-mono flex flex-col relative terminal-crt">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-charcoal/95 select-none text-[10px] text-white/40">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-500" />
              <span>telemetry_debugger@subhendu-db: ~ (sh)</span>
            </div>
            <span>PORT_3000</span>
          </div>

          <div className="p-5 flex flex-col gap-2 min-h-[100px] text-xs md:text-sm text-emerald-400 select-text select-none">
            <div className="flex gap-2 text-white">
              <span>visitor@subhendu.dev:~$</span>
              <span className="font-bold">{consoleCommand}</span>
            </div>
            
            <div className="text-gray-300 leading-relaxed font-mono whitespace-pre-wrap select-text break-words">
              {selectedLog}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
