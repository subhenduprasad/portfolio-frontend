const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { Resend } = require("resend");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { defineSecret } = require("firebase-functions/params");

const ADMIN_RECOVERY_KEY = defineSecret("ADMIN_RECOVERY_KEY");
const OTP_SECRET_SALT = defineSecret("OTP_SECRET_SALT");


admin.initializeApp();

exports.sendContactMessage = onRequest({ cors: true }, async (req, res) => {
  // CORS preflight support
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "3600");
    res.status(204).send("");
    return;
  }

  res.set("Access-Control-Allow-Origin", "*");

  try {
    const { name, email, message } = req.body;

    if (!email || !message) {
      res.status(400).json({ success: false, error: "Email and message are required." });
      return;
    }

    const msgId = `MSG_${Math.floor(1000 + Math.random() * 9000)}`;
    const newMsg = {
      id: msgId,
      name: name || "Anonymous User",
      email: email,
      message: message,
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
      timestamp: Date.now()
    };

    await admin.firestore().collection("portfolio_messages").doc(msgId).set(newMsg);

    const resendApiKey = process.env.RESEND_API_KEY || "";
    const adminEmail = process.env.ADMIN_EMAIL;

    let emailSent = false;
    let logMsg = "";

    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: "Portfolio Security <onboarding@resend.dev>",
          to: adminEmail,
          subject: `Secure Contact Message from ${newMsg.name}`,
          html: `<p><strong>Name:</strong> ${newMsg.name}</p>
                 <p><strong>Email:</strong> ${newMsg.email}</p>
                 <p><strong>Message:</strong> ${newMsg.message}</p>
                 <p><strong>Timestamp:</strong> ${newMsg.date} ${newMsg.time}</p>`
        });
        emailSent = true;
        logMsg = "Resend API dispatch success";
      } catch (err) {
        logMsg = `Resend dispatch failed: ${err.message}`;
      }
    } else {
      // SMTP Fallback using environment parameters
      const smtpHost = process.env.SMTP_HOST || "";
      const smtpPort = process.env.SMTP_PORT || "465";
      const smtpUser = process.env.SMTP_USER || "";
      const smtpPass = process.env.SMTP_PASS || "";

      if (smtpHost && smtpUser && smtpPass) {
        try {
          const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: parseInt(smtpPort),
            secure: smtpPort === "465",
            auth: {
              user: smtpUser,
              pass: smtpPass
            }
          });

          await transporter.sendMail({
            from: `"Portfolio Contact Form" <${smtpUser}>`,
            to: adminEmail,
            subject: `Secure Contact Message from ${newMsg.name}`,
            text: `Name: ${newMsg.name}\nEmail: ${newMsg.email}\nMessage: ${newMsg.message}\n`
          });
          emailSent = true;
          logMsg = "Nodemailer SMTP dispatch success";
        } catch (err) {
          logMsg = `SMTP dispatch failed: ${err.message}`;
        }
      } else {
        logMsg = "No email dispatch keys configured (local fallback active)";
      }
    }

    res.status(200).json({
      success: true,
      messageId: msgId,
      emailSent,
      log: logMsg
    });

  } catch (err) {
    console.error("Cloud Function failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

async function sendOTPEmailHelper(otpCode) {
  const resendApiKey = process.env.RESEND_API_KEY || "";
  const adminEmail = process.env.ADMIN_EMAIL;
  const subject = "Admin Gateway Security - MFA OTP Verification Code";
  const messageContent = `Your 6-digit administrative verification code is: ${otpCode}. This code is highly confidential and valid for 5 minutes.`;

  if (!adminEmail) return;

  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from: "Portfolio Security <onboarding@resend.dev>",
        to: adminEmail,
        subject: subject,
        html: `<p><strong>Security System OTP Gateway</strong></p>
               <p>${messageContent}</p>`
      });
      console.log("OTP email sent successfully via Resend API.");
      return true;
    } catch (err) {
      console.error("Resend API failed to send OTP email:", err);
    }
  }

  const smtpHost = process.env.SMTP_HOST || "";
  const smtpPort = process.env.SMTP_PORT || "465";
  const smtpUser = process.env.SMTP_USER || "";
  const smtpPass = process.env.SMTP_PASS || "";

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort),
        secure: smtpPort === "465",
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      await transporter.sendMail({
        from: `"Portfolio Security System" <${smtpUser}>`,
        to: adminEmail,
        subject: subject,
        text: messageContent
      });
      console.log("OTP email sent successfully via Nodemailer SMTP.");
      return true;
    } catch (err) {
      console.error("SMTP fallback failed to send OTP email:", err);
    }
  }

  console.log(`[LOCAL DEV MODE] OTP Code generated: ${otpCode}`);
  return false;
}

