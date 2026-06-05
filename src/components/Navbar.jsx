import gsap from "gsap";
import React, { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { navData, contactDetails } from "../utils/constants";
import "../index.css";

gsap.registerPlugin(ScrollTrigger);

const Navbar = ({ apiStatus = "ONLINE", profile }) => {
  const navbarRef = useRef();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [latency, setLatency] = useState("1.2ms");

  const resolvedStatus = !isOnline ? "OFFLINE" : apiStatus;

  const getStatusConfig = () => {
    switch (resolvedStatus) {
      case "OFFLINE":
        return {
          label: "SYSTEM_OFFLINE",
          colorClass: "bg-red-500/10 border-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]",
          dotColor: "bg-red-500",
          pingColor: "bg-red-400",
          latencyText: "OFFLINE",
          latencyClass: "text-red-500 font-bold animate-pulse"
        };
      case "DEGRADED":
        return {
          label: "SYSTEM_DEGRADED",
          colorClass: "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:border-amber-500/30 hover:bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.1)]",
          dotColor: "bg-amber-500",
          pingColor: "bg-amber-400",
          latencyText: "DEGRADED",
          latencyClass: "text-amber-500 font-semibold animate-pulse"
        };
      case "ONLINE":
      default:
        return {
          label: "SYSTEM_OK",
          colorClass: "bg-white/5 border-white/5 text-gray-400 hover:border-emerald-500/20 hover:bg-emerald-500/5 shadow-[0_0_15px_rgba(0,0,0,0.2)]",
          dotColor: "bg-emerald-500",
          pingColor: "bg-emerald-400",
          latencyText: latency,
          latencyClass: "text-emerald-400 font-semibold"
        };
    }
  };
  
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  
  useEffect(() => {
    const updateLatency = () => {
      if (typeof navigator === "undefined") return;

      if (!navigator.onLine) {
        setLatency("OFFLINE");
        return;
      }

      if (navigator.connection && navigator.connection.rtt !== undefined && navigator.connection.rtt > 0) {
        
        setLatency(`${navigator.connection.rtt}ms`);
      } else {
        
        const ms = (Math.random() * 0.4 + 0.9).toFixed(1);
        setLatency(`${ms}ms`);
      }
    };

    updateLatency(); 
    const interval = setInterval(updateLatency, 4000);
    return () => clearInterval(interval);
  }, [isOnline]);

  
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("overflow-hidden");
      if (window.lenis) {
        window.lenis.stop();
      }
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove("overflow-hidden");
      if (window.lenis) {
        window.lenis.start();
      }
    }
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("overflow-hidden");
      if (window.lenis) {
        window.lenis.start();
      }
    };
  }, [mobileMenuOpen]);

  useGSAP(() => {
    
    gsap.fromTo(
      navbarRef.current,
      { y: -50, opacity: 0 },
      {
        y: 0,
        duration: 0.8,
        opacity: 1,
        delay: 0.5,
        ease: "power3.out",
      }
    );

    
    const trigger = ScrollTrigger.create({
      trigger: "body",
      start: "top+=10 top",
      onEnter: () => {
        gsap.to(navbarRef.current, {
          backgroundColor: "rgba(7, 7, 8, 0.75)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          height: "64px",
          duration: 0.4,
          ease: "power2.out",
        });
      },
      onLeaveBack: () => {
        gsap.to(navbarRef.current, {
          backgroundColor: "transparent",
          backdropFilter: "blur(0px)",
          WebkitBackdropFilter: "blur(0px)",
          borderBottom: "1px solid transparent",
          height: "72px",
          duration: 0.4,
          ease: "power2.out",
        });
      },
    });

    return () => trigger.kill();
  });

  const handleContactClick = () => {
    const target = document.querySelector("#contact");
    if (target) {
      if (window.lenis) {
        window.lenis.scrollTo(target);
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <>
      <nav
        className="fixed z-50 top-0 left-0 h-[72px] w-full px-[var(--defaultPaddingMob)] lg:px-[var(--defaultPadding)] flex items-center justify-between text-white bg-transparent"
        ref={navbarRef}
      >
        
        <a
          href="https://subhenduhembram.dev"
          className="text-white cursor-pointer font-bold text-base md:text-lg tracking-wider flex items-center gap-2 font-mono hover:text-emerald-400 transition-colors"
        >
          <span className="text-emerald-500 font-extrabold">&lt;</span>
          <span>subhendu.dev</span>
          <span className="text-emerald-500 font-extrabold">/&gt;</span>
        </a>
        
        <NavLinks />
        
        <div className="flex items-center gap-4">
          {(() => {
            const statusConfig = getStatusConfig();
            return (
              <div 
                className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border font-mono text-[10px] transition-all duration-300 ${statusConfig.colorClass}`}
                title="SYSTEM STATUS TELEMETRY"
              >
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusConfig.pingColor}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${statusConfig.dotColor}`}></span>
                </span>
                <span className={resolvedStatus === "ONLINE" ? "" : "font-bold"}>{statusConfig.label}</span>
                <span className="text-white/20">|</span>
                <span className={statusConfig.latencyClass}>{statusConfig.latencyText}</span>
              </div>
            );
          })()}

          <button
            onClick={handleContactClick}
            className="hidden sm:flex px-4 py-1.5 flex-row items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/25 active:scale-95 text-xs font-mono tracking-wide cursor-pointer transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.05)] hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
          >
            PING_SERVER
            <div className="flex items-center justify-center">
              <TopArrow />
            </div>
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col gap-1.5 p-1.5 lg:hidden active:scale-90 transition-transform cursor-pointer"
          >
            <span className="w-6 h-0.5 bg-white rounded-full"></span>
            <span className="w-5 h-0.5 bg-white rounded-full self-end"></span>
            <span className="w-6 h-0.5 bg-white rounded-full"></span>
          </button>
        </div>
      </nav>
      
      <div 
        className={`fixed inset-0 z-[99] bg-black/60 backdrop-blur-md transition-opacity duration-300 lg:hidden ${mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setMobileMenuOpen(false)}
      ></div>
      
      <div 
        className={`fixed top-0 right-0 h-full w-[280px] max-w-[80vw] z-[100] bg-charcoal border-l border-white/5 flex flex-col p-8 transition-transform duration-300 lg:hidden ease-out ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-8">
          <span className="font-mono text-sm text-gray-400 font-semibold">NAVIGATION_TREE</span>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 rounded bg-white/5 hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <ul className="flex flex-col gap-6 font-mono text-sm">
          {navData.map((data, i) => (
            <li key={i}>
              <a 
                href={data.path}
                onClick={(e) => {
                  e.preventDefault();
                  document.body.style.overflow = "";
                  document.body.classList.remove("overflow-hidden");
                  if (window.lenis) {
                    window.lenis.start();
                  }

                  setMobileMenuOpen(false);

                  if (data.path.startsWith("#")) {
                    const target = document.querySelector(data.path);
                    if (target) {
                      
                      setTimeout(() => {
                        if (window.lenis) {
                          window.lenis.scrollTo(target);
                        } else {
                          target.scrollIntoView({ behavior: "smooth" });
                        }
                      }, 80);
                    }
                  }
                }}
                className="flex items-center gap-3 text-gray-300 hover:text-emerald-400 transition-colors uppercase tracking-wider py-2"
              >
                <span className="text-emerald-500 font-extrabold">~/</span>
                {data.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-auto border-t border-white/5 pt-6 flex flex-col gap-4 font-mono text-xs text-gray-400">
          <div>
            <p className="text-[10px] text-white/30 mb-1">SYSTEM STATUS</p>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full animate-pulse ${
                resolvedStatus === "ONLINE" ? "bg-emerald-500" : resolvedStatus === "DEGRADED" ? "bg-amber-500" : "bg-red-500"
              }`}></span>
              <span className={`font-mono ${
                resolvedStatus === "ONLINE" ? "text-white" : resolvedStatus === "DEGRADED" ? "text-amber-400 font-semibold" : "text-red-400 font-bold"
              }`}>
                {resolvedStatus === "ONLINE" ? "Active Node Online" : resolvedStatus === "DEGRADED" ? "Active Node Degraded" : "Active Node Offline"}
              </span>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-white/30 mb-1">SECURE CONNECT</p>
            <a href={`mailto:${contactDetails.email}`} className="hover:text-emerald-400 break-all transition-colors">{contactDetails.email}</a>
          </div>
        </div>
      </div>
    </>
  );
};

const TopArrow = () => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 18L18 6M18 6H10M18 6V14"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const NavlinkItem = ({ children, href }) => {
  const container = useRef(null);
  const letters = children.split("");
  const { contextSafe } = useGSAP({ scope: container });

  const handleMouseEnter = contextSafe(() => {
    gsap.to(".letter-wrapper", {
      y: "-100%",
      duration: 0.3,
      ease: "power2.out",
      stagger: 0.015,
    });
  });

  const handleMouseLeave = contextSafe(() => {
    gsap.to(".letter-wrapper", {
      y: "0%",
      duration: 0.3,
      ease: "power2.out",
      stagger: 0.015,
    });
  });

  const handleClick = (e) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        if (window.lenis) {
          window.lenis.scrollTo(target);
        } else {
          target.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  return (
    <a
      ref={container}
      href={href}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative flex h-fit overflow-hidden font-mono text-xs uppercase cursor-pointer py-1 text-gray-400 hover:text-emerald-400 transition-colors"
    >
      {letters.map((letter, i) => (
        <div
          key={i}
          className="relative flex flex-col h-4 overflow-hidden"
        >
          <div className="letter-wrapper relative w-full h-full">
            <span className="flex items-center h-full leading-none">
              {letter === " " ? "\u00A0" : letter}
            </span>

            <span className="absolute top-full left-0 flex items-center h-full text-emerald-400 leading-none">
              {letter === " " ? "\u00A0" : letter}
            </span>
          </div>
        </div>
      ))}
    </a>
  );
};

const NavLinks = () => {
  return (
    <ul className="flex-row gap-8 hidden lg:flex items-center">
      {navData.map((data, i) => (
        <li key={i} className="text-center min-w-max">
          <NavlinkItem href={data.path}>{data.label}</NavlinkItem>
        </li>
      ))}
    </ul>
  );
};

export default Navbar;
