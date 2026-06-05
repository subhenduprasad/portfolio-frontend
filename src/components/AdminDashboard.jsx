import React, { useState, useEffect, useRef } from "react";
import {
  Database,
  Plus,
  Edit,
  Trash2,
  LogOut,
  Terminal,
  Cpu,
  Activity,
  Globe,
  Check,
  AlertTriangle,
  ExternalLink,
  Shield,
  Key,
  KeyRound,
  Monitor,
  RefreshCw,
  AlertOctagon,
  Mail,
  User,
  FileText,
} from "lucide-react";
import gsap from "gsap";
import { api } from "../utils/api";
import { defaultProfile } from "../utils/constants";

const maskEmail = (email) => {
  if (!email) return "";
  const [localPart, domain] = email.split("@");
  if (localPart.length <= 2) {
    return `${localPart[0]}...@${domain}`;
  }
  return `${localPart[0]}......${localPart[localPart.length - 1]}@${domain}`;
};

const sendOtpEmail = async (
  otpCode,
  subject = "Admin Passcode Customizer - MFA OTP Verification Code",
) => {
  const formKey = import.meta.env.VITE_SECURITY_FORM_KEY || "";
  const emailTarget = import.meta.env.VITE_ADMIN_EMAIL || "";
  const messageContent = `PASSCODE ROTATION CONTROL: Your 6-digit administrative verification code is: ${otpCode}. This code is highly confidential and valid for 5 minutes.`;

  if (!formKey) {
    console.log(
      `%c[SECURITY GATEWAY] Fallback MFA verification code is: ${otpCode}. Set VITE_SECURITY_FORM_KEY in .env for real secret emails!`,
      "color: #10b981; font-weight: bold; font-family: monospace; font-size: 11px;",
    );
    return false;
  }

  try {
    const isWeb3Forms = formKey.includes("-");
    const endpoint = isWeb3Forms
      ? "https://api.web3forms.com/submit"
      : `https://submit-form.com/${formKey}`;

    const payload = isWeb3Forms
      ? {
          access_key: formKey,
          subject: subject,
          from_name: "Portfolio Security System",
          name: "Subhendu Portfolio Admin",
          email: emailTarget,
          message: messageContent,
        }
      : {
          email: emailTarget,
          _subject: subject,
          message: messageContent,
        };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("[SECURITY GATEWAY] Email Dispatch API Response:", data);

    if (!response.ok || data.success === false) {
      throw new Error(data.message || `API error! status: ${response.status}`);
    }
    return true;
  } catch (err) {
    console.error("MFA relay error:", err);
    return false;
  }
};


const AdminGraph = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationId;
    let offset = 0;

    const resize = () => {
      canvas.width = canvas.parentElement.clientWidth || 300;
      canvas.height = 40;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "rgba(255,255,255,0.02)";
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x++) {
        const y =
          canvas.height / 2 +
          Math.sin(x * 0.04 + offset) * 10 * 0.6 +
          Math.sin(x * 0.09 - offset * 1.5) * 4;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      offset += 0.04;
      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-8 opacity-40 select-none pointer-events-none"
    />
  );
};

