import { Html, useProgress } from "@react-three/drei";
import { useEffect, useState } from "react";

function ProgressValue({ is2D }) {
  if (is2D) return 100;
  try {
    const { progress } = useProgress();
    return progress;
  } catch (e) {
    return 100;
  }
}

export default function Loader({ onLoaded, is2D = false }) {
  const progress = ProgressValue({ is2D });
  const [visualPct, setVisualPct] = useState(0);
  const [logs, setLogs] = useState([]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setVisualPct((prev) => {
        const actualProgress = Math.round(progress);
        if (prev < 99) {
          return prev + 1;
        } else if (actualProgress === 100) {
          clearInterval(interval);
          setTimeout(() => {
            if (onLoaded) onLoaded();
          }, 450); 
          return 100;
        }
        return prev;
      });
    }, 20); 

    return () => clearInterval(interval);
  }, [progress, onLoaded]);

  useEffect(() => {
    const list = [
      { prg: 0, txt: ">>> Booting subhendu_os_kernel v2.6.14..." },
      { prg: 10, txt: is2D ? "[ INFO ] Adaptive Network scan: Low-Bandwidth Node detected." : "[  OK  ] Core memory mapped (x86_64 architecture)" },
      { prg: 25, txt: is2D ? "[ WARN ] Saving data: Bypassing high-overhead 3D workspace models..." : "[  OK  ] MongoDB Connection pooled (latency: 1.2ms)" },
      { prg: 42, txt: "[  OK  ] Redis memory-cache adapter synced" },
      { prg: 58, txt: "[  OK  ] C++ compilation context loaded" },
      { prg: 72, txt: "[  OK  ] React 19 fiber hydration hooks attached" },
      { prg: 88, txt: "[ READY ] Client terminal payload decrypted." },
      { prg: 99, txt: is2D ? "[  OK  ] Initializing low-overhead systems dashboard panels..." : "[ WAIT ] Syncing high-fidelity 3D workspace assets..." },
      { prg: 100, txt: is2D ? ">>> Launching system profile core..." : ">>> Opening 3D virtual workspace tunnel..." }
    ];

    const currentLogs = list
      .filter((item) => visualPct >= item.prg)
      .map((item) => item.txt);

    setLogs(currentLogs);
  }, [visualPct, is2D]);

  const loaderUI = (
    <div 
      className="w-[90vw] max-w-lg p-6 rounded-xl border border-white/10 bg-black/80 backdrop-blur-md select-none text-left code-font shadow-[0_0_40px_rgba(16,185,129,0.15)] overflow-hidden relative font-mono text-white"
      style={{
        boxShadow: "0 0 30px rgba(0, 0, 0, 0.9)",
      }}
    >
      
      <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4 text-white/40 text-xs">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/50"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></span>
        </div>
        <span>subhendu_boot.sh</span>
      </div>
      
      <div className="min-h-[160px] flex flex-col gap-1.5 text-xs md:text-sm text-emerald-400 font-mono select-none">
        {logs.map((log, idx) => (
          <div key={idx} className="flex gap-2">
            <span className="text-white/20 select-none">[{idx}]</span>
            <span className="break-all">{log}</span>
          </div>
        ))}
        
        {visualPct < 100 && (
          <div className="flex gap-2 items-center text-white/50 animate-pulse">
            <span>[{logs.length}]</span>
            <span className="w-2 h-4 bg-emerald-400"></span>
          </div>
        )}
      </div>
      
      <div className="mt-6 flex flex-col gap-1.5">
        <div className="flex justify-between items-center text-xs text-white/50">
          <span>SYSTEM DECRYPT STATUS</span>
          <span className="text-emerald-400 font-semibold">{visualPct}%</span>
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981] transition-all duration-300 ease-out" 
            style={{ width: `${visualPct}%` }}
          ></div>
        </div>
      </div>
    </div>
  );

  if (is2D) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
        {loaderUI}
      </div>
    );
  }

  return (
    <Html center>
      {loaderUI}
    </Html>
  );
}