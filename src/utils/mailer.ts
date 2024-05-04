import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

interface MailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

/**
 * Class to handle email operations using Nodemailer.
 */
class Mailer {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.ADMIN_MAILID, // Sender's email address
        pass: process.env.ADMIN_MAIL_PASSWORD, // Sender's email password or app-specific passkey
      },
    });
  }

  /**
   * Sends an email using the configured Nodemailer transporter.
   * @param mailOptions - Options for the email (e.g., to, subject, text/html content).
   */
  public async sendMail(mailOptions: MailOptions): Promise<void> {
    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new Error('Error sending email');
    }
  }
}

export default Mailer;
