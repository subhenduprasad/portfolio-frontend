const mobileNumber = `+91 123456789`;

export const navData = [
  { label: "Projects", path: "#projects" },
  { label: "Skills", path: "#skills" },
  { label: "Experience", path: "#experiences" },
  { label: "About", path: "#about" },
  { label: "Contact", path: "#contact" },
];

export const titleData = [
  { role: "Backend Architect", id: "title-1" },
  { role: "Systems Engineer", id: "title-2" },
  { role: "C++ & Fullstack Dev", id: "title-3" },
];

export const skills = [
  
  {
    skill: "C++",
    type: "development",
    icon: "https://images.seeklogo.com/logo-png/24/1/c-logo-png_seeklogo-249774.png",
    origin: "https://isocpp.org/",
    level: "Proficient",
    logInfo: "[C++] GCC 14.1 linked. Pointers, multi-threading, custom memory pooling, STL algorithms initialized."
  },
  {
    skill: "Nodejs",
    type: "development",
    icon: "https://images.seeklogo.com/logo-png/27/1/node-js-logo-png_seeklogo-273749.png",
    origin: "https://nodejs.org/",
    level: "Proficient",
    logInfo: "[NodeJS] V8 runtime online. Async non-blocking Event Loop running smoothly. Cluster modules active."
  },
  {
    skill: "Expressjs",
    type: "development",
    icon: "https://images.seeklogo.com/logo-png/27/1/express-logo-png_seeklogo-273075.png",
    origin: "https://expressjs.com/",
    level: "Proficient",
    logInfo: "[Express] REST API router online. Middlewares, error boundaries, rate-limit controllers compiled."
  },
  {
    skill: "TypeScript",
    type: "development",
    icon: "https://images.seeklogo.com/logo-png/52/1/typescript-logo-png_seeklogo-526730.png",
    origin: "https://typescriptlang.org/",
    level: "Advanced",
    logInfo: "[TypeScript] Static compiler initialized. Strictly-typed system architecture rules validated."
  },

  
  {
    skill: "Mongodb",
    type: "database",
    icon: "https://images.seeklogo.com/logo-png/50/1/mongodb-icon-logo-png_seeklogo-503274.png",
    origin: "https://mongodb.com/",
    level: "Proficient",
    logInfo: "[MongoDB] Replica set pooled. JSON document pipelines, custom indexes, BSON aggregations ready."
  },
  {
    skill: "MySQL",
    type: "database",
    icon: "https://images.seeklogo.com/logo-png/9/1/mysql-logo-png_seeklogo-96578.png",
    origin: "https://mysql.com/",
    level: "Proficient",
    logInfo: "[MySQL] InnoDB engine initialized. Normalized relations, dynamic query optimization active."
  },
  {
    skill: "Github",
    type: "development",
    icon: "https://images.seeklogo.com/logo-png/30/1/github-logo-png_seeklogo-304612.png",
    origin: "https://github.com/subhenduprasad/",
    level: "Proficient",
    logInfo: "[Git/GitHub] Version Control operational. CI/CD actions, hooks, and branching pipeline loaded."
  },

  
  {
    skill: "Reactjs",
    type: "frontend",
    icon: "https://images.seeklogo.com/logo-png/27/1/react-logo-png_seeklogo-273845.png",
    origin: "https://react.dev/",
    level: "Proficient",
    logInfo: "[React] Virtual DOM initialized. Hydration complete, state reconciliation and Fiber thread running."
  },
  {
    skill: "Tailwindcss",
    type: "frontend",
    icon: "https://images.seeklogo.com/logo-png/35/1/tailwind-css-logo-png_seeklogo-354675.png",
    origin: "https://tailwindcss.com/",
    level: "Proficient",
    logInfo: "[Tailwind v4] Utility class compiler loaded. JIT styles injected into active DOM tree."
  },
  {
    skill: "Redux",
    type: "frontend",
    icon: "https://images.seeklogo.com/logo-png/28/1/redux-logo-png_seeklogo-284335.png",
    origin: "https://redux.js.org/",
    level: "Advanced",
    logInfo: "[Redux] Global store connected. Action dispatched, immutable state tree synchronized."
  },
  {
    skill: "Threejs",
    type: "frontend",
    icon: "https://images.seeklogo.com/logo-png/43/1/three-js-logo-png_seeklogo-431124.png",
    origin: "https://threejs.org/",
    level: "Advanced",
    logInfo: "[ThreeJS] WebGL2 Renderer configured. Shaders compiled, vector geometry cached."
  },
  {
    skill: "gsap",
    type: "frontend",
    icon: "https://images.seeklogo.com/logo-png/44/1/greensock-gsap-icon-logo-png_seeklogo-448110.png",
    origin: "https://gsap.com/",
    level: "Proficient",
    logInfo: "[GSAP] Core engine active. ScrollTrigger, lag smoothing, high-frequency tick scheduler operational."
  },
  {
    skill: "motion",
    type: "frontend",
    icon: "https://images.seeklogo.com/logo-png/58/1/framer-icon-logo-png_seeklogo-586477.png",
    origin: "https://motion.dev/",
    level: "Proficient",
    logInfo: "[Motion] Spring animations synchronized. Hardware accelerated CSS layout transitions active."
  },

  
  {
    skill: "Blender",
    type: "creative",
    icon: "https://images.seeklogo.com/logo-png/39/1/blender-logo-png_seeklogo-394263.png",
    origin: "https://blender.org/",
    level: "Advanced",
    logInfo: "[Blender] EEVEE rendering pipeline configured. 3D meshes and UV coordinates mapping."
  },
  {
    skill: "Illustrator",
    type: "creative",
    icon: "https://images.seeklogo.com/logo-png/38/1/adobe-illustrator-logo-png_seeklogo-380559.png",
    origin: "https://adobe.com/illustrator",
    level: "Advanced",
    logInfo: "[Illustrator] Vector path engines running. Canvas dimensions and resolution scales ready."
  },
  {
    skill: "Photoshop",
    type: "creative",
    icon: "https://images.seeklogo.com/logo-png/38/1/adobe-photoshop-logo-png_seeklogo-380560.png",
    origin: "https://adobe.com/photoshop",
    level: "Advanced",
    logInfo: "[Photoshop] Multi-layered canvas operational. Rasterized filters and color space mapped."
  },
  {
    skill: "Davinci Resolve",
    type: "creative",
    icon: "https://images.seeklogo.com/logo-png/44/1/davinci-resolve-logo-png_seeklogo-443231.png",
    origin: "https://blackmagicdesign.com",
    level: "Advanced",
    logInfo: "[DaVinci] Hardware acceleration online. Video encoding, dynamic ranges, audio sync active."
  },
  {
    skill: "Figma",
    type: "creative",
    icon: "https://images.seeklogo.com/logo-png/33/1/figma-logo-png_seeklogo-332042.png",
    origin: "https://figma.com/",
    level: "Advanced",
    logInfo: "[Figma] Responsive mockups and prototypes synchronized. Vector elements compiled."
  }
];

