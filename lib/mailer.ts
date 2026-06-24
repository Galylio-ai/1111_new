import nodemailer, { Transporter } from "nodemailer";

// Reuses the SAME SMTP credentials as the backend Python mailer (already set on
// the VPS): SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASSWORD / SMTP_FROM /
// SMTP_USE_SSL / SMTP_USE_TLS. No new mail account needed.

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (!host || !user || !pass) return null; // SMTP not configured → skip silently

  if (!transporter) {
    const port = parseInt(process.env.SMTP_PORT ?? "587", 10);
    const useSsl = (process.env.SMTP_USE_SSL ?? "false").toLowerCase() === "true";
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: useSsl || port === 465, // SSL on 465, STARTTLS otherwise
      auth: { user, pass },
    });
  }
  return transporter;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const t = getTransporter();
  if (!t) {
    console.warn("[mailer] SMTP not configured — skipping email to", to);
    return false;
  }
  const from = process.env.SMTP_FROM ?? "noreply@1111.tn";
  try {
    await t.sendMail({ from, to, subject, html });
    return true;
  } catch (err) {
    console.error("[mailer] sendMail failed:", err);
    return false;
  }
}

const fmt = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 3 });

// French price-change email — drop OR rise. `productUrl` deep-links to the product page.
export function priceChangeEmail(opts: {
  kind: "drop" | "rise";
  fullName?: string | null;
  productName: string;
  oldPrice: number;
  newPrice: number;
  img?: string | null;
  productUrl: string;
}): { subject: string; html: string } {
  const { kind, fullName, productName, oldPrice, newPrice, img, productUrl } = opts;
  const isDrop = kind === "drop";
  const delta = Math.abs(newPrice - oldPrice);
  const pct = oldPrice > 0 ? Math.round((delta / oldPrice) * 100) : 0;
  const hello = fullName ? `Bonjour ${fullName},` : "Bonjour,";

  const emoji = isDrop ? "📉" : "📈";
  const sign = isDrop ? "−" : "+";
  const subject = `${emoji} ${isDrop ? "Baisse" : "Hausse"} de prix : ${productName} (${sign}${pct}%)`;

  // Theme: emerald for drops, orange/red for rises
  const headerBg = isDrop
    ? "linear-gradient(135deg,#059669,#065f46)"
    : "linear-gradient(135deg,#ea580c,#9a3412)";
  const ctaBg = isDrop ? "#059669" : "#ea580c";
  const newPriceColor = isDrop ? "#059669" : "#dc2626";
  const badgeBg = isDrop ? "#ecfdf5" : "#fff7ed";
  const badgeText = isDrop ? "#059669" : "#c2410c";
  const headerTitle = isDrop ? "Le prix a baissé ! 🎉" : "Le prix a augmenté ⚠️";
  const intro = isDrop
    ? "Bonne nouvelle ! Le prix d'un produit que vous suivez vient de baisser."
    : "Le prix d'un produit que vous suivez vient d'augmenter. C'est peut-être le moment d'agir avant qu'il ne grimpe encore.";
  const badgeText2 = isDrop
    ? `Vous économisez ${fmt(delta)} DT (−${pct}%)`
    : `Augmentation de ${fmt(delta)} DT (+${pct}%)`;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
  <div style="max-width:560px;margin:0 auto;padding:24px;">
    <div style="text-align:center;margin-bottom:16px;">
      <span style="font-size:22px;font-weight:900;color:#e11d2d;">1111<span style="color:#f6c453;">.tn</span></span>
    </div>
    <div style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:${headerBg};padding:20px 24px;color:#fff;">
        <div style="font-size:13px;text-transform:uppercase;letter-spacing:1px;opacity:.85;">Alerte prix</div>
        <div style="font-size:20px;font-weight:800;margin-top:4px;">${headerTitle}</div>
      </div>
      <div style="padding:24px;">
        <p style="margin:0 0 16px;font-size:15px;">${hello}</p>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.5;">
          ${intro}
        </p>
        <div style="display:flex;gap:16px;align-items:center;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:20px;">
          ${img ? `<img src="${img}" alt="" width="72" height="72" style="border-radius:8px;object-fit:contain;background:#fff;border:1px solid #eee;">` : ""}
          <div>
            <div style="font-size:15px;font-weight:700;color:#111827;">${productName}</div>
            <div style="margin-top:8px;">
              <span style="text-decoration:line-through;color:#9ca3af;font-size:14px;">${fmt(oldPrice)} DT</span>
              &nbsp;<span style="color:${newPriceColor};font-weight:900;font-size:20px;">${fmt(newPrice)} DT</span>
            </div>
            <div style="margin-top:6px;display:inline-block;background:${badgeBg};color:${badgeText};font-weight:700;font-size:12px;padding:3px 8px;border-radius:999px;">
              ${badgeText2}
            </div>
          </div>
        </div>
        <div style="text-align:center;margin:24px 0 8px;">
          <a href="${productUrl}" style="display:inline-block;background:${ctaBg};color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:12px 28px;border-radius:10px;">
            Voir le produit
          </a>
        </div>
      </div>
    </div>
    <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:20px;line-height:1.5;">
      Vous recevez cet e-mail car vous avez créé une alerte prix sur 1111.tn.<br>
      Gérez vos alertes depuis votre profil.
    </p>
  </div>
</body>
</html>`;

  return { subject, html };
}

// Back-compat thin wrapper for the original drop-only signature.
export function priceDropEmail(opts: {
  fullName?: string | null;
  productName: string;
  oldPrice: number;
  newPrice: number;
  img?: string | null;
  productUrl: string;
}): { subject: string; html: string } {
  return priceChangeEmail({ ...opts, kind: "drop" });
}
