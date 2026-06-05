import { jsPDF } from "jspdf";

const getBulletPoints = (desc) => {
  if (!desc) return [];
  desc = desc.replace(/\s+/g, " ").trim();
  
  const sentences = desc.split(/(?<=[.!?])\s+/);
  const bulletPoints = [];
  
  for (let sentence of sentences) {
    sentence = sentence.trim();
    if (!sentence) continue;
    
    if (sentence.includes(",") && (sentence.toLowerCase().includes("ing ") || sentence.toLowerCase().includes("ing,"))) {
      const parts = sentence.split(/, (?:and )?/);
      if (parts.length > 1 && parts.every(part => part.trim().match(/^[A-Za-z]+ing\b/i) || part.trim().match(/^(?:and\s+)?[A-Za-z]+ing\b/i))) {
        for (let part of parts) {
          let cleanedPart = part.trim().replace(/^and\s+/i, "");
          if (cleanedPart) {
            cleanedPart = cleanedPart.charAt(0).toUpperCase() + cleanedPart.slice(1);
            if (!cleanedPart.endsWith(".")) cleanedPart += ".";
            bulletPoints.push(cleanedPart);
          }
        }
        continue;
      }
    }
    
    if (!sentence.endsWith(".")) sentence += ".";
    sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
    bulletPoints.push(sentence);
  }
  
  return bulletPoints;
};

const categorizeCapabilities = (capabilities) => {
  const categories = {
    "Languages": [],
    "Frontend": [],
    "Backend": [],
    "Databases": [],
    "Core Concepts": []
  };

  const languageKeywords = ["c++", "c++20", "typescript", "javascript", "java", "sql", "python", "swift", "go", "rust", "php", "c#", "ruby"];
  const frontendKeywords = ["react", "react.js", "reactjs", "tailwind", "tailwindcss", "tailwind css", "three.js", "threejs", "webgl", "framer motion", "motion", "gsap", "redux", "next.js", "nextjs", "vite", "vue", "angular", "html", "css"];
  const backendKeywords = ["node.js", "node", "nodejs", "express", "express.js", "expressjs", "django", "flask", "springboot", "graphql", "rest api", "rest apis", "restful api", "redis", "firebase"];
  const databaseKeywords = ["mongodb", "mysql", "postgres", "postgresql", "firestore", "oracle", "sqlite", "databases", "database"];
  const conceptKeywords = ["dsa", "dbms", "computer networks", "operating systems", "oop", "object-oriented programming", "software engineering", "data structures", "algorithms", "toc", "theory of computation"];

  capabilities.forEach(cap => {
    const lowerCap = cap.toLowerCase().trim();
    let dispCap = cap;

    if (lowerCap === "express") dispCap = "Express.js";
    if (lowerCap === "node.js" || lowerCap === "nodejs") dispCap = "Node.js";
    if (lowerCap === "react.js" || lowerCap === "reactjs") dispCap = "React.js";
    if (lowerCap === "tailwind css" || lowerCap === "tailwindcss") dispCap = "Tailwind CSS";
    if (lowerCap === "three.js" || lowerCap === "threejs") dispCap = "Three.js";

    if (languageKeywords.includes(lowerCap)) {
      categories["Languages"].push(dispCap);
    } else if (databaseKeywords.some(kw => lowerCap.includes(kw))) {
      categories["Databases"].push(dispCap);
    } else if (frontendKeywords.some(kw => lowerCap.includes(kw))) {
      categories["Frontend"].push(dispCap);
    } else if (backendKeywords.some(kw => lowerCap.includes(kw))) {
      categories["Backend"].push(dispCap);
    } else if (conceptKeywords.some(kw => lowerCap.includes(kw))) {
      categories["Core Concepts"].push(dispCap);
    } else {
      categories["Core Concepts"].push(dispCap);
    }
  });

  return categories;
};

const cleanUrl = (url) => {
  if (!url) return "";
  return url
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/$/i, "");
};

export const mapExperienceData = (experiences) => {
  if (!Array.isArray(experiences)) return [];
  return experiences.map(exp => {
    let role = exp.role || "";
    let company = exp.company || "";
    let duration = exp.duration || "";

    const roleLower = role.toLowerCase().trim();

    if (
      roleLower === "independent developer" || 
      roleLower === "independent systems & full stack engineer" || 
      roleLower === "independent systems & full stack dev"
    ) {
      role = "Software Engineer (Independent Projects)";
      company = "";
      duration = "2021 – Present";
    }

    if (
      duration.toUpperCase().includes("PRESENT") || 
      duration.toUpperCase().includes("ACTIVE")
    ) {
      duration = "2021 – Present";
    }

    return {
      ...exp,
      role,
      company,
      duration
    };
  });
};