export const projects = [
  {
    projectName: "Adaptive Code Judge",
    languages: ["React", "Node.js", "Express.js", "Sandboxed Runner"],
    status: "live",
    description: "An adaptive, scalable online code judging platform designed to evaluate programming solutions securely and efficiently. Built with a client-server-executor architecture supporting sandboxed code execution, role-based workflows, and real-time verdicts (AC/WA/TLE/RTE).",
    stats: { latency: "0.22ms", throughput: "1K req/s", concurrent: "800+" },
    links: { code: "https://github.com/subhenduprasad/Adaptive-Code-Judge", demo: "https://github.com/subhenduprasad/Adaptive-Code-Judge" }
  },
  {
    projectName: "NextHire (SmartHire Job Portal)",
    languages: ["React", "Node.js", "MongoDB", "Express", "Socket.IO", "TailwindCSS"],
    status: "live",
    description: "A comprehensive full-stack job portal web application connecting candidates, employers, coordinators, and recruiters. Features role-based dashboards, resume parsing queues, real-time messaging via Socket.IO, structured feedback, and email verification.",
    stats: { latency: "38ms", throughput: "1.2K req/s", concurrent: "2K+" },
    links: { code: "https://github.com/subhenduprasad/NextHire", demo: "https://github.com/subhenduprasad/NextHire" }
  },
  {
    projectName: "Mini Database Engine",
    languages: ["C++", "File Storage", "DBMS Internals"],
    status: "developed",
    description: "A lightweight C++ database engine supporting basic SQL operations, custom file-based storage, data serialization, indexing, and record management.",
    stats: { storage: "File-Based", operations: "CRUD", indexing: "Custom" },
    links: { code: "https://github.com/subhenduprasad/Mini-Database-Engine", demo: "https://github.com/subhenduprasad/Mini-Database-Engine" }
  },
  {
    projectName: "Chat Application",
    languages: ["C++", "Socket Programming", "Threads"],
    status: "developed",
    description: "A socket-based chat system developed in C++ featuring real-time communication, multi-client support, and concurrent connection handling.",
    stats: { protocol: "TCP", communication: "Real-Time", concurrency: "Multi-Client" },
    links: { code: "https://github.com/subhenduprasad/Chat-Application", demo: "https://github.com/subhenduprasad/Chat-Application" }
  }
];

