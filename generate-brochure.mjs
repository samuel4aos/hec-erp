import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read screenshots as base64
function imgData(name) {
  const p = path.join(__dirname, 'screenshots', name);
  if (!fs.existsSync(p)) return '';
  const buf = fs.readFileSync(p);
  return `data:image/png;base64,${buf.toString('base64')}`;
}

const imgs = {
  home: imgData('01-homepage.png'),
  live: imgData('02-livestream.png'),
  grace: imgData('03-gracegiver.png'),
  prayer: imgData('04-prayer.png'),
  academy: imgData('05-academy.png'),
  bookstore: imgData('06-bookstore.png'),
};

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HEC ERP — Enterprise Church Management System</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Inter', -apple-system, sans-serif;
    background: #0a0405;
    color: #f8f3e3;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  .page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 40px;
  }

  /* COVER PAGE */
  .cover {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    position: relative;
    background:
      radial-gradient(1200px 600px at 20% 0, rgba(163,32,32,0.45) 0%, transparent 60%),
      radial-gradient(900px 600px at 90% 30%, rgba(0,100,0,0.28) 0%, transparent 60%),
      radial-gradient(800px 500px at 50% 100%, rgba(212,175,55,0.18) 0%, transparent 60%),
      linear-gradient(180deg, #1a0606 0%, #0a0405 60%, #050202 100%);
    padding: 80px 40px;
  }
  .cover::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(212,175,55,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(212,175,55,0.06) 1px, transparent 1px);
    background-size: 48px 48px;
  }
  .cover-content { position: relative; z-index: 1; }
  .cover h1 {
    font-family: 'Cinzel', serif;
    font-size: 52px;
    font-weight: 700;
    letter-spacing: 4px;
    margin-bottom: 16px;
    background: linear-gradient(135deg, #fbe79a, #d4af37, #8a6c1c);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(0 2px 6px rgba(212,175,55,0.25));
  }
  .cover .subtitle {
    font-family: 'Cormorant Garamond', serif;
    font-size: 26px;
    color: rgba(248,243,227,0.7);
    font-style: italic;
    margin-bottom: 40px;
  }
  .cover .tagline {
    font-size: 18px;
    color: rgba(248,243,227,0.5);
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-bottom: 12px;
  }
  .cover .divider {
    width: 120px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #d4af37, transparent);
    margin: 30px auto;
  }
  .cover .badge {
    display: inline-block;
    padding: 8px 28px;
    border: 1px solid rgba(212,175,55,0.3);
    border-radius: 4px;
    font-size: 12px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #d4af37;
    margin-top: 20px;
  }

  /* SECTIONS */
  .section {
    padding: 80px 0;
    border-bottom: 1px solid rgba(212,175,55,0.1);
  }
  .section:last-child { border-bottom: none; }

  .section-label {
    font-family: 'Cinzel', serif;
    font-size: 10px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: #d4af37;
    margin-bottom: 12px;
  }
  .section h2 {
    font-family: 'Cinzel', serif;
    font-size: 32px;
    font-weight: 600;
    margin-bottom: 20px;
    color: #f8f3e3;
  }
  .section h3 {
    font-family: 'Cinzel', serif;
    font-size: 20px;
    font-weight: 500;
    margin-bottom: 12px;
    color: #d4af37;
  }
  .section p {
    font-size: 15px;
    color: rgba(248,243,227,0.75);
    max-width: 800px;
    margin-bottom: 24px;
  }

  .screenshot {
    margin: 30px 0;
    border-radius: 8px;
    border: 1px solid rgba(212,175,55,0.15);
    overflow: hidden;
    box-shadow: 0 20px 60px -20px rgba(0,0,0,0.6);
  }
  .screenshot img {
    width: 100%;
    height: auto;
    display: block;
  }

  .feature-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin: 30px 0;
  }
  .feature-card {
    background: linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02));
    border: 1px solid rgba(212,175,55,0.12);
    border-radius: 8px;
    padding: 28px;
    backdrop-filter: blur(18px);
  }
  .feature-card h4 {
    font-family: 'Cinzel', serif;
    font-size: 15px;
    color: #d4af37;
    margin-bottom: 8px;
  }
  .feature-card p {
    font-size: 13px;
    margin-bottom: 0;
    color: rgba(248,243,227,0.65);
  }

  .tech-list {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
    margin: 24px 0;
  }
  .tech-item {
    background: rgba(212,175,55,0.05);
    border: 1px solid rgba(212,175,55,0.1);
    border-radius: 6px;
    padding: 16px 20px;
  }
  .tech-item .label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: rgba(248,243,227,0.4);
    margin-bottom: 4px;
  }
  .tech-item .value {
    font-family: 'Cinzel', serif;
    font-size: 14px;
    color: #d4af37;
  }

  .stats-row {
    display: flex;
    gap: 40px;
    margin: 40px 0;
    justify-content: center;
  }
  .stat {
    text-align: center;
  }
  .stat .num {
    font-family: 'Cinzel', serif;
    font-size: 42px;
    color: #d4af37;
    font-weight: 600;
  }
  .stat .desc {
    font-size: 12px;
    color: rgba(248,243,227,0.5);
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-top: 4px;
  }

  .role-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
    margin: 24px 0;
  }
  .role-card {
    background: rgba(163,32,32,0.1);
    border: 1px solid rgba(163,32,32,0.2);
    border-radius: 8px;
    padding: 20px;
    text-align: center;
  }
  .role-card .icon { font-size: 28px; margin-bottom: 8px; }
  .role-card h4 { font-family: 'Cinzel', serif; font-size: 14px; color: #d4af37; }
  .role-card p { font-size: 12px; color: rgba(248,243,227,0.6); margin-bottom: 0; }

  .footer-page {
    text-align: center;
    padding: 60px 0;
    color: rgba(248,243,227,0.3);
    font-size: 13px;
  }
  .footer-page .big {
    font-family: 'Cinzel', serif;
    font-size: 28px;
    color: #d4af37;
    margin-bottom: 8px;
  }

  @media print {
    @page { margin: 0; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>

<!-- COVER -->
<div class="cover">
  <div class="cover-content">
    <div class="tagline">Enterprise Resource Planning</div>
    <h1>HOLINESS<br>EVANGELISTIC CHURCH</h1>
    <div class="divider"></div>
    <div class="subtitle">A Unified Digital Ecosystem for Church Administration,<br>Engagement, and Growth</div>
    <div class="badge">Full-Stack ERP System &mdash; 2026</div>
  </div>
</div>

<div class="page">

<!-- EXECUTIVE SUMMARY -->
<div class="section">
  <div class="section-label">Overview</div>
  <h2>Transform Church Operations with One Platform</h2>
  <p>
    The HEC ERP is a comprehensive, full-stack church management system designed to unify every facet of
    ministry administration — from member engagement and attendance tracking to financial management,
    content publishing, and multi-channel communication. Built for scale, security, and multilingual
    congregations.
  </p>

  <div class="stats-row">
    <div class="stat"><div class="num">30+</div><div class="desc">Feature Modules</div></div>
    <div class="stat"><div class="num">5</div><div class="desc">Languages Supported</div></div>
    <div class="stat"><div class="num">5</div><div class="desc">User Roles</div></div>
    <div class="stat"><div class="num">3</div><div class="desc">Notification Channels</div></div>
  </div>
</div>

<!-- KEY FEATURES -->
<div class="section">
  <div class="section-label">Features</div>
  <h2>Everything Your Ministry Needs</h2>

  <div class="feature-grid">
    <div class="feature-card"><h4>📺 Live Stream Management</h4><p>Dual-platform support for YouTube and Facebook Live. Auto-detects stream source, syncs YouTube Live Chat, and provides integrated Sanctuary Chat for non-YouTube streams.</p></div>
    <div class="feature-card"><h4>📖 Online Bookstore</h4><p>Full product catalog with authors, pricing variants, stock status. HQ-managed inventory, bank account management, and order verification workflow.</p></div>
    <div class="feature-card"><h4>🙏 Prayer & Testimony Wall</h4><p>AI-powered prayer categorization using GPT-4o-mini. Community prayer chain, testimony sharing, and automated follow-ups.</p></div>
    <div class="feature-card"><h4>📊 Attendance Intelligence</h4><p>Per-member attendance tracking, monthly trend visualization (Recharts), automated care alerts for 3+ missed Sundays, branch-wide analytics.</p></div>
    <div class="feature-card"><h4>🎓 HEC Academy</h4><p>Course management with student enrollments, progress tracking, and role-based access for instructors and administrators.</p></div>
    <div class="feature-card"><h4>📅 Event Management</h4><p>Create, promote, and manage events with online registration, capacity tracking, and automated confirmation messages.</p></div>
    <div class="feature-card"><h4>💝 Grace Giver Hub</h4><p>Digital giving platform with multi-bank account display, color-coded accounts, tithes, offerings, and special project contributions.</p></div>
    <div class="feature-card"><h4>📱 Multi-Channel Comms</h4><p>WhatsApp Business API, Termii SMS, and Resend email — all integrated. Automated notifications for events, follow-ups, and confirmations.</p></div>
    <div class="feature-card"><h4>🔐 Role-Based Security</h4><p>Five user roles: HQ Admin, Pastor, Treasurer, Ushers, Admin Staff. Granular permissions, JWT authentication, and audit logging.</p></div>
    <div class="feature-card"><h4>🌐 Multilingual CMS</h4><p>Full landing page CMS with hero, overseer, church info, ticker, video messages, and image uploads. 5 languages: English, Yoruba, Hausa, Igbo, French.</p></div>
    <div class="feature-card"><h4>📈 Analytics Dashboard</h4><p>Real-time insights on attendance trends, giving patterns, event participation, and member growth — all with exportable reports.</p></div>
    <div class="feature-card"><h4>📋 First-Timer Follow-up</h4><p>Automated tracking and engagement workflows for new members. Counseling log and soul-winning tracker integrated.</p></div>
  </div>
</div>

<!-- SCREENSHOTS -->
<div class="section">
  <div class="section-label">In Action</div>
  <h2>Beautiful, Immersive Experience</h2>
  <p>Crafted with a rich maroon, gold, and parchment palette. Every screen reflects the dignity and reverence of ministry work.</p>

  <div class="screenshot"><img src="${imgs.home}" alt="Homepage — Landing Page"></div>
  <p style="text-align:center;font-size:12px;color:rgba(248,243,227,0.4);margin-top:-16px;margin-bottom:40px;">Landing Page — Hero Section with Divine Grid Background</p>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
    <div><div class="screenshot" style="margin:0;"><img src="${imgs.live}" alt="Live Stream"></div><p style="text-align:center;font-size:12px;color:rgba(248,243,227,0.4);margin-top:8px;">Live Stream — YouTube & Facebook Dual-Platform</p></div>
    <div><div class="screenshot" style="margin:0;"><img src="${imgs.grace}" alt="Grace Giver"></div><p style="text-align:center;font-size:12px;color:rgba(248,243,227,0.4);margin-top:8px;">Grace Giver Hub — Digital Giving Platform</p></div>
    <div><div class="screenshot" style="margin:0;"><img src="${imgs.prayer}" alt="Prayer Wall"></div><p style="text-align:center;font-size:12px;color:rgba(248,243,227,0.4);margin-top:8px;">Prayer & Testimony Wall — AI-Powered Categorization</p></div>
    <div><div class="screenshot" style="margin:0;"><img src="${imgs.bookstore}" alt="Bookstore"></div><p style="text-align:center;font-size:12px;color:rgba(248,243,227,0.4);margin-top:8px;">Bookstore — Product Catalog & Checkout</p></div>
  </div>
</div>

<!-- ROLES -->
<div class="section">
  <div class="section-label">Access Control</div>
  <h2>Five Roles, One Platform</h2>
  <p>Each ministry role gets a tailored workspace with relevant tools and permissions. No clutter, no confusion — just what you need.</p>

  <div class="role-grid">
    <div class="role-card"><div class="icon">🏛️</div><h4>HQ Admin</h4><p>Full system control: CMS, user management, bookstore, attendance reports, analytics, branch oversight, and all settings.</p></div>
    <div class="role-card"><div class="icon">👔</div><h4>Pastor</h4><p>Preaching log, soul-winning tracker, counselling records, prayer chain, member directory, event registrations.</p></div>
    <div class="role-card"><div class="icon">💰</div><h4>Treasurer</h4><p>Giving reports, expense tracking, remittance management, service counts, and financial data export.</p></div>
    <div class="role-card"><div class="icon">📋</div><h4>Ushers</h4><p>Service count recording, first-timer capture, attendance check-in, and welcome workflows.</p></div>
    <div class="role-card"><div class="icon">🔧</div><h4>Admin Staff</h4><p>Member directory, event management, communication tools, and day-to-day church operations.</p></div>
  </div>
</div>

<!-- TECHNOLOGY -->
<div class="section">
  <div class="section-label">Architecture</div>
  <h2>Built for the Modern Church</h2>
  <p>Enterprise-grade technology stack that delivers performance, reliability, and a world-class user experience.</p>

  <div class="tech-list">
    <div class="tech-item"><div class="label">Frontend</div><div class="value">React 19 + TypeScript</div></div>
    <div class="tech-item"><div class="label">Styling</div><div class="value">Tailwind CSS 4.1</div></div>
    <div class="tech-item"><div class="label">Animations</div><div class="value">Framer Motion</div></div>
    <div class="tech-item"><div class="label">Charts</div><div class="value">Recharts</div></div>
    <div class="tech-item"><div class="label">3D Graphics</div><div class="value">Three.js / R3F</div></div>
    <div class="tech-item"><div class="label">Backend</div><div class="value">Express 5 (Node.js)</div></div>
    <div class="tech-item"><div class="label">Database</div><div class="value">Neon PostgreSQL</div></div>
    <div class="tech-item"><div class="label">Auth</div><div class="value">JWT + bcryptjs</div></div>
    <div class="tech-item"><div class="label">AI Engine</div><div class="value">OpenAI GPT-4o-mini</div></div>
    <div class="tech-item"><div class="label">SMS</div><div class="value">Termii</div></div>
    <div class="tech-item"><div class="label">Email</div><div class="value">Resend</div></div>
    <div class="tech-item"><div class="label">Messaging</div><div class="value">WhatsApp Business API</div></div>
    <div class="tech-item"><div class="label">Build Tool</div><div class="value">Vite 7 + singlefile</div></div>
    <div class="tech-item"><div class="label">Deployment</div><div class="value">Vercel (Serverless)</div></div>
    <div class="tech-item"><div class="label">File Uploads</div><div class="value">Multer</div></div>
  </div>
</div>

<!-- WHY HEC ERP -->
<div class="section">
  <div class="section-label">Value Proposition</div>
  <h2>Why Choose HEC ERP?</h2>

  <div class="feature-grid">
    <div class="feature-card"><h4>🎯 Purpose-Built for Ministry</h4><p>Not a generic business ERP — every feature was designed specifically for church operations, from soul-winning tracking to prayer chain management.</p></div>
    <div class="feature-card"><h4>🌍 Multilingual by Design</h4><p>Built-in support for English, Yoruba, Hausa, Igbo, and French. Your congregation interacts in their heart language.</p></div>
    <div class="feature-card"><h4>🤖 AI-Powered Intelligence</h4><p>GPT-4o-mini integration for prayer categorization, sermon note generation, and intelligent SMS responses — saving hours of manual work.</p></div>
    <div class="feature-card"><h4>📲 Multi-Channel Engagement</h4><p>Reach members where they are: WhatsApp, SMS, and email — all from a single platform with automated workflows.</p></div>
    <div class="feature-card"><h4>🔒 Enterprise Security</h4><p>JWT authentication, role-based access control, bcrypt password hashing, and comprehensive audit logging.</p></div>
    <div class="feature-card"><h4>☁️ Zero Maintenance</h4><p>Serverless deployment on Vercel with Neon PostgreSQL. Auto-scaling, auto-backups, no server management needed.</p></div>
  </div>
</div>

<!-- GETTING STARTED -->
<div class="section">
  <div class="section-label">Quick Start</div>
  <h2>Go Live in Minutes</h2>

  <div class="feature-grid">
    <div class="feature-card"><h4>1. Configure Environment</h4><p>Set your Neon database URL and API keys (OpenAI, Termii, Resend, WhatsApp) as Vercel environment variables.</p></div>
    <div class="feature-card"><h4>2. Deploy to Vercel</h4><p>Connect your GitHub repository. Vercel auto-deploys with zero configuration. Both frontend and API are served from a single serverless function.</p></div>
    <div class="feature-card"><h4>3. Create Accounts</h4><p>Use the built-in user management to create accounts for HQ admins, pastors, treasurers, and ushers.</p></div>
    <div class="feature-card"><h4>4. Customize Content</h4><p>Use the Landing Page CMS to upload your church logo, hero images, overseer portrait, video messages, and ticker announcements.</p></div>
    <div class="feature-card"><h4>5. Configure Giving</h4><p>Add bank accounts via the Grace Giver Admin panel. Set up bookstore products and start receiving orders.</p></div>
    <div class="feature-card"><h4>6. Train Your Team</h4><p>Each role gets a dedicated workspace with curated tools. Onboard your staff in under an hour.</p></div>
  </div>
</div>

<!-- CONTACT -->
<div class="section" style="border:none;">
  <div class="section-label">Get In Touch</div>
  <h2>Ready to Transform Your Church Operations?</h2>
  <p>
    Whether you're a single congregation or a multi-branch ministry, HEC ERP scales to meet your needs.
    Contact us for a live demo, pricing, or to discuss custom requirements.
  </p>

  <div class="footer-page">
    <div class="big">✝ Hosanna!</div>
    Holiness Evangelistic Church ERP<br>
    Built with React · Express · Neon PostgreSQL · Vercel<br><br>
    <span style="color:rgba(248,243,227,0.2);font-size:11px;">
      Document generated May 2026 &mdash; All screenshots from the live production system
    </span>
  </div>
</div>

</div><!-- .page -->
</body>
</html>`;

const outPath = path.join(__dirname, 'brochure.html');
fs.writeFileSync(outPath, html);
console.log('✓ brochure.html written');

// Generate PDF
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('file://' + outPath, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
const pdfPath = path.join(__dirname, 'HEC-ERP-Brochure.pdf');
await page.pdf({
  path: pdfPath,
  format: 'A4',
  printBackground: true,
  margin: { top: 0, bottom: 0, left: 0, right: 0 },
});
await browser.close();
console.log('✓ HEC-ERP-Brochure.pdf generated!');
