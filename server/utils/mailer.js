const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
  port:   parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

exports.sendResetEmail = async (to, username, resetUrl) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { background: #080808; color: #f0f0f0; font-family: -apple-system, sans-serif; margin: 0; padding: 0; }
        .container { max-width: 480px; margin: 40px auto; padding: 0 20px; }
        .card {
          background: linear-gradient(180deg, #161616 0%, #111111 100%);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px; padding: 40px; text-align: center;
        }
        .logo { font-size: 32px; font-weight: 800; letter-spacing: -1px;
                background: linear-gradient(135deg, #fff, #a5b4fc); -webkit-background-clip: text;
                -webkit-text-fill-color: transparent; margin-bottom: 8px; }
        .subtitle { color: #606060; font-size: 13px; margin-bottom: 32px; }
        h2 { font-size: 22px; font-weight: 700; margin: 0 0 12px; color: #f0f0f0; }
        p  { color: #909090; font-size: 14px; line-height: 1.6; margin: 0 0 28px; }
        .btn {
          display: inline-block; padding: 14px 32px; border-radius: 14px;
          background: linear-gradient(135deg, #6366f1, #4338ca);
          color: #fff !important; font-size: 14px; font-weight: 700;
          text-decoration: none;
          box-shadow: 0 8px 32px rgba(99,102,241,0.35);
        }
        .expiry { color: #4a4a4a; font-size: 12px; margin-top: 24px; }
        .divider { border: none; border-top: 1px solid rgba(255,255,255,0.05); margin: 28px 0; }
        .footer { color: #333; font-size: 11px; text-align: center; margin-top: 24px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="logo">Noothing</div>
          <div class="subtitle">Privacy-first messaging</div>
          <hr class="divider">
          <h2>Reset your password</h2>
          <p>Hey <strong style="color:#f0f0f0">@${username}</strong>,<br>
          We received a request to reset your password. Click the button below to create a new one.</p>
          <a href="${resetUrl}" class="btn">Reset Password →</a>
          <p class="expiry">This link expires in <strong>15 minutes</strong>.<br>
          If you didn't request this, you can safely ignore this email.</p>
        </div>
        <div class="footer">© ${new Date().getFullYear()} Noothing · Privacy-first messaging</div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from:    `"Noothing" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Reset your Noothing password',
    html,
  });
};