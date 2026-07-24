import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
MAIL_FROM = os.getenv("MAIL_FROM")
MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
MAIL_PORT = int(os.getenv("MAIL_PORT", 587))

def send_welcome_email(to_email: str, name: str):
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Welcome to YTAnalyzer! 🎉"
        msg["From"] = f"YTAnalyzer <{MAIL_FROM}>"
        msg["To"] = to_email

        html = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:#dc2626;border-radius:12px;padding:12px 20px;">
        <span style="color:white;font-size:24px;font-weight:900;letter-spacing:1px;">YT</span>
        <span style="color:#fca5a5;font-size:24px;font-weight:900;">Analyzer</span>
      </div>
    </div>

    <div style="background:#111111;border:1px solid #1f2937;border-radius:16px;padding:32px;">
      <h1 style="color:#ffffff;font-size:24px;margin:0 0 8px 0;">
        Welcome, {name}! 🎉
      </h1>
      <p style="color:#9ca3af;font-size:15px;margin:0 0 24px 0;">
        You've successfully joined YTAnalyzer — your AI-powered YouTube growth platform.
      </p>

      <div style="background:#0a0a0a;border:1px solid #1f2937;border-radius:12px;padding:20px;margin-bottom:24px;">
        <h2 style="color:#dc2626;font-size:14px;font-weight:700;letter-spacing:2px;margin:0 0 16px 0;">
          WHAT YOU CAN DO NOW
        </h2>
        <div style="margin-bottom:12px;">
          <span style="color:#dc2626;margin-right:8px;">→</span>
          <span style="color:#d1d5db;font-size:14px;">
            <strong style="color:white;">Analyze any YouTube video</strong> — get AI verdict, title score, sentiment
          </span>
        </div>
        <div style="margin-bottom:12px;">
          <span style="color:#dc2626;margin-right:8px;">→</span>
          <span style="color:#d1d5db;font-size:14px;">
            <strong style="color:white;">Predict your video idea</strong> — know if it will hit or flop before filming
          </span>
        </div>
        <div style="margin-bottom:12px;">
          <span style="color:#dc2626;margin-right:8px;">→</span>
          <span style="color:#d1d5db;font-size:14px;">
            <strong style="color:white;">Generate optimized titles</strong> — 10 AI titles in seconds
          </span>
        </div>
        <div style="margin-bottom:12px;">
          <span style="color:#dc2626;margin-right:8px;">→</span>
          <span style="color:#d1d5db;font-size:14px;">
            <strong style="color:white;">Compare channels</strong> — see how you stack up against competitors
          </span>
        </div>
        <div>
          <span style="color:#dc2626;margin-right:8px;">→</span>
          <span style="color:#d1d5db;font-size:14px;">
            <strong style="color:white;">Connect your YouTube channel</strong> — unlock personalized AI insights
          </span>
        </div>
      </div>

      <div style="text-align:center;margin-bottom:24px;">
        <a href="https://youtube-analyzer-drab.vercel.app/dashboard"
           style="display:inline-block;background:#dc2626;color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;">
          Go to Dashboard →
        </a>
      </div>

      <p style="color:#4b5563;font-size:13px;text-align:center;margin:0;">
        Need help? Reply to this email and we'll get back to you.
      </p>
    </div>

    <div style="text-align:center;margin-top:24px;">
      <p style="color:#374151;font-size:12px;margin:0;">
        © 2026 YTAnalyzer · Built by Lavish Dadhich
      </p>
      <p style="color:#374151;font-size:12px;margin:4px 0 0 0;">
        <a href="https://youtube-analyzer-drab.vercel.app/privacy" style="color:#6b7280;text-decoration:none;">Privacy Policy</a>
        &nbsp;·&nbsp;
        <a href="https://youtube-analyzer-drab.vercel.app/terms" style="color:#6b7280;text-decoration:none;">Terms of Service</a>
      </p>
    </div>

  </div>
</body>
</html>
"""

        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP(MAIL_SERVER, MAIL_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            server.sendmail(MAIL_FROM, to_email, msg.as_string())

        print(f"✅ Welcome email sent to {to_email}")
        return True

    except Exception as e:
        print(f"❌ Email failed: {e}")
        return False


def send_oauth_welcome_email(to_email: str, name: str):
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Your YouTube channel is now connected! 🔗"
        msg["From"] = f"YTAnalyzer <{MAIL_FROM}>"
        msg["To"] = to_email

        html = f"""
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">

    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:#dc2626;border-radius:12px;padding:12px 20px;">
        <span style="color:white;font-size:24px;font-weight:900;">YT</span>
        <span style="color:#fca5a5;font-size:24px;font-weight:900;">Analyzer</span>
      </div>
    </div>

    <div style="background:#111111;border:1px solid #1f2937;border-radius:16px;padding:32px;">
      <h1 style="color:#ffffff;font-size:24px;margin:0 0 8px 0;">
        Channel Connected! 🔗
      </h1>
      <p style="color:#9ca3af;font-size:15px;margin:0 0 24px 0;">
        Hi {name}, your YouTube channel has been successfully verified and connected to YTAnalyzer.
      </p>

      <div style="background:#052e16;border:1px solid #16a34a;border-radius:12px;padding:16px;margin-bottom:24px;">
        <p style="color:#4ade80;font-size:14px;margin:0;">
          ✓ Channel verified via Google OAuth
        </p>
        <p style="color:#86efac;font-size:13px;margin:8px 0 0 0;">
          Your real channel data is now powering your dashboard analytics.
        </p>
      </div>

      <div style="text-align:center;">
        <a href="https://youtube-analyzer-drab.vercel.app/dashboard"
           style="display:inline-block;background:#dc2626;color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;">
          View My Dashboard →
        </a>
      </div>
    </div>

    <p style="color:#374151;font-size:12px;text-align:center;margin-top:24px;">
      © 2026 YTAnalyzer · Built by Lavish Dadhich
    </p>
  </div>
</body>
</html>
"""

        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP(MAIL_SERVER, MAIL_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            server.sendmail(MAIL_FROM, to_email, msg.as_string())

        print(f"✅ OAuth welcome email sent to {to_email}")
        return True

    except Exception as e:
        print(f"❌ OAuth email failed: {e}")
        return False