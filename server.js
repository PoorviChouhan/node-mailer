require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
const PORT = 8000;

// Middleware
app.use(cors()); // Allows frontend requests
app.use(express.json()); // Parses JSON requests

// Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false, // This bypasses self-signed certificate issues
    },
});

// Contact Form Route
app.post("/contact", async (req, res) => {
    const { name, email,mobile, subject, message } = req.body;

    if (!name || !email || !subject || !mobile) {
        return res.status(400).json({ success: false, error: "All fields are required!" });
    }

    const mailOptions = {
        from: email, // Sender's email
        to: process.env.RECEIVER_EMAIL, // Your email to receive messages
        subject: `New Contact Form Submission: ${subject}`,
        text: `You received a new message from:\n\nName: ${name}\nEmail: ${email}\nMobile No.: ${mobile}\n\nMessage:\n${message}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "Message sent successfully!" });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ success: false, error: "Failed to send message." });
    }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
