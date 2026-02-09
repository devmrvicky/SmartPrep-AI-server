import nodemailer, { Transporter } from "nodemailer";
import config from "../config/config";
import logger from "../config/logger";

class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  }

  async sendOTP(email: string, fullname: string, otp: string): Promise<void> {
    try {
      const mailOptions = {
        from: `"Authentication Service" <${config.email.user}>`,
        to: email,
        subject: "Email Verification - OTP Code",
        html: this.getOTPEmailTemplate(fullname, otp),
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`OTP email sent to ${email}`, { messageId: info.messageId });
    } catch (error) {
      logger.error("Error sending OTP email", { email, error });
      throw new Error("Failed to send OTP email");
    }
  }

  private getOTPEmailTemplate(fullname: string, otp: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9f9f9;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .otp-code {
            background-color: #007bff;
            color: white;
            font-size: 32px;
            font-weight: bold;
            text-align: center;
            padding: 20px;
            border-radius: 8px;
            letter-spacing: 8px;
            margin: 30px 0;
          }
          .info {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Email Verification</h1>
          </div>
          
          <p>Hello ${fullname},</p>
          
          <p>Thank you for registering! To complete your registration, please use the following One-Time Password (OTP):</p>
          
          <div class="otp-code">
            ${otp}
          </div>
          
          <div class="info">
            <strong>Important:</strong>
            <ul>
              <li>This OTP is valid for ${config.otp.expiryMinutes} minutes only</li>
              <li>Do not share this code with anyone</li>
              <li>If you didn't request this, please ignore this email</li>
            </ul>
          </div>
          
          <p>After entering this OTP, you'll be able to set your password and complete the registration process.</p>
          
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} Authentication Service. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      logger.info("Email service connection verified");
      return true;
    } catch (error) {
      logger.error("Email service connection failed", error);
      return false;
    }
  }
}

export default new EmailService();