async function checkOTPRateLimit(identifier) {
  const db = admin.firestore();
  const rateLimitRef = db.collection("otp_rate_limits").doc(identifier);
  
  const snap = await rateLimitRef.get();
  const now = Date.now();
  const fifteenMinutes = 15 * 60 * 1000;

  if (snap.exists) {
    const data = snap.data();
    if (now - data.lastRequestTime > fifteenMinutes) {
      await rateLimitRef.set({
        requestCount: 1,
        lastRequestTime: now
      });
      return true;
    } else {
      if (data.requestCount >= 3) {
        return false;
      } else {
        await rateLimitRef.update({
          requestCount: data.requestCount + 1,
          lastRequestTime: now
        });
        return true;
      }
    }
  } else {
    await rateLimitRef.set({
      requestCount: 1,
      lastRequestTime: now
    });
    return true;
  }
}

// Cloud Function to generate OTP for logged in admin
exports.generateOTP = onRequest({ cors: true, secrets: [OTP_SECRET_SALT] }, async (req, res) => {
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Max-Age", "3600");
    res.status(204).send("");
    return;
  }
  res.set("Access-Control-Allow-Origin", "*");

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "UNAUTHORIZED: MISSING TOKEN" });
    }
    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) return;
    if (email !== adminEmail) {
      return res.status(403).json({ success: false, error: "FORBIDDEN: NOT THE ADMINISTRATOR" });
    }

    const allowed = await checkOTPRateLimit(uid);
    if (!allowed) {
      return res.status(429).json({ success: false, error: "TOO MANY REQUESTS. MAX 3 OTPS PER 15 MINUTES." });
    }

    await admin.auth().setCustomUserClaims(uid, { admin: true, mfa_verified: false });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = OTP_SECRET_SALT.value() || "SUBHENDU_SECURE_MFA_SALT_2026";
    const otpHash = crypto.createHash("sha256").update(otpCode + uid + salt).digest("hex");

    await admin.firestore().collection("secure_otps").doc(uid).set({
      otpHash,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: Date.now() + 5 * 60 * 1000,
      attemptsCount: 0
    });

    await sendOTPEmailHelper(otpCode);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("generateOTP failed:", err);
    return res.status(500).json({ success: false, error: err.message.toUpperCase() });
  }
});

