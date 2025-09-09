require("dotenv").config();
const nodemailer = require("nodemailer");

async function main() {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"Soporte Lumo" <${process.env.EMAIL_USER}>`,
      to: "juanda.190404@hotmail.com", // cámbialo por tu correo real
      subject: "Prueba de Nodemailer 🚀",
      text: "Hola! Esto es una prueba de envío desde tu servidor Lumo.",
    });

    console.log("✅ Correo enviado:", info.messageId);
  } catch (error) {
    console.error("❌ Error enviando correo:", error);
  }
}

main();
