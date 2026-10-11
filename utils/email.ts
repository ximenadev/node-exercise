import nodemailer from 'nodemailer';

const SMTP_TIMEOUT_MS = 10_000;

const toHtml = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/https?:\/\/[^\s<]+/g, url => `<a href="${url}">${url}</a>`)
    .replace(/\n/g, '<br>');

export const sendEmail = async ({
  to,
  subject,
  message,
}: {
  to: string;
  subject: string;
  message: string;
}) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    // secure: process.env.SMTP_SECURE === 'true',
    connectionTimeout: SMTP_TIMEOUT_MS,
    greetingTimeout: SMTP_TIMEOUT_MS,
    socketTimeout: SMTP_TIMEOUT_MS,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    // from: process.env.SMTP_FROM,
    from: 'Ximena Dev <hola@ximena.dev>',
    to,
    subject,
    text: message,
    html: toHtml(message),
  };

  await transporter.sendMail(mailOptions);
};
