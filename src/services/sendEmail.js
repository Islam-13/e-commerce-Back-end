import { createTransport } from "nodemailer";

const sendEmail = async (
  to = "",
  subject = "",
  html = "",
  attachments = []
) => {
  const transporter = createTransport({
    service: "gmail",
    auth: {
      user: process.env.emailSender,
      pass: process.env.emailPassword,
    },
  });

  const info = await transporter.sendMail({
    from: `"e-commerce app 👻" <${process.env.emailSender}>`,
    to,
    subject,
    html,
    attachments,
  });

  if (info.accepted.length) return true;

  return false;
};

export default sendEmail;