export default function AdminDashboard({
  projects,
  setProjects,
  profile,
  setProfile,
  onLogout,
  apiStatus,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [logs, setLogs] = useState([]);
  const logsContainerRef = useRef(null);
  const isInitialMount = useRef(true);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        setIsAuthenticated(false);
        setIsLoadingAuth(false);
        onLogout();
        return;
      }
      try {
        const verify = await api.verifySession(token);
        if (verify.success && verify.active) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("admin_token");
          setIsAuthenticated(false);
          onLogout();
        }
      } catch (err) {
        console.error("Session verification failed:", err);
        localStorage.removeItem("admin_token");
        setIsAuthenticated(false);
        onLogout();
      } finally {
        setIsLoadingAuth(false);
      }
    };
    checkSession();
  }, [onLogout, apiStatus]);
  
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [langs, setLangs] = useState("");
  const [status, setStatus] = useState("live");
  const [statsInput, setStatsInput] = useState("");
  const [codeUrl, setCodeUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [formError, setFormError] = useState("");
  const [projectSuccessMsg, setProjectSuccessMsg] = useState("");
  const [projectErrorMsg, setProjectErrorMsg] = useState("");
  
  const [activeTab, setActiveTab] = useState("database"); 

  useEffect(() => {
    if (activeTab) {
      const verifyTabSession = async () => {
        const token = localStorage.getItem("admin_token");
        if (token) {
          try {
            const verify = await api.verifySession(token);
            if (!verify.success || !verify.active) {
              localStorage.removeItem("admin_token");
              onLogout();
            }
          } catch (e) {
            console.error("Tab switch session verification failed:", e);
          }
        }
      };
      verifyTabSession();
    }
  }, [activeTab, onLogout]);
  
  const [profileData, setProfileData] = useState(() => {
    if (typeof window === "undefined") return defaultProfile;
    try {
      const stored = localStorage.getItem("portfolio_profile");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object") {
          
          const endpoint =
            import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT ||
            "ik.imagekit.io/wydlez00d/";
          const endpointClean = endpoint
            .replace(/^https?:\/\//, "")
            .replace(/\/$/, "");
          let changed = false;
          if (
            !parsed.imageUrl ||
            parsed.imageUrl === "/images/Subhendu.jpg" ||
            parsed.imageUrl.startsWith("/images/") ||
            parsed.imageUrl.includes("unsplash.com") ||
            (!parsed.imageUrl.includes(endpointClean) &&
              !parsed.imageUrl.includes("ik.imagekit.io/wydlez00d/"))
          ) {
            parsed.imageUrl = defaultProfile.imageUrl;
            changed = true;
          }
          if (
            !parsed.bgImageUrl ||
            parsed.bgImageUrl === "/images/Subhendu.jpg" ||
            parsed.bgImageUrl?.startsWith("/images/")
          ) {
            parsed.bgImageUrl = defaultProfile.bgImageUrl;
            changed = true;
          }
          if (changed) {
            localStorage.setItem("portfolio_profile", JSON.stringify(parsed));
            localStorage.setItem("portfolio_cache_timestamp", Date.now().toString());
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to parse stored profile", e);
    }
    return defaultProfile;
  });

  const [syncStatus, setSyncStatus] = useState("synced");
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");
  const [profileErrorMsg, setProfileErrorMsg] = useState("");
  const [newCapInput, setNewCapInput] = useState("");
  
  const [urlEndpoint, setUrlEndpoint] = useState(() => {
    return (
      localStorage.getItem("imagekit_url_endpoint") ||
      import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT ||
      ""
    );
  });
  const [publicKey, setPublicKey] = useState(() => {
    return (
      localStorage.getItem("imagekit_public_key") ||
      import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY ||
      ""
    );
  });
  const [privateKey, setPrivateKey] = useState(() => {
    return (
      localStorage.getItem("imagekit_private_key") ||
      import.meta.env.VITE_IMAGEKIT_PRIVATE_KEY ||
      ""
    );
  });
  const [uploadProgress, setUploadProgress] = useState({
    active: false,
    filename: "",
    pct: 0,
    field: "",
  });
  const activeUploadTaskRef = useRef(null);
  
  const [portraitLoaded, setPortraitLoaded] = useState(false);
  const [portraitError, setPortraitError] = useState(false);

  const [bgPreviewLoaded, setBgPreviewLoaded] = useState(false);
  const [bgPreviewError, setBgPreviewError] = useState(false);

  const [ogPreviewLoaded, setOgPreviewLoaded] = useState(false);
  const [ogPreviewError, setOgPreviewError] = useState(false);

  useEffect(() => {
    setPortraitLoaded(false);
    setPortraitError(false);
  }, [profileData.imageUrl]);

  useEffect(() => {
    setBgPreviewLoaded(false);
    setBgPreviewError(false);
  }, [profileData.bgImageUrl]);

  useEffect(() => {
    setOgPreviewLoaded(false);
    setOgPreviewError(false);
  }, [profileData.ogImageUrl]);

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    if (apiStatus === "OFFLINE" || apiStatus === "DEGRADED") {
      setProfileErrorMsg("WRITE_ERROR: BACKEND PORTAL IS OFFLINE // SAVING BLOCKED.");
      setTimeout(() => setProfileErrorMsg(""), 6000);
      return;
    }
    setSyncStatus("saving");
    try {
      localStorage.setItem("portfolio_profile", JSON.stringify(profileData));
      localStorage.setItem("portfolio_cache_timestamp", Date.now().toString());
      if (setProfile) setProfile(profileData);

      const token = localStorage.getItem("admin_token");
      await api.savePortfolioData(profileData, token);

      setSyncStatus("synced");
      setProfileSuccessMsg(
        "PROFILE_DATABASE_COMMITTED // CHANGES SAVED SUCCESSFULLY",
      );
      setProfileErrorMsg("");
      setTimeout(() => setProfileSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Profile sync failed:", err);
      setSyncStatus("error");
      setProfileErrorMsg("WRITE_ERROR: " + err.message.toUpperCase());
      setTimeout(() => setProfileErrorMsg(""), 6000);
    }
  };

  const handleResetProfile = async () => {
    if (apiStatus === "OFFLINE" || apiStatus === "DEGRADED") {
      setProfileErrorMsg("RESET_ERROR: BACKEND PORTAL IS OFFLINE // RESTORE BLOCKED.");
      setTimeout(() => setProfileErrorMsg(""), 6000);
      return;
    }
    if (
      window.confirm(
        "ARE YOU SURE YOU WANT TO RESTORE ALL DEFAULT SYSTEM CONFIGURATIONS?",
      )
    ) {
      setSyncStatus("saving");
      try {
        setProfileData(defaultProfile);
        localStorage.setItem("portfolio_profile", JSON.stringify(defaultProfile));
        localStorage.setItem("portfolio_cache_timestamp", Date.now().toString());
        if (setProfile) setProfile(defaultProfile);

        const token = localStorage.getItem("admin_token");
        await api.savePortfolioData(defaultProfile, token);

        setSyncStatus("synced");
        setProfileSuccessMsg(
          "SYSTEM_RESTORE_COMPLETE // DEFAULT PROFILE INSTALLED",
        );
        setProfileErrorMsg("");
        setTimeout(() => setProfileSuccessMsg(""), 4000);
      } catch (err) {
        console.error("Firestore reset failed:", err);
        setSyncStatus("error");
        setProfileErrorMsg("RESET_ERROR: " + err.message.toUpperCase());
        setTimeout(() => setProfileErrorMsg(""), 6000);
      }
    }
  };
  
  const convertGoogleDriveUrl = (url) => {
    if (!url) return "";
    const cleanUrl = url.trim();
    if (cleanUrl.includes("drive.google.com/file/d/")) {
      const parts = cleanUrl.split("/file/d/");
      if (parts.length > 1) {
        const fileId = parts[1].split("/")[0].split("?")[0];
        if (fileId) {
          return `https://lh3.googleusercontent.com/d/${fileId}`;
        }
      }
    } else if (cleanUrl.includes("drive.google.com/open?id=") || cleanUrl.includes("drive.google.com/uc?id=")) {
      const match = cleanUrl.match(/[?&]id=([^&]+)/);
      if (match && match[1]) {
        return `https://lh3.googleusercontent.com/d/${match[1]}`;
      }
    }
    return cleanUrl;
  };

  const handleCancelUpload = () => {
    if (activeUploadTaskRef.current) {
      try {
        activeUploadTaskRef.current.abort();
      } catch (err) {
        console.error("Cancel upload error:", err);
      }
      activeUploadTaskRef.current = null;
    }
    setUploadProgress({ active: false, filename: "", pct: 0, field: "" });
    setProfileErrorMsg("UPLOAD_CANCELLED // FILE DISPATCH DISCONTINUED.");
    setTimeout(() => setProfileErrorMsg(""), 4000);
  };

  const handleAddExperience = () => {
    const newExp = {
      role: "New Position Role",
      company: "Company Node Name",
      duration: "Duration / Dates",
      desc: "Describe your responsibilities and systems performance specifications here...",
      isPresent: false,
    };
    setProfileData({
      ...profileData,
      experiences: [...(profileData.experiences || []), newExp],
    });
  };

  const handleRemoveExperience = (idxToRemove) => {
    setProfileData({
      ...profileData,
      experiences: (profileData.experiences || []).filter(
        (_, idx) => idx !== idxToRemove,
      ),
    });
  };

  const handleUpdateExperience = (idx, field, value) => {
    const updated = (profileData.experiences || []).map((exp, expIdx) => {
      if (expIdx === idx) {
        return { ...exp, [field]: value };
      }
      return exp;
    });
    setProfileData({
      ...profileData,
      experiences: updated,
    });
  };

  const handleAddCapability = (e) => {
    if (e) e.preventDefault();
    if (!newCapInput.trim()) return;
    if ((profileData.capabilities || []).includes(newCapInput.trim())) {
      setNewCapInput("");
      return;
    }
    setProfileData({
      ...profileData,
      capabilities: [...(profileData.capabilities || []), newCapInput.trim()],
    });
    setNewCapInput("");
  };

  const handleRemoveCapability = (capToRemove) => {
    setProfileData({
      ...profileData,
      capabilities: (profileData.capabilities || []).filter(
        (cap) => cap !== capToRemove,
      ),
    });
  };

  const handleImageKitUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    if (apiStatus === "OFFLINE" || apiStatus === "DEGRADED") {
      setProfileErrorMsg("STORAGE_ERROR // SERVER IS OFFLINE. UPLOADS DISABLED.");
      setTimeout(() => setProfileErrorMsg(""), 6000);
      return;
    }

    const maxSize = field === "resumeUrl" ? 5 * 1024 * 1024 : 3 * 1024 * 1024; 
    if (file.size > maxSize) {
      setProfileErrorMsg(
        `UPLOAD_FAILED // FILE_TOO_LARGE (MAX SIZE: ${field === "resumeUrl" ? "5MB" : "3MB"})`,
      );
      setTimeout(() => setProfileErrorMsg(""), 5000);
      return;
    }

    setUploadProgress({ active: true, filename: file.name, pct: 10, field });

    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        throw new Error("ADMIN SESSION INVALID OR TIMED OUT.");
      }
      
      const sigData = await api.getUploadSignature(token);
      
      const xhr = new XMLHttpRequest();
      activeUploadTaskRef.current = xhr;

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress({
            active: true,
            filename: file.name,
            pct: progress,
            field,
          });
        }
      });

      xhr.addEventListener("load", async () => {
        activeUploadTaskRef.current = null;
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            const downloadUrl = response.url;

            setProfileData((prev) => {
              const updated = { ...prev, [field]: downloadUrl };
              localStorage.setItem("portfolio_profile", JSON.stringify(updated));
              localStorage.setItem("portfolio_cache_timestamp", Date.now().toString());
              if (setProfile) setProfile(updated);
              return updated;
            });

            setProfileSuccessMsg(
              `UPLOAD_SUCCESS // SAVED TO FIELD: ${field.toUpperCase()}`,
            );
            setTimeout(() => setProfileSuccessMsg(""), 4000);
          } catch (urlErr) {
            console.error("Failed to parse ImageKit response:", urlErr);
            setProfileErrorMsg("URL_RESOLVE_FAILED // FAILED TO PARSE UPLOAD RESPONSE.");
            setTimeout(() => setProfileErrorMsg(""), 6000);
          }
        } else {
          try {
            const response = JSON.parse(xhr.responseText || "{}");
            setProfileErrorMsg(`UPLOAD_FAILED // ${response.message ? response.message.toUpperCase() : xhr.statusText}`);
          } catch (pe) {
            setProfileErrorMsg(`UPLOAD_FAILED // RESPONSE ERROR`);
          }
          setTimeout(() => setProfileErrorMsg(""), 6000);
        }
        setTimeout(() => {
          setUploadProgress({ active: false, filename: "", pct: 0, field: "" });
        }, 1000);
      });

      xhr.addEventListener("error", () => {
        activeUploadTaskRef.current = null;
        setProfileErrorMsg("UPLOAD_FAILED // NETWORK ERROR DURING UPLOAD.");
        setTimeout(() => setProfileErrorMsg(""), 6000);
        setUploadProgress({ active: false, filename: "", pct: 0, field: "" });
      });

      xhr.addEventListener("abort", () => {
        activeUploadTaskRef.current = null;
        setProfileErrorMsg("UPLOAD_CANCELLED // FILE DISPATCH DISCONTINUED.");
        setTimeout(() => setProfileErrorMsg(""), 4000);
        setUploadProgress({ active: false, filename: "", pct: 0, field: "" });
      });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);
      formData.append("publicKey", publicKey);
      formData.append("signature", sigData.signature);
      formData.append("expire", sigData.expire);
      formData.append("token", sigData.token);
      formData.append("folder", "/portfolio");

      xhr.open("POST", "https://upload.imagekit.io/api/v1/files/upload");
      xhr.send(formData);

    } catch (err) {
      console.error("ImageKit signed upload failure:", err);
      activeUploadTaskRef.current = null;
      setProfileErrorMsg(`UPLOAD_FAILED // ${err.message ? err.message.toUpperCase() : "FAILED TO SIGN OR UPLOAD."}`);
      setTimeout(() => setProfileErrorMsg(""), 6000);
      setUploadProgress({ active: false, filename: "", pct: 0, field: "" });
    }
  };
  
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [securityOtp, setSecurityOtp] = useState("");
  const [generatedSecurityOtp, setGeneratedSecurityOtp] = useState("");
  const [showSecurityToast, setShowSecurityToast] = useState(false);
  const [securityToastOtp, setSecurityToastOtp] = useState("");
  const [passwordChangerError, setPasswordChangerError] = useState("");
  const [passwordChangerSuccess, setPasswordChangerSuccess] = useState("");
  const [isGeneratingSecurityOtp, setIsGeneratingSecurityOtp] = useState(false);
  const [mailTunnelActive, setMailTunnelActive] = useState(() => {
    return localStorage.getItem("mail_tunnel_active") !== "false";
  });
  
  const [messagesList, setMessagesList] = useState([]);
  const [expandedMessage, setExpandedMessage] = useState(null);

  const loadMessages = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;
    try {
      const messages = await api.fetchMessages(token);
      setMessagesList(messages);
    } catch (e) {
      console.error("[INBOX] Failed to fetch messages from server:", e);
      setLogs((prev) => [
        ...prev,
        `[ERROR] FETCH MESSAGES FAILURE: ${e.message.toUpperCase()}`
      ]);
      setMessagesList([]);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [activeTab]);

  const handleDeleteMessage = async (msgId) => {
    if (
      window.confirm(
        "ARE YOU SURE YOU WANT TO DECOMMISSION THIS MESSAGE RECORD?",
      )
    ) {
      const token = localStorage.getItem("admin_token");
      if (!token) return;
      try {
        await api.deleteMessage(token, msgId);
        await loadMessages();
        setLogs((prev) => [
          ...prev,
          `[SYSTEM_EVENT] DECOMMISSIONED CONTACT MESSAGE: ${msgId}`,
        ]);
      } catch (e) {
        console.error("[INBOX] Failed to delete message:", e);
        setLogs((prev) => [
          ...prev,
          `[ERROR] DELETION FAILURE FOR ${msgId}: ${e.message.toUpperCase()}`
        ]);
      }
    }
  };
  
  const [sessionsList, setSessionsList] = useState([]);
  const [lockedOut, setLockedOut] = useState(false);
  const [lockoutDetails, setLockoutDetails] = useState(null);
  
  useEffect(() => {
    const addLog = () => {
      const actions = [
        "DB QUERY: SELECT * FROM cache_registry WHERE ttl > 0",
        "SECURE SYNC: Synchronizing local state registers...",
        "PROXY ROUTE: Authorized transaction decrypted on port 443",
        "SYSTEM HEALTH: Active CPU core load running within 15% range",
        "COMPILING: Compiled CSS tokens successfully in 84ms",
        "STORAGE AUDIT: Indexed file blocks correctly serialized",
        "REDIS STATS: Hit rate 99.4% | Unified cache sync active",
      ];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      const timestamp = new Date().toLocaleTimeString();
      setLogs((prev) => [...prev.slice(-30), `[${timestamp}] ${randomAction}`]);
    };

    addLog();
    const interval = setInterval(addLog, 5000);
    return () => clearInterval(interval);
  }, []);

  
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop =
        logsContainerRef.current.scrollHeight;
    }
  }, [logs]);
  
  useEffect(() => {
    const mySessionId = localStorage.getItem("admin_session_id");
    if (!mySessionId) return;

    const checkSession = () => {
      const activeSessionId = localStorage.getItem("admin_session_id");
      let shouldLockout = activeSessionId && activeSessionId !== mySessionId;

      try {
        const storedSessions = localStorage.getItem("admin_sessions_list");
        if (storedSessions) {
          const list = JSON.parse(storedSessions);

          
          const mySess = list.find((s) => s.sessionId === mySessionId);
          if (mySess && mySess.active === false) {
            shouldLockout = true;
          }

          const activeSess = list.find((s) => s.sessionId === activeSessionId);
          if (activeSess) {
            setLockoutDetails(activeSess);
          }
        }
      } catch (e) {}

      if (shouldLockout) {
        setLockedOut(true);
      }
    };

    const handleStorageChange = (e) => {
      if (e.key === "admin_session_id") {
        const activeSessionId = e.newValue;
        if (activeSessionId && activeSessionId !== mySessionId) {
          setLockedOut(true);
          try {
            const storedSessions = localStorage.getItem("admin_sessions_list");
            if (storedSessions) {
              const list = JSON.parse(storedSessions);
              const activeSess = list.find(
                (s) => s.sessionId === activeSessionId,
              );
              if (activeSess) {
                setLockoutDetails(activeSess);
              }
            }
          } catch (err) {}
        }
      } else if (e.key === "admin_sessions_list") {
        try {
          const list = JSON.parse(e.newValue);
          const mySess = list.find((s) => s.sessionId === mySessionId);
          if (mySess && mySess.active === false) {
            setLockedOut(true);
          }
        } catch (err) {}
      }
    };

    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(checkSession, 3000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);
  
  const loadSessions = () => {
    const stored = localStorage.getItem("admin_sessions_list");
    if (stored) {
      try {
        setSessionsList(JSON.parse(stored));
      } catch (e) {}
    }
  };

  const handleRevokeSession = (sessionId) => {
    if (window.confirm(`REVOKE SENSOR BLOCK FOR SESSION: ${sessionId}?`)) {
      const stored = localStorage.getItem("admin_sessions_list");
      if (stored) {
        try {
          let list = JSON.parse(stored);
          list = list.map((s) =>
            s.sessionId === sessionId ? { ...s, active: false } : s,
          );
          localStorage.setItem("admin_sessions_list", JSON.stringify(list));
          setSessionsList(list);
          setLogs((prev) => [
            ...prev,
            `[SECURITY_EVENT] Revoked authorization token for session: ${sessionId}`,
          ]);
        } catch (e) {}
      }
    }
  };

  useEffect(() => {
    loadSessions();
  }, [activeTab]);

  
  useEffect(() => {
    if (showSecurityToast) {
      const timer = setTimeout(() => {
        gsap.to(".security-otp-toast", {
          x: 300,
          opacity: 0,
          duration: 0.5,
          ease: "power2.in",
          onComplete: () => setShowSecurityToast(false),
        });
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [showSecurityToast]);

  
  const handleRequestSecurityOtp = async () => {
    if (apiStatus === "OFFLINE" || apiStatus === "DEGRADED") {
      setPasswordChangerError("ERROR: BACKEND PORTAL IS OFFLINE // OTP FLOW DISABLED.");
      return;
    }
    setIsGeneratingSecurityOtp(true);
    setPasswordChangerError("");
    setPasswordChangerSuccess("");
    setShowSecurityToast(false);

    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        throw new Error("ADMIN SESSION INVALID OR TIMED OUT.");
      }
      const data = await api.requestChangePasswordOtp(token);
      if (!data.success) {
        throw new Error(data.error || "OTP GENERATION FAILED.");
      }

      setIsGeneratingSecurityOtp(false);
      setShowSecurityToast(true);

      setTimeout(() => {
        gsap.fromTo(
          ".security-otp-toast",
          { x: 300, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.8, ease: "elastic.out(1, 0.75)" },
        );
      }, 100);
    } catch (err) {
      setIsGeneratingSecurityOtp(false);
      setPasswordChangerError(err.message ? err.message.toUpperCase() : "OTP GENERATION FAILED.");
    }
  };

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    if (apiStatus === "OFFLINE" || apiStatus === "DEGRADED") {
      setPasswordChangerError("ERROR: BACKEND PORTAL IS OFFLINE // ROTATION BLOCKED.");
      return;
    }
    setPasswordChangerError("");
    setPasswordChangerSuccess("");

    if (!currentPass || !newPass || !confirmPass) {
      setPasswordChangerError("ALL PASSWORD FIELD INSTRUCTIONS REQUIRED.");
      return;
    }

    if (newPass !== confirmPass) {
      setPasswordChangerError("NEW PASSWORD ENTRIES DO NOT MATCH.");
      return;
    }

    if (!securityOtp) {
      setPasswordChangerError("VERIFICATION SECURITY OTP REQUIRED.");
      return;
    }

    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        throw new Error("ADMIN SESSION INVALID OR TIMED OUT.");
      }

      const data = await api.changePassword(currentPass, newPass, securityOtp, token);
      if (!data.success) {
        throw new Error(data.error || "PASSWORD ROTATION CONTROL GATE REJECTED THE REQUEST.");
      }

      setPasswordChangerSuccess("ADMIN PASSCODE ROTATED SUCCESSFULLY.");
      setLogs((prev) => [
        ...prev,
        `[SECURITY_EVENT] Administrative password modified. Cryptographic token rotated.`,
      ]);

      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
      setSecurityOtp("");
      setShowSecurityToast(false);
    } catch (err) {
      console.error("Password change failure:", err);
      setPasswordChangerError(err.message ? err.message.toUpperCase() : "PASSWORD ROTATION FAILED.");
    }
  };
  
  const handleCreateOpen = () => {
    setEditingProject(null);
    setName("");
    setDesc("");
    setLangs("React, Tailwindcss, Express");
    setStatus("live");
    setStatsInput("latency:15ms, clients:1.2K+");
    setCodeUrl("https://github.com/subhenduprasad");
    setDemoUrl("https://github.com/subhenduprasad");
    setFormError("");
    setIsModalOpen(true);
  };
  
  const handleEditOpen = (project) => {
    setEditingProject(project);
    setName(project.projectName);
    setDesc(project.description);
    setLangs(project.languages.join(", "));
    setStatus(project.status);
    
    const statsStr = Object.entries(project.stats)
      .map(([k, v]) => `${k}:${v}`)
      .join(", ");
    setStatsInput(statsStr);

    setCodeUrl(project.links.code);
    setDemoUrl(project.links.demo);
    setFormError("");
    setIsModalOpen(true);
  };
  
  const handleDelete = async (project) => {
    if (apiStatus === "OFFLINE" || apiStatus === "DEGRADED") {
      setProjectErrorMsg("WRITE_ERROR: BACKEND PORTAL IS OFFLINE // DELETE BLOCKED.");
      setTimeout(() => setProjectErrorMsg(""), 6000);
      return;
    }
    if (
      window.confirm(
        `ARE YOU SURE YOU WANT TO TERMINATE PROCESS: ${project.projectName}?`,
      )
    ) {
      try {
        const updated = projects.filter(
          (p) => p.projectName !== project.projectName,
        );
        setProjects(updated);
        localStorage.setItem("portfolio_projects", JSON.stringify(updated));
        localStorage.setItem("portfolio_cache_timestamp", Date.now().toString());

        const token = localStorage.getItem("admin_token");
        await api.saveProjectsData(updated, token);

        setProjectSuccessMsg(
          `PROJECT_DECOMMISSIONED // TERMINATED SUCCESSFULLY: ${project.projectName}`,
        );
        setProjectErrorMsg("");
        setTimeout(() => setProjectSuccessMsg(""), 4000);
        
        setLogs((prev) => [
          ...prev,
          `[SYSTEM_EVENT] DELETED PROJECT: ${project.projectName}`,
        ]);
      } catch (err) {
        console.error(err);
        setProjectErrorMsg(`DELETION_ERROR: ${err.message.toUpperCase()}`);
        setTimeout(() => setProjectErrorMsg(""), 5000);
      }
    }
  };
  
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (apiStatus === "OFFLINE" || apiStatus === "DEGRADED") {
      setFormError("WRITE_ERROR: BACKEND PORTAL IS OFFLINE // PROJECT SAVES BLOCKED.");
      return;
    }
    if (!name || !desc) {
      setFormError("PROJECT NAME AND DESCRIPTION ARE MANDATORY INSTRUCTIONS.");
      return;
    }
    
    const languagesArray = langs
      .split(",")
      .map((l) => l.trim())
      .filter(Boolean);
    
    const statsObj = {};
    if (statsInput) {
      statsInput.split(",").forEach((item) => {
        const parts = item.split(":");
        if (parts.length === 2) {
          statsObj[parts[0].trim().toLowerCase()] = parts[1].trim();
        }
      });
    }

    const newProject = {
      projectName: name.trim(),
      languages: languagesArray,
      status,
      description: desc.trim(),
      stats: statsObj,
      links: {
        code: codeUrl.trim() || "https://github.com/subhenduprasad",
        demo: demoUrl.trim() || "https://github.com/subhenduprasad",
      },
    };

    let updatedList;
    if (editingProject) {
      
      updatedList = projects.map((p) =>
        p.projectName === editingProject.projectName ? newProject : p,
      );
      setLogs((prev) => [
        ...prev,
        `[SYSTEM_EVENT] UPDATED PROJECT DATA: ${newProject.projectName}`,
      ]);
    } else {
      
      if (
        projects.some(
          (p) =>
            p.projectName.toLowerCase() ===
            newProject.projectName.toLowerCase(),
        )
      ) {
        setFormError("A SYSTEM NODE ALREADY EXISTS WITH THIS IDENTIFIER.");
        return;
      }
      
      updatedList = [...projects, newProject];
      setLogs((prev) => [
        ...prev,
        `[SYSTEM_EVENT] MOUNTED NEW SERVICE CORE: ${newProject.projectName}`,
      ]);
    }

    try {
      setProjects(updatedList);
      localStorage.setItem("portfolio_projects", JSON.stringify(updatedList));
      localStorage.setItem("portfolio_cache_timestamp", Date.now().toString());

      const token = localStorage.getItem("admin_token");
      await api.saveProjectsData(updatedList, token);

      setProjectSuccessMsg(
        editingProject
          ? `PROJECT_UPDATED // SYSTEM CORE DATA ROTATED: ${newProject.projectName}`
          : `PROJECT_MOUNTED // NEW SERVICE CORE COMPILED: ${newProject.projectName}`,
      );
      setProjectErrorMsg("");
      setTimeout(() => setProjectSuccessMsg(""), 4000);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      setProjectErrorMsg(`WRITE_ERROR: ${err.message.toUpperCase()}`);
      setTimeout(() => setProjectErrorMsg(""), 6000);
    }
  };

  const handleLogoutClick = async () => {
    if (window.confirm("VERIFY REQUEST: DISCONNECT ADMINISTRATIVE SESSION?")) {
      const token = localStorage.getItem("admin_token");
      try {
        if (token && apiStatus === "ONLINE") {
          const BASE_URL = import.meta.env.VITE_SERVER_BASE_URL || "http://localhost:5000";
          await fetch(`${BASE_URL}/api/v1/auth/logout`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          });
        }
      } catch (err) {
        console.error("Failed to notify backend on logout:", err);
      }

      localStorage.removeItem("admin_token");

      try {
        const mySessionId = localStorage.getItem("admin_session_id");
        const stored = localStorage.getItem("admin_sessions_list");
        if (stored) {
          let list = JSON.parse(stored);
          list = list.map((s) =>
            s.sessionId === mySessionId ? { ...s, active: false } : s,
          );
          localStorage.setItem("admin_sessions_list", JSON.stringify(list));
        }
        localStorage.removeItem("admin_session_id");
      } catch (e) {}

      try {
        if (auth) {
          await auth.signOut();
        }
      } catch (e) {}

      onLogout();
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 z-[99999] bg-[#070708] text-white flex items-center justify-center font-mono">
        <RefreshCw className="animate-spin w-8 h-8 text-emerald-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (lockedOut) {
    return (
      <div className="fixed inset-0 z-[99999] bg-[#0c0808] text-white flex items-center justify-center font-mono overflow-hidden select-none">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(239,68,68,0.02),rgba(239,68,68,0.01),rgba(239,68,68,0.02))] bg-[size:100%_3px,3px_100%] z-20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-red-500/5 rounded-full blur-[160px] pointer-events-none"></div>
        <div className="w-full max-w-[500px] mx-4 p-8 rounded-2xl border border-red-500/20 bg-charcoal/30 backdrop-blur-xl relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6 mx-auto shadow-[0_0_20px_rgba(239,68,68,0.15)]">
            <AlertOctagon className="w-8 h-8 text-red-500 animate-bounce" />
          </div>

          <h2 className="text-xl font-black tracking-widest text-red-500 uppercase mb-3">
            [ SECURITY LOCKOUT ]
          </h2>
          <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider mb-6">
            Session terminated. Node overridden by another device.
          </p>
          
          <div className="w-full bg-black/60 border border-red-500/10 rounded-xl p-4 text-left text-[10px] text-gray-400 mb-6 font-mono leading-relaxed shadow-inner">
            <div className="flex items-center gap-1.5 mb-2.5 text-red-500/80 font-bold uppercase tracking-wider pb-1.5 border-b border-white/5">
              <Monitor className="w-3.5 h-3.5" />
              <span>Overriding Node Telemetry</span>
            </div>
            {lockoutDetails ? (
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                <div>
                  <span className="text-gray-600 uppercase font-semibold">
                    Session ID:
                  </span>{" "}
                  <span className="text-white font-semibold">
                    {lockoutDetails.sessionId}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 uppercase font-semibold">
                    OS Mod:
                  </span>{" "}
                  <span className="text-white font-semibold">
                    {lockoutDetails.os}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 uppercase font-semibold">
                    Engine:
                  </span>{" "}
                  <span className="text-white font-semibold">
                    {lockoutDetails.browser}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 uppercase font-semibold">
                    Cores:
                  </span>{" "}
                  <span className="text-white font-semibold">
                    {lockoutDetails.cores}
                  </span>
                </div>
                <div className="col-span-2 truncate">
                  <span className="text-gray-600 uppercase font-semibold">
                    GPU Card:
                  </span>{" "}
                  <span className="text-white font-semibold text-[9px] block truncate">
                    {lockoutDetails.gpu}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 uppercase font-semibold">
                    IP Node:
                  </span>{" "}
                  <span className="text-white font-semibold">
                    {lockoutDetails.ip}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 uppercase font-semibold">
                    Time:
                  </span>{" "}
                  <span className="text-white font-semibold">
                    {lockoutDetails.time}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-600 uppercase font-bold py-2 animate-pulse">
                Compiling Override Telemetries...
              </p>
            )}
          </div>

          <button
            onClick={() => {
              try {
                const mySessionId = localStorage.getItem("admin_session_id");
                const stored = localStorage.getItem("admin_sessions_list");
                if (stored) {
                  let list = JSON.parse(stored);
                  list = list.map((s) =>
                    s.sessionId === mySessionId ? { ...s, active: false } : s,
                  );
                  localStorage.setItem(
                    "admin_sessions_list",
                    JSON.stringify(list),
                  );
                }
              } catch (e) {}
              onLogout();
            }}
            className="w-full h-11 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-xs uppercase tracking-widest cursor-pointer hover:bg-red-500/20 active:scale-[0.98] transition-all duration-300 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.03)]"
          >
            Return to Secure Entry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070708] text-white font-mono p-4 md:p-8 relative select-none">
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(16,185,129,0.01),rgba(6,182,212,0.005),rgba(16,185,129,0.01))] bg-[size:100%_3px,3px_100%] z-20"></div>
      
      {showSecurityToast && (
        <div className="security-otp-toast fixed top-6 right-6 z-[99999] max-w-sm w-80 p-4 border border-emerald-500/20 bg-black/85 backdrop-blur-md rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.15)] flex gap-3 text-left font-mono">
          <div className="w-8 h-8 rounded-lg border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4 text-emerald-400 animate-bounce" />
          </div>
          <div className="flex-1 text-left">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[9px] uppercase font-bold text-gray-500">
                MFA Mail Relayer
              </span>
              <button
                onClick={() => setShowSecurityToast(false)}
                className="text-gray-500 hover:text-white text-[8px] uppercase tracking-wider cursor-pointer"
              >
                Dismiss
              </button>
            </div>
            <p className="text-[10px] text-gray-300 leading-normal">
              A temporary security key has been secretly dispatched to your registered node <span className="text-white font-semibold">{maskEmail(import.meta.env.VITE_ADMIN_EMAIL || "")}</span>. Please check your inbox.
            </p>
          </div>
        </div>
      )}

      <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 relative z-10">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border border-white/5 bg-charcoal/30 backdrop-blur-md gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Database className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-wider uppercase leading-none mb-1">
                Subhendu Core Admin Panel
              </h1>
              <p className="text-[9px] text-gray-500 uppercase leading-none">
                Core Relational Schema Decoupler 
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 self-stretch sm:self-auto justify-between sm:justify-start">
            
            <div className="flex gap-1 p-1 rounded-xl bg-black/40 border border-white/5 mr-1 sm:mr-2">
              <button
                type="button"
                onClick={() => setActiveTab("database")}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase font-bold tracking-widest transition-all cursor-pointer ${
                  activeTab === "database"
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                    : "border border-transparent text-gray-500 hover:text-white"
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Services</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("security")}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase font-bold tracking-widest transition-all cursor-pointer ${
                  activeTab === "security"
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                    : "border border-transparent text-gray-500 hover:text-white"
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Security</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("messages")}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase font-bold tracking-widest transition-all cursor-pointer ${
                  activeTab === "messages"
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                    : "border border-transparent text-gray-500 hover:text-white"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Inbox</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase font-bold tracking-widest transition-all cursor-pointer ${
                  activeTab === "profile"
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                    : "border border-transparent text-gray-500 hover:text-white"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Profile</span>
              </button>
            </div>

            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/25 active:scale-95 text-red-400 text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Disconnect</span>
            </button>
          </div>
        </div>

        {activeTab === "database" && (
          <>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-white/5 bg-charcoal/20 backdrop-blur-sm flex flex-col gap-1.5">
                <span className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">
                  TOTAL SERVICES MOUNTED
                </span>
                <span className="text-2xl font-black text-white">
                  {projects.length} Nodes
                </span>
                <span className="text-[9px] text-gray-600 mt-1 uppercase font-mono leading-none">
                  Active server pools
                </span>
              </div>

              <div className="p-4 rounded-xl border border-white/5 bg-charcoal/20 backdrop-blur-sm flex flex-col gap-1.5">
                <span className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">
                  CORE DATABASE UPTIME
                </span>
                <span className="text-2xl font-black text-emerald-400">
                  100.00%
                </span>
                <span className="text-[9px] text-emerald-500/40 mt-1 uppercase font-mono leading-none">
                  0 downtime packet loss
                </span>
              </div>

              <div className="p-4 rounded-xl border border-white/5 bg-charcoal/20 backdrop-blur-sm flex flex-col gap-1.5">
                <span className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">
                  CPU MEMORY ALLOCATION
                </span>
                <span className="text-2xl font-black text-white">
                  99.4% Hits
                </span>
                <div className="mt-1.5">
                  <AdminGraph />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-white/5 bg-charcoal/20 backdrop-blur-sm flex flex-col gap-1.5">
                <span className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">
                  ADMIN QUERY LATENCY
                </span>
                <span className="text-2xl font-black text-cyan-400">0.9ms</span>
                <span className="text-[9px] text-cyan-500/40 mt-1 uppercase font-mono leading-none">
                  Secured proxy socket
                </span>
              </div>
            </div>
            
            <div className="p-5 rounded-xl border border-white/5 bg-charcoal/20 backdrop-blur-sm flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-white/5">
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-emerald-400" />
                    Active Database Registry
                  </h2>
                </div>

                <button
                  onClick={handleCreateOpen}
                  className="flex items-center gap-1.5 px-3 h-9 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/25 active:scale-95 text-emerald-400 text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.02)] shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Mount Service</span>
                </button>
              </div>

              {projectSuccessMsg && (
                <div className="p-3 border border-emerald-500/10 bg-emerald-500/5 rounded-lg flex gap-2 items-center text-[10px] text-emerald-400 font-mono tracking-wide uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{projectSuccessMsg}</span>
                </div>
              )}

              {projectErrorMsg && (
                <div className="p-3 border border-red-500/10 bg-red-500/5 rounded-lg flex gap-2 items-center text-[10px] text-red-400 font-mono tracking-wide uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  <span>{projectErrorMsg}</span>
                </div>
              )}

              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs font-mono border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-white/5 text-[9px] uppercase tracking-widest text-gray-500 font-bold">
                      <th className="pb-3 px-2">Service ID Name</th>
                      <th className="pb-3 px-2">Technologies Used</th>
                      <th className="pb-3 px-2">Deployment Status</th>
                      <th className="pb-3 px-2">Performance Telemetries</th>
                      <th className="pb-3 px-2 text-right">
                        Administrative Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((proj, idx) => {
                      const isLive = proj.status === "live";
                      const statusColor = isLive
                        ? "text-emerald-400 border-emerald-500/10 bg-emerald-500/5"
                        : "text-cyan-400 border-cyan-500/10 bg-cyan-500/5";

                      return (
                        <tr
                          key={idx}
                          className="border-b border-white/5 hover:bg-white/[0.02] transition-all"
                        >
                          <td className="py-4 px-2 font-bold max-w-[200px] truncate">
                            <div className="text-white text-sm font-semibold">
                              {proj.projectName}
                            </div>
                            <div className="text-[10px] text-gray-500 mt-1 truncate max-w-[190px] font-normal leading-normal">
                              {proj.description}
                            </div>
                          </td>
                          <td className="py-4 px-2 max-w-[180px]">
                            <div className="flex flex-wrap gap-1">
                              {proj.languages.map((l, lIdx) => (
                                <span
                                  key={lIdx}
                                  className="px-1.5 py-0.5 border border-white/5 bg-white/5 text-[8px] text-cyan-300 rounded font-mono uppercase"
                                >
                                  {l}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <span
                              className={`px-2 py-0.5 border text-[8px] rounded uppercase font-semibold tracking-wider ${statusColor}`}
                            >
                              {proj.status === "live"
                                ? "ONLINE // ACTIVE"
                                : "STABLE // MOUNTED"}
                            </span>
                          </td>
                          <td className="py-4 px-2">
                            <div className="flex flex-col gap-1 text-[9px] text-gray-400">
                              {Object.entries(proj.stats).map(([k, v]) => (
                                <div key={k}>
                                  <span className="text-gray-500 uppercase">
                                    {k}:
                                  </span>{" "}
                                  <span className="font-semibold text-white">
                                    {v}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-2 text-right">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleEditOpen(proj)}
                                className="p-2 rounded bg-white/5 border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/10 text-gray-400 hover:text-emerald-400 transition-all cursor-pointer"
                                title="Edit Service Module"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(proj)}
                                className="p-2 rounded bg-white/5 border border-white/5 hover:border-red-500/30 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all cursor-pointer"
                                title="Decommission Service"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="p-4 rounded-xl border border-white/5 bg-charcoal/20 backdrop-blur-sm flex flex-col gap-3 font-mono">
              <h2 className="text-[10px] font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                System Transaction Compiler Audits
              </h2>

              <div
                ref={logsContainerRef}
                className="w-full h-32 overflow-y-auto bg-black/40 border border-white/5 rounded-lg p-3 text-[9px] text-emerald-500/90 leading-relaxed font-mono flex flex-col gap-1 select-text scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
              >
                {logs.map((log, lIdx) => (
                  <p key={lIdx} className="break-all">
                    {log}
                  </p>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "security" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-mono">
            <div className="lg:col-span-5 flex flex-col gap-6 w-full">
              
              <div className="p-6 rounded-xl border border-white/5 bg-charcoal/20 backdrop-blur-sm flex flex-col gap-5">
                <div className="flex flex-col gap-1.5 pb-4 border-b border-white/5">
                  <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-emerald-400" />
                    Security Customizer
                  </h2>
                  <p className="text-[9px] text-gray-500 uppercase">
                    Update administrative decryptor passcodes. Secured via MFA.
                  </p>
                </div>

                <form
                  onSubmit={handlePasswordChangeSubmit}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold px-1">
                      Current Decryption Key
                    </label>
                    <input
                      type="password"
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                      placeholder="••••••••••••"
                      className="h-10 px-3 bg-black/40 border border-white/5 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500/30 transition-all font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold px-1">
                      New Administrative Key
                    </label>
                    <input
                      type="password"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="••••••••••••"
                      className="h-10 px-3 bg-black/40 border border-white/5 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500/30 transition-all font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold px-1">
                      Confirm New Key
                    </label>
                    <input
                      type="password"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      placeholder="••••••••••••"
                      className="h-10 px-3 bg-black/40 border border-white/5 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500/30 transition-all font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold px-1">
                      MFA Security OTP
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength="30"
                        value={securityOtp}
                        onChange={(e) => setSecurityOtp(e.target.value)}
                        placeholder="Verification OTP"
                        className="flex-1 h-10 px-3 bg-black/40 border border-white/5 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500/30 transition-all font-mono text-center tracking-widest font-bold"
                      />
                      <button
                        type="button"
                        onClick={handleRequestSecurityOtp}
                        disabled={isGeneratingSecurityOtp}
                        className="px-3 h-10 rounded-lg border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/15 active:scale-95 text-emerald-400 text-[8px] uppercase font-bold tracking-widest transition-all cursor-pointer flex items-center justify-center shrink-0"
                      >
                        {isGeneratingSecurityOtp ? (
                          <RefreshCw className="animate-spin w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          "Get OTP"
                        )}
                      </button>
                    </div>
                  </div>

                  {passwordChangerError && (
                    <div className="p-3 border border-red-500/10 bg-red-500/5 rounded-lg flex gap-2 items-center text-[9px] text-red-400 uppercase font-bold tracking-wide font-mono">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span>{passwordChangerError}</span>
                    </div>
                  )}

                  {passwordChangerSuccess && (
                    <div className="p-3 border border-emerald-500/20 bg-emerald-500/5 rounded-lg flex gap-2 items-center text-[9px] text-emerald-400 uppercase font-bold tracking-wide font-mono">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{passwordChangerSuccess}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full h-11 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/25 active:scale-95 text-emerald-400 text-[10px] uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.02)] mt-2 font-bold"
                  >
                    Rotate Passphrase
                  </button>
                </form>
              </div>
              
              <div className="p-6 rounded-xl border border-white/5 bg-charcoal/20 backdrop-blur-sm flex flex-col gap-5">
                <div className="flex flex-col gap-1.5 pb-4 border-b border-white/5">
                  <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    Service Gateways Control
                  </h2>
                  <p className="text-[9px] text-gray-500 uppercase">
                    Manage live gateway sockets and API relay permissions.
                  </p>
                </div>

                <div className="flex flex-col gap-4 font-mono">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg bg-black/40 border border-white/5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-white font-bold uppercase">
                        Secure Mail Tunnel Relay
                      </span>
                      <span className="text-[8px] text-gray-500 uppercase">
                        Enable direct Formspark / Web3Forms API relay
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const currentVal =
                          localStorage.getItem("mail_tunnel_active") !==
                          "false";
                        localStorage.setItem("mail_tunnel_active", !currentVal);
                        setMailTunnelActive(!currentVal);
                        setLogs((prev) => [
                          ...prev,
                          `[SECURITY_EVENT] Mail Tunnel Relay set to: ${!currentVal ? "ENABLED" : "DISABLED"}`,
                        ]);
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-[8px] uppercase tracking-widest font-bold transition-all cursor-pointer ${
                        mailTunnelActive
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-red-500/10 border-red-500/30 text-red-400"
                      }`}
                    >
                      {mailTunnelActive
                        ? "ONLINE // ACTIVE"
                        : "OFFLINE // DISABLED"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-7 p-6 rounded-xl border border-white/5 bg-charcoal/20 backdrop-blur-sm flex flex-col gap-4 overflow-hidden w-full">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <div className="flex flex-col gap-1.5">
                  <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Monitor className="w-4 h-4 text-emerald-400" />
                    Active Device Telemetry Registry
                  </h2>
                  <p className="text-[9px] text-gray-500 uppercase">
                    Audited session blocks and terminal device fingerprints
                    active on this socket.
                  </p>
                </div>
                <button
                  onClick={loadSessions}
                  className="p-2 rounded bg-white/5 border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/10 text-gray-400 hover:text-emerald-400 transition-all cursor-pointer"
                  title="Refresh Registry Pools"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs font-mono border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-white/5 text-[8px] uppercase tracking-widest text-gray-500 font-bold">
                      <th className="pb-3 px-2">Session Token</th>
                      <th className="pb-3 px-2">Platform / Browser</th>
                      <th className="pb-3 px-2">Hardware Specs</th>
                      <th className="pb-3 px-2">Timestamp</th>
                      <th className="pb-3 px-2 text-right">Status / Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionsList.map((sess, idx) => {
                      const isCurrent =
                        sess.sessionId ===
                        localStorage.getItem("admin_session_id");
                      const isActive = sess.active;
                      const statusBg = isActive
                        ? "text-emerald-400 border-emerald-500/10 bg-emerald-500/5"
                        : "text-red-400 border-red-500/10 bg-red-500/5";

                      return (
                        <tr
                          key={idx}
                          className="border-b border-white/5 hover:bg-white/[0.02] transition-all"
                        >
                          <td className="py-3 px-2 font-semibold text-cyan-400">
                            {sess.sessionId}
                            {isCurrent && (
                              <span className="block text-[8px] text-gray-500 mt-0.5 uppercase font-mono font-bold">
                                
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-2">
                            <div className="text-white font-semibold text-[11px]">
                              {sess.os}
                            </div>
                            <div className="text-[9px] text-gray-500 mt-0.5 font-normal leading-none">
                              {sess.browser}
                            </div>
                          </td>
                          <td
                            className="py-3 px-2 text-[10px] max-w-[150px] truncate"
                            title={sess.gpu}
                          >
                            <div className="text-white truncate font-normal leading-normal">
                              {sess.cores}
                            </div>
                            <div className="text-[8px] text-gray-600 mt-0.5 truncate leading-none">
                              {sess.gpu}
                            </div>
                          </td>
                          <td className="py-3 px-2 text-[9px] text-gray-400">
                            <div>{sess.time}</div>
                            <div className="text-gray-600 mt-0.5">
                              {sess.date}
                            </div>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <div className="flex items-center justify-end gap-2 shrink-0">
                              <span
                                className={`px-1.5 py-0.5 border text-[7px] rounded uppercase font-bold tracking-widest ${statusBg} shrink-0`}
                              >
                                {isCurrent
                                  ? "ACTIVE // SECURED"
                                  : isActive
                                    ? "ACTIVE // NODE"
                                    : "REVOKED // NODE"}
                              </span>
                              {isActive && !isCurrent && (
                                <button
                                  onClick={() =>
                                    handleRevokeSession(sess.sessionId)
                                  }
                                  className="px-2 py-0.5 border border-red-500/30 bg-red-500/10 hover:bg-red-500/25 active:scale-95 text-red-400 text-[8px] rounded uppercase font-bold tracking-widest transition-all cursor-pointer font-mono shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.02)]"
                                >
                                  Disconnect
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "messages" && (
          <div className="p-6 rounded-xl border border-white/5 bg-charcoal/20 backdrop-blur-sm flex flex-col gap-4 overflow-hidden font-mono">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <div className="flex flex-col gap-1.5">
                <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-emerald-400" />
                  ADMINISTRATIVE COMMUNICATION OVERWATCH 
                </h2>
                <p className="text-[9px] text-gray-500 uppercase">
                  AUDITED PACKAGE TRANSFERS DISPATCHED BY SECURE ROUTING SYSTEM.
                </p>
              </div>
              <button
                onClick={loadMessages}
                className="p-2 rounded bg-white/5 border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/10 text-gray-400 hover:text-emerald-400 transition-all cursor-pointer"
                title="Refresh Inbox"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {messagesList.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
                <AlertOctagon className="w-10 h-10 text-gray-600 animate-pulse" />
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                  [ INBOX_EMPTY ]
                </p>
                <p className="text-[9px] text-gray-600 uppercase font-mono max-w-xs leading-normal">
                  Active listeners online. Waiting for cryptographic SMTP
                  handshake signals...
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  {messagesList.map((msg) => {
                    const isExpanded = expandedMessage === msg.id;

                    return (
                      <div
                        key={msg.id}
                        className="p-4 rounded-xl border border-white/5 bg-black/30 flex flex-col gap-3 transition-all hover:border-white/10"
                      >
                        
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-2 text-[9px] gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-cyan-400 font-bold">
                              {msg.id}
                            </span>
                            <span className="text-white/20">|</span>
                            <span className="text-gray-400 font-semibold uppercase">
                              From: {msg.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-500">
                            <span>{msg.date}</span>
                            <span className="text-white/20">|</span>
                            <span>{msg.time}</span>
                          </div>
                        </div>
                        
                        <div className="text-[10px] font-semibold text-emerald-400 tracking-wide select-all">
                          {msg.email}
                        </div>
                        
                        <div className="text-[11px] text-gray-300 leading-relaxed font-light whitespace-pre-wrap select-text break-words">
                          {isExpanded ? (
                            msg.message
                          ) : (
                            <>
                              {msg.message.length > 120
                                ? `${msg.message.substring(0, 120)}...`
                                : msg.message}
                            </>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5 text-[9px] uppercase tracking-wider font-bold">
                          <button
                            onClick={() =>
                              setExpandedMessage(isExpanded ? null : msg.id)
                            }
                            className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                          >
                            {isExpanded
                              ? "Collapse Buffer"
                              : "Expand Full Buffer"}
                          </button>

                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="flex items-center gap-1 text-red-500 hover:text-red-400 transition-colors cursor-pointer"
                            title="Decommission message record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Decommission</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "profile" && (
          <div className="p-6 rounded-xl border border-white/5 bg-charcoal/20 backdrop-blur-sm flex flex-col gap-6 overflow-hidden font-mono text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-white/5 gap-4">
              <div className="flex flex-col gap-1.5">
                <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5 flex-wrap">
                  <User className="w-4 h-4 text-emerald-400" />
                  CORE PROFILE CONFIGURATION REGISTRY 
                  {syncStatus === "synced" && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-bold tracking-wider animate-pulse ml-2 uppercase">
                      ✓ Saved & Synced
                    </span>
                  )}
                  {syncStatus === "saving" && (
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[8px] font-bold tracking-wider animate-pulse ml-2 uppercase flex items-center gap-1">
                      <RefreshCw className="w-2.5 h-2.5 animate-spin text-cyan-400" />
                      Syncing...
                    </span>
                  )}
                  {syncStatus === "error" && (
                    <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[8px] font-bold tracking-wider ml-2 uppercase">
                      ⚠ Sync Error (Saved Locally)
                    </span>
                  )}
                </h2>
                <p className="text-[9px] text-gray-500 uppercase">
                  EVERY EDIT IS DYNAMICALLY AUTO-SAVED IN THE BACKGROUND. NO
                  MANUAL SAVE REQUIRED.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetProfile}
                className="px-3 py-1.5 border border-red-500/30 bg-red-500/10 hover:bg-red-500/25 active:scale-95 text-red-400 text-[9px] rounded uppercase font-bold tracking-widest transition-all cursor-pointer font-mono"
              >
                Restore System Defaults
              </button>
            </div>

            
            {profileSuccessMsg && (
              <div className="p-3 border border-emerald-500/10 bg-emerald-500/5 rounded-lg flex gap-2 items-center text-[9px] text-emerald-400 uppercase font-bold tracking-wide animate-pulse">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}
            {profileErrorMsg && (
              <div className="p-3 border border-red-500/10 bg-red-500/5 rounded-lg flex gap-2 items-center text-[9px] text-red-400 uppercase font-bold tracking-wide">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>{profileErrorMsg}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveProfile();
              }}
              className="flex flex-col gap-6"
            >
              
              <div className="border border-white/5 bg-black/30 rounded-xl p-4 flex flex-col gap-4">
                <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-widest block border-b border-white/5 pb-2">
                  
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold px-1">
                      Master User Name
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                      className="h-10 px-3 bg-black/40 border border-white/5 rounded-lg text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/30 transition-all font-mono"
                      required
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold px-1">
                      System Architecture Title
                    </label>
                    <input
                      type="text"
                      value={profileData.jobTitle}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          jobTitle: e.target.value,
                        })
                      }
                      className="h-10 px-3 bg-black/40 border border-white/5 rounded-lg text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/30 transition-all font-mono"
                      required
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold px-1">
                      Location Coordinates
                    </label>
                    <input
                      type="text"
                      value={profileData.address}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          address: e.target.value,
                        })
                      }
                      className="h-10 px-3 bg-black/40 border border-white/5 rounded-lg text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/30 transition-all font-mono"
                      required
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold px-1">
                      Academic Node (Institution)
                    </label>
                    <input
                      type="text"
                      value={profileData.college}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          college: e.target.value,
                        })
                      }
                      className="h-10 px-3 bg-black/40 border border-white/5 rounded-lg text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/30 transition-all font-mono"
                      required
                    />
                  </div>

                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold px-1">
                      Web Domain Label
                    </label>
                    <input
                      type="text"
                      value={profileData.website}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          website: e.target.value,
                        })
                      }
                      className="h-10 px-3 bg-black/40 border border-white/5 rounded-lg text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/30 transition-all font-mono"
                      required
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold px-1">
                      Full Destination Endpoint URL
                    </label>
                    <input
                      type="url"
                      value={profileData.websiteUrl}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          websiteUrl: e.target.value,
                        })
                      }
                      className="h-10 px-3 bg-black/40 border border-white/5 rounded-lg text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/30 transition-all font-mono"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold px-1">
                    Biographical Overview Narrative
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) =>
                      setProfileData({ ...profileData, bio: e.target.value })
                    }
                    rows="3"
                    className="p-3 bg-black/40 border border-white/5 rounded-lg text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/30 transition-all font-mono resize-none leading-relaxed"
                    required
                  />
                </div>
              </div>
              
              <div className="border border-white/5 bg-black/30 rounded-xl p-4 flex flex-col gap-4">
                <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-widest block border-b border-white/5 pb-2">
                  
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold px-1">
                      Contact Email Node
                    </label>
                    <input
                      type="email"
                      value={profileData.email || ""}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          email: e.target.value,
                        })
                      }
                      className="h-10 px-3 bg-black/40 border border-white/5 rounded-lg text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/30 transition-all font-mono"
                      required
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold px-1">
                      Phone Coordinates
                    </label>
                    <input
                      type="text"
                      value={profileData.phoneNumber || ""}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          phoneNumber: e.target.value,
                        })
                      }
                      className="h-10 px-3 bg-black/40 border border-white/5 rounded-lg text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/30 transition-all font-mono"
                      required
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold px-1">
                      Github Endpoint URL
                    </label>
                    <input
                      type="url"
                      value={profileData.githubUrl || ""}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          githubUrl: e.target.value,
                        })
                      }
                      className="h-10 px-3 bg-black/40 border border-white/5 rounded-lg text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/30 transition-all font-mono"
                      required
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold px-1">
                      LinkedIn Endpoint URL
                    </label>
                    <input
                      type="url"
                      value={profileData.linkedinUrl || ""}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          linkedinUrl: e.target.value,
                        })
                      }
                      className="h-10 px-3 bg-black/40 border border-white/5 rounded-lg text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/30 transition-all font-mono"
                      required
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold px-1">
                      Instagram Endpoint URL
                    </label>
                    <input
                      type="url"
                      value={profileData.instagramUrl || ""}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          instagramUrl: e.target.value,
                        })
                      }
                      className="h-10 px-3 bg-black/40 border border-white/5 rounded-lg text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/30 transition-all font-mono"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="border border-white/5 bg-black/30 rounded-xl p-4 flex flex-col gap-4">
                <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-widest block border-b border-white/5 pb-2">
                  
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-black/20">
                    <div className="flex flex-col gap-0.5 text-left">
                      <span className="text-[9px] font-bold uppercase text-gray-300">Show Phone</span>
                      <span className="text-[7px] text-gray-500 uppercase">Display phone number on page</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProfileData({ ...profileData, showPhone: !profileData.showPhone })}
                      className={`w-9 h-5 rounded-full p-0.5 transition-all duration-300 ${profileData.showPhone ? "bg-emerald-500" : "bg-white/10"}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${profileData.showPhone ? "translate-x-4" : "translate-x-0"}`}></div>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-black/20">
                    <div className="flex flex-col gap-0.5 text-left">
                      <span className="text-[9px] font-bold uppercase text-gray-300">Show Email</span>
                      <span className="text-[7px] text-gray-500 uppercase">Display email node publicly</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProfileData({ ...profileData, showEmail: !profileData.showEmail })}
                      className={`w-9 h-5 rounded-full p-0.5 transition-all duration-300 ${profileData.showEmail ? "bg-emerald-500" : "bg-white/10"}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${profileData.showEmail ? "translate-x-4" : "translate-x-0"}`}></div>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-black/20">
                    <div className="flex flex-col gap-0.5 text-left">
                      <span className="text-[9px] font-bold uppercase text-gray-300">Show Resume</span>
                      <span className="text-[7px] text-gray-500 uppercase">Authorize resume access</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProfileData({ ...profileData, showResume: !profileData.showResume })}
                      className={`w-9 h-5 rounded-full p-0.5 transition-all duration-300 ${profileData.showResume ? "bg-emerald-500" : "bg-white/10"}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${profileData.showResume ? "translate-x-4" : "translate-x-0"}`}></div>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="border border-white/5 bg-black/30 rounded-xl p-4 flex flex-col gap-5">
                <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-widest block border-b border-white/5 pb-2">
                  
                </span>
                
                {uploadProgress.active && (
                  <div className="p-3 border border-cyan-500/10 bg-cyan-500/5 rounded-xl flex flex-col gap-2 font-mono text-[9px] relative">
                    <div className="flex justify-between items-center text-cyan-400 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                        Relaying File: {uploadProgress.filename}
                      </span>
                      <div className="flex items-center gap-2">
                        <span>{uploadProgress.pct}%</span>
                        <button
                          type="button"
                          onClick={handleCancelUpload}
                          className="px-1.5 py-0.5 border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-white rounded cursor-pointer transition-all leading-none font-bold uppercase text-[7px]"
                          title="Abort Upload Process"
                        >
                          Abort
                        </button>
                      </div>
                    </div>
                    <div className="w-full bg-black/40 border border-white/5 rounded-full h-2 overflow-hidden shadow-inner">
                      <div
                        className="bg-cyan-500 h-full transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                        style={{ width: `${uploadProgress.pct}%` }}
                      ></div>
                    </div>
                    <span className="text-[7.5px] text-gray-600 uppercase">
                      
                    </span>
                  </div>
                )}
                
                <div className="border border-white/5 bg-black/10 rounded-xl p-4 flex flex-col gap-4">
                  <span className="text-[7.5px] text-cyan-400 font-bold uppercase tracking-widest block border-b border-white/5 pb-2">
                    
                  </span>

                  <div className="flex flex-col md:flex-row gap-5 items-center md:items-start">
                    
                    <div className="w-24 h-24 rounded-xl overflow-hidden border border-white/10 shrink-0 relative bg-charcoal/40 flex items-center justify-center">
                      {profileData.imageUrl ? (
                        <>
                          <img
                            src={profileData.imageUrl}
                            alt="Portrait Preview"
                            className={`w-full h-full object-cover transition-opacity duration-500 ${portraitLoaded && !portraitError ? "opacity-100" : "opacity-0 absolute"}`}
                            onLoad={() => setPortraitLoaded(true)}
                            onError={() => setPortraitError(true)}
                            referrerPolicy="no-referrer"
                          />
                          {(portraitError || !portraitLoaded) && (
                            <div className="w-full h-full bg-[#0a0a0c] border border-cyan-500/20 flex flex-col items-center justify-center p-2.5 text-center relative overflow-hidden select-none">
                              
                              <div
                                className="absolute inset-0 opacity-[0.06] mix-blend-screen animate-pulse"
                                style={{
                                  backgroundImage: `
                                    linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px),
                                    linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)
                                  `,
                                  backgroundSize: "12px 12px",
                                }}
                              />
                              <div className="w-9 h-9 rounded-full border border-cyan-500/30 bg-cyan-500/5 flex items-center justify-center mb-1 shadow-[0_0_10px_rgba(6,182,212,0.1)] z-10">
                                <User className="w-4 h-4 text-cyan-400 animate-pulse" />
                              </div>
                              <span className="text-[6px] text-cyan-400 font-bold uppercase tracking-widest leading-none z-10 max-w-full truncate">
                                {portraitError ? "LOAD_ERROR" : "LOADING..."}
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full bg-[#0a0a0c] border border-white/5 flex flex-col items-center justify-center p-2.5 text-center relative overflow-hidden select-none">
                          <div
                            className="absolute inset-0 opacity-[0.03] mix-blend-screen"
                            style={{
                              backgroundImage: `
                                linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)
                              `,
                              backgroundSize: "12px 12px",
                            }}
                          />
                          <div className="w-9 h-9 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center mb-1 z-10">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <span className="text-[6px] text-gray-500 font-bold uppercase tracking-widest leading-none z-10">
                            NO_PORTRAIT
                          </span>
                        </div>
                      )}
                      <div className="absolute bottom-1 right-1 bg-black/80 text-[5.5px] text-cyan-400 font-bold px-1.5 py-0.5 rounded border border-white/10 uppercase tracking-widest z-20">
                        Preview
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-3.5 w-full">
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold px-1">
                          Portrait Image URL
                        </label>
                        <input
                          type="text"
                          value={profileData.imageUrl || ""}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              imageUrl: convertGoogleDriveUrl(e.target.value),
                            })
                          }
                          placeholder="https://ik.imagekit.io/your_id/..."
                          className="h-10 px-3 bg-black/40 border border-white/5 rounded-lg text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/30 transition-all font-mono"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold px-1">
                          Upload New Portrait
                        </label>
                        <div className="flex items-center gap-3">
                          <label className="px-4 py-2 border border-cyan-500/30 hover:border-cyan-500/50 bg-cyan-500/5 hover:bg-cyan-500/10 active:scale-95 text-cyan-400 text-[9px] uppercase font-bold tracking-widest transition-all cursor-pointer rounded-lg font-mono flex items-center gap-1.5 shadow-[0_0_10px_rgba(6,182,212,0.02)]">
                            Select Photo File
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadProgress.active}
                              onChange={(e) =>
                                handleImageKitUpload(e, "imageUrl")
                              }
                              className="hidden"
                            />
                          </label>
                          <span className="text-[7px] text-gray-500 uppercase leading-normal">
                            Max size: 3MB. Direct secure ImageKit.io upload.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border border-white/5 bg-black/10 rounded-xl p-4 flex flex-col gap-4">
                  <span className="text-[7.5px] text-cyan-400 font-bold uppercase tracking-widest block border-b border-white/5 pb-2">
                    
                  </span>

                  <div className="flex flex-col md:flex-row gap-5 items-center md:items-start">
                    
                    <div className="w-24 h-24 rounded-xl overflow-hidden border border-white/10 shrink-0 relative bg-charcoal/40 flex items-center justify-center">
                      {profileData.bgImageUrl ? (
                        <>
                          <img
                            src={profileData.bgImageUrl}
                            alt="Background Preview"
                            className={`w-full h-full object-cover transition-opacity duration-500 ${bgPreviewLoaded && !bgPreviewError ? "opacity-100" : "opacity-0 absolute"}`}
                            onLoad={() => setBgPreviewLoaded(true)}
                            onError={() => setBgPreviewError(true)}
                            referrerPolicy="no-referrer"
                          />
                          {(bgPreviewError || !bgPreviewLoaded) && (
                            <div className="w-full h-full bg-[#0a0a0c] border border-cyan-500/20 flex flex-col items-center justify-center p-2.5 text-center relative overflow-hidden select-none">
                              
                              <div
                                className="absolute inset-0 opacity-[0.06] mix-blend-screen animate-pulse"
                                style={{
                                  backgroundImage: `
                                    linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px),
                                    linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)
                                  `,
                                  backgroundSize: "12px 12px",
                                }}
                              />
                              <div className="w-9 h-9 rounded-full border border-cyan-500/30 bg-cyan-500/5 flex items-center justify-center mb-1 shadow-[0_0_10px_rgba(6,182,212,0.1)] z-10">
                                <Monitor className="w-4 h-4 text-cyan-400 animate-pulse" />
                              </div>
                              <span className="text-[6px] text-cyan-400 font-bold uppercase tracking-widest leading-none z-10 max-w-full truncate">
                                {bgPreviewError ? "LOAD_ERROR" : "LOADING..."}
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full bg-[#0a0a0c] border border-white/5 flex flex-col items-center justify-center p-2.5 text-center relative overflow-hidden select-none">
                          <div
                            className="absolute inset-0 opacity-[0.03] mix-blend-screen"
                            style={{
                              backgroundImage: `
                                linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)
                              `,
                              backgroundSize: "12px 12px",
                            }}
                          />
                          <div className="w-9 h-9 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center mb-1 z-10">
                            <Monitor className="w-4 h-4 text-gray-600" />
                          </div>
                          <span className="text-[6px] text-gray-500 font-bold uppercase tracking-widest leading-none z-10">
                            NO_BACKGROUND
                          </span>
                        </div>
                      )}
                      <div className="absolute bottom-1 right-1 bg-black/80 text-[5.5px] text-cyan-400 font-bold px-1.5 py-0.5 rounded border border-white/10 uppercase tracking-widest z-20">
                        Preview
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-3.5 w-full">
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold px-1">
                          Background Image URL
                        </label>
                        <input
                          type="text"
                          value={profileData.bgImageUrl || ""}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              bgImageUrl: convertGoogleDriveUrl(e.target.value),
                            })
                          }
                          placeholder="https://ik.imagekit.io/your_id/..."
                          className="h-10 px-3 bg-black/40 border border-white/5 rounded-lg text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/30 transition-all font-mono"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold px-1">
                          Upload New Background
                        </label>
                        <div className="flex items-center gap-3">
                          <label className="px-4 py-2 border border-cyan-500/30 hover:border-cyan-500/50 bg-cyan-500/5 hover:bg-cyan-500/10 active:scale-95 text-cyan-400 text-[9px] uppercase font-bold tracking-widest transition-all cursor-pointer rounded-lg font-mono flex items-center gap-1.5 shadow-[0_0_10px_rgba(6,182,212,0.02)]">
                            Select Background File
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadProgress.active}
                              onChange={(e) =>
                                handleImageKitUpload(e, "bgImageUrl")
                              }
                              className="hidden"
                            />
                          </label>
                          <span className="text-[7px] text-gray-500 uppercase leading-normal">
                            Max size: 3MB. Direct secure ImageKit.io upload.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border border-white/5 bg-black/10 rounded-xl p-4 flex flex-col gap-4">
                  <span className="text-[7.5px] text-pink-400 font-bold uppercase tracking-widest block border-b border-white/5 pb-2">
                    
                  </span>

                  <div className="flex flex-col md:flex-row gap-5 items-center md:items-start">
                    
                    <div className="w-24 h-24 rounded-xl overflow-hidden border border-white/10 shrink-0 relative bg-charcoal/40 flex flex-col items-center justify-center p-3 text-center gap-1.5">
                      <FileText
                        className={`w-8 h-8 ${profileData.resumeUrl ? "text-pink-400" : "text-gray-600 animate-pulse"}`}
                      />
                      <span className="text-[7px] uppercase font-black tracking-widest">
                        {profileData.resumeUrl ? "DOC_MOUNTED" : "NO_DOCUMENT"}
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col gap-3.5 w-full">
                      
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center px-1">
                          <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold">
                            Resume Document PDF URL
                          </label>
                          {profileData.resumeUrl && (
                            <a
                              href={profileData.resumeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[7.5px] text-pink-400 hover:underline uppercase font-bold tracking-widest flex items-center gap-1"
                            >
                              Open Resume{" "}
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                        <input
                          type="text"
                          value={profileData.resumeUrl || ""}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              resumeUrl: convertGoogleDriveUrl(e.target.value),
                            })
                          }
                          placeholder="https://ik.imagekit.io/your_id/..."
                          className="h-10 px-3 bg-black/40 border border-white/5 rounded-lg text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-pink-500/30 transition-all font-mono"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold px-1">
                          Upload New Resume Document (PDF)
                        </label>
                        <div className="flex items-center gap-3">
                          <label className="px-4 py-2 border border-pink-500/30 hover:border-pink-500/50 bg-pink-500/5 hover:bg-pink-500/10 active:scale-95 text-pink-400 text-[9px] uppercase font-bold tracking-widest transition-all cursor-pointer rounded-lg font-mono flex items-center gap-1.5 shadow-[0_0_10px_rgba(236,72,153,0.02)]">
                            Select Resume (PDF)
                            <input
                              type="file"
                              accept="application/pdf"
                              disabled={uploadProgress.active}
                              onChange={(e) =>
                                handleImageKitUpload(e, "resumeUrl")
                              }
                              className="hidden"
                            />
                          </label>
                          <span className="text-[7px] text-gray-500 uppercase leading-normal">
                            Max size: 5MB. Direct secure ImageKit.io upload.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border border-white/5 bg-black/10 rounded-xl p-4 flex flex-col gap-4">
                  <span className="text-[7.5px] text-emerald-400 font-bold uppercase tracking-widest block border-b border-white/5 pb-2">
                    Open Graph (OG) Share Settings [SEO]
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold px-1">
                        OG Share Title
                      </label>
                      <input
                        type="text"
                        value={profileData.ogTitle || ""}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            ogTitle: e.target.value,
                          })
                        }
                        placeholder="e.g. Subhendu Prasad - Systems Architect"
                        className="h-10 px-3 bg-black/40 border border-white/5 rounded-lg text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/30 transition-all font-mono"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold px-1">
                        OG Share Description
                      </label>
                      <input
                        type="text"
                        value={profileData.ogDescription || ""}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            ogDescription: e.target.value,
                          })
                        }
                        placeholder="e.g. Portfolio page of systems engineer Subhendu Hembram"
                        className="h-10 px-3 bg-black/40 border border-white/5 rounded-lg text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/30 transition-all font-mono"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-5 items-center md:items-start pt-2 border-t border-white/5">
                    
                    <div className="w-24 h-24 rounded-xl overflow-hidden border border-white/10 shrink-0 relative bg-charcoal/40 flex items-center justify-center">
                      {profileData.ogImageUrl ? (
                        <>
                          <img
                            src={profileData.ogImageUrl}
                            alt="OG Share Preview"
                            className={`w-full h-full object-cover transition-opacity duration-500 ${ogPreviewLoaded && !ogPreviewError ? "opacity-100" : "opacity-0 absolute"}`}
                            onLoad={() => setOgPreviewLoaded(true)}
                            onError={() => setOgPreviewError(true)}
                            referrerPolicy="no-referrer"
                          />
                          {(ogPreviewError || !ogPreviewLoaded) && (
                            <div className="w-full h-full bg-[#0a0a0c] border border-emerald-500/20 flex flex-col items-center justify-center p-2.5 text-center relative overflow-hidden select-none">
                              <div
                                className="absolute inset-0 opacity-[0.06] mix-blend-screen animate-pulse"
                                style={{
                                  backgroundImage: `
                                    linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px),
                                    linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)
                                  `,
                                  backgroundSize: "12px 12px",
                                }}
                              />
                              <div className="w-9 h-9 rounded-full border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-center mb-1 shadow-[0_0_10px_rgba(16,185,129,0.1)] z-10">
                                <Globe className="w-4 h-4 text-emerald-400 animate-pulse" />
                              </div>
                              <span className="text-[6px] text-emerald-400 font-bold uppercase tracking-widest leading-none z-10 max-w-full truncate">
                                {ogPreviewError ? "LOAD_ERROR" : "LOADING..."}
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full bg-[#0a0a0c] border border-white/5 flex flex-col items-center justify-center p-2.5 text-center relative overflow-hidden select-none">
                          <div
                            className="absolute inset-0 opacity-[0.03] mix-blend-screen"
                            style={{
                              backgroundImage: `
                                linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)
                              `,
                              backgroundSize: "12px 12px",
                            }}
                          />
                          <div className="w-9 h-9 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center mb-1 z-10">
                            <Globe className="w-4 h-4 text-gray-600" />
                          </div>
                          <span className="text-[6px] text-gray-500 font-bold uppercase tracking-widest leading-none z-10">
                            NO_OG_IMAGE
                          </span>
                        </div>
                      )}
                      <div className="absolute bottom-1 right-1 bg-black/80 text-[5.5px] text-emerald-400 font-bold px-1.5 py-0.5 rounded border border-white/10 uppercase tracking-widest z-20">
                        Preview
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-3.5 w-full">
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold px-1">
                          OG Share Image URL
                        </label>
                        <input
                          type="text"
                          value={profileData.ogImageUrl || ""}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              ogImageUrl: convertGoogleDriveUrl(e.target.value),
                            })
                          }
                          placeholder="https://ik.imagekit.io/your_id/..."
                          className="h-10 px-3 bg-black/40 border border-white/5 rounded-lg text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/30 transition-all font-mono"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold px-1">
                          Upload New OG Share Image
                        </label>
                        <div className="flex items-center gap-3">
                          <label className="px-4 py-2 border border-emerald-500/30 hover:border-emerald-500/50 bg-emerald-500/5 hover:bg-emerald-500/10 active:scale-95 text-emerald-400 text-[9px] uppercase font-bold tracking-widest transition-all cursor-pointer rounded-lg font-mono flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.02)]">
                            Select OG Image File
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadProgress.active}
                              onChange={(e) =>
                                handleImageKitUpload(e, "ogImageUrl")
                              }
                              className="hidden"
                            />
                          </label>
                          <span className="text-[7px] text-gray-500 uppercase leading-normal">
                            Max size: 3MB. Direct secure ImageKit.io upload.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border border-white/5 bg-black/30 rounded-xl p-4 flex flex-col gap-4">
                <span className="text-[8px] text-orange-400 font-bold uppercase tracking-widest block border-b border-white/5 pb-2">
                  
                </span>

                <div className="flex flex-col gap-3">
                  
                  <div className="flex flex-wrap gap-2 p-3 bg-black/20 border border-white/5 rounded-xl min-h-[50px]">
                    {(profileData.capabilities || []).map((tech, idx) => (
                      <span
                        key={idx}
                        className="pl-2.5 pr-1 py-1 border border-cyan-500/10 bg-cyan-500/5 text-cyan-300 text-[8px] rounded uppercase font-bold tracking-widest shadow-inner flex items-center gap-1.5 hover:border-red-500/30 hover:text-red-400 transition-colors group cursor-pointer"
                        onClick={() => handleRemoveCapability(tech)}
                        title={`Remove tag: ${tech}`}
                      >
                        {tech}
                        <span className="p-0.5 rounded bg-black/40 text-gray-500 group-hover:text-red-400 transition-colors text-[8px] font-sans">
                          ×
                        </span>
                      </span>
                    ))}
                    {(profileData.capabilities || []).length === 0 && (
                      <span className="text-[8px] text-gray-600 uppercase m-auto font-sans font-bold">
                        
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={newCapInput}
                      onChange={(e) => setNewCapInput(e.target.value)}
                      placeholder="e.g. Next.js, Rust, Docker"
                      className="h-10 px-3 bg-black/40 border border-white/5 rounded-lg text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/30 transition-all font-mono flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCapability();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCapability}
                      className="px-4 h-10 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/25 active:scale-95 text-emerald-400 text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer rounded-lg font-mono flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.02)]"
                    >
                      Add Tag
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="border border-white/5 bg-black/30 rounded-xl p-4 flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-[8px] text-pink-400 font-bold uppercase tracking-widest block">
                    
                  </span>
                  <button
                    type="button"
                    onClick={handleAddExperience}
                    className="flex items-center gap-1.5 px-3 py-1 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/25 active:scale-95 text-emerald-400 text-[8px] rounded uppercase font-bold tracking-widest transition-all cursor-pointer font-mono shadow-[0_0_10px_rgba(16,185,129,0.02)]"
                  >
                    <Plus className="w-3 h-3 text-emerald-400 shrink-0" />
                    Add Experience Log
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {(profileData.experiences || []).map((exp, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border flex flex-col gap-4 transition-all relative ${
                        exp.isPresent
                          ? "bg-emerald-500/[0.02] border-emerald-500/15 shadow-[0_0_15px_rgba(16,185,129,0.02)]"
                          : "bg-charcoal/20 border-white/5"
                      }`}
                    >
                      
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(idx)}
                        className="absolute top-4 right-4 p-1.5 rounded bg-white/5 border border-white/5 hover:border-red-500/30 hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all cursor-pointer shrink-0"
                        title="Remove experience log item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-black/40 border border-white/10 rounded text-[7px] text-gray-400 uppercase font-mono font-bold leading-none">
                          Log Entry #{idx + 1}
                        </span>
                        {exp.isPresent && (
                          <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[7px] text-emerald-400 uppercase font-mono font-bold leading-none animate-pulse">
                            Active Node
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold px-1">
                            Position / Role Title
                          </label>
                          <input
                            type="text"
                            value={exp.role}
                            onChange={(e) =>
                              handleUpdateExperience(
                                idx,
                                "role",
                                e.target.value,
                              )
                            }
                            placeholder="Software Development Intern"
                            className="h-10 px-3 bg-black/40 border border-white/5 rounded-lg text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/30 transition-all font-mono"
                            required
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold px-1">
                            Company / Node Name
                          </label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) =>
                              handleUpdateExperience(
                                idx,
                                "company",
                                e.target.value,
                              )
                            }
                            placeholder="Research & Development Node"
                            className="h-10 px-3 bg-black/40 border border-white/5 rounded-lg text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/30 transition-all font-mono"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold px-1">
                            Duration / Dates Range
                          </label>
                          <input
                            type="text"
                            value={exp.duration}
                            onChange={(e) =>
                              handleUpdateExperience(
                                idx,
                                "duration",
                                e.target.value,
                              )
                            }
                            placeholder="Present // e.g. 2021 - 2025"
                            className="h-10 px-3 bg-black/40 border border-white/5 rounded-lg text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/30 transition-all font-mono"
                            required
                          />
                        </div>

                        <div className="flex items-center gap-2.5 mt-4 md:mt-2.5 px-1">
                          <input
                            type="checkbox"
                            checked={exp.isPresent}
                            id={`isPresent-${idx}`}
                            onChange={(e) =>
                              handleUpdateExperience(
                                idx,
                                "isPresent",
                                e.target.checked,
                              )
                            }
                            className="w-4 h-4 accent-emerald-500 rounded border-white/5 bg-black/40 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                          />
                          <label
                            htmlFor={`isPresent-${idx}`}
                            className="text-[9px] uppercase tracking-widest text-gray-400 font-bold select-none cursor-pointer"
                          >
                            Mark as Current Active Node (isPresent)
                          </label>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold px-1">
                          Position Responsibilities Description
                        </label>
                        <textarea
                          value={exp.desc}
                          onChange={(e) =>
                            handleUpdateExperience(idx, "desc", e.target.value)
                          }
                          rows="2"
                          placeholder="Describe C++ optimizations, Redis clustering details..."
                          className="p-3 bg-black/40 border border-white/5 rounded-lg text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/30 transition-all font-mono resize-none leading-relaxed"
                          required
                        />
                      </div>
                    </div>
                  ))}
                  {(profileData.experiences || []).length === 0 && (
                    <div className="py-8 border border-dashed border-white/5 rounded-xl text-center flex flex-col items-center justify-center text-gray-600 gap-1.5">
                      <AlertOctagon className="w-6 h-6 text-gray-700 animate-pulse" />
                      <span className="text-[8px] uppercase tracking-widest font-black font-mono">
                        [ EXPERIENCE_LOG_EMPTY ]
                      </span>
                      <span className="text-[8px] uppercase font-sans font-semibold">
                        Tapping the "Add Experience Log" button above to
                        register career milestones.
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-4 border-t border-white/5 pt-4">
                <button
                  type="submit"
                  disabled={syncStatus === "saving"}
                  className={`w-full sm:w-auto px-6 h-11 rounded-lg border text-[10px] uppercase font-black tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2.5 relative overflow-hidden group ${
                    syncStatus === "saving"
                      ? "border-cyan-500/30 bg-cyan-500/5 text-cyan-400 cursor-not-allowed"
                      : syncStatus === "error"
                        ? "border-red-500/30 bg-red-500/5 text-red-400"
                        : "border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.05)]"
                  }`}
                >
                  {syncStatus === "saving" ? (
                    <>
                      <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                      <span>Syncing in Background...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Force Database Sync</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      
      {isModalOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-[550px] bg-[#121010] border border-white/5 rounded-2xl relative shadow-[0_30px_60px_rgba(0,0,0,0.9)] max-h-[90vh] flex flex-col">
            
            <div className="absolute inset-0 rounded-2xl border border-emerald-500/10 pointer-events-none"></div>
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                {editingProject
                  ? `Config: ${editingProject.projectName}`
                  : "Compile New Service Core"}
              </h3>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            
            <form
              onSubmit={handleFormSubmit}
              className="flex-1 overflow-y-auto p-6 flex flex-col gap-4"
            >
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold px-1">
                  Service Core Identifier Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Distributed Storage Registry"
                  className="h-10 px-3 bg-black/40 border border-white/5 rounded-lg text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/30 transition-all font-mono"
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold px-1">
                  Technologies (Comma-separated)
                </label>
                <input
                  type="text"
                  value={langs}
                  onChange={(e) => setLangs(e.target.value)}
                  placeholder="React, Node.js, Express"
                  className="h-10 px-3 bg-black/40 border border-white/5 rounded-lg text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/30 transition-all font-mono"
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold px-1">
                  Deployment Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-10 px-3 bg-black/40 border border-white/5 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500/30 transition-all font-mono appearance-none"
                  style={{
                    backgroundImage:
                      "linear-gradient(45deg, transparent 50%, gray 50%), linear-gradient(135deg, gray 50%, transparent 50%)",
                    backgroundPosition:
                      "calc(100% - 20px) calc(1em + 2px), calc(100% - 15px) calc(1em + 2px)",
                    backgroundSize: "5px 5px, 5px 5px",
                    backgroundRepeat: "no-repeat",
                  }}
                >
                  <option
                    value="live"
                    className="bg-[#121010] text-emerald-400"
                  >
                    ONLINE 
                  </option>
                  <option
                    value="developed"
                    className="bg-[#121010] text-cyan-400"
                  >
                    STABLE 
                  </option>
                </select>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold px-1">
                  Service Node Architecture Description
                </label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows="3"
                  placeholder="Describe your server thread allocations, write speeds, concurrency..."
                  className="p-3 bg-black/40 border border-white/5 rounded-lg text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/30 transition-all font-mono resize-none leading-relaxed"
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold px-1">
                  Performance Specifications (Key:Value Comma-separated)
                </label>
                <input
                  type="text"
                  value={statsInput}
                  onChange={(e) => setStatsInput(e.target.value)}
                  placeholder="latency:0.18ms, throughput:150K, concurrent:5K+"
                  className="h-10 px-3 bg-black/40 border border-white/5 rounded-lg text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/30 transition-all font-mono"
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold px-1">
                  Repository Link (GIT_REPO)
                </label>
                <input
                  type="url"
                  value={codeUrl}
                  onChange={(e) => setCodeUrl(e.target.value)}
                  placeholder="https://github.com/subhenduprasad/..."
                  className="h-10 px-3 bg-black/40 border border-white/5 rounded-lg text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/30 transition-all font-mono"
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[8px] uppercase tracking-widest text-gray-500 font-bold px-1">
                  Launch Endpoint (SYS_LAUNCH)
                </label>
                <input
                  type="url"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://subhenduhembram.dev/..."
                  className="h-10 px-3 bg-black/40 border border-white/5 rounded-lg text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/30 transition-all font-mono"
                />
              </div>
              
              {formError && (
                <div className="p-3 border border-red-500/10 bg-red-500/5 rounded-lg flex gap-2 items-center text-[9px] text-red-400 uppercase font-bold tracking-wide">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              
              <div className="flex justify-end gap-3 mt-4 border-t border-white/5 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 h-9 rounded-lg border border-white/5 hover:bg-white/5 text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer text-gray-400 hover:text-white"
                >
                  Terminate
                </button>
                <button
                  type="submit"
                  className="px-4 h-9 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/25 active:scale-95 text-emerald-400 text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.02)]"
                >
                  Deploy Stack
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
