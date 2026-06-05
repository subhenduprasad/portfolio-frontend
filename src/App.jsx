import { useState, useEffect } from "react";
import Intro from "./components/Intro";
import Hero from "./sections/Hero";
import Navbar from "./components/Navbar";
import Timeline from "./sections/Timeline";
import Skills from "./sections/Skills";
import Contact from "./sections/Contact";
import Projects from "./sections/Projects";
import About from "./sections/About";
import SmoothScroll from "./components/SmoothScroll";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import { projects, defaultProfile } from "./utils/constants";
import { api } from "./utils/api";
import ContextMenu from "./components/ContextMenu";

const getInitialProjects = () => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("portfolio_projects");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to parse stored projects", e);
  }
  localStorage.setItem("portfolio_projects", JSON.stringify(projects));
  return projects;
};

const mapProfileExperiences = (profile) => {
  if (!profile) return profile;
  let updated = { ...profile };

  if (!updated.address || updated.address === "Bhubaneswar, India") {
    updated.address = "Mayurbhanj, India";
  }
  if (!updated.college || updated.college === "IIT Bhubaneswar") {
    updated.college = "GIFT Autonomous";
  }

  if (Array.isArray(updated.experiences)) {
    updated.experiences = updated.experiences.map(exp => {
      let updatedExp = { ...exp };
      if (updatedExp.company === "IIT Bhubaneswar") {
        updatedExp.company = "GIFT Autonomous";
      }
      if (updatedExp.company === "GIFT Autonomous" && updatedExp.role === "B.Tech in Computer Science") {
        updatedExp.desc = "Completed B.Tech in Computer Science from GIFT Autonomous, developing expertise in Database Systems, Operating Systems, and TOC. Actively engaged in building real-world projects using the MERN Stack and modern development practices.";
      }
      
      const rLower = (updatedExp.role || "").toLowerCase().trim();
      if (rLower === "independent developer" || rLower === "independent systems & full stack engineer" || rLower === "independent systems & full stack dev") {
        updatedExp.role = "Software Engineer (Independent Projects)";
        updatedExp.company = "";
        updatedExp.duration = "2021 – Present";
      }

      const dUpper = (updatedExp.duration || "").toUpperCase().trim();
      if (dUpper.includes("PRESENT") || dUpper.includes("ACTIVE")) {
        updatedExp.duration = "2021 – Present";
      }
      return updatedExp;
    });
  }
  return updated;
};

const getInitialProfile = () => {
  if (typeof window === "undefined") return mapProfileExperiences(defaultProfile);
  try {
    const stored = localStorage.getItem("portfolio_profile");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === "object") {
        if (parsed.college === "IIT Bhubaneswar") parsed.college = "GIFT Autonomous";
        if (parsed.address === "Bhubaneswar, India") parsed.address = "Mayurbhanj, India";
        return mapProfileExperiences(parsed);
      }
    }
  } catch (e) {
    console.error("Failed to parse stored profile", e);
  }
  return mapProfileExperiences(defaultProfile);
};

export default function App() {
  const [done, setDone] = useState(false);
  const [view, setView] = useState("portfolio"); 
  const [projectsList, setProjectsList] = useState(getInitialProjects());
  const [profileData, setProfileData] = useState(getInitialProfile());
  const [apiStatus, setApiStatus] = useState("ONLINE");

  useEffect(() => {
    const checkHealth = async () => {
      const status = await api.checkHealth();
      setApiStatus(status);
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cacheTime = localStorage.getItem("portfolio_cache_timestamp");
    if (cacheTime) {
      const ageHrs = (Date.now() - parseInt(cacheTime)) / (1000 * 60 * 60);
      console.log(`[SYSTEM] Local cache age: ${ageHrs.toFixed(2)} hours. (${ageHrs < 24 ? "FRESH_CACHE" : "OLD_CACHE"})`);
    } else {
      console.log("[SYSTEM] No local cache timestamp detected. Initializing...");
      localStorage.setItem("portfolio_cache_timestamp", Date.now().toString());
    }
  }, []);

  useEffect(() => {
    const checkAdminSession = async () => {
      const token = localStorage.getItem("admin_token");
      if (token) {
        try {
          const verify = await api.verifySession(token);
          if (verify.success && verify.active) {
            setView("admin");
          } else {
            localStorage.removeItem("admin_token");
            setView("portfolio");
          }
        } catch (e) {
          console.error("Session validation on startup failed:", e);
          setView("portfolio");
        }
      } else {
        setView("portfolio");
      }
    };
    checkAdminSession();
  }, [apiStatus]);

  useEffect(() => {
    const loadDynamicData = async () => {
      if (apiStatus === "ONLINE") {
        try {
          const data = await api.fetchPortfolioData();
          if (data.profile) {
            setProfileData((prev) => {
              const updated = mapProfileExperiences({ ...prev, ...data.profile });
              localStorage.setItem("portfolio_profile", JSON.stringify(updated));
              return updated;
            });
          }
          if (data.projects) {
            const list = Array.isArray(data.projects.list)
              ? data.projects.list
              : Array.isArray(data.projects)
              ? data.projects
              : null;
            if (list && list.length > 0) {
              setProjectsList(list);
              localStorage.setItem("portfolio_projects", JSON.stringify(list));
            }
          }

          localStorage.setItem("portfolio_cache_timestamp", Date.now().toString());
        } catch (err) {
          console.error("Failed to load portfolio dynamic data:", err);
        }
      }
    };
    loadDynamicData();
  }, [apiStatus]);

  
  useEffect(() => {
    if (!profileData) return;

    const updateMetaTag = (property, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const updateMetaName = (name, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    if (profileData.ogTitle) {
      document.title = profileData.ogTitle;
    }

    updateMetaTag("og:title", profileData.ogTitle || "Subhendu Prasad Hembram");
    updateMetaTag("og:description", profileData.ogDescription || profileData.bio || "Systems & Backend Engineer");
    updateMetaTag("og:image", profileData.ogImageUrl || profileData.imageUrl);

    updateMetaName("description", profileData.ogDescription || profileData.bio || "Systems & Backend Engineer");
  }, [profileData]);

  return (
    <>
      <ContextMenu apiStatus={apiStatus} />
      {!done && <Intro onFinish={() => setDone(true)} />}

      {view === "portfolio" ? (
        <div className={`transition-opacity duration-700 ${done ? "opacity-100" : "opacity-0"}`}>
          <Navbar profile={profileData} apiStatus={apiStatus} />
          <SmoothScroll>
            <Hero projects={projectsList} profile={profileData} onAdminSuccess={() => setView("admin-login")} />
            <About profile={profileData} projects={projectsList} />
            <Projects projects={projectsList} />
            <Skills />
          </SmoothScroll>
          <Timeline />
          <Contact profile={profileData} />
        </div>
      ) : view === "admin-login" ? (
        <AdminLogin apiStatus={apiStatus} onBack={() => setView("portfolio")} onLoginSuccess={() => setView("admin")} />
      ) : (
        <AdminDashboard 
          apiStatus={apiStatus}
          projects={projectsList} 
          setProjects={setProjectsList} 
          profile={profileData}
          setProfile={setProfileData}
          onLogout={() => setView("portfolio")} 
        />
      )}
    </>
  );
}