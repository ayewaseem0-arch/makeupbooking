import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Email Service Helper
async function sendAdminNotificationEmail(booking: any) {
  const { name, email, date, time, service, requirements } = booking;
  const adminEmail = process.env.ADMIN_EMAIL || "ayesha3may@gmail.com";
  const smtpUser = process.env.SMTP_USER;

  if (!process.env.SMTP_HOST || !smtpUser || !process.env.SMTP_PASS) {
    console.log("[Email Service] Simulated Admin Notification (Missing SMTP)");
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: smtpUser,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Glam Studio System" <${smtpUser}>`,
      to: adminEmail,
      subject: `NEW BOOKING REQUEST: ${name} - ${service}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d46a92; font-family: serif;">New Pending Request</h2>
          <p>A new booking has been recorded. <strong>Identity needs verification before confirmation.</strong></p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;"/>
          <p><strong>CLIENT:</strong> ${name} (${email})</p>
          <p><strong>SERVICE:</strong> ${service}</p>
          <p><strong>WHEN:</strong> ${date} at ${time}</p>
          <p><strong>NOTE:</strong> ${requirements || 'None'}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;"/>
          <p style="font-size: 12px; color: #888;">Log in to the Admin Dashboard to review and confirm this booking.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("[Email Service] Error sending admin notification:", error);
  }
}

async function sendConfirmationEmail(booking: any) {
  const { name, email, date, time, service } = booking;
  const smtpUser = process.env.SMTP_USER;

  if (!process.env.SMTP_HOST || !smtpUser || !process.env.SMTP_PASS) {
    console.log("[Email Service] Simulated User Confirmation (Missing SMTP)");
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: smtpUser,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Glam Studio" <${smtpUser}>`,
      to: email,
      subject: `Booking Confirmed: ${service} at Glam Studio`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #f0f0f0; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
          <div style="background-color: #d46a92; padding: 50px 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-family: serif; font-size: 32px; letter-spacing: 2px; text-transform: uppercase;">Confirmed</h1>
            <p style="margin-top: 10px; opacity: 0.9; font-weight: 300; text-transform: uppercase; letter-spacing: 3px; font-size: 10px;">Your beauty transformation awaits</p>
          </div>
          <div style="padding: 50px 40px; color: #444; line-height: 1.8;">
            <p style="font-size: 18px;">Hello <strong>${name}</strong>,</p>
            <p>We are delighted to confirm your booking with <strong>Zaisha Makeup Studio</strong>. Your appointment has been officially reserved.</p>
            
            <div style="background-color: #fff8f8; padding: 35px; border-radius: 25px; margin: 35px 0; border: 1px solid #fff0f5;">
              <h3 style="margin-top: 0; color: #d46a92; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px;">Appointment Details</h3>
              <p style="margin: 0;"><strong>SERVICE:</strong> ${service}</p>
              <p style="margin: 15px 0 0 0;"><strong>DATE:</strong> ${date}</p>
              <p style="margin: 15px 0 0 0;"><strong>TIME:</strong> ${time}</p>
            </div>
            
            <p style="font-size: 14px; color: #888;">If you need to reschedule, please reach out via WhatsApp as soon as possible.</p>
            
            <div style="margin-top: 50px; border-top: 1px solid #eee; padding-top: 30px; text-align: center;">
              <p style="margin: 0; font-weight: 600; color: #d46a92;">With Love,</p>
              <p style="margin: 5px 0; font-size: 20px; font-family: serif;">Zaisha</p>
              <p style="margin: 0; font-size: 10px; color: #aaa; text-transform: uppercase;">Founder, Glam Studio</p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("[Email Service] Error sending confirmation email:", error);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory "database" for demonstration
  let bookings: any[] = [];

  // API Route: Submit Booking
  app.post("/api/bookings", (req, res) => {
    const { name, email, date, time, service, requirements } = req.body;
    
    if (!name || !email || !date || !time || !service) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newBooking = {
      id: Date.now().toString(),
      name,
      email,
      date,
      time,
      service,
      requirements,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    bookings.push(newBooking);
    console.log("New booking received:", newBooking);
    
    // Preliminary Notification: Email to Admin
    sendAdminNotificationEmail(newBooking).catch(err => {
      console.error("Async admin alert email error:", err);
    });
    
    res.status(201).json({ 
      success: true, 
      message: "Booking request received. Please notify via WhatsApp.", 
      booking: newBooking 
    });
  });

  // Auth Middleware
  const authenticateAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    const validUsername = process.env.ADMIN_USERNAME || "admin";
    const validPassword = process.env.ADMIN_PASSWORD || "glam2026";
    const expectedToken = Buffer.from(`${validUsername}:${validPassword}`).toString('base64');

    if (token === expectedToken) {
      next();
    } else {
      res.status(403).json({ error: "Unauthorized access" });
    }
  };

  // API Route: Confirm booking
  app.post("/api/bookings/:id/confirm", authenticateAdmin, (req, res) => {
    const { id } = req.params;
    const booking = bookings.find(b => b.id === id);
    
    if (booking) {
      if (booking.status === "confirmed") {
        return res.status(400).json({ error: "Booking already confirmed" });
      }
      
      booking.status = "confirmed";
      console.log(`Booking ${id} confirmed. Sending email...`);
      
      // Trigger confirmation email
      sendConfirmationEmail(booking).catch(err => {
        console.error("Async email error during confirmation:", err);
      });
      
      return res.json({ success: true, message: "Booking confirmed and email sent", booking });
    }
    
    res.status(404).json({ error: "Booking not found" });
  });

  // API Route: Login
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    
    const validUsername = process.env.ADMIN_USERNAME || "admin";
    const validPassword = process.env.ADMIN_PASSWORD || "glam2026";

    if (username === validUsername && password === validPassword) {
      // In a real app, use JWT. For this simple case, we use a shared secret from env or a simple string
      const token = Buffer.from(`${validUsername}:${validPassword}`).toString('base64');
      res.json({ success: true, token });
    } else {
      res.status(401).json({ error: "Invalid username or password" });
    }
  });

  // API Route: Get all bookings
  app.get("/api/bookings", authenticateAdmin, (req, res) => {
    res.json(bookings.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  });

  // API Route: Delete booking
  app.delete("/api/bookings/:id", authenticateAdmin, (req, res) => {
    const { id } = req.params;
    const index = bookings.findIndex(b => b.id === id);
    if (index !== -1) {
      bookings.splice(index, 1);
      return res.json({ success: true, message: "Booking deleted" });
    }
    res.status(404).json({ error: "Booking not found" });
  });

  // API Route: Delete all bookings
  app.delete("/api/bookings", authenticateAdmin, (req, res) => {
    bookings = [];
    res.json({ success: true, message: "All bookings cleared" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve built files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
