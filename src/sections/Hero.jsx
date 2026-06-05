import React, { useState, useEffect, useRef } from "react";
import { contactDetails, skills } from "../utils/constants";
import "../../src/index.css";

export default function Hero({ projects, onAdminSuccess }) {
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalHistory, setTerminalHistory] = useState([
    { type: "sys", text: "SYSTEM OVERWATCH: SECURE GATEWAY OPENED" },
    { type: "sys", text: "visitor@subhendu.dev:~$ echo 'Welcome, type \"help\" to explore my profile!'" },
    { type: "output", text: "Welcome, type \"help\" to explore my profile!" }
  ]);
  const [isComputing, setIsComputing] = useState(false);
  const [computingText, setComputingText] = useState("");
  const [liveVisitorSpecs, setLiveVisitorSpecs] = useState(null);
  
  const terminalBodyRef = useRef(null);
  const terminalInputRef = useRef(null);
  
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [terminalHistory]);
  
  useEffect(() => {
    
    const initial = getVisitorSystemInfo();
    setLiveVisitorSpecs(initial);
    
    if (navigator.userAgentData && typeof navigator.userAgentData.getHighEntropyValues === "function") {
      navigator.userAgentData.getHighEntropyValues(["platformVersion", "model", "platform"])
        .then(hints => {
          setLiveVisitorSpecs(prev => {
            if (!prev) return prev;
            let updatedVersion = prev.osVersion;
            let updatedModel = prev.deviceModel;

            const platform = hints.platform || "";
            const platVer = hints.platformVersion || "";
            const modelName = hints.model || "";

            if (platform === "Windows") {
              const majorVer = parseInt(platVer.split(".")[0]);
              if (majorVer >= 13) {
                updatedVersion = `Windows 11 (Build ${platVer})`;
              } else {
                updatedVersion = `Windows 10 (Build ${platVer})`;
              }
            } else if (platform === "macOS") {
              const majorVer = parseInt(platVer.split(".")[0]);
              if (majorVer === 15) {
                updatedVersion = `macOS Sequoia 15.2 (Build ${platVer})`;
              } else if (majorVer >= 16) {
                updatedVersion = `macOS Tahoe 26.5 (Build ${platVer})`;
              } else if (platVer) {
                updatedVersion = `macOS v${platVer}`;
              }
            } else if (platform === "Android") {
              if (platVer) {
                updatedVersion = `Android ${platVer}`;
              }
            }

            if (modelName) {
              updatedModel = modelName;
            }

            return {
              ...prev,
              osVersion: updatedVersion,
              deviceModel: updatedModel
            };
          });
        })
        .catch(() => {});
    }
  }, []);

  const focusTerminal = () => {
    if (terminalInputRef.current) {
      terminalInputRef.current.focus();
    }
  };
  
  const getVisitorSystemInfo = () => {
    const ua = navigator.userAgent;
    
    let osName = "Linux Kernel Node";
    let deviceModel = "x86_64 Systems Mainframe";
    if (ua.includes("iPhone")) {
      osName = "iOS (Apple iPhone Platform)";
      deviceModel = "Apple iPhone";
    } else if (ua.includes("iPad")) {
      osName = "iPadOS (Apple iPad Platform)";
      deviceModel = "Apple iPad";
    } else if (ua.includes("Macintosh")) {
      osName = "macOS (Darwin Kernel Node)";
      deviceModel = "Apple Mac Workstation";
    } else if (ua.includes("Android")) {
      osName = "Android OS Platform";
      deviceModel = "Mobile Android Device";
    } else if (ua.includes("Windows")) {
      osName = "Windows OS Node";
      deviceModel = "Windows PC Rig";
    }
    
    let osVersion = "";
    if (ua.includes("iPhone OS")) {
      const match = ua.match(/iPhone OS (\d+)_(\d+)/);
      if (match) osVersion = `iOS ${match[1]}.${match[2]}`;
      else osVersion = "iOS 18.x / 19.x";
    } else if (ua.includes("Android")) {
      const match = ua.match(/Android (\d+)/);
      if (match) osVersion = `Android ${match[1]}.0`;
      else osVersion = "Android 15.0 / 16.0 / 17.0";
    } else if (ua.includes("Mac OS X")) {
      const match = ua.match(/Mac OS X (\d+)[_.](\d+)/);
      if (match) {
        const major = parseInt(match[1]);
        const minor = parseInt(match[2]);
        if (major === 10 && minor === 15) {
          
          
          if (CSS.supports && CSS.supports("anchor-name: --my-anchor")) {
            osVersion = "macOS Sequoia 15.2 / macOS Tahoe 26.5 (Safari 18.x detected)";
          } else if (CSS.supports && CSS.supports("contain-intrinsic-size: auto")) {
            osVersion = "macOS Sonoma 14.7 (Safari 17.x detected)";
          } else if (CSS.supports && CSS.supports("font-palette: dark")) {
            osVersion = "macOS Ventura 13.6 (Safari 16.x detected)";
          } else {
            osVersion = "macOS Monterey 12.7 (Safari 15.x detected)";
          }
        } else {
          osVersion = `macOS ${major}.${minor}`;
        }
      } else {
        osVersion = "macOS Sequoia 15.x / Tahoe 26.x";
      }
    } else if (ua.includes("Windows NT")) {
      const match = ua.match(/Windows NT (\d+)\.(\d+)/);
      if (match) {
        const major = match[1];
        const minor = match[2];
        if (major === "10" && minor === "0") {
          osVersion = "Windows 11 / Windows 12 (Secure Build)";
        } else {
          osVersion = `Windows NT ${major}.${minor}`;
        }
      } else {
        osVersion = "Windows 11";
      }
    } else {
      osVersion = "Linux Kernel v6.12.8-cyber";
    }

    
    let brand = "Custom Systems OEM";
    if (ua.includes("iPhone") || ua.includes("iPad") || ua.includes("Macintosh")) {
      brand = "Apple Inc. (Designed in California)";
    } else if (ua.includes("Android")) {
      brand = "Android Mobile OEM";
      if (ua.includes("Samsung") || ua.includes("SM-")) brand = "Samsung Electronics Co.";
      else if (ua.includes("Pixel")) brand = "Google Pixel LLC";
      else if (ua.includes("OnePlus")) brand = "OnePlus Mobile";
      else if (ua.includes("Xiaomi") || ua.includes("Redmi")) brand = "Xiaomi Corporation";
      else if (ua.includes("Oppo") || ua.includes("Find")) brand = "Oppo Electronics";
      else if (ua.includes("Vivo")) brand = "Vivo Communications";
      else if (ua.includes("Motorola") || ua.includes("Moto")) brand = "Motorola Mobility";
      else if (ua.includes("Sony") || ua.includes("Xperia")) brand = "Sony Mobile Corp.";
    } else if (ua.includes("Windows")) {
      brand = "Custom PC Rig Builder (Intel/AMD/NVIDIA)";
      if (ua.includes("Dell")) brand = "Dell Technologies Inc.";
      else if (ua.includes("HP") || ua.includes("Hewlett-Packard")) brand = "HP Inc.";
      else if (ua.includes("Lenovo") || ua.includes("ThinkPad")) brand = "Lenovo Group Ltd.";
      else if (ua.includes("Asus") || ua.includes("ROG")) brand = "ASUSTeK Computer Inc.";
      else if (ua.includes("Acer")) brand = "Acer Inc.";
      else if (ua.includes("MSI")) brand = "Micro-Star International";
    }
    
    let browserName = "Chrome V8 Engine";
    if (ua.includes("Firefox")) browserName = "Mozilla Firefox";
    else if (ua.includes("Safari") && !ua.includes("Chrome")) browserName = "Apple Safari WebKit";
    else if (ua.includes("Brave")) browserName = "Brave Browser";
    else if (ua.includes("Chrome")) browserName = "Google Chrome / Chromium";
    
    const cores = navigator.hardwareConcurrency || 8;
    const cpuArch = `${cores}-Core Logical Processor`;
    const ramEstimate = navigator.deviceMemory 
      ? `${navigator.deviceMemory} GB Unified Memory (Approx)` 
      : "Detected 8GB+ (Capped by browser privacy)";
    
    let gpuSpec = "Standard Systems Hardware GPU";
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (gl) {
        const dbgRenderInfo = gl.getExtension("WEBGL_debug_renderer_info");
        if (dbgRenderInfo) {
          const renderer = gl.getParameter(dbgRenderInfo.UNMASKED_RENDERER_WEBGL);
          if (renderer) {
            
            let clean = renderer;
            if (clean.includes("ANGLE (") && clean.includes(")")) {
              const match = clean.match(/ANGLE \([^,]+,\s*([^,]+)/);
              if (match && match[1]) clean = match[1];
            }
            gpuSpec = clean.replace(/Direct3D.*/g, "").trim();
          }
        }
      }
    } catch (e) {
      gpuSpec = "Graphics Compute Core";
    }
    
    let chipInfo = "High-performance x86_64/ARM64 computing platform";
    if (gpuSpec.toLowerCase().includes("apple")) {
      if (ua.includes("Macintosh")) {
        chipInfo = `Apple Silicon M-Series (${gpuSpec}): Unified Core platform with hardware raytracing, high neural concurrency, and integrated system cache.`;
      } else {
        chipInfo = `Apple A-Series Bionic / Pro Chip: Ultra-low latency mobile neural processor with secure enclave.`;
      }
    } else if (gpuSpec.toLowerCase().includes("adreno")) {
      chipInfo = "Qualcomm Snapdragon SoC platform: Kyro high-frequency threads with high-density GPU nodes.";
    } else if (gpuSpec.toLowerCase().includes("mali") || gpuSpec.toLowerCase().includes("immortalis")) {
      chipInfo = "ARM-based SoC platform (MediaTek Dimensity / Samsung Exynos Exynos SoC): Liquid-cooled core architecture.";
    } else if (gpuSpec.toLowerCase().includes("nvidia")) {
      chipInfo = `${gpuSpec} platform: Parallel compute architecture featuring Tensor-Cores and high-throughput raytracing.`;
    } else if (gpuSpec.toLowerCase().includes("amd") || gpuSpec.toLowerCase().includes("radeon")) {
      chipInfo = `${gpuSpec} platform: RDNA structural processing with advanced floating-point pipeline efficiency.`;
    } else if (gpuSpec.toLowerCase().includes("intel")) {
      chipInfo = "Intel Core x86_64 processor: High clock-rate processing block with integrated graphics.";
    }
    
    const screenW = window.screen.width * (window.devicePixelRatio || 1);
    const screenH = window.screen.height * (window.devicePixelRatio || 1);
    const screenSpec = `${screenW} x ${screenH} Dynamic Canvas (${window.devicePixelRatio || 1}x High-DPI)`;
    let netProvider = "Wi-Fi / Mobile LTE Network Link";
    if (navigator.connection) {
      const conn = navigator.connection;
      const type = conn.type ? `${conn.type.toUpperCase()} ` : "";
      const effType = conn.effectiveType ? `(${conn.effectiveType.toUpperCase()})` : "";
      const downlink = conn.downlink ? ` ~${conn.downlink} Mbps Down` : "";
      netProvider = `${type}High-Speed Channel ${effType}${downlink}`;
    }

    return { 
      deviceModel, 
      cpuArch, 
      ramSpec: ramEstimate, 
      netProvider, 
      screenSpec, 
      gpuSpec, 
      osName, 
      osVersion,
      deviceBrand: brand,
      chipInfo,
      browser: browserName 
    };
  };

  const handleTerminalSubmit = (e, directCommand = null) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    if (isComputing) return;

    const rawInput = directCommand !== null ? directCommand : terminalInput;
    const trimmedInput = rawInput.trim();
    if (!trimmedInput) return;

    const newHistory = [...terminalHistory, { type: "input", text: `visitor@subhendu.dev:~$ ${trimmedInput}` }];
    const parts = trimmedInput.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const arg = parts[1] ? parts[1].toLowerCase() : "";

    switch (cmd) {
      case "help":
        newHistory.push({
          type: "output",
          text: `Available Shell Commands:
  pwd        - Print current server directory
  ls         - List files or directories
  cd [dir]   - Switch directory (scrolled to that page section!)
  cat [file] - Read source code configuration file
  projects   - Show database details of systems projects
  skills     - View engineering and creative skill layers
  socials    - List all verified social network links
  github     - Connect directly to GitHub profile
  linkedin   - Connect directly to LinkedIn profile
  instagram  - Connect directly to Instagram profile
  neofetch   - Detect & display YOUR actual device system specs!
  ping       - Perform real-time multi-hop diagnostic latency check
  hack       - Simulate secure database mainframe override bypass [COOL]
  matrix     - Compile green matrix binary code stream [COOL]
  system     - Check CPU, RAM and cache diagnostic stats
  avatar     - Render systems designer profile picture ASCII art [NEW]
  dino       - Launch Chrome retro developer dinosaur [NEW]
  cowsay     - Classic retro Unix message relayer [NEW]
  clear      - Wipe console output buffer`
        });
        break;

      case "pwd":
        newHistory.push({ type: "output", text: "https://subhenduhembram.dev/" });
        break;

      case "ls":
        if (!arg) {
          newHistory.push({
            type: "output",
            text: "about/      projects/   skills/     experience/  contact/\n\nSimulated files:\ndistributed_storage.cpp   nexthire.js   mini_db.cpp   chat_app.cpp"
          });
        } else if (arg === "projects" || arg === "project") {
          newHistory.push({ type: "output", text: "distributed_storage.cpp   nexthire.js   mini_db.cpp   chat_app.cpp" });
        } else if (arg === "skills" || arg === "skill") {
          newHistory.push({ type: "output", text: "systems_core/   databases/   integrations/   creative/" });
        } else {
          newHistory.push({ type: "error", text: `ls: cannot access '${arg}': No such file or directory` });
        }
        break;

      case "cd":
        if (!arg || arg === "~" || arg === "..") {
          newHistory.push({ type: "sys", text: "cd: navigating back to root directory (~)" });
          const target = document.querySelector("#home");
          if (target) {
            setTimeout(() => {
              if (window.lenis) window.lenis.scrollTo(target);
              else target.scrollIntoView({ behavior: "smooth" });
            }, 300);
          }
        } else if (arg === "projects" || arg === "project") {
          newHistory.push({ type: "sys", text: "cd: executing directory switch -> /projects" });
          const target = document.querySelector("#projects");
          if (target) {
            setTimeout(() => {
              if (window.lenis) window.lenis.scrollTo(target);
              else target.scrollIntoView({ behavior: "smooth" });
            }, 300);
          }
        } else if (arg === "skills" || arg === "skill") {
          newHistory.push({ type: "sys", text: "cd: executing directory switch -> /skills" });
          const target = document.querySelector("#skills");
          if (target) {
            setTimeout(() => {
              if (window.lenis) window.lenis.scrollTo(target);
              else target.scrollIntoView({ behavior: "smooth" });
            }, 300);
          }
        } else if (arg === "experience" || arg === "experiences" || arg === "timeline") {
          newHistory.push({ type: "sys", text: "cd: executing directory switch -> /experiences" });
          const target = document.querySelector("#experiences");
          if (target) {
            setTimeout(() => {
              if (window.lenis) window.lenis.scrollTo(target);
              else target.scrollIntoView({ behavior: "smooth" });
            }, 300);
          }
        } else if (arg === "about") {
          newHistory.push({ type: "sys", text: "cd: executing directory switch -> /about" });
          const target = document.querySelector("#about");
          if (target) {
            setTimeout(() => {
              if (window.lenis) window.lenis.scrollTo(target);
              else target.scrollIntoView({ behavior: "smooth" });
            }, 300);
          }
        } else if (arg === "contact") {
          newHistory.push({ type: "sys", text: "cd: executing directory switch -> /contact" });
          const target = document.querySelector("#contact");
          if (target) {
            setTimeout(() => {
              if (window.lenis) window.lenis.scrollTo(target);
              else target.scrollIntoView({ behavior: "smooth" });
            }, 300);
          }
        } else {
          newHistory.push({ type: "error", text: `cd: no such file or directory: ${arg}` });
        }
        break;

      case "cat":
        if (!arg) {
          newHistory.push({ type: "error", text: "cat: missing file operand" });
        } else if (arg === "distributed_storage.cpp" || arg === "distributed_file_storage_system") {
          newHistory.push({
            type: "output",
            text: `// distributed_storage.cpp -- C++20 chunk partition storage engine
#include <iostream>
#include <vector>
#include <thread>

class DistributedStorageSystem {
public:
    void partitionChunk(const std::string& payload) {
        std::cout << "Dividing file payload into 4MB chunks..." << std::endl;
        // socket mapping multi-threaded stream active
    }
};`
          });
        } else if (arg === "nexthire.js" || arg === "nexthire") {
          newHistory.push({
            type: "output",
            text: `// nexthire.js -- SmartHire Job Portal asynchronous server
const express = require('express');
const app = express();
const queue = require('./resume_queue');

app.post('/api/apply', async (req, res) => {
    // Relaying resume files into parallel aggregation threads
    await queue.push(req.body.resume);
    res.status(202).json({ status: "Relayed to BSON queue" });
});`
          });
        } else if (arg === "mini_db.cpp" || arg === "mini_database_engine") {
          newHistory.push({
            type: "output",
            text: `// mini_db.cpp -- File-indexed SQL record parser
#include <fstream>
#include <map>

struct SQLRecord {
    std::string key;
    std::map<std::string, std::string> fields;
};

// CREATE TABLE, INSERT, SELECT, UPDATE, DELETE structures mapping...`
          });
        } else if (arg === "chat_app.cpp" || arg === "chat_application") {
          newHistory.push({
            type: "output",
            text: `// chat_app.cpp -- TCP Multi-threaded websocket relayer
#include <sys/socket.h>
#include <netinet/in.h>

void* routePackets(void* clientSocket) {
    // zero-copy TCP packet broadcast cluster active
    return nullptr;
}`
          });
        } else {
          newHistory.push({ type: "error", text: `cat: ${arg}: No such file or directory` });
        }
        break;

      case "projects":
      case "project":
        const projText = projects.map(p => 
          `• ${p.projectName} [${p.status === 'live' ? 'ONLINE' : 'DEV'}]\n  Stack   : ${p.languages.join(", ")}\n  Metrics : ${Object.entries(p.stats).map(([k, v]) => `${k.toUpperCase()}: ${v}`).join(" | ")}`
        ).join("\n\n");
        newHistory.push({ type: "output", text: `Active Server Processes:\n\n${projText}` });
        break;

      case "skills":
      case "skill":
        const devSkills = skills.filter(s => s.type === "development").map(s => s.skill).join(", ");
        const dbSkills = skills.filter(s => s.type === "database").map(s => s.skill).join(", ");
        const creativeSkills = skills.filter(s => s.type === "creative").map(s => s.skill).join(", ");
        newHistory.push({
          type: "output",
          text: `Core Stack Registry:\n\n[SYSTEMS & CORE] : ${devSkills}\n[DATA & CACHE]   : ${dbSkills}\n[CREATIVE SUITE] : ${creativeSkills}`
        });
        break;

      case "socials":
      case "social":
        newHistory.push({
          type: "output",
          text: `Registered Communication Links:
  linkedin  - Open LinkedIn [${contactDetails.social.linkedIn}]
  github    - Open GitHub [${contactDetails.social.github}]
  instagram - Open Instagram [${contactDetails.social.instagram}]`
        });
        break;

      case "github":
        newHistory.push({ type: "sys", text: `[REDIRECT] Opening secure tunnel to GitHub: ${contactDetails.social.github}` });
        window.open(contactDetails.social.github, "_blank");
        break;

      case "linkedin":
        newHistory.push({ type: "sys", text: `[REDIRECT] Opening secure tunnel to LinkedIn: ${contactDetails.social.linkedIn}` });
        window.open(contactDetails.social.linkedIn, "_blank");
        break;

      case "instagram":
      case "insta":
        newHistory.push({ type: "sys", text: `[REDIRECT] Opening secure tunnel to Instagram: ${contactDetails.social.instagram}` });
        window.open(contactDetails.social.instagram, "_blank");
        break;

      case "neofetch":
      case "whoami":
      case "sysinfo":
        const sys = liveVisitorSpecs || getVisitorSystemInfo();
        newHistory.push({
          type: "output",
          text: `      .----------------.   SYSTEM DIAGNOSTICS: visitor@subhendu
     /  /#############/ \\\\  ------------------------------------
    /  /#############/   \\\\ OS PLATFORM: ${sys.osName}
   /  /#############/     \\\\OS VERSION : ${sys.osVersion}
  |  |#############|      | OEM BRAND  : ${sys.deviceBrand}
  |  |#############|      | DEV MODEL  : ${sys.deviceModel}
   \\  \\#############\\     / CPU CORES  : ${sys.cpuArch}
    \\  \\#############\\   /  SYSTEM RAM : ${sys.ramSpec}
     '----------------'   GPU ACTIVE   : ${sys.gpuSpec}
                          SCREEN GRID  : ${sys.screenSpec}
                          NET METRICS  : ${sys.netProvider}
                          RELAY STATUS : SECURE CHANNEL ENCRYPTED [ACTIVE]`
        });
        break;

      case "ping":
        setIsComputing(true);
        setComputingText("[PINGING NETWORK CHANNELS...]");
        newHistory.push({ type: "output", text: "PING subhendu.dev (10.50.7.100) 56(84) bytes of data." });
        setTerminalHistory(newHistory);
        
        setTimeout(() => {
          setTerminalHistory(prev => [...prev, { type: "output", text: "64 bytes from 10.50.7.100: icmp_seq=1 ttl=64 time=1.05 ms" }]);
        }, 300);

        setTimeout(() => {
          setTerminalHistory(prev => [...prev, { type: "output", text: "64 bytes from 10.50.7.100: icmp_seq=2 ttl=64 time=0.88 ms" }]);
        }, 600);

        setTimeout(() => {
          setTerminalHistory(prev => [...prev, { type: "output", text: "64 bytes from 10.50.7.100: icmp_seq=3 ttl=64 time=1.34 ms" }]);
        }, 900);

        setTimeout(() => {
          setTerminalHistory(prev => [...prev, { 
            type: "output", 
            text: `--- subhendu.dev ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 1204ms
[■■■■■■■■□□] rtt min/avg/max = 0.88/1.09/1.34 ms` 
          }]);
          setIsComputing(false);
        }, 1200);
        
        setTerminalInput("");
        return;

      case "admin":
      case "login":
        newHistory.push({ type: "sys", text: "[SECURE GATEWAY] Initializing authentication handshake..." });
        newHistory.push({ type: "sys", text: "[REDIRECT] Relaying viewport control to secure login portal..." });
        setTerminalHistory(newHistory);
        setTimeout(() => {
          if (onAdminSuccess) onAdminSuccess();
        }, 1000);
        setTerminalInput("");
        return;

      case "sudo":
        if (arg === "hack") {
          setIsComputing(true);
          setComputingText("[OVERRIDING SECURITY PROTOCOLS...]");
          newHistory.push({ type: "sys", text: ">>> Initializing secure backend bypass protocol [cyber_breach.sh]..." });
          newHistory.push({ type: "output", text: "[CONNECT] Establishing SSL socket link to central mainframe..." });
          setTerminalHistory(newHistory);
          
          setTimeout(() => {
            setTerminalHistory(prev => [...prev, { type: "output", text: "[SCAN]    Scanning node ports 22, 80, 443, 8080... (Open)" }]);
          }, 400);

          setTimeout(() => {
            setTerminalHistory(prev => [...prev, { type: "output", text: "[ATTACK]  Injecting core stack pointer exploit into C++ systems module..." }]);
          }, 800);

          setTimeout(() => {
            setTerminalHistory(prev => [...prev, { type: "output", text: "[STATUS]  0x7FFF9A8B02F: Core system overflowed. Relaying root stream..." }]);
          }, 1200);

          setTimeout(() => {
            setTerminalHistory(prev => [...prev, { type: "output", text: "[DECRYPT] Deciphering 512-bit RSA security credentials..." }]);
          }, 1600);

          setTimeout(() => {
            setTerminalHistory(prev => [...prev, { type: "output", text: "[REGISTRY] Fetching server database catalogs... Bypassing local honeypots..." }]);
          }, 2000);

          setTimeout(() => {
            setTerminalHistory(prev => [...prev, { type: "output", text: "[SUCCESS] Synced 4,192 SQL backend files securely!" }]);
          }, 2400);

          setTimeout(() => {
            setTerminalHistory(prev => [...prev, { 
              type: "output", 
              text: `  _    _          _____ _  __ ______ _____  
 | |  | |   /\   / ____| |/ /|  ____|  __ \\ 
 | |__| |  /  \\ | |    | ' / | |__  | |  | |
 |  __  | / /\\ \\| |    |  <  |  __| | |  | |
 | |  | |/ ____ \\ |____| . \\ | |____| |__| |
 |_|  |_/_/    \\_\\_____|_|\\_\\|______|_____/ 

"Subhendu was here. Mainframe compromised. 🖥️🔓"` 
            }]);
            setIsComputing(false);
          }, 2800);
        } else if (arg === "admin" || arg === "login") {
          newHistory.push({ type: "sys", text: "[SECURE GATEWAY] Initializing root authentication handshake..." });
          newHistory.push({ type: "sys", text: "[REDIRECT] Relaying viewport control to secure login portal..." });
          setTerminalHistory(newHistory);
          setTimeout(() => {
            if (onAdminSuccess) onAdminSuccess();
          }, 1000);
        } else {
          newHistory.push({ type: "error", text: `sudo: command not found: ${arg}` });
        }
        setTerminalInput("");
        return;

      case "hack":
        setIsComputing(true);
        setComputingText("[OVERRIDING SECURITY PROTOCOLS...]");
        newHistory.push({ type: "sys", text: ">>> Initializing secure backend bypass protocol [cyber_breach.sh]..." });
        newHistory.push({ type: "output", text: "[CONNECT] Establishing SSL socket link to central mainframe..." });
        setTerminalHistory(newHistory);
        
        setTimeout(() => {
          setTerminalHistory(prev => [...prev, { type: "output", text: "[SCAN]    Scanning node ports 22, 80, 443, 8080... (Open)" }]);
        }, 400);

        setTimeout(() => {
          setTerminalHistory(prev => [...prev, { type: "output", text: "[ATTACK]  Injecting core stack pointer exploit into C++ systems module..." }]);
        }, 800);

        setTimeout(() => {
          setTerminalHistory(prev => [...prev, { type: "output", text: "[STATUS]  0x7FFF9A8B02F: Core system overflowed. Relaying root stream..." }]);
        }, 1200);

        setTimeout(() => {
          setTerminalHistory(prev => [...prev, { type: "output", text: "[DECRYPT] Deciphering 512-bit RSA security credentials..." }]);
        }, 1600);

        setTimeout(() => {
          setTerminalHistory(prev => [...prev, { type: "output", text: "[REGISTRY] Fetching server database catalogs... Bypassing local honeypots..." }]);
        }, 2000);

        setTimeout(() => {
          setTerminalHistory(prev => [...prev, { type: "output", text: "[SUCCESS] Synced 4,192 SQL backend files securely!" }]);
        }, 2400);

        setTimeout(() => {
          setTerminalHistory(prev => [...prev, { 
            type: "output", 
            text: `  _    _          _____ _  __ ______ _____  
 | |  | |   /\   / ____| |/ /|  ____|  __ \\ 
 | |__| |  /  \\ | |    | ' / | |__  | |  | |
 |  __  | / /\\ \\| |    |  <  |  __| | |  | |
 | |  | |/ ____ \\ |____| . \\ | |____| |__| |
 |_|  |_/_/    \\_\\_____|_|\\_\\|______|_____/ 

"Subhendu was here. Mainframe compromised. 🖥️🔓"` 
          }]);
          setIsComputing(false);
        }, 2800);
        
        setTerminalInput("");
        return;

      case "matrix":
        setIsComputing(true);
        setComputingText("[COMPILING BINARY STREAM...]");
        newHistory.push({ type: "output", text: "01000100 01000101 01000011 01010010 01011001 01010000 01010100" });
        setTerminalHistory(newHistory);
        
        setTimeout(() => {
          setTerminalHistory(prev => [...prev, { type: "output", text: "01010011 01010101 01000011 01000011 01000101 01010011 01010011" }]);
        }, 250);

        setTimeout(() => {
          setTerminalHistory(prev => [...prev, { type: "output", text: "01100011 01110000 01110000 01101111 01110010 01110100 01100110" }]);
        }, 500);

        setTimeout(() => {
          setTerminalHistory(prev => [...prev, { 
            type: "output", 
            text: `[MATRIX GRID STREAM ACTIVE]
  1 0 1 0 0 1 0 1 1 0 0 1 0 1 1 0 1 0 1 0
  0 1 1 0 1 0 0 1 0 1 1 0 1 0 0 1 1 0 0 1
  1 1 0 0 1 1 0 1 0 0 1 1 0 1 0 0 1 1 1 0
[SYSTEM NODE STACK OVERWATCH ENCRYPTED: GREEN]` 
          }]);
          setIsComputing(false);
        }, 750);
        
        setTerminalInput("");
        return;

      case "system":
        const activeSys = liveVisitorSpecs || getVisitorSystemInfo();
        newHistory.push({
          type: "output",
          text: `Node Diagnostics Status:
-------------------------------
OEM Brand    : ${activeSys.deviceBrand}
Device Model : ${activeSys.deviceModel}
Host OS      : ${activeSys.osName}
OS Version   : ${activeSys.osVersion}
Browser Engine: ${activeSys.browser}
CPU Platform : ${activeSys.cpuArch}
Graphics Core: ${activeSys.gpuSpec}
Chip Registry: ${activeSys.chipInfo}
Memory Spec  : ${activeSys.ramSpec}
Screen Grid  : ${activeSys.screenSpec}
Net Gateway  : ${activeSys.netProvider}
Routing State: 100% Secure Client Tunnel (Active Session)`
        });
        break;

      case "avatar":
        newHistory.push({
          type: "output",
          text: `           ._________________.
           |.---------------.|
           ||  subhendu.dev ||
           ||               ||
           ||   [SYSTEMS]   ||
           ||   [ACTIVE]    ||
           ||_______________||
           /.-.-.-.-.-.-.-.-.\\
          /  _______________  \\
         /  / ############# \\  \\
        /  /  #############  \\  \\
       / _/_________________  \\_ \\
      (_________________________)

🖥️ RETRO CORE WORKSTATION: CONNECTED TO /SUBHENDU/AVATAR`
        });
        break;

      case "dino":
        newHistory.push({
          type: "output",
          text: `               ████████
             ██      ██
             ██████████
             ██
       ████████████
     ██████████████
     ██  ██████  ██
         ██    ██
         ██    ██

🦖 [CHROMIUM RUNNING RETRO DINO VERSION 1.9.4]
Watch out for the cactus nodes in the CI/CD pipeline!`
        });
        break;

      case "cowsay":
        const msgIndex = trimmedInput.toLowerCase().indexOf("cowsay");
        const customMsg = trimmedInput.substring(msgIndex + 6).trim();
        const speakText = customMsg || "Subhendu is the ultimate systems architect! 💻🚀";
        const bubbleBorder = "_".repeat(speakText.length + 2);
        const bubbleBottom = "-".repeat(speakText.length + 2);
        newHistory.push({
          type: "output",
          text: `  ${bubbleBorder}
< ${speakText} >
  ${bubbleBottom}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`
        });
        break;

      case "clear":
        setTerminalHistory([]);
        setTerminalInput("");
        return;

      default:
        newHistory.push({ type: "error", text: `sh: command not found: ${cmd}. Type 'help' for instructions.` });
    }

    setTerminalHistory(newHistory);
    setTerminalInput("");
  };

  useEffect(() => {
    const handleRunCommand = (e) => {
      const { command } = e.detail;
      
      const target = document.querySelector("#home");
      if (target) {
        if (window.lenis) window.lenis.scrollTo(target);
        else target.scrollIntoView({ behavior: "smooth" });
      }
      
      setTimeout(() => {
        if (terminalInputRef.current) {
          terminalInputRef.current.focus();
        }
        handleTerminalSubmit(null, command);
      }, 450);
    };

    window.addEventListener("run-terminal-command", handleRunCommand);
    return () => window.removeEventListener("run-terminal-command", handleRunCommand);
  }, [terminalHistory, terminalInput, isComputing]);

  return (
    <div 
      id="home" 
      className="min-h-screen w-full flex flex-col justify-start px-[var(--defaultPaddingMob)] lg:px-[var(--defaultPadding)] bg-obsidian pb-12 text-white relative overflow-hidden"
    >
      
      <div className="w-full shrink-0 block" style={{ height: "var(--hero-spacer-height)" }}></div>
      <div className="absolute top-[-10vw] left-[-10vw] w-[45vw] h-[45vw] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-10vw] right-[-10vw] w-[40vw] h-[40vw] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full max-w-7xl mx-auto items-center z-10">
        <div className="lg:col-span-6 flex flex-col justify-center items-start text-left">
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs mb-6 uppercase tracking-wider">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Systems & Backend Engineer
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight text-white mb-6 font-sans leading-tight">
            ENGINEERING <span className="text-emerald-400">SCALABLE</span> & HIGH-PERFORMANCE <span className="text-cyan-400">SYSTEMS</span>.
          </h1>

          <p className="text-base md:text-lg font-light text-gray-400 max-w-xl mb-8 leading-relaxed">
            Focused on backend engineering, software systems, and Data Structures & Algorithms. I enjoy building projects, understanding internals, and solving complex engineering problems.
          </p>
          
          <div 
            className="w-full max-w-xl p-5 border border-white/5 rounded-2xl bg-charcoal/50 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.4)] mb-8 font-mono select-none"
            style={{ borderLeft: "4px solid #10b981" }}
          >
            <div className="flex items-center gap-2 mb-3 text-xs text-white/30">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/30"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/30"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/30"></span>
              <span className="ml-2">subhendu_profile.json</span>
            </div>
            
            <div className="text-xs md:text-sm text-gray-300 leading-relaxed select-none">
              <p><span className="text-emerald-400">const</span> developer = &#123;</p>
              <p className="pl-4">name: <span className="text-cyan-300">"Subhendu Prasad Hembram"</span>,</p>
              <p className="pl-4">role: <span className="text-cyan-300">"Systems & Backend Engineer"</span>,</p>
              <p className="pl-4">languages: [<span className="text-orange-300">"C++","TypeScript", "JavaScript"</span>],</p>
              <p className="pl-4">databases: [<span className="text-orange-300">"MongoDB", "MySQL"</span>],</p>
              <p className="pl-4">status: <span className="text-emerald-400">"Learning & Building"</span></p>
              <p>&#125;;</p>
            </div>
          </div>
          
          <div className="flex gap-4 items-center flex-wrap">
            <button 
              onClick={() => {
                const target = document.querySelector("#projects");
                if (target) {
                  if (window.lenis) window.lenis.scrollTo(target);
                  else target.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="px-6 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-emerald-400 hover:text-black hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              LAUNCH_PROJECTS_DASHBOARD
            </button>
            <a 
              href={`mailto:${contactDetails.email}`}
              className="px-6 py-3 rounded-full border border-white/10 hover:border-white/30 text-white font-medium text-sm hover:bg-white/5 active:scale-95 transition-all text-center"
            >
              PING_ME
            </a>
          </div>

        </div>
        
        <div className="lg:col-span-6 w-full flex justify-center">
          <div 
            onClick={focusTerminal}
            className="w-full max-w-lg aspect-[4/3] rounded-2xl border border-white/10 bg-charcoal/70 backdrop-blur-md shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col relative cursor-text terminal-crt terminal-scanline"
            style={{ minHeight: "340px" }}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 bg-charcoal/90 select-none text-xs text-white/40">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/60 hover:bg-red-500 transition-colors"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60 hover:bg-yellow-500 transition-colors"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60 hover:bg-emerald-500 transition-colors"></span>
              </div>
              <span className="font-mono text-[10px]">secure_session@subhendu-srv: ~ (sh)</span>
              <span className="font-mono text-[10px] text-emerald-400">99.9% CPU</span>
            </div>
            
            <div 
              ref={terminalBodyRef}
              data-lenis-prevent
              className="flex-1 p-5 overflow-y-auto font-mono text-xs md:text-sm text-gray-300 flex flex-col gap-2.5 select-text"
            >
              {terminalHistory.map((history, i) => {
                if (history.type === "sys") {
                  return <div key={i} className="text-emerald-400/70 font-semibold select-none">{history.text}</div>;
                } else if (history.type === "input") {
                  return <div key={i} className="text-white font-bold select-none">{history.text}</div>;
                } else if (history.type === "error") {
                  return <div key={i} className="text-red-400 font-semibold break-words select-none">{history.text}</div>;
                } else {
                  return (
                    <div key={i} className="text-gray-300 whitespace-pre-wrap leading-relaxed select-text font-mono">
                      {history.text}
                    </div>
                  );
                }
              })}
            </div>
            
            <form 
              onSubmit={handleTerminalSubmit}
              className="px-5 py-4 border-t border-white/5 bg-black/60 flex items-center gap-2 select-none"
            >
              <span className="font-mono text-xs md:text-sm text-emerald-400 font-bold select-none">
                visitor@subhendu.dev:~$
              </span>
              {isComputing ? (
                <div className="flex-1 font-mono text-xs md:text-sm text-emerald-400 font-bold select-none animate-pulse">
                  {computingText || "Executing payload sequence..."}
                </div>
              ) : (
                <input
                  ref={terminalInputRef}
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  placeholder="Type 'help'..."
                  className="flex-1 bg-transparent border-none outline-none font-mono text-xs md:text-sm text-white caret-emerald-400 placeholder-white/20 select-text"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
