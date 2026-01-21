import nodemailer from 'nodemailer';
import config from '../config';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = !!(config.smtp.user && config.smtp.pass);

    if (this.isConfigured) {
      this.transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure,
        auth: {
          user: config.smtp.user,
          pass: config.smtp.pass,
        },
      });
    } else {
      // Create a dummy transporter for development
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
      console.log('⚠️  Email not configured. Emails will be logged to console.');
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"${config.smtp.fromName}" <${config.smtp.fromEmail || config.smtp.user}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ''),
      };

      if (this.isConfigured) {
        await this.transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to: ${options.to}`);
      } else {
        // Log email in development when not configured
        console.log('\n📧 ========== EMAIL (Not Sent - SMTP not configured) ==========');
        console.log(`To: ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        console.log('Body:', options.text || options.html.replace(/<[^>]*>/g, ''));
        console.log('================================================================\n');
      }

      return true;
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      return false;
    }
  }

  async sendInviteEmail(
    email: string,
    inviteToken: string,
    role: string,
    inviterName?: string
  ): Promise<boolean> {
    const inviteLink = `${config.frontendUrl}/register/${inviteToken}`;
    const expiresIn = config.inviteTokenExpiresHours;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited to NexusAdmin</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">NexusAdmin</h1>
              <p style="margin: 10px 0 0; color: #e8e8e8; font-size: 14px;">Role-Based Admin & Project Management</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px; font-weight: 600;">You're Invited! 🎉</h2>
              
              <p style="margin: 0 0 20px; color: #555555; font-size: 16px; line-height: 1.6;">
                ${inviterName ? `<strong>${inviterName}</strong> has invited you` : 'You have been invited'} to join <strong>NexusAdmin</strong> as a <strong style="color: #667eea;">${role}</strong>.
              </p>
              
              <p style="margin: 0 0 30px; color: #555555; font-size: 16px; line-height: 1.6;">
                Click the button below to create your account and get started:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <a href="${inviteLink}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 20px; color: #888888; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link in your browser:
              </p>
              
              <p style="margin: 0 0 30px; padding: 15px; background-color: #f8f9fa; border-radius: 6px; word-break: break-all; color: #667eea; font-size: 14px;">
                ${inviteLink}
              </p>
              
              <!-- Warning -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fff8e6; border-radius: 6px; border-left: 4px solid #ffc107;">
                <tr>
                  <td style="padding: 15px;">
                    <p style="margin: 0; color: #856404; font-size: 14px;">
                      ⏰ <strong>This invitation expires in ${expiresIn} hours.</strong><br>
                      Please complete your registration before then.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0 0 10px; color: #888888; font-size: 14px;">
                If you didn't expect this invitation, you can safely ignore this email.
              </p>
              <p style="margin: 0; color: #aaaaaa; font-size: 12px;">
                © ${new Date().getFullYear()} NexusAdmin. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const text = `
You're Invited to NexusAdmin!

${inviterName ? `${inviterName} has invited you` : 'You have been invited'} to join NexusAdmin as a ${role}.

Click the link below to create your account:
${inviteLink}

⏰ This invitation expires in ${expiresIn} hours.

If you didn't expect this invitation, you can safely ignore this email.

© ${new Date().getFullYear()} NexusAdmin
    `;

    return this.sendEmail({
      to: email,
      subject: `You're invited to join NexusAdmin as ${role}`,
      html,
      text,
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const loginLink = `${config.frontendUrl}/login`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to NexusAdmin</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">NexusAdmin</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px; font-weight: 600;">Welcome, ${name}! 🎉</h2>
              
              <p style="margin: 0 0 20px; color: #555555; font-size: 16px; line-height: 1.6;">
                Your account has been successfully created. You now have access to NexusAdmin.
              </p>
              
              <p style="margin: 0 0 30px; color: #555555; font-size: 16px; line-height: 1.6;">
                You can now log in and start managing projects with your team.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <a href="${loginLink}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                      Go to Login
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #aaaaaa; font-size: 12px;">
                © ${new Date().getFullYear()} NexusAdmin. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Welcome to NexusAdmin!',
      html,
    });
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;
