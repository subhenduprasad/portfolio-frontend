import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCw,
  ArrowUp,
  Code,
  Layers,
  Briefcase,
  User,
  Mail,
  Terminal
} from "lucide-react";

const ContextMenu = ({ apiStatus = "ONLINE" }) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);

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
    const handleContextMenu = (e) => {
      e.preventDefault();
      setVisible(true);

      const menuW = 210;
      const menuH = 390; 
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;

      let posX = e.clientX;
      let posY = e.clientY;

      if (posX + menuW > screenW) {
        posX = screenW - menuW - 10;
      }
      if (posY + menuH > screenH) {
        posY = screenH - menuH - 10;
      }

      setPosition({ x: posX, y: posY });
    };

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setVisible(false);
      } else {
        
        setVisible(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setVisible(false);
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleScrollToTop = () => {
    if (window.lenis) {
      window.lenis.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleScrollToSection = (id) => {
    const target = document.querySelector(id);
    if (target) {
      if (window.lenis) {
        window.lenis.scrollTo(target);
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleTriggerCommand = (command) => {
    window.dispatchEvent(
      new CustomEvent("run-terminal-command", {
        detail: { command },
      })
    );
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          style={{ top: position.y, left: position.x }}
          className="fixed z-[9999] w-[210px] rounded-xl border border-white/10 bg-zinc-950/80 p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl flex flex-col font-mono text-[11px] text-zinc-300"
        >
          
          <button
            onClick={handleRefresh}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-400 active:scale-[0.98] transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <RotateCw className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
              <span>REFRESH_SESSION</span>
            </div>
            <span className="text-[9px] text-zinc-600 font-mono">⌘R</span>
          </button>

          <button
            onClick={handleScrollToTop}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-400 active:scale-[0.98] transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ArrowUp className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
              <span>SCROLL_TO_TOP</span>
            </div>
          </button>

          <div className="h-[1px] bg-white/5 my-1" />

          
          <div className="px-3 py-1 text-[9px] text-zinc-500 uppercase tracking-widest font-semibold font-mono">
            Navigation tree
          </div>

          <button
            onClick={() => handleScrollToSection("#about")}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 hover:text-white transition-all text-left cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-zinc-600" />
            <span>~/about</span>
          </button>

          <button
            onClick={() => handleScrollToSection("#projects")}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 hover:text-white transition-all text-left cursor-pointer"
          >
            <Code className="w-3.5 h-3.5 text-zinc-600" />
            <span>~/projects</span>
          </button>

          <button
            onClick={() => handleScrollToSection("#skills")}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 hover:text-white transition-all text-left cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-zinc-600" />
            <span>~/skills</span>
          </button>

          <button
            onClick={() => handleScrollToSection("#experiences")}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 hover:text-white transition-all text-left cursor-pointer"
          >
            <Briefcase className="w-3.5 h-3.5 text-zinc-600" />
            <span>~/experience</span>
          </button>

          <button
            onClick={() => handleScrollToSection("#contact")}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 hover:text-white transition-all text-left cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-zinc-600" />
            <span>~/contact</span>
          </button>

          <div className="h-[1px] bg-white/5 my-1" />

          
          <div className="px-3 py-1 text-[9px] text-zinc-500 uppercase tracking-widest font-semibold font-mono">
            Terminal scripts
          </div>

          <button
            onClick={() => handleTriggerCommand("system")}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-400 active:scale-[0.98] transition-all text-left cursor-pointer group"
          >
            <Terminal className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400" />
            <span>run neofetch</span>
          </button>

          <button
            onClick={() => handleTriggerCommand("hack")}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-400 active:scale-[0.98] transition-all text-left cursor-pointer group"
          >
            <Terminal className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 animate-pulse" />
            <span>initiate hack</span>
          </button>

          <button
            onClick={() => handleTriggerCommand("matrix")}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-400 active:scale-[0.98] transition-all text-left cursor-pointer group"
          >
            <Terminal className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400" />
            <span>compile matrix</span>
          </button>

          <button
            onClick={() => handleTriggerCommand("avatar")}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-400 active:scale-[0.98] transition-all text-left cursor-pointer group"
          >
            <Terminal className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400" />
            <span>ascii avatar</span>
          </button>
          
          <div className="border-t border-white/5 pt-2 mt-1.5 px-3 pb-1 flex flex-col gap-1 font-mono text-[9px] text-zinc-500">
            <div className="flex justify-between items-center">
              <span>NODE_STATUS:</span>
              <span className={isOnline ? "text-emerald-500 font-bold" : "text-red-500 font-bold animate-pulse"}>
                {isOnline ? (apiStatus === "ONLINE" ? "ONLINE" : apiStatus === "DEGRADED" ? "DEGRADED" : "OFFLINE") : "DISCONNECTED"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>SECURE_ADDR:</span>
              <span className="text-zinc-400">0x7F000001</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContextMenu;
