import requests as req
import os

# Resend is used instead of raw SMTP because Render's free tier blocks
# outbound SMTP ports (25/465/587). Resend sends over plain HTTPS, which
# works fine on any tier.
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
RESEND_FROM = os.getenv("RESEND_FROM", "onboarding@resend.dev")
OWNER_EMAIL = os.getenv("OWNER_EMAIL")  # your own inbox — where feedback notifications land


def send_email(to_email: str, subject: str, html_body: str) -> bool:
    """Sends an email via Resend's HTTPS API. Fails silently (returns False)
    so it never blocks whatever triggered it — this is for notifications,
    not critical user-facing flows."""
    if not RESEND_API_KEY:
        print("RESEND_API_KEY not set — skipping email send")
        return False

    try:
        resp = req.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "from": RESEND_FROM,
                "to": [to_email],
                "subject": subject,
                "html": html_body,
            },
            timeout=15
        )
        if resp.status_code >= 400:
            print(f"Resend email failed ({resp.status_code}): {resp.text}")
            return False
        return True
    except Exception as e:
        print(f"Resend email error: {e}")
        return False


def send_feedback_notification(
    rating: int,
    comment: str,
    submitter_email: str = None,
    category: str = "",
    context: str = "logout",
    name: str = None,
    channel_name: str = None,
):
    """Notifies the site owner (OWNER_EMAIL) whenever someone submits feedback."""
    if not OWNER_EMAIL:
        print("OWNER_EMAIL not set — skipping feedback notification")
        return False

    stars = "⭐" * rating + "☆" * (5 - rating)
    is_deletion = context == "delete_account"

    display_name = name or "Anonymous"
    display_email = submitter_email or "Not logged in"
    display_channel = channel_name or "—"

    comment_html = (
        f'<p style="margin:4px 0 0;">{comment}</p>'
        if comment and comment.strip()
        else '<p style="margin:4px 0 0; color:#888;">No comment left.</p>'
    )
    category_row = (
        f'''
        <tr>
          <td style="padding:6px 0; color:#888; width:110px;">Category</td>
          <td style="padding:6px 0; color:#111;">{category}</td>
        </tr>'''
        if category else ""
    )

    banner = (
        '<div style="background:#fee2e2;color:#b91c1c;padding:8px 14px;border-radius:6px;'
        'font-weight:bold;font-size:13px;display:inline-block;margin-bottom:16px;">'
        '⚠️ Submitted while deleting account</div>'
        if is_deletion else ""
    )

    subject_prefix = "🚨 YTAnalyzer — Account Deletion Feedback" if is_deletion else "📬 YTAnalyzer Feedback"
    subject = f"{subject_prefix}: {rating}/5 stars"

    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; border:1px solid #eee; border-radius:10px; overflow:hidden;">
      <div style="background:#0a0a0a; padding:18px 24px;">
        <span style="color:#ffffff; font-weight:800; font-size:16px; letter-spacing:0.5px;">
          YT<span style="color:#DC2626;">Analyzer</span>
        </span>
        <span style="color:#888; font-size:12px; margin-left:8px;">Feedback Notification</span>
      </div>
      <div style="padding:24px; color:#111;">
        {banner}
        <p style="font-size:24px; margin:0 0 16px;">{stars} <span style="font-size:15px; color:#666;">({rating}/5)</span></p>

        <table style="width:100%; border-collapse:collapse; font-size:14px; margin-bottom:16px;">
          <tr>
            <td style="padding:6px 0; color:#888; width:110px;">Name</td>
            <td style="padding:6px 0; color:#111; font-weight:600;">{display_name}</td>
          </tr>
          <tr>
            <td style="padding:6px 0; color:#888;">Email</td>
            <td style="padding:6px 0; color:#111;">{display_email}</td>
          </tr>
          <tr>
            <td style="padding:6px 0; color:#888;">Channel</td>
            <td style="padding:6px 0; color:#111;">{display_channel}</td>
          </tr>
          {category_row}
        </table>

        <div style="background:#f9fafb; border-left:3px solid #DC2626; padding:12px 14px; border-radius:4px; font-size:14px; color:#333;">
          <p style="margin:0; color:#888; font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">Comment</p>
          {comment_html}
        </div>
      </div>
    </div>
    """
    return send_email(OWNER_EMAIL, subject, html)