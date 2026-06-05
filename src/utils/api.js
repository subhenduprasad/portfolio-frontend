const BASE_URL = import.meta.env.VITE_SERVER_BASE_URL || "http://localhost:5000";

const getHeaders = (token) => {
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  
  async checkHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); 

      const res = await fetch(`${BASE_URL}/api/v1/health`, {
        method: "GET",
        headers: getHeaders(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        return "DEGRADED";
      }

      const data = await res.json();
      return data.status || "ONLINE";
    } catch (err) {
      console.warn("[API] Server health check failed, marking as OFFLINE.", err);
      return "OFFLINE";
    }
  },

  
  async fetchPortfolioData() {
    const res = await fetch(`${BASE_URL}/api/v1/portfolio`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch portfolio data: ${res.statusText}`);
    }

    return await res.json();
  },

  
  async submitContactMessage(payload) {
    const res = await fetch(`${BASE_URL}/api/v1/contact`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Contact relay returned code ${res.status}`);
    }

    return await res.json();
  },

  
  async loginAdmin(password) {
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Login request rejected.");
    }

    return await res.json();
  },

  
  async verifyAdminOtp(otp, tempToken) {
    const res = await fetch(`${BASE_URL}/api/v1/auth/verify-otp`, {
      method: "POST",
      headers: getHeaders(tempToken),
      body: JSON.stringify({ otp }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "OTP verification failed.");
    }

    return await res.json();
  },

  
  async resendOtp(tempToken) {
    const res = await fetch(`${BASE_URL}/api/v1/auth/resend-otp`, {
      method: "POST",
      headers: getHeaders(tempToken),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to resend OTP.");
    }

    return await res.json();
  },

  
  async requestRecovery(recoveryKey) {
    const res = await fetch(`${BASE_URL}/api/v1/auth/recovery`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ recoveryKey }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Recovery request failed.");
    }

    return await res.json();
  },

  
  async verifyRecoveryOtp(otp, tempToken) {
    const res = await fetch(`${BASE_URL}/api/v1/auth/verify-recovery-otp`, {
      method: "POST",
      headers: getHeaders(tempToken),
      body: JSON.stringify({ otp }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Recovery OTP verification failed.");
    }

    return await res.json();
  },

  
  async verifySession(token) {
    if (!token) return { success: false, active: false };
    try {
      const res = await fetch(`${BASE_URL}/api/v1/auth/verify-session`, {
        method: "GET",
        headers: getHeaders(token),
      });

      if (!res.ok) {
        return { success: false, active: false };
      }

      const data = await res.json();
      return { success: data.success, active: data.active };
    } catch (e) {
      console.error("[API] Session verification failed due to network error", e);
      return { success: false, active: false };
    }
  },

  
  async savePortfolioData(profileData, token) {
    const res = await fetch(`${BASE_URL}/api/v1/portfolio/save`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(profileData),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to commit profile updates.");
    }

    return await res.json();
  },

  
  async saveProjectsData(projectsList, token) {
    const res = await fetch(`${BASE_URL}/api/v1/portfolio/projects`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify({ list: projectsList }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to commit projects updates.");
    }

    return await res.json();
  },

  
  async getUploadSignature(token) {
    const res = await fetch(`${BASE_URL}/api/v1/portfolio/upload-signature`, {
      method: "GET",
      headers: getHeaders(token),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to retrieve upload signature.");
    }

    return await res.json();
  },

  
  async requestChangePasswordOtp(token) {
    const res = await fetch(`${BASE_URL}/api/v1/auth/request-change-password-otp`, {
      method: "POST",
      headers: getHeaders(token),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Password change OTP request failed.");
    }

    return await res.json();
  },

  
  async changePassword(currentPassword, newPassword, otp, token) {
    const res = await fetch(`${BASE_URL}/api/v1/auth/change-password`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify({ currentPassword, newPassword, otp }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Password rotation failed.");
    }

    return await res.json();
  },

  
  async fetchMessages(token) {
    const res = await fetch(`${BASE_URL}/api/v1/admin/messages`, {
      method: "GET",
      headers: getHeaders(token),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to fetch inbox messages.");
    }

    return await res.json();
  },

  
  async deleteMessage(token, msgId) {
    const res = await fetch(`${BASE_URL}/api/v1/admin/messages/${msgId}`, {
      method: "DELETE",
      headers: getHeaders(token),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to delete message record.");
    }

    return await res.json();
  },
};