// Cloud Function to verify OTP and assign custom user claims
exports.verifyOTP = onRequest({ cors: true, secrets: [OTP_SECRET_SALT] }, async (req, res) => {
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Max-Age", "3600");
    res.status(204).send("");
    return;
  }
  res.set("Access-Control-Allow-Origin", "*");

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "UNAUTHORIZED: MISSING TOKEN" });
    }
    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return;
    if (email !== adminEmail) {
      return res.status(403).json({ success: false, error: "FORBIDDEN: NOT THE ADMINISTRATOR" });
    }

    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({ success: false, error: "OTP IS REQUIRED" });
    }

    const otpDocRef = admin.firestore().collection("secure_otps").doc(uid);
    const otpDoc = await otpDocRef.get();

    if (!otpDoc.exists) {
      return res.status(400).json({ success: false, error: "MFA TOKEN NOT GENERATED OR EXPIRED." });
    }

    const data = otpDoc.data();

    if (Date.now() > data.expiresAt) {
      await otpDocRef.delete();
      return res.status(400).json({ success: false, error: "OTP HAS EXPIRED. GENERATE A NEW ONE." });
    }

    if (data.attemptsCount >= 5) {
      await otpDocRef.delete();
      return res.status(400).json({ success: false, error: "MAX ATTEMPTS EXCEEDED. OTP VOIDED. RE-AUTHENTICATE." });
    }

    const salt = OTP_SECRET_SALT.value() || "SUBHENDU_SECURE_MFA_SALT_2026";
    const computedHash = crypto.createHash("sha256").update(otp + uid + salt).digest("hex");

    if (data.otpHash !== computedHash) {
      const newAttempts = data.attemptsCount + 1;
      if (newAttempts >= 5) {
        await otpDocRef.delete();
        return res.status(400).json({ success: false, error: "MAX ATTEMPTS EXCEEDED. OTP VOIDED. RE-AUTHENTICATE." });
      } else {
        await otpDocRef.update({ attemptsCount: newAttempts });
        return res.status(400).json({ success: false, error: `INVALID MFA CODE. ${5 - newAttempts} ATTEMPTS REMAIN.` });
      }
    }

    await admin.auth().setCustomUserClaims(uid, {
      admin: true,
      mfa_verified: true,
      mfa_time: Math.floor(Date.now() / 1000)
    });

    await otpDocRef.delete();

    const clientIp = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket.remoteAddress || "127.0.0.1";

    return res.status(200).json({ success: true, ip: clientIp });
  } catch (err) {
    console.error("verifyOTP failed:", err);
    return res.status(500).json({ success: false, error: err.message.toUpperCase() });
  }
});

// Cloud Function to verify administrative recovery key and initialize token verification
exports.initiateRecovery = onRequest({ cors: true, secrets: [ADMIN_RECOVERY_KEY, OTP_SECRET_SALT] }, async (req, res) => {
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "3600");
    res.status(204).send("");
    return;
  }
  res.set("Access-Control-Allow-Origin", "*");

  try {
    const { recoveryKey } = req.body;
    const realRecoveryKey = ADMIN_RECOVERY_KEY.value();

    if (!recoveryKey || recoveryKey !== realRecoveryKey) {
      return res.status(401).json({ success: false, error: "INVALID RECOVERY DECRYPTION KEY." });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return;
    const user = await admin.auth().getUserByEmail(adminEmail);
    const uid = user.uid;

    const allowed = await checkOTPRateLimit(uid);
    if (!allowed) {
      return res.status(429).json({ success: false, error: "TOO MANY REQUESTS. MAX 3 OTPS PER 15 MINUTES." });
    }

    await admin.auth().setCustomUserClaims(uid, { admin: true, mfa_verified: false });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = OTP_SECRET_SALT.value() || "SUBHENDU_SECURE_MFA_SALT_2026";
    const otpHash = crypto.createHash("sha256").update(otpCode + uid + salt).digest("hex");

    await admin.firestore().collection("secure_otps").doc(uid).set({
      otpHash,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: Date.now() + 5 * 60 * 1000,
      attemptsCount: 0
    });

    await sendOTPEmailHelper(otpCode);

    const customToken = await admin.auth().createCustomToken(uid);

    return res.status(200).json({ success: true, customToken });
  } catch (err) {
    console.error("initiateRecovery failed:", err);
    return res.status(500).json({ success: false, error: err.message.toUpperCase() });
  }
});