export const generateResumePDF = (profile, projectsList) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageHeight = 297;
  const pageWidth = 210;
  const leftMargin = 15;
  const rightMargin = 15;
  const maxContentWidth = pageWidth - leftMargin - rightMargin;
  
  let y = 15;

  const drawSectionHeader = (title) => {
    y += 3.5;
    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.text(title, leftMargin, y);
    y += 1.2;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(leftMargin, y, pageWidth - rightMargin, y);
    y += 3.8;
  };

  const drawBulletPoints = (bullets) => {
    doc.setFont("times", "normal");
    doc.setFontSize(9);
    bullets.forEach(bullet => {
      const wrappedLines = doc.splitTextToSize(bullet, maxContentWidth - 6);
      wrappedLines.forEach((line) => {
        doc.text("•", leftMargin + 2, y);
        doc.text(line, leftMargin + 5, y);
        y += 3.8;
      });
    });
  };

  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.text(profile.name || "Resume Name", pageWidth / 2, y, { align: "center" });
  y += 5;

  doc.setFont("times", "normal");
  doc.setFontSize(9);
  const addressPart = profile.address ? `${profile.address}` : "";
  const emailPart = profile.email ? `${profile.email}` : "";
  const websitePart = profile.website ? `${cleanUrl(profile.websiteUrl || profile.website)}` : "";
  
  const contactLine1 = [addressPart, emailPart, websitePart].filter(Boolean).join("  |  ");
  doc.text(contactLine1, pageWidth / 2, y, { align: "center" });
  y += 4;

  const linkedinPart = profile.linkedinUrl ? `${cleanUrl(profile.linkedinUrl)}` : "";
  const githubPart = profile.githubUrl ? `${cleanUrl(profile.githubUrl)}` : "";
  
  const contactLine2 = [linkedinPart, githubPart].filter(Boolean).join("  |  ");
  if (contactLine2) {
    doc.text(contactLine2, pageWidth / 2, y, { align: "center" });
    y += 5;
  }

  if (profile.bio) {
    drawSectionHeader("Career Objective");
    doc.setFont("times", "normal");
    doc.setFontSize(9);
    const wrappedBio = doc.splitTextToSize(profile.bio, maxContentWidth);
    wrappedBio.forEach(line => {
      doc.text(line, leftMargin, y);
      y += 3.8;
    });
    y += 1;
  }

  const mappedExperiences = mapExperienceData(profile.experiences || []);
  const educationKeywords = ["b.tech", "btech", "m.tech", "mtech", "b.e.", "b.s.", "bachelor", "school", "university", "college", "autonomous"];
  
  const educationList = mappedExperiences.filter(exp => {
    const roleLower = (exp.role || "").toLowerCase();
    const compLower = (exp.company || "").toLowerCase();
    return educationKeywords.some(kw => roleLower.includes(kw) || compLower.includes(kw));
  });

  const workList = mappedExperiences.filter(exp => {
    const roleLower = (exp.role || "").toLowerCase();
    const compLower = (exp.company || "").toLowerCase();
    return !educationKeywords.some(kw => roleLower.includes(kw) || compLower.includes(kw));
  });

  if (educationList.length > 0) {
    drawSectionHeader("Education");
    
    educationList.forEach(edu => {
      doc.setFont("times", "bold");
      doc.setFontSize(9.5);
      
      const eduTitle = `${edu.company}${edu.role ? `, ${edu.role}` : ""}`;
      doc.text(eduTitle, leftMargin, y);
      
      if (edu.duration) {
        doc.text(edu.duration, pageWidth - rightMargin, y, { align: "right" });
      }
      y += 3.8;

      if (edu.desc) {
        const eduBullets = getBulletPoints(edu.desc);
        drawBulletPoints(eduBullets);
      }
      y += 1.5;
    });
  }

  if (profile.capabilities && profile.capabilities.length > 0) {
    drawSectionHeader("Technologies");
    
    const categories = categorizeCapabilities(profile.capabilities);
    Object.keys(categories).forEach(cat => {
      const items = categories[cat];
      if (items.length > 0) {
        const label = `${cat}: `;
        const itemsStr = items.join(", ");
        
        doc.setFont("times", "bold");
        doc.setFontSize(9);
        const labelWidth = doc.getTextWidth(label);
        
        doc.text(label, leftMargin, y);
        
        doc.setFont("times", "normal");
        const wrappedItems = doc.splitTextToSize(itemsStr, maxContentWidth - labelWidth);
        wrappedItems.forEach((line, idx) => {
          if (idx === 0) {
            doc.text(line, leftMargin + labelWidth, y);
          } else {
            doc.text(line, leftMargin, y);
          }
          y += 3.8;
        });
        y += 0.5;
      }
    });
    y += 1.5;
  }

  if (workList.length > 0) {
    drawSectionHeader("Experience");
    
    workList.forEach(work => {
      doc.setFont("times", "bold");
      doc.setFontSize(9.5);
      
      const workTitle = `${work.role}${work.company ? `, ${work.company}` : ""}`;
      doc.text(workTitle, leftMargin, y);
      
      if (work.duration) {
        doc.text(work.duration, pageWidth - rightMargin, y, { align: "right" });
      }
      y += 3.8;

      if (work.desc) {
        const workBullets = getBulletPoints(work.desc);
        drawBulletPoints(workBullets);
      }
      y += 1.5;
    });
  }

  const projectsToRender = (projectsList || []).slice(0, 3);
  if (projectsToRender.length > 0) {
    drawSectionHeader("Projects");
    
    projectsToRender.forEach(proj => {
      doc.setFont("times", "bold");
      doc.setFontSize(9.5);
      
      const projName = proj.projectName || proj.name || "Project Node";
      doc.text(projName, leftMargin, y);
      y += 3.8;

      const projDesc = proj.description || proj.desc || "";
      if (projDesc) {
        const projBullets = getBulletPoints(projDesc);
        drawBulletPoints(projBullets);
      }
      y += 1.5;
    });
  }

  const footerHeight = 10;
  if (y < pageHeight - footerHeight - 5) {
    y = pageHeight - footerHeight - 3;
  }

  doc.setFont("times", "italic");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  
  const siteUrl = profile.website || "subhenduhembram.dev";
  doc.text(`Generated dynamically from ${siteUrl}`, pageWidth / 2, y, { align: "center" });
  y += 3.5;
  
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  doc.text(`Generated on: ${dd}/${mm}/${yyyy}`, pageWidth / 2, y, { align: "center" });

  const cleanName = (profile.name || "Subhendu_Prasad_Hembram").trim().replace(/\s+/g, "_");
  doc.save(`${cleanName}_Resume.pdf`);
};
