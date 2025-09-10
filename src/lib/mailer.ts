import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

const mailersend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY!,
});

const sentFrom = new Sender(process.env.MAILERSEND_FROM!, "AncosDevSolutions");

export async function sendWelcomeEmail(to: string, name: string, link: string) {
  const recipients = [new Recipient(to, name)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject("Verify your email ✨")
    .setHtml(`
      <p>Hi ${name},</p>
      <p>Welcome! Please verify your email by clicking below:</p>
      <p><a href="${link}" target="_blank">Verify Email</a></p>
      <p>If you didn’t create this account, you can ignore this email.</p>
    `);

  await mailersend.email.send(emailParams);
}