// Cloud Function to verify OTP and reset Admin password
exports.setAdminPassword = onRequest({ cors: true, secrets: [OTP_SECRET_SALT] }, async (req, res) => {
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Max-Age", "3600");
    res.status(204).send("");
    return;
  }
  res.set("Access-Control-Allow-Origin", "*");

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "UNAUTHORIZED: MISSING TOKEN" });
    }
    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return;
    if (email !== adminEmail) {
      return res.status(403).json({ success: false, error: "FORBIDDEN: NOT THE ADMINISTRATOR" });
    }

    const { newPassword, otp } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, error: "PASSWORD MUST BE AT LEAST 6 CHARACTERS." });
    }
    if (!otp) {
      return res.status(400).json({ success: false, error: "VERIFICATION OTP REQUIRED." });
    }

    const otpDocRef = admin.firestore().collection("secure_otps").doc(uid);
    const otpDoc = await otpDocRef.get();

    if (!otpDoc.exists) {
      return res.status(400).json({ success: false, error: "MFA TOKEN NOT GENERATED OR EXPIRED." });
    }

    const data = otpDoc.data();

    if (Date.now() > data.expiresAt) {
      await otpDocRef.delete();
      return res.status(400).json({ success: false, error: "OTP HAS EXPIRED. REQUEST A NEW OTP." });
    }

    if (data.attemptsCount >= 5) {
      await otpDocRef.delete();
      return res.status(400).json({ success: false, error: "MAX ATTEMPTS EXCEEDED. OTP VOIDED." });
    }

    const salt = OTP_SECRET_SALT.value() || "SUBHENDU_SECURE_MFA_SALT_2026";
    const computedHash = crypto.createHash("sha256").update(otp + uid + salt).digest("hex");

    if (data.otpHash !== computedHash) {
      const newAttempts = data.attemptsCount + 1;
      if (newAttempts >= 5) {
        await otpDocRef.delete();
        return res.status(400).json({ success: false, error: "MAX ATTEMPTS EXCEEDED. OTP VOIDED." });
      } else {
        await otpDocRef.update({ attemptsCount: newAttempts });
        return res.status(400).json({ success: false, error: `INVALID MFA CODE. ${5 - newAttempts} ATTEMPTS REMAIN.` });
      }
    }

    await admin.auth().updateUser(uid, { password: newPassword });

    await admin.auth().setCustomUserClaims(uid, {
      admin: true,
      mfa_verified: true,
      mfa_time: Math.floor(Date.now() / 1000)
    });

    await otpDocRef.delete();

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("setAdminPassword failed:", err);
    return res.status(500).json({ success: false, error: err.message.toUpperCase() });
  }
});

exports.logoutAdmin = onRequest({ cors: true }, async (req, res) => {
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Max-Age", "3600");
    res.status(204).send("");
    return;
  }
  res.set("Access-Control-Allow-Origin", "*");

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "UNAUTHORIZED: MISSING TOKEN" });
    }
    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    await admin.auth().setCustomUserClaims(uid, {
      admin: true,
      mfa_verified: false,
      mfa_time: 0
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("logoutAdmin failed:", err);
    return res.status(500).json({ success: false, error: err.message.toUpperCase() });
  }
});

// Cloud Function for API health check
exports.health = onRequest({ cors: true }, async (req, res) => {
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "3600");
    res.status(204).send("");
    return;
  }
  res.set("Access-Control-Allow-Origin", "*");

  try {
    const db = admin.firestore();
    const start = Date.now();
    await db.collection("portfolio").doc("profile").get();
    const duration = Date.now() - start;

    let status = "ONLINE";
    if (duration > 1500) {
      status = "DEGRADED";
    }

    return res.status(200).json({
      status,
      timestamp: Date.now(),
      latency: `${duration}ms`
    });
  } catch (err) {
    console.error("Health check failed:", err);
    return res.status(200).json({
      status: "DEGRADED",
      error: err.message,
      timestamp: Date.now()
    });
  }
});

// Cloud Function hosting API routes
exports.api = onRequest({ cors: true }, async (req, res) => {
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "3600");
    res.status(204).send("");
    return;
  }
  res.set("Access-Control-Allow-Origin", "*");

  const parsedPath = req.path || req.url || "";
  if (req.method === "GET" && (parsedPath === "/v1/health" || parsedPath === "/api/v1/health" || parsedPath.endsWith("/v1/health") || parsedPath.endsWith("/api/v1/health"))) {
    try {
      const db = admin.firestore();
      const start = Date.now();
      await db.collection("portfolio").doc("profile").get();
      const duration = Date.now() - start;

      let status = "ONLINE";
      if (duration > 1500) {
        status = "DEGRADED";
      }

      return res.status(200).json({
        status,
        timestamp: Date.now(),
        latency: `${duration}ms`
      });
    } catch (err) {
      console.error("Health check failed:", err);
      return res.status(200).json({
        status: "DEGRADED",
        error: err.message,
        timestamp: Date.now()
      });
    }
  }

  res.status(404).send("Not Found");
});


