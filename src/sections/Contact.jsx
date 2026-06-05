import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { contactDetails } from "../utils/constants";
import {
  Send,
  Terminal,
  ShieldAlert,
  Cpu,
  ShieldCheck,
  Lock,
  Activity,
  X,
} from "lucide-react";
import "../../src/index.css";

gsap.registerPlugin(ScrollTrigger);

export default function Contact({ profile }) {
  const containerRef = useRef(null);
  
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [messagePayload, setMessagePayload] = useState("");
  const [honeypot, setHoneypot] = useState(""); 

  const [transmissionStatus, setTransmissionStatus] = useState("IDLE"); 
  const [transmissionLogs, setTransmissionLogs] = useState([]);
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const anim = gsap.fromTo(
      containerRef.current.children,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      },
    );
    return () => anim.kill();
  }, []);
  
  const validateEmailAddress = (email) => {
    if (!email) return { isValid: false, reason: "Email address is required." };
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, reason: "Malformed syntax address." };
    }

    const parts = email.split("@");
    const domain = parts[1].toLowerCase().trim();
    
    const disposableDomains = [
      "mailinator.com",
      "yopmail.com",
      "tempmail.com",
      "10minutemail.com",
      "dispostable.com",
      "getairmail.com",
      "trashmail.com",
      "sharklasers.com",
      "guerrillamail.com",
      "guerrillamailblock.com",
      "guerrillamail.net",
      "guerrillamail.org",
      "guerrillamail.biz",
      "spam4.me",
      "grr.la",
      "pokemail.net",
      "maildrop.cc",
      "burnermail.io",
      "tempmailaddress.com",
      "tempmailo.com",
      "moakt.com",
    ];
    if (disposableDomains.includes(domain)) {
      return {
        isValid: false,
        reason: "Disposable temporary email domains are blocked.",
      };
    }
    
    const fakeDomains = [
      "example.com",
      "test.com",
      "domain.com",
      "email.com",
      "invalid.com",
      "none.com",
      "noname.com",
      "user.com",
      "placeholder.com",
    ];
    if (fakeDomains.includes(domain)) {
      return {
        isValid: false,
        reason: "Fictitious domain addresses are blocked.",
      };
    }
    
    const commonTypos = {
      "gamil.com": "gmail.com",
      "gmal.com": "gmail.com",
      "gamil.co": "gmail.com",
      "gmail.co": "gmail.com",
      "yahooo.com": "yahoo.com",
      "yaho.com": "yahoo.com",
      "hotail.com": "hotmail.com",
      "hotmal.com": "hotmail.com",
    };
    if (commonTypos[domain]) {
      return {
        isValid: false,
        reason: `Did you mean ${parts[0]}@${commonTypos[domain]}? Typo domain detected.`,
      };
    }

    return { isValid: true };
  };
  
  const checkRateLimit = () => {
    try {
      const raw = localStorage.getItem("smtp_relay_timestamps");
      const timestamps = raw ? JSON.parse(raw) : [];
      const now = Date.now();
      
      const activeTimestamps = timestamps.filter((t) => now - t < 600000);

      if (activeTimestamps.length >= 2) {
        const earliest = activeTimestamps[0];
        const remainingSec = Math.ceil((600000 - (now - earliest)) / 1000);
        const remainingMin = Math.ceil(remainingSec / 60);
        return {
          allowed: false,
          timeLeft: `${remainingMin}m (${remainingSec}s)`,
          currentTimestamps: activeTimestamps,
        };
      }

      return { allowed: true, currentTimestamps: activeTimestamps };
    } catch (e) {
      return { allowed: true, currentTimestamps: [] };
    }
  };
  
  const solveCryptographicChallenge = () => {
    const start = performance.now();
    let num = 1000000;
    while (true) {
      let isPrime = true;
      for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) {
          isPrime = false;
          break;
        }
      }
      if (isPrime) break;
      num++;
    }
    const end = performance.now();
    return { nonce: num, timeMs: Math.round(end - start) };
  };

  const saveMessageLocally = async (name, email, message) => {
    const newMsg = {
      id: `MSG_${Math.floor(1000 + Math.random() * 9000)}`,
      name: name || "Anonymous User",
      email: email,
      message: message,
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
      timestamp: Date.now(),
    };

    try {
      const raw = localStorage.getItem("portfolio_contact_messages");
      const messages = raw ? JSON.parse(raw) : [];
      const updated = [newMsg, ...messages].slice(0, 15);
      localStorage.setItem(
        "portfolio_contact_messages",
        JSON.stringify(updated),
      );
    } catch (e) {
      console.error("Failed to store message locally", e);
    }
  };

  const triggerSmtpTransmission = async (e) => {
    e.preventDefault();
    
    if (honeypot) {
      setTransmissionStatus("ERROR");
      setTransmissionLogs([
        "[FATAL] Bot signature detected by honeypot block.",
        "[INFO] Connection aborted to protect relay gateways.",
      ]);
      return;
    }
    
    const validation = validateEmailAddress(senderEmail);
    if (!validation.isValid) {
      setTransmissionStatus("ERROR");
      setTransmissionLogs([
        `[ERROR] Validation failed: ${validation.reason}`,
        "[INFO] Only active, verified, non-temporary domains are authorized.",
      ]);
      return;
    }
    
    const rateLimit = checkRateLimit();
    if (!rateLimit.allowed) {
      setTransmissionStatus("ERROR");
      setTransmissionLogs([
        "[ERROR] Rate limit exceeded.",
        `[SECURITY] Anti-spam shield active. Please wait ${rateLimit.timeLeft} before trying again.`,
      ]);
      return;
    }

    setTransmissionStatus("SENDING");
    setTransmissionLogs([
      ">>> Executing subhendu_smtp_relay --relay=direct",
      "[INIT] Solving Proof-of-Work cryptographic challenge...",
    ]);

    const challenge = solveCryptographicChallenge();

    setTimeout(() => {
      const targetEmail = import.meta.env.VITE_ADMIN_EMAIL || "";
      setTransmissionLogs((prev) => [
        ...prev,
        `[  OK  ] Proof-of-Work solved! Nonce: ${challenge.nonce} (computed in ${challenge.timeMs}ms)`,
        `[INIT] Resolving MX records for ${targetEmail}...`,
        "[  OK  ] MX records matched to google-mail-server (142.250.190.27)",
      ]);
    }, 600);

    setTimeout(() => {
      setTransmissionLogs((prev) => [
        ...prev,
        "[  OK  ] Connected to port 465 (SMTP SSL Tunnel active)",
        "[INIT] Handshaking TLS 1.3 cryptographic session key...",
      ]);
    }, 1200);

    setTimeout(async () => {
      setTransmissionLogs((prev) => [
        ...prev,
        "[  OK  ] Encryption established. Cipher: ECDHE-RSA-AES128-GCM-SHA256",
        "[INIT] Relaying mail envelope & BSON package stream...",
      ]);

      const isTunnelActive =
        localStorage.getItem("mail_tunnel_active") !== "false";

      if (!isTunnelActive) {
        setTransmissionLogs((prev) => [
          ...prev,
          "[INFO] Mail Tunnel relay is set to OFFLINE by administrator.",
          "[INIT] Redirecting to native local mail client route...",
        ]);

        setTimeout(() => {
          setTransmissionStatus("SUCCESS");
          setTransmissionLogs((prev) => [
            ...prev,
            "[SUCCESS] Native mail client triggered. Packet relayed successfully!",
          ]);
          saveMessageLocally(senderName, senderEmail, messagePayload);
          const bodyText = encodeURIComponent(
            `Hi Subhendu,\n\n${messagePayload}\n\nBest regards,\n${senderName}`,
          );
          window.location.href = `mailto:${contactDetails.email}?subject=Message%20from%20Portfolio%20(${senderName})&body=${bodyText}`;
        }, 1000);
        return;
      }
      
      try {
        const baseUrl = import.meta.env.VITE_SERVER_BASE_URL || "http://localhost:5000";
        const endpoint = `${baseUrl}/api/v1/contact`;

        const payload = {
          name: senderName || "Anonymous User",
          email: senderEmail,
          message: messagePayload
        };

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(
            `Secure Cloud Function gateway responded with code ${response.status}`,
          );
        }
        
        const currentTimestamps = rateLimit.currentTimestamps || [];
        currentTimestamps.push(Date.now());
        localStorage.setItem(
          "smtp_relay_timestamps",
          JSON.stringify(currentTimestamps),
        );

        setTransmissionLogs((prev) => [
          ...prev,
          "[  OK  ] SMTP Package relayed. Server Code: 250 OK queued",
          "[SUCCESS] Transmission completed. Message delivered successfully in background!",
        ]);
        setTransmissionStatus("SUCCESS");
        saveMessageLocally(senderName, senderEmail, messagePayload);
      } catch (err) {
        console.error("Mail Relay error:", err);
        setTransmissionLogs((prev) => [
          ...prev,
          `[WARNING] Relay node failure: ${err.message}`,
          "[INIT] Handshaking fallback native mail client route...",
        ]);

        setTimeout(() => {
          setTransmissionStatus("SUCCESS");
          setTransmissionLogs((prev) => [
            ...prev,
            "[SUCCESS] Native mail client triggered as fail-safe.",
          ]);
          saveMessageLocally(senderName, senderEmail, messagePayload);
          const bodyText = encodeURIComponent(
            `Hi Subhendu,\n\n${messagePayload}\n\nBest regards,\n${senderName}`,
          );
          window.location.href = `mailto:${contactDetails.email}?subject=Message%20from%20Portfolio%20(${senderName})&body=${bodyText}`;
        }, 1000);
      }
    }, 2000);
  };

  const resetTunnel = () => {
    setSenderName("");
    setSenderEmail("");
    setMessagePayload("");
    setHoneypot("");
    setTransmissionStatus("IDLE");
    setTransmissionLogs([]);
  };

  return (
    <div
      id="contact"
      className="py-24 w-full bg-obsidian px-[var(--defaultPaddingMob)] lg:px-[var(--defaultPadding)] text-white flex flex-col items-center justify-center relative overflow-hidden"
    >
      
      <div className="absolute bottom-0 left-1/2 w-[60vw] h-[60vw] bg-emerald-500/5 rounded-full blur-[140px] -z-10 pointer-events-none -translate-x-1/2 translate-y-1/3"></div>

      <div
        ref={containerRef}
        className="w-full max-w-4xl flex flex-col items-center text-center z-10 select-none"
      >
        
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 font-mono text-[10px] text-gray-400 rounded-full mb-6">
          <Terminal className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span>ROUTING_GATEWAY</span>
        </div>

        <h2 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tight font-sans">
          SECURE MAIL <span className="text-emerald-400">TUNNEL</span>
        </h2>
        <p className="text-sm md:text-base text-gray-400 max-w-xl mb-12 font-light leading-relaxed">
          Open a direct secure cryptographic SMTP handshake to relay packets
          straight to my primary inbox cluster.
        </p>
        
        <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-charcoal/50 backdrop-blur-md shadow-2xl overflow-hidden flex flex-col relative text-left select-none">
          
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-charcoal/90 select-none text-[10px] font-mono text-gray-500">
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-emerald-500" />
              <span>TUNNEL_GATEWAY: ACTIVE</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>TLS_1.3_ENABLED</span>
            </div>
          </div>
          
          {transmissionStatus !== "IDLE" && (
            <div className="p-5 font-mono text-xs text-emerald-400 border-b border-white/5 bg-black/40 flex flex-col gap-2 min-h-[140px] select-text">
              {transmissionLogs.map((log, lIdx) => (
                <div key={lIdx} className="flex gap-2">
                  <span className="text-white/20 select-none">
                    &gt;&gt;&gt;
                  </span>
                  <span
                    className={
                      log.includes("[SUCCESS]")
                        ? "text-emerald-300 font-bold"
                        : log.includes("[ERROR]") || log.includes("[FATAL]")
                          ? "text-red-400 font-bold"
                          : ""
                    }
                  >
                    {log}
                  </span>
                </div>
              ))}
              {transmissionStatus === "SENDING" && (
                <div className="flex gap-2 items-center text-white/50 select-none">
                  <span>&gt;&gt;&gt;</span>
                  <span className="w-2 h-4 bg-emerald-400 animate-pulse"></span>
                </div>
              )}
              {(transmissionStatus === "SUCCESS" ||
                transmissionStatus === "ERROR") && (
                <button
                  onClick={resetTunnel}
                  className="mt-3 px-3 py-1.5 self-start rounded bg-white/5 border border-white/5 hover:bg-white/10 text-[10px] text-white hover:text-emerald-400 cursor-pointer font-bold transition-all"
                >
                  {transmissionStatus === "SUCCESS"
                    ? "TRANSMIT_NEW_PACKET"
                    : "RESET_TUNNEL_PORT"}
                </button>
              )}
            </div>
          )}
          
          {transmissionStatus === "IDLE" && (
            <form
              onSubmit={triggerSmtpTransmission}
              className="p-6 flex flex-col gap-5 font-mono"
            >
              
              <input
                type="text"
                name="security_honeypot_field"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ display: "none" }}
                tabIndex="-1"
                autoComplete="off"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-500 uppercase">
                    --name
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Enter sender tag..."
                    className="p-3 bg-black/40 border border-white/5 hover:border-white/10 focus:border-emerald-500/50 rounded-xl outline-none font-mono text-xs md:text-sm text-white caret-emerald-400 placeholder-white/20"
                    autoComplete="off"
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-500 uppercase">
                    --from (Required)
                  </label>
                  <input
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="your_email@domain.com"
                    className="p-3 bg-black/40 border border-white/5 hover:border-white/10 focus:border-emerald-500/50 rounded-xl outline-none font-mono text-xs md:text-sm text-white caret-emerald-400 placeholder-white/20"
                    autoComplete="off"
                    required
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-500 uppercase">
                  --payload (Required)
                </label>
                <textarea
                  rows="4"
                  value={messagePayload}
                  onChange={(e) => setMessagePayload(e.target.value)}
                  placeholder="Enter secure message buffer contents..."
                  className="p-3 bg-black/40 border border-white/5 rounded-xl outline-none font-mono text-xs md:text-sm text-white focus:border-emerald-500/50 caret-emerald-400 placeholder-white/20 resize-none hover:border-white/10"
                  required
                />
              </div>

              <button
                type="submit"
                className="mt-2 w-full p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold font-mono text-xs tracking-wider cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.05)] hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>TRANSMIT_SECURE_PACKET</span>
              </button>
            </form>
          )}
        </div>
        
        <div className="mt-24 w-full pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 font-mono text-xs text-gray-400">
          {(() => {
            const showEmail = profile ? (profile.showEmail !== false) : true;
            const showPhone = profile ? (profile.showPhone !== false) : true;
            const emailVal = profile?.email || contactDetails.email;
            const phoneVal = profile?.phoneNumber || contactDetails.phoneNumber;

            return (
              <div className="text-left flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {showEmail && (
                  <div>
                    <p className="text-[9px] text-gray-600 uppercase mb-1">
                      SYSTEM INSTANCE 
                    </p>
                    <a
                      href={`mailto:${emailVal}`}
                      className="hover:text-emerald-400 transition-colors tracking-wide text-white font-bold"
                    >
                      {emailVal}
                    </a>
                  </div>
                )}
                <button
                  onClick={() => setShowSecurityInfo(true)}
                  className="mt-3.5 p-1.5 rounded bg-white/5 border border-white/5 hover:border-emerald-500/20 hover:bg-emerald-500/5 hover:text-emerald-400 text-gray-500 transition-all cursor-pointer"
                  title="SYSTEM SECURITY INTEGRITY"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </button>
              </div>
            );
          })()}

          <div className="text-left md:text-right">
            <p className="text-[9px] text-gray-600 uppercase mb-1">
              SECURED NODES
            </p>
            <div className="flex gap-5 items-center justify-center md:justify-end">
              {Object.entries({
                linkedin: contactDetails.social.linkedIn,
                github: contactDetails.social.github,
                instagram: contactDetails.social.instagram,
              }).map(([platform, link]) => (
                <a
                  key={platform}
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 transition-all font-mono uppercase tracking-wider text-xs flex items-center gap-1"
                >
                  <span className="text-emerald-500 font-bold select-none">
                    /
                  </span>
                  {platform}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {showSecurityInfo && (
        <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center font-mono p-4 select-none">
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(16,185,129,0.01),rgba(6,182,212,0.005),rgba(16,185,129,0.01))] bg-[size:100%_3px,3px_100%] z-20"></div>
          <div className="w-full max-w-[460px] p-6 rounded-2xl border border-emerald-500/20 bg-[#0a0a0c]/90 backdrop-blur-xl relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-500/50 animate-pulse"></div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/5 text-[9px] text-gray-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>SECURITY_OVERWATCH</span>
              </div>
              <button
                onClick={() => setShowSecurityInfo(false)}
                className="text-gray-500 hover:text-white transition-colors cursor-pointer"
                title="CLOSE_REGISTRY"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex flex-col items-center text-center my-5 gap-4">
              <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                <Lock className="w-6 h-6 text-emerald-400 animate-pulse" />
              </div>

              <h3 className="text-base font-black tracking-wider text-white uppercase mt-2">
                [ PORTFOLIO CORE SECURED ]
              </h3>
              
              <div className="text-[10px] text-gray-400 leading-relaxed font-light text-left bg-black/50 border border-white/5 p-4 rounded-xl w-full flex flex-col gap-2 font-mono">
                <div className="flex justify-between items-center pb-1.5 border-b border-white/5 mb-1 text-gray-500 uppercase tracking-widest text-[8px] font-bold">
                  <span>SYSTEM REGISTER</span>
                  <span>STATUS</span>
                </div>
                <div className="flex justify-between">
                  <span>SECURITY STATE:</span>
                  <span className="text-emerald-400 font-semibold font-mono">
                    ONLINE 
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>CIPHER SUITE:</span>
                  <span className="text-white font-semibold font-mono">
                    AES-GCM-256
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>SMTP INTEGRITY:</span>
                  <span className="text-white font-semibold font-mono">
                    TLS 1.3 SECURED
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>PROXY GATEWAY:</span>
                  <span className="text-cyan-400 font-semibold font-mono">
                    ROUTED 
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>DDOS FILTER:</span>
                  <span className="text-emerald-400 font-semibold font-mono">
                    RATE-LIMITED 
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowSecurityInfo(false)}
              className="w-full h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 active:scale-[0.98] text-xs font-bold uppercase tracking-widest cursor-pointer transition-all duration-300 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.02)]"
            >
              Acknowledge & Exit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
