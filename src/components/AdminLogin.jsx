import React, { useState, useEffect, useRef } from "react";
import { Lock, ShieldAlert, ArrowLeft, Terminal, ShieldCheck, Mail, RefreshCw } from "lucide-react";
import gsap from "gsap";
import { api } from "../utils/api";
import { defaultProfile } from "../utils/constants";

const getDeviceTelemetry = () => {
  if (typeof window === "undefined") return ;
  const ua = navigator.userAgent;
  let osName = "Unknown OS";
  if (ua.includes("Windows")) osName = "Windows OS";
  else if (ua.includes("Mac OS X") || ua.includes("Macintosh")) osName = "macOS Sequoia";
  else if (ua.includes("Linux")) osName = "Linux Kernel";
  else if (ua.includes("Android")) osName = "Android 15";
  else if (ua.includes("iPhone") || ua.includes("iPad")) osName = "iOS 18";

  let browserName = "Unknown Browser";
  if (ua.includes("Firefox")) browserName = "Firefox Engine";
  else if (ua.includes("Chrome")) browserName = "Chrome V8";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browserName = "Safari WebKit";

  const cores = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency}-Core Logical CPU` : "Dual-Core Thread";
  
  let gpu = "Apple Silicon M-Series GPU";
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    if (ext) {
      const renderer = gl.getParameter(ext.UNMASKED_RENDERER_INFO);
      if (renderer) {
        gpu = renderer.replace(/ANGLE \(.*?\)/, "").replace(/Direct3D.*/, "").trim();
      }
    }
  } catch (e) {}

  return {
    os: osName,
    browser: browserName,
    cores,
    gpu,
    ip: "127.0.0.1", 
    time: new Date().toLocaleTimeString(),
    date: new Date().toLocaleDateString()
  };
};

const maskEmail = (email) => {
  if (!email) return "";
  const [localPart, domain] = email.split("@");
  if (localPart.length <= 2) {
    return `${localPart[0]}...@${domain}`;
  }
  return `${localPart[0]}......${localPart[localPart.length - 1]}@${domain}`;
};

export default function AdminLogin({ onBack, onLoginSuccess, apiStatus }) {
  const [step, setStep] = useState(1); 
  const [password, setPassword] = useState("");
  const [otpInputs, setOtpInputs] = useState(Array(6).fill(""));
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isRecoveryFlow, setIsRecoveryFlow] = useState(false);
  const [masterKeyBypassed, setMasterKeyBypassed] = useState(false);
  const [serverClientIp, setServerClientIp] = useState("");
  const [tempToken, setTempToken] = useState("");

  const otpRefs = useRef([]);

  useEffect(() => {
    gsap.fromTo(
      ".login-card",
      { scale: 0.95, opacity: 0, y: 15 },
      { scale: 1, opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );
  }, []);

  useEffect(() => {
    if (apiStatus === "OFFLINE" || apiStatus === "DEGRADED") {
      setError("BACKEND PORTAL OFFLINE // ADMINISTRATIVE CONTROLS DEACTIVATED.");
    } else {
      setError("");
    }
  }, [apiStatus]);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        gsap.to(".otp-toast", {
          x: 300,
          opacity: 0,
          duration: 0.5,
          ease: "power2.in",
          onComplete: () => setShowToast(false)
        });
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (apiStatus === "OFFLINE" || apiStatus === "DEGRADED") {
      setError("BACKEND PORTAL OFFLINE // AUTHENTICATION ROUTING BLOCKED.");
      return;
    }
    if (!password) {
      setError("AUTHENTICATION TOKEN CANNOT BE EMPTY.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const resData = await api.loginAdmin(password);
      setTempToken(resData.tempToken);
      setMasterKeyBypassed(false);

      gsap.to(".login-card", {
        scale: 0.95,
        opacity: 0,
        y: 10,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => {
          setStep(2);
          setIsSubmitting(false);
          setPassword(""); 
          
          gsap.fromTo(
            ".login-card",
            { scale: 0.95, opacity: 0, y: 15 },
            { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
          );

          setTimeout(() => {
            setShowToast(true);
            gsap.fromTo(
              ".otp-toast",
              { x: 300, opacity: 0 },
              { x: 0, opacity: 1, duration: 0.8, ease: "elastic.out(1, 0.75)" }
            );
          }, 600);
        }
      });

    } catch (err) {
      setIsSubmitting(false);
      setError(err.message ? err.message.toUpperCase() : "INVALID CREDENTIALS. ACCESS DENIED.");
      setPassword("");
      
      gsap.fromTo(
        ".login-card",
        { x: -10 },
        { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" }
      );
    }
  };

  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    if (apiStatus === "OFFLINE" || apiStatus === "DEGRADED") {
      setError("BACKEND PORTAL OFFLINE // AUTHENTICATION ROUTING BLOCKED.");
      return;
    }
    if (!password) {
      setError("RECOVERY KEY CANNOT BE EMPTY.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const resData = await api.requestRecovery(password);
      setTempToken(resData.tempToken);
      setMasterKeyBypassed(true);

      gsap.to(".login-card", {
        scale: 0.95,
        opacity: 0,
        y: 10,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => {
          setStep(2);
          setIsSubmitting(false);
          setPassword(""); 
          
          gsap.fromTo(
            ".login-card",
            { scale: 0.95, opacity: 0, y: 15 },
            { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
          );

          setTimeout(() => {
            setShowToast(true);
            gsap.fromTo(
              ".otp-toast",
              { x: 300, opacity: 0 },
              { x: 0, opacity: 1, duration: 0.8, ease: "elastic.out(1, 0.75)" }
            );
          }, 600);
        }
      });
    } catch (err) {
      setIsSubmitting(false);
      setError(err.message ? err.message.toUpperCase() : "INVALID RECOVERY KEY OR TIMEOUT.");
      setPassword("");
      gsap.fromTo(
        ".login-card",
        { x: -10 },
        { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" }
      );
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otpInputs];
    newOtp[index] = value.substring(value.length - 1);
    setOtpInputs(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otpInputs[index] && index > 0) {
        const newOtp = [...otpInputs];
        newOtp[index - 1] = "";
        setOtpInputs(newOtp);
        otpRefs.current[index - 1]?.focus();
      } else if (otpInputs[index]) {
        const newOtp = [...otpInputs];
        newOtp[index] = "";
        setOtpInputs(newOtp);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtpInputs(digits);
      otpRefs.current[5]?.focus();
    }
  };

  const handleResendOtp = async () => {
    setOtpInputs(Array(6).fill(""));
    setError("");
    setShowToast(false);
    
    try {
      const data = await api.resendOtp(tempToken);
      if (!data.success) {
        throw new Error(data.error || "Failed to resend OTP");
      }

      setTimeout(() => {
        setShowToast(true);
        gsap.fromTo(
          ".otp-toast",
          { x: 300, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.8, ease: "elastic.out(1, 0.75)" }
        );
      }, 400);
    } catch (err) {
      setError(err.message.toUpperCase());
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const enteredOtp = otpInputs.join("");
    if (enteredOtp.length < 6) {
      setError("MFA VERIFICATION TOKEN REQUIRES 6 CRYPTO DIGITS.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const verifyFunc = masterKeyBypassed ? api.verifyRecoveryOtp : api.verifyAdminOtp;
      const data = await verifyFunc(enteredOtp, tempToken);
      if (!data.success || !data.token) {
        throw new Error(data.error || "INVALID MFA TOKEN.");
      }

      setServerClientIp(data.ip || "127.0.0.1");
      setShowToast(false);
      
      localStorage.setItem("admin_token", data.token);

      const newSessionId = `SESS_${Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase()}`;
      localStorage.setItem("admin_session_id", newSessionId);

      const telemetry = getDeviceTelemetry();
      const newSessionObj = {
        sessionId: newSessionId,
        ...telemetry,
        ip: data.ip || "127.0.0.1",
        active: true
      };

      const storedSessions = localStorage.getItem("admin_sessions_list");
      let sessionsList = [];
      if (storedSessions) {
        try {
          sessionsList = JSON.parse(storedSessions);
        } catch (err) {}
      }
      
      sessionsList = sessionsList.map(s => ({ ...s, active: false }));
      sessionsList.unshift(newSessionObj);
      localStorage.setItem("admin_sessions_list", JSON.stringify(sessionsList.slice(0, 10)));

      gsap.to(".login-card", {
        scale: 1.05,
        opacity: 0,
        y: -10,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => {
          setIsSubmitting(false);
          onLoginSuccess();
        },
      });
    } catch (err) {
      setIsSubmitting(false);
      setError(err.message ? err.message.toUpperCase() : "INVALID MFA CODE.");
      setOtpInputs(Array(6).fill(""));
      otpRefs.current[0]?.focus();

      gsap.fromTo(
        ".login-card",
        { x: -10 },
        { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" }
      );
    }
  };

  const toggleRecoveryFlow = () => {
    setIsRecoveryFlow(prev => !prev);
    setPassword("");
    setError("");
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#070708] text-white flex items-center justify-center font-mono overflow-hidden select-none">
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(16,185,129,0.02),rgba(6,182,212,0.01),rgba(16,185,129,0.02))] bg-[size:100%_3px,3px_100%] z-20"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-emerald-500/5 rounded-full blur-[160px] pointer-events-none"></div>

      {showToast && (
        <div className="otp-toast fixed top-6 right-6 z-[99999] max-w-sm w-80 p-4 border border-emerald-500/20 bg-black/85 backdrop-blur-md rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.15)] flex gap-3 text-left">
          <div className="w-8 h-8 rounded-lg border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4 text-emerald-400 animate-bounce" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[9px] uppercase font-bold text-gray-500">MFA Mail Relayer</span>
              <button 
                onClick={() => setShowToast(false)}
                className="text-gray-500 hover:text-white text-[8px] uppercase tracking-wider cursor-pointer"
              >
                Dismiss
              </button>
            </div>
            <p className="text-[10px] text-gray-300 leading-normal">
              A temporary security key has been secretly dispatched to your registered node <span className="text-white font-semibold">{maskEmail(JSON.parse(localStorage.getItem("portfolio_profile") || "{}").email || defaultProfile.email)}</span>. Please check your inbox.
            </p>
          </div>
        </div>
      )}

      <div className="login-card w-full max-w-[420px] mx-4 p-8 rounded-2xl border border-white/5 bg-charcoal/30 backdrop-blur-xl relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        <div className="absolute inset-0 rounded-2xl border border-emerald-500/10 pointer-events-none z-0"></div>

        <button
          onClick={onBack}
          className="absolute top-6 left-6 text-gray-400 hover:text-emerald-400 flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Exit Gate</span>
        </button>

        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[8px] text-gray-500 w-fit mx-auto mt-6 mb-8 uppercase tracking-widest font-mono">
          <Terminal className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
          <span>Security Protocol Gate</span>
        </div>

        {step === 1 ? (
          <>
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-14 h-14 rounded-full bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center mb-4 relative shadow-[0_0_20px_rgba(16,185,129,0.05)]">
                <Lock className="w-6 h-6 text-emerald-400 animate-pulse" />
              </div>
              <h2 className="text-lg font-black tracking-wider uppercase mb-2">
                {isRecoveryFlow ? "Decoupler Recovery" : "Secure Decoupler"}
              </h2>
              <p className="text-[10px] text-gray-500 max-w-[280px] leading-relaxed">
                {isRecoveryFlow 
                  ? "Enter administrative recovery passkey to authenticate user custom token and rotate default system configs."
                  : "Enter administrative token to initiate server routing and bypass secure profile locks."}
              </p>
            </div>

            <form onSubmit={isRecoveryFlow ? handleRecoverySubmit : handlePasswordSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold px-1">
                  {isRecoveryFlow ? "Recovery Key" : "Decryption Passphrase"}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={isSubmitting}
                  className="w-full h-11 px-4 bg-black/40 border border-white/5 rounded-xl font-mono text-sm tracking-widest text-center text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/30 focus:bg-black/60 transition-all duration-300"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs uppercase tracking-widest cursor-pointer hover:bg-emerald-500/20 active:scale-[0.98] transition-all duration-300 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.03)]"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="animate-spin w-4 h-4 text-emerald-400" />
                    <span>Decrypting Node...</span>
                  </span>
                ) : (
                  isRecoveryFlow ? "Recover Channel" : "Authorize Channel"
                )}
              </button>

              <button
                type="button"
                onClick={toggleRecoveryFlow}
                disabled={isSubmitting}
                className="mt-2 text-center text-xs text-emerald-500 hover:text-emerald-400 cursor-pointer select-none font-bold uppercase transition-colors"
              >
                {isRecoveryFlow ? "Back to normal login" : "Forgot Admin Password?"}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-14 h-14 rounded-full bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center mb-4 relative shadow-[0_0_20px_rgba(16,185,129,0.05)]">
                <ShieldCheck className="w-6 h-6 text-emerald-400 animate-pulse" />
              </div>
              <h2 className="text-lg font-black tracking-wider uppercase mb-2">Two-Factor Security Gate</h2>
              <p className="text-[10px] text-gray-500 max-w-[280px] leading-relaxed">
                SMTP Relayer dispatched a 6-digit OTP token to your email node. Please enter it to authorize session.
              </p>
            </div>

            {masterKeyBypassed && (
              <div className="mb-5 p-3.5 border border-emerald-500/20 bg-emerald-500/5 rounded-xl flex gap-2.5 items-start text-[9px] text-emerald-400 font-bold uppercase tracking-wide">
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                <span>[ RECOVERY MASTER OVERRIDE ] Master Key authorized. Local passphrase reset to offline default.</span>
              </div>
            )}

            <div className="w-full bg-black/50 border border-white/5 rounded-lg p-2.5 mb-5 font-mono text-[9px] text-emerald-400/90 leading-relaxed shadow-inner">
              <div className="flex items-center gap-1.5 mb-1 text-gray-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>SMTP TRANSLATION LOGS</span>
              </div>

              <p className="font-semibold select-all">[SMTP_RELAY] Dispatched security token to {maskEmail(JSON.parse(localStorage.getItem("portfolio_profile") || "{}").email || defaultProfile.email)}...</p>
              <p className="text-gray-500 mt-0.5">Please check your email and enter the code below to sign in.</p>
            </div>

            <form onSubmit={handleOtpSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2.5">
                <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold text-center px-1">
                  MFA Code Verification
                </label>
                
                <div className="flex justify-between gap-2 max-w-[320px] mx-auto">
                  {otpInputs.map((digit, idx) => (
                    <input
                      key={idx}
                      type="text"
                      maxLength="1"
                      ref={(el) => (otpRefs.current[idx] = el)}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      onPaste={handlePaste}
                      disabled={isSubmitting}
                      className="w-11 h-12 bg-black/40 border border-white/5 rounded-lg font-mono text-base font-black text-center text-white focus:outline-none focus:border-emerald-500/40 focus:bg-black/60 transition-all duration-300"
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center px-1 text-[9px]">
                <button
                  type="button"
                  onClick={() => { setStep(1); setIsRecoveryFlow(false); }}
                  className="text-gray-500 hover:text-white uppercase transition-colors cursor-pointer"
                >
                  Change Password
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-emerald-500 hover:text-emerald-400 uppercase font-bold transition-colors cursor-pointer"
                >
                  Resend Token
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs uppercase tracking-widest cursor-pointer hover:bg-emerald-500/20 active:scale-[0.98] transition-all duration-300 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.03)]"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="animate-spin w-4 h-4 text-emerald-400" />
                    <span>Verifying Code...</span>
                  </span>
                ) : (
                  "Verify Identity"
                )}
              </button>
            </form>
          </>
        )}

        {error && (
          <div className="mt-5 p-3.5 border border-red-500/10 bg-red-500/5 rounded-xl flex gap-2.5 items-start text-[9px] text-red-400 leading-relaxed font-bold tracking-wide uppercase">
            <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
