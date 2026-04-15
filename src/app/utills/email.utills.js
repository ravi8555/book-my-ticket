import nodemailer from 'nodemailer'
import 'dotenv/config'
// Configure Brevo SMTP transport
const createBrevoTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST,
    port: parseInt(process.env.BREVO_SMTP_PORT || '587'),
    secure: false, // false for port 587
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: process.env.BREVO_SMTP_PASSWORD,
    },
    tls: {
      ciphers: 'SSLv3',
    },
  })
}

// Send verification email using Brevo SMTP
export class EmailUtils {
  static async sendVerificationEmail(email, token, name) {
    console.log(
      `📧 Preparing to send verification email to ${email} via Brevo...`,
    )

    const verificationUrl = `${process.env.APP_URL}/auth/verify-email?token=${token}`

    const mailOptions = {
      from: {
        name: process.env.BREVO_FROM_NAME || 'Book My Ticket',
        address: process.env.BREVO_FROM_EMAIL || 'noreply@yourapp.com',
      },
      to: email,
      subject: 'Verify Your Email Address',
      html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Email Verification</title>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #4CAF50; color: white; text-align: center; padding: 20px; border-radius: 5px 5px 0 0; }
                        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; border: 1px solid #ddd; border-top: none; }
                        .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
                        .button:hover { background-color: #45a049; }
                        .token { background-color: #f4f4f4; padding: 10px; border-radius: 3px; font-family: monospace; word-break: break-all; margin: 10px 0; }
                        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Welcome to Book My Ticket!</h1>
                        </div>
                        <div class="content">
                            <h2>Hello ${name}!</h2>
                            <p>Thank you for registering. Please verify your email address to complete your registration.</p>
                            
                            <div style="text-align: center;">
                                <a href="${verificationUrl}" class="button">Verify Email Address</a>
                            </div>
                            
                            <p>Or copy and paste this link into your browser:</p>
                            <div class="token">
                                <a href="${verificationUrl}">${verificationUrl}</a>
                            </div>
                            
                            <p><strong>Your verification token:</strong></p>
                            <div class="token">
                                ${token}
                            </div>
                            
                            <p><strong>Important:</strong> This link will expire in 15 minutes.</p>
                            
                            <p>If you didn't create an account, please ignore this email.</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated message, please do not reply.</p>
                            <p>&copy; 2026 Book My Ticket. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
    }

    const transporter = createBrevoTransporter()

    try {
      const info = await transporter.sendMail(mailOptions)
      console.log(
        `✅ Verification email sent successfully via Brevo to: ${email}`,
      )
      console.log(`📬 Message ID: ${info.messageId}`)
      // return info;
    } catch (error) {
      console.error('❌ Failed to send email via Brevo:', error)
      throw new Error('Failed to send verification email')
    }
  }

  static async sendVerificationSuccessEmail(email, name) {
    const mailOptions = {
      from: {
        name: process.env.BREVO_FROM_NAME || 'Book My Ticket',
        address: process.env.BREVO_FROM_EMAIL || 'noreply@yourapp.com',
      },
      to: email,
      subject: 'Email Verified Successfully',
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4CAF50;">Email Verified! 🎉</h2>
                    <p>Hello ${name},</p>
                    <p>Your email has been successfully verified. You can now access all features of our platform.</p>
                    <p>Thank you for joining us!</p>
                    <br>
                    <p>Best regards,<br>Book My Ticket Team</p>
                </div>
            `,
    }
    const transporter = createBrevoTransporter()
    try {
      await transporter.sendMail(mailOptions)
      console.log(`✅ Verification success email sent to: ${email}`)
    } catch (error) {
      console.error('Failed to send success email:', error)
    }
  }

  static async sendPasswordResetEmail(email, resetUrl, name) {
    console.log(`📧 Sending password reset email to ${email}...`)

    const mailOptions = {
      from: {
        name: process.env.BREVO_FROM_NAME || 'Your App',
        address: process.env.BREVO_FROM_EMAIL || 'noreply@yourapp.com',
      },
      to: email,
      subject: 'Password Reset Request',
      html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4CAF50;">Reset Your Password</h2>
                <p>Hello ${name},</p>
                <p>You requested to reset your password. Click the button below to reset it:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                </div>
                <p>Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <br>
                <p>Best regards,<br>Your App Team</p>
            </div>
        `,
    }

    const transporter = createBrevoTransporter()

    try {
      await transporter.sendMail(mailOptions)
      console.log(`✅ Password reset email sent to: ${email}`)
    } catch (error) {
      console.error('Failed to send reset email:', error)
      throw new Error('Failed to send reset email')
    }
  }

  static async sendPasswordChangeConfirmationEmail(email, name) {
    const mailOptions = {
      from: {
        name: process.env.BREVO_FROM_NAME || 'Your App',
        address: process.env.BREVO_FROM_EMAIL || 'noreply@yourapp.com',
      },
      to: email,
      subject: 'Password Changed Successfully',
      html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4CAF50;">Password Changed</h2>
                <p>Hello ${name},</p>
                <p>Your password has been successfully changed.</p>
                <p>If you didn't make this change, please contact support immediately.</p>
                <br>
                <p>Best regards,<br>Your App Team</p>
            </div>
        `,
    }

    const transporter = createBrevoTransporter()

    try {
      await transporter.sendMail(mailOptions)
      console.log(`✅ Password change confirmation sent to: ${email}`)
    } catch (error) {
      console.error('Failed to send confirmation email:', error)
    }
  }
}
