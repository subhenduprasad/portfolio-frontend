import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GitBranch, GitCommit, ChevronDown, ChevronUp } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function Timeline() {
  const [expandedCommit, setExpandedCommit] = useState(null);
  const containerRef = useRef(null);
  const lineRef = useRef(null);
  const itemsRef = useRef([]);
  itemsRef.current = [];

  const addToRefs = (el) => {
    if (el && !itemsRef.current.includes(el)) {
      itemsRef.current.push(el);
    }
  };

  useEffect(() => {
    if (itemsRef.current.length === 0) return;

    const ctx = gsap.context(() => {
      
      itemsRef.current.forEach((item) => {
        gsap.fromTo(
          item,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: item,
              start: "top 85%",
              toggleActions: "play none none none",
            }
          }
        );
      });
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current.querySelector(".tree-container"),
          start: "top 60%",
          toggleActions: "play none none none",
        }
      });
      
      tl.fromTo(
        lineRef.current,
        { height: "0%" },
        {
          height: "100%",
          duration: 1.5,
          ease: "power1.inOut",
        }
      );
      
      itemsRef.current.forEach((item, index) => {
        const bullet = item.querySelector(".bullet-node");
        const icon = item.querySelector(".bullet-icon");
        const card = item.querySelector(".timeline-card");
        const highlightTime = index * 0.75;

        tl.to(bullet, {
          borderColor: "#10b981", 
          backgroundColor: "#070708", 
          boxShadow: "0 0 24px rgba(16, 185, 129, 0.8), inset 0 0 12px rgba(16, 185, 129, 0.3)",
          duration: 0.3,
          ease: "power1.out"
        }, highlightTime)
        .to(icon, {
          color: "#34d399", 
          duration: 0.3,
          ease: "power1.out"
        }, highlightTime)
        .to(card, {
          borderColor: "rgba(16, 185, 129, 0.3)",
          backgroundColor: "rgba(11, 11, 13, 0.8)",
          boxShadow: "0 4px 25px rgba(0, 0, 0, 0.45), 0 0 20px rgba(16, 185, 129, 0.05)",
          duration: 0.3,
          ease: "power1.out"
        }, highlightTime);
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const toggleCommit = (index) => {
    if (expandedCommit === index) {
      setExpandedCommit(null);
    } else {
      setExpandedCommit(index);
    }
  };

  const experiences = [
    {
      role: "Graduate Degree in Computer Science",
      company: "GIFT Autonomous",
      duration: "2022 - 2026 // GRADUATION",
      desc: "+ Built basic foundations in C and Java programming, along with Data Structures (DSA) and Algorithms (DAA)\n+ Learned core academic subjects including FLAT, Theory of Computation (TOC), and basic Operating Systems (OS)\n+ Completed academic curriculum milestones including basic concepts of Computer Networking\n- Transitioned from basic programming concepts to real-world software development practices",
      isPresent: false
    },
    {
      role: "Independent Developer",
      company: "Independent Projects",
      duration: "2021 - PRESENT // ACTIVE",
      desc: "+ Built full-stack applications using React, Node.js, Express, and MongoDB\n+ Developed C++ projects involving socket programming, multithreading, and file handling\n+ Practiced Data Structures & Algorithms to strengthen problem-solving skills\n- Refactored project architectures and removed redundant code to improve maintainability",
      isPresent: true
    },
    {
      role: "Backend & Full Stack Developer",
      company: "Collaborative Engineering Node",
      duration: "2025 - PRESENT // COLLABORATE",
      desc: "+ Collaborating on an adaptive online code judging platform with a development team\n+ Contributing to backend services, evaluation workflows, and system design\n+ Working with Git-based collaborative development practices\n- Reworked initial implementations and optimized project structure based on team feedback",
      isPresent: true
    }
  ];

  const commits = experiences.map((exp, idx) => {
    const rawVal = exp.role + exp.company + idx;
    let hashNum = 0;
    for (let i = 0; i < rawVal.length; i++) {
      hashNum = rawVal.charCodeAt(i) + ((hashNum << 5) - hashNum);
    }
    const pseudoHash = Math.abs(hashNum).toString(16).substring(0, 7).padEnd(7, "0");
    
    let diffLines = [];
    if (exp.desc) {
      diffLines = exp.desc.split("\n").filter(Boolean).map(line => {
        let text = line.trim();
        let type = "add";
        if (text.startsWith("+")) {
          type = "add";
          text = text.substring(1).trim();
        } else if (text.startsWith("-")) {
          type = "del";
          text = text.substring(1).trim();
        } else if (text.startsWith("*")) {
          type = "add";
          text = text.substring(1).trim();
        }
        return { type, text };
      });
    }

    return {
      hash: pseudoHash,
      date: exp.duration,
      category: exp.isPresent ? "ACTIVE" : "STABLE",
      title: exp.role,
      summary: exp.company,
      diff: diffLines.length > 0 ? diffLines : [{ type: "add", text: exp.desc || "" }]
    };
  });

  return (
    <div 
      id="experiences" 
      className="py-24 w-full bg-obsidian px-[var(--defaultPaddingMob)] lg:px-[var(--defaultPadding)] text-white flex flex-col items-start overflow-x-hidden relative"
      ref={containerRef}
    >
      
      <div className="absolute top-1/3 right-[-10%] w-[50vw] h-[50vw] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="w-full max-w-5xl mx-auto flex flex-col items-start z-10 select-none">
        
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 font-mono text-[10px] text-gray-400 rounded-full mb-6">
          <GitBranch className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span>GIT_BRANCH</span>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase font-sans mb-4">
          SYSTEMS <span className="text-emerald-400">CHRONOLOGY</span>
        </h2>
        <p className="text-sm md:text-base text-gray-400 max-w-xl font-light leading-relaxed mb-16">
          Telemetry ledger representing milestone commits, academic degrees, and professional freelancing contributions mapped onto a git tree.
        </p>
        
        <div className="tree-container relative w-full flex flex-col gap-12">
          <div className="absolute top-0 bottom-0 left-[16px] md:left-[32px] w-[2px] -translate-x-1/2 bg-white/5 pointer-events-none z-[1]"></div>
          <div 
            ref={lineRef}
            className="absolute top-0 left-[16px] md:left-[32px] w-[2px] -translate-x-1/2 bg-gradient-to-b from-emerald-500 via-cyan-400 to-emerald-500 shadow-[0_0_12px_rgba(52,211,153,0.7)] origin-top pointer-events-none z-[2]"
            style={{ height: "0%" }}
          ></div>

          {commits.map((commit, idx) => {
            const isExpanded = expandedCommit === idx;

            return (
              <div 
                key={idx}
                ref={addToRefs}
                className="relative w-full group select-none text-left z-[10]"
              >
                
                <span className="bullet-node absolute left-[16px] md:left-[32px] -translate-x-1/2 top-2.5 flex h-5 w-5 md:h-7 md:w-7 items-center justify-center rounded-full bg-[#070708] border border-white/10 shadow-none z-[30] group-hover:scale-115 transition-all duration-300">
                  <GitCommit className="bullet-icon w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-gray-500 transition-colors" />
                </span>
                
                <div className="pl-[36px] md:pl-[64px] w-full">
                  <div className="flex items-center gap-3 mb-3 text-[10px] font-mono text-gray-500">
                  <span className="px-2 py-0.5 border border-white/10 bg-white/5 text-emerald-400 font-bold rounded">
                    commit {commit.hash}
                  </span>
                  <span>|</span>
                  <span>{commit.date}</span>
                  <span>|</span>
                  <span className="text-cyan-400 tracking-wider font-semibold">{commit.category}</span>
                </div>
                
                <div 
                  onClick={() => toggleCommit(idx)}
                  className="timeline-card p-5 rounded-2xl border border-white/5 bg-charcoal/50 backdrop-blur-md hover:border-emerald-500/20 hover:bg-charcoal/70 transition-all duration-300 shadow-md cursor-pointer relative"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-white mb-2 font-sans tracking-wide">
                        {commit.title}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-400 font-light leading-relaxed">
                        {commit.summary}
                      </p>
                    </div>

                    <div className="p-1.5 rounded-lg border border-white/5 bg-white/5 text-gray-400 group-hover:text-emerald-400 transition-colors shrink-0">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                  
                  <div 
                    className={`overflow-hidden transition-all duration-500 ease-in-out font-mono text-xs ${isExpanded ? "max-h-[300px] mt-5 border-t border-white/5 pt-5 opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`}
                  >
                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-3">
                    </p>
                    <div className="flex flex-col gap-2 p-4 rounded-xl bg-black/40 border border-white/5 leading-relaxed text-[11px] md:text-xs">
                      {commit.diff.map((line, lIdx) => {
                        const isAdd = line.type === "add";
                        return (
                          <div 
                            key={lIdx} 
                            className={`flex gap-3 px-2 py-1 rounded select-text ${isAdd ? "bg-emerald-500/5 text-emerald-400" : "bg-red-500/5 text-red-400"}`}
                          >
                            <span className="font-bold select-none">{isAdd ? "+" : "-"}</span>
                            <span className="font-mono">{line.text}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>

            </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
