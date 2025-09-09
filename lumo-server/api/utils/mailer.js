// api/utils/mailer.js
const nodemailer = require("nodemailer");

async function sendMail(to, subject, html) {
  const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  logger: true,  // muestra logs en consola
  debug: true,   // muestra detalles SMTP
});

  const info = await transporter.sendMail({
    from: `"Lumo App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });

  console.log("Correo enviado: %s", info.messageId);
  return info;
}

module.exports = { sendMail };
