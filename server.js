require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");

const app = express();
const PORT = 8000;

// Middleware
// app.use(cors({ 
//   origin: "https://panoramasoftwares.com",
//   methods: ["GET", "POST", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
// }));
// app.options("*", cors());
app.use(cors({ origin: "http://localhost:3000" }));

app.use(express.json());

// Multer setup for file upload (Career form)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "./uploads";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Nodemailer transporter configuration for Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ----------- CONTACT FORM ROUTE -----------
app.post("/contact", async (req, res) => {
  const { name, email, mobile, subject, message } = req.body;

  if (!name || !email || !subject || !mobile) {
    return res
      .status(400)
      .json({ success: false, error: "All fields are required!" });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.RECEIVER_EMAIL,
    subject: `New Contact Form Submission: ${subject}`,
    text: `You received a new message:\n\nName: ${name}\nEmail: ${email}\nMobile: ${mobile}\n\nMessage:\n${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    console.error("Error sending contact form email:", error);
    res.status(500).json({ success: false, error: "Failed to send message." });
  }
});

// ----------- CAREER FORM ROUTE (with file upload) -----------
app.post("/career", upload.single("resume"), async (req, res) => {
  const {
    name,
    email,
    phone,
    position,
    experience,
    qualification,
    passingYear,
    message,
  } = req.body;

  if (
    !name ||
    !email ||
    !phone ||
    !position ||
    !qualification ||
    !passingYear ||
    !req.file
  ) {
    return res.status(400).json({
      success: false,
      error: "All required fields including resume must be provided!",
    });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.RECEIVER_EMAIL,
    subject: `New Career Application for: ${position}`,
    text: `You received a new career application:\n\n
Name: ${name}
Email: ${email}
Phone: ${phone}
Position: ${position}
Experience: ${experience}
Qualification: ${qualification}
Year of Passing: ${passingYear}
Message: ${message}
    `,
    attachments: [
      {
        filename: req.file.originalname,
        path: req.file.path,
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({
      success: true,
      message: "Application submitted successfully!",
    });

    // Optional: Delete resume after sending
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Failed to delete resume:", err);
    });
  } catch (error) {
    console.error("Error sending career application email:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to send application." });
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