export const contactDetails = {
  myName: "Subhendu Prasad Hembram",
  email: import.meta.env.VITE_ADMIN_EMAIL,
  phoneNumber: mobileNumber,
  webpage: "subhenduhembram.dev",
  social: {
    linkedIn: "https://www.linkedin.com/in/subhendu-prasad-hembram",
    github: "https://github.com/subhenduprasad",
    instagram: "https://www.instagram.com/subhendu_45_",
  },
};

export const defaultProfile = {
  name: "Subhendu Prasad Hembram",
  jobTitle: "Systems & Backend Engineer",
  address: "Mayurbhanj, Odisha, India",
  college: "GIFT Autonomous",
  website: "subhenduhembram.dev",
  websiteUrl: "https://subhenduhembram.dev",
  imageUrl: "https://ik.imagekit.io/wydlez00d/portfolio/Subhendu_Prasad_7Vw9ILVO-.png?updatedAt=1780331248940",
  bgImageUrl: "https://ik.imagekit.io/wydlez00d/Subhendu-bg.png?updatedAt=1780485660988",
  resumeUrl: "",
  bio: "I am a Computer Science student passionate about backend development, systems programming, and software architecture. I enjoy solving complex problems, exploring low-level concepts, and building practical applications ranging from distributed systems and database engines to full-stack platforms. I am constantly learning, experimenting, and refining my skills to become a strong software engineer.",
  experiences: [
    {
      role: "Software Engineer (Independent Projects)",
      company: "Personal Projects & Continuous Learning",
      duration: "2021 - Present",
      desc: "Passionate about understanding how software works under the hood. Building projects, exploring backend systems, and continuously learning through hands-on development and problem solving.",
      isPresent: true
    },
    {
      role: "B.Tech in Computer Science",
      company: "GIFT Autonomous",
      duration: "2021 - 2025",
      desc: "Completed B.Tech in Computer Science from GIFT Autonomous, developing expertise in Database Systems, Operating Systems, and TOC. Actively engaged in building real-world projects using the MERN Stack and modern development practices.",
      isPresent: false
    }
  ],
  capabilities: ["C++", "React.js", "Node.js", "Express", "TypeScript", "MongoDB", "MySQL", "REST APIs"]
};

