import { useState, useRef } from "react";

const LOGO = "https://drive.google.com/uc?export=view&id=1bwq96x-oseVslcgQib59V1DdH1kWk6uS";

// Brand colors: Teal, Gold, White
const G = "#1a7a7a";      // teal primary
const GOLD = "#c9a84c";   // gold accent
const PAPER = "#ffffff";  // white
const TEAL_DARK = "#12595a";
const TEAL_LIGHT = "#e8f5f5";
const MUTED = "#5a7070";
const BORDER = "#b2d4d4";

const LOADING_STEPS = [
  ["Researching client landscape…", "Analysing industry, goals & competitive context"],
  ["Writing the first half…", "Cover, summary, platforms, content strategy & packages"],
  ["Writing the second half…", "ROI projections, timeline, why Hustle Hazel & signature"],
  ["Combining everything…", "Assembling your complete proposal"],
  ["Polishing the document…", "Finalising your Hustle Hazel proposal"],
];

const INDUSTRIES = [
  "Food & Beverage","Fashion & Apparel","Health & Wellness","Real Estate",
  "Technology / SaaS","Retail / E-commerce","Hospitality & Tourism","Education",
  "Finance & Insurance","Beauty & Personal Care","Medical & Aesthetic Clinic",
  "Culinary School / Training Center","Leisure & Recreation","Non-Profit","Entertainment & Media","Other"
];

const BUDGETS = [
  "Under ₱10,000/mo","₱10,000 – ₱25,000/mo","₱25,000 – ₱50,000/mo",
  "₱50,000 – ₱100,000/mo","₱100,000+/mo",
  "Under $500/mo","$500 – $1,500/mo","$1,500 – $3,000/mo","$3,000 – $5,000/mo","$5,000+/mo"
];

const SIZES = ["Solo / Freelancer","Small (2–10 employees)","Medium (11–50 employees)","Large (50+ employees)"];

async function callClaude(prompt) {
  const res = await fetch("https://hustle-hazel-api.hazelmarrefaith.workers.dev", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }]
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error("API error " + res.status + ": " + JSON.stringify(data.details || data.error || data));
  let text = data.content.map(b => b.type === "text" ? b.text : "").join("");
  // Strip any accidental code fences or html wrapper the AI might add
  text = text.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/gi, "").trim();
  return text;
}

export default function App() {
  const [phase, setPhase] = useState("intake");
  const [step, setStep] = useState(0);
  const [proposal, setProposal] = useState("");
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const timer = useRef(null);
  const [form, setForm] = useState({
    clientName:"", industry:"", goals:"", budget:"", bizSize:"",
    competitors:"", extra:"", doctors:""
  });
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  function startLoading() {
    setStep(0);
    timer.current = setInterval(() => setStep(p => Math.min(p+1, LOADING_STEPS.length-1)), 5000);
  }
  function stopLoading() { clearInterval(timer.current); }

  async function generate() {
    setError("");
    if (!form.clientName.trim() || !form.industry) {
      setError("Please fill in Client Name and Industry to continue.");
      return;
    }
    setPhase("loading");
    startLoading();

    const today = new Date().toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" });
    const isMedical = form.industry.toLowerCase().includes("medical") || form.industry.toLowerCase().includes("aesthetic") || form.industry.toLowerCase().includes("clinic");

    const context = `
CLIENT: ${form.clientName}
INDUSTRY: ${form.industry}
BUSINESS SIZE: ${form.bizSize || "Not specified"}
BUDGET: ${form.budget || "Not specified"}
GOALS: ${form.goals || "Not specified"}
COMPETITORS: ${form.competitors || "Not specified"}
ADDITIONAL NOTES: ${form.extra || "None"}
${form.doctors ? `DOCTORS / KEY PEOPLE TO FEATURE: ${form.doctors}` : ""}
DATE: ${today}

HUSTLE HAZEL SERVICE PACKAGES (USE EXACTLY — do not change names, prices, or inclusions):

TIER 1 — Basic Starter Package | PHP 18,000/month
Best for: Consistent social media presence
Platforms: Instagram and Facebook
• Content strategy and monthly content calendar
• 12 static posts (graphics/photos)
• 3 short-form videos (Reels)
• Caption writing with CTAs
• Page optimization (bio, highlights, pinned posts)
• Basic community management (replying to comments & inquiries during office hours)
• Monthly performance summary

TIER 2 — Growth Launch Package (RECOMMENDED) | PHP 22,000/month
Best for: Aggressive, strong visibility, and consistent engagement
Platforms: Instagram and Facebook
• Full social media strategy & content calendar
• 16 static posts
• 4 Reel videos (before & after, time-lapse, promos)
• 3 Stories per week (opening updates, promos, behind-the-scenes)
• Caption writing with strong sales-focused CTAs
• Community management (comments & inbox monitoring)
• Coordination for influencer visits (excluding talent fees)
• Monthly analytics & insights report with recommendations

TIER 3 — Domination Package | PHP 28,000/month
Best for: Maximum reach, fast brand recall, and category leadership
Platforms: Instagram, Facebook, and TikTok
• Advanced content and campaign strategy
• 20 static posts
• 6 high-impact Reels/TikTok videos
• 5 stories per week with engagement stickers and promos
• Paid ads setup and monitoring (ad spend excluded)
• Influencer campaign planning and coordination
• Reputation management (reviews, testimonials, social proof)
• Monthly performance check-ins
• Detailed monthly report`;

    const brandVoice = `
BRAND VOICE & WRITING RULES (follow strictly):
- Hustle Hazel Digital Marketing Services is run by ONE person — Hazel. Never use "we" or "our team". Use "I", "Hustle Hazel", or refer to Hazel directly.
- Tone: Confident, warm, strategic, and direct. Like a trusted expert adviser — not a corporate pitch deck.
- When giving constructive feedback on a client's current social media, frame it as an opportunity, not a problem. For example, instead of saying "your account is damaged by personal content", say something like "there's a strong opportunity to draw a clearer boundary between personal and brand content, which will help the audience connect with the clinic's identity more consistently."
- Never use filler corporate phrases like "leverage synergies", "holistic approach", "cutting-edge", "best-in-class".
- Write as if Hazel is speaking directly to the client — personable, honest, and results-focused.`;

    const designRules = `
DESIGN RULES (follow strictly):
- Use ONLY inline CSS. No external stylesheets.
- Brand colors: Teal (#1a7a7a) as primary, Gold (#c9a84c) as accent, White (#ffffff) as background, Dark Teal (#12595a) for headings, Muted Teal (#5a7070) for body text.
- Typography: Georgia or serif font for headings. System-ui or sans-serif for body.
- Professional, boutique, elegant — not corporate or generic.
- Use cards with subtle box shadows, clean tables, clear visual hierarchy.
- Return ONLY raw HTML body content. No markdown. No code fences. No explanation. No DOCTYPE or html/head/body tags.`;

    const medicalContentStrategy = isMedical ? `
SPECIAL CONTENT STRATEGY INSTRUCTIONS FOR MEDICAL/AESTHETIC CLINIC:
The content strategy must include a STORYTELLING approach, especially for brand awareness content. Key storytelling angle: Introduce the doctors behind the clinic as real, approachable human beings — not just credentials on a wall. Show who they are, why they chose medicine/aesthetics, what they believe in, and what drives their passion for patient care. This humanises the clinic and builds trust before a patient even walks through the door.

Content pillars should include:
1. Meet the Doctor — Personal stories, their journey, their philosophy, behind-the-scenes of clinic life
2. Patient Education — Myth-busting, procedure explainers, what to expect (builds trust)
3. Results & Transformations — Before/after content (tasteful and compliant), patient testimonials
4. Clinic Culture — Day in the life, team moments, behind-the-scenes
5. Promos & Offers — Seasonal deals, package spotlights, consultation CTAs
${form.doctors ? `Feature these specific doctors/people in the storytelling content: ${form.doctors}` : ""}` : "";

    const sharedHeader = `You are writing one part of a social media management proposal on behalf of Hazel Marre Faith Lacang, founder of Hustle Hazel Digital Marketing Services — a boutique one-person digital marketing agency based in the Philippines. Hazel has worked primarily with restaurants and food & beverage brands, as well as culinary schools, training centers, and leisure facilities.

${brandVoice}
${context}

CRITICAL RULES:
- Generate ONLY the exact sections listed. Nothing more, nothing less.
- Each section must be fully complete — do not stop mid-section.
- Do NOT add any preamble, intro text, outro, or section numbers that weren't asked for.
- Return raw HTML with inline CSS only. No markdown. No code fences. No DOCTYPE or html/head/body tags.
${designRules}`;

    // CALL 1: Cover + Executive Summary + Social Media Assessment
    const prompt1 = `${sharedHeader}

Generate ONLY these 3 sections as complete, polished HTML:

SECTION 1 — COVER / HERO
Full-width hero with: agency name "Hustle Hazel Digital Marketing Services", client name "${form.clientName}", tagline "Social Media Strategy Proposal", date ${today}. Teal (#1a7a7a) background, gold (#c9a84c) and white accents. Elegant and professional.

SECTION 2 — EXECUTIVE SUMMARY
Exactly 3 paragraphs in Hazel's voice — warm, strategic, direct. Written specifically for ${form.clientName} in the ${form.industry} industry. Focus on the opportunity ahead. Use "I" or "Hustle Hazel" — never "we".

SECTION 3 — CURRENT SOCIAL MEDIA ASSESSMENT
Frame every observation as an opportunity, never a problem. Tone is encouraging and solution-focused. Example: instead of "posts are inconsistent", say "there's a real opportunity to build a more intentional posting rhythm that the audience can look forward to." Base this on: ${form.competitors || "a general assessment for a " + form.industry + " business."} Keep this section concise — 4 to 5 opportunity points maximum.`;

    // CALL 2: Platform Recommendations + Content Strategy
    const prompt2 = `${sharedHeader}
${medicalContentStrategy}

Generate ONLY these 2 sections as complete, polished HTML:

SECTION 4 — PLATFORM RECOMMENDATIONS
Recommend the right platforms for ${form.clientName} (${form.industry}). One styled card per platform. Explain clearly why each platform suits this specific client. Keep each card concise.

SECTION 5 — CONTENT STRATEGY OVERVIEW
${isMedical
  ? `Open with the STORYTELLING approach: explain that introducing the doctors as real, approachable human beings — their story, their passion, their philosophy — is one of the most powerful trust-building tools a clinic can use on social media. Make this feel inspiring, not clinical.
Then present these 5 content pillars as styled cards:
1. Meet the Doctor — personal stories, journey, philosophy, behind-the-scenes of clinic life ${form.doctors ? `(Feature: ${form.doctors})` : ""}
2. Patient Education — myth-busting, procedure explainers, what to expect before/after
3. Results & Transformations — tasteful before/after content, patient testimonials
4. Clinic Culture — team moments, day-in-the-life, behind-the-scenes
5. Promos & Offers — seasonal deals, package spotlights, consultation CTAs
Include recommended posting frequency and content formats (Reels, Stories, carousels, static posts).`
  : `Present 4-5 content pillars specific to ${form.clientName} in the ${form.industry} industry. Style each as a card. Include posting frequency and content types.`}`;

    // CALL 3: Service Packages
    const prompt3 = `${sharedHeader}

Generate ONLY this 1 section as complete, polished HTML:

SECTION 6 — SERVICE PACKAGES & PRICING
CRITICAL LAYOUT RULE: All 3 package cards MUST appear side by side in a single row using this exact wrapper:
<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; align-items: start;">
  [TIER 1 card] [TIER 2 card] [TIER 3 card]
</div>
Do NOT use flex-wrap. Do NOT put cards in separate rows. All 3 cards must be in one grid row.

The package NAMES and PRICES are fixed — do not change them. Adapt platforms and content type examples to fit ${form.clientName} in the ${form.industry} industry based on Section 4 recommendations.

RULES:
- Platforms: Only include platforms recommended in Section 4. Remove TikTok if not recommended.
- Reel/video descriptions: Use industry-appropriate examples. For medical/aesthetic clinic: "(doctor introductions, patient education, procedure overviews)". For restaurant: "(kitchen prep, plating, behind-the-scenes)". For tech: "(product demos, feature walkthroughs, tutorials)". Never use generic "(before & after, time-lapse, promos)" unless the industry makes it relevant.
- Stories: Same rule — use industry-appropriate examples.
- NEVER include influencer management, influencer visits, influencer coordination, or any influencer-related inclusion in ANY tier. Remove it entirely.
- All other inclusions stay as written below.

TIER 1 — Basic Starter Package | PHP 18,000/month
Platforms: [adapt to recommended platforms]
Inclusions:
• Content strategy and monthly content calendar
• 12 static posts (graphics/photos)
• 3 short-form videos — [industry-appropriate examples]
• Caption writing with CTAs
• Page optimization (bio, highlights, pinned posts)
• Basic community management (replying to comments & inquiries during office hours)
• Monthly performance summary

TIER 2 — Growth Launch Package | PHP 22,000/month ★ RECOMMENDED
Platforms: [adapt to recommended platforms]
Mark this card with a prominent gold (#c9a84c) "RECOMMENDED" badge at the top.
Inclusions:
• Full social media strategy & content calendar
• 16 static posts
• 4 short-form videos — [industry-appropriate examples, NO influencer content]
• 3 Stories per week — [industry-appropriate examples]
• Caption writing with strong sales-focused CTAs
• Community management (comments & inbox monitoring)
• Monthly analytics & insights report with recommendations

TIER 3 — Domination Package | PHP 28,000/month
Platforms: [adapt to recommended platforms only]
Inclusions:
• Advanced content and campaign strategy
• 20 static posts
• 6 high-impact short-form videos — [industry-appropriate examples]
• 5 Stories per week with engagement stickers and promos
• Paid ads setup and monitoring (ad spend excluded)
• Reputation management (reviews, testimonials, social proof)
• Monthly performance check-ins
• Detailed monthly report`;

    // CALL 4: ROI + Onboarding Timeline
    const prompt4 = `${sharedHeader}

Generate ONLY these 2 sections as complete, polished HTML:

SECTION 7 — ROI PROJECTIONS
A clean styled table showing realistic projections for ${form.clientName} (${form.industry}). Columns: Metric | 3 Months | 6 Months | 12 Months. Rows: Follower Growth %, Engagement Rate, Monthly Reach, Estimated Leads or Inquiries. Add a short note below: conservative estimates based on the recommended package and active collaboration with the client.

SECTION 8 — ONBOARDING TIMELINE
CRITICAL: This section must be in its own <section> tag with style="page-break-after: always;" so it is fully separated from the next section. ALL 4 WEEKS must be written and their HTML fully closed before this section ends.

4 styled vertical week cards. Each card has a numbered badge, a week title, and exactly 4 specific bullet tasks:
Week 1 — Discovery & Foundation: (1) Contract signing & onboarding form sent, (2) Strategy kick-off call (60–90 min), (3) Admin access granted to all platforms, (4) Full social media audit completed
Week 2 — Strategy & Planning: (1) Brand questionnaire reviewed, (2) Content pillars and tone finalised, (3) Month 1 content calendar created, (4) Calendar submitted for client approval
Week 3 — Content Creation: (1) First batch of posts designed and written, (2) Captions drafted and reviewed, (3) Graphics approved by client, (4) Scheduling and publishing tools set up
Week 4 — Launch & Monitor: (1) Content goes live across all platforms, (2) Community management begins — comments and messages monitored daily, (3) End-of-week performance check, (4) Month 2 content direction confirmed

Structure each week as a fully self-contained card. Close every div tag. Do NOT let this section bleed into the next. End this section with </section> before moving on.`;

    // CALL 5: Why Hustle Hazel + CTA + Signature
    const prompt5 = `${sharedHeader}

Generate ONLY these 3 sections as complete, polished HTML:

SECTION 9 — WHY HUSTLE HAZEL
Exactly 4 styled differentiator cards. Use ONLY these facts — do not add any other industry or niche:
1. Direct access — Hazel is a one-person agency. Clients work directly with the strategist doing the actual work, not an account manager or middleman.
2. Experience in experience-driven industries — Background in restaurants, food & beverage, culinary schools, training centers, and leisure facilities. Hazel understands how businesses built on atmosphere and experience attract and retain customers.
3. Custom strategies only — Every proposal and content plan is built from scratch for each client. No recycled templates, no copy-paste strategies.
4. Storytelling-first philosophy — Content is created with narrative and purpose, not just to fill a posting schedule. Every post has a reason to exist.

SECTION 10 — NEXT STEPS / CALL TO ACTION
This section must be FULLY COMPLETE. Write all of the following:
- Opening: A warm 2-sentence message in Hazel's voice personally inviting ${form.clientName} to take the next step
- A styled card or highlight box with these 3 numbered action steps written in full: (1) Reply to this proposal or send an email to hello@hustlehazel.com, (2) Schedule a free 30-minute discovery call, (3) Sign the agreement and get started within the week
- Contact details block displayed clearly and prominently: hello@hustlehazel.com | +63 927 138 9467 | hustlehazel.com
Write the entire section. Do not stop after the opening.

SECTION 11 — SIGNATURE BLOCK
Write all of the following, fully rendered in elegant HTML:
- A thin full-width horizontal divider line in gold (#c9a84c)
- Name in larger text: Hazel Marre Faith Lacang
- Title: Founder, Hustle Hazel Digital Marketing Services
- Contact line: hello@hustlehazel.com | +63 927 138 9467 | hustlehazel.com
- Closing tagline in italics: "Prepared with intention. Delivered with purpose."`;

    try {
      const part1 = await callClaude(prompt1);
      const part2 = await callClaude(prompt2);
      const part3 = await callClaude(prompt3);
      const part4 = await callClaude(prompt4);
      const part5 = await callClaude(prompt5);
      stopLoading();
      setProposal(part1 + part2 + part3 + part4 + part5);
      setPhase("proposal");
    } catch (err) {
      stopLoading();
      setError("Something went wrong: " + err.message);
      setPhase("intake");
    }
  }

  function download() {
    setDownloading(true);
    try {
      const fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>Hustle Hazel Proposal – ${form.clientName}</title>
<style>
  @media print {
    body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    @page { margin: 0.5in; }
  }
  body { margin: 0; font-family: system-ui, sans-serif; }
</style>
</head>
<body>${proposal}</body>
</html>`;
      const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Hustle-Hazel-Proposal-${form.clientName.replace(/\s+/g,"-")}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch(e) { alert("Download failed: " + e.message); }
    setDownloading(false);
  }

  function reset() {
    setForm({ clientName:"", industry:"", goals:"", budget:"", bizSize:"", competitors:"", extra:"", doctors:"" });
    setError(""); setProposal(""); setPhase("intake");
  }

  const s = {
    wrap: { fontFamily:"system-ui,sans-serif", background:"#f4fafa", minHeight:"100vh" },
    header: { background:TEAL_DARK, padding:"0 28px", display:"flex", alignItems:"center", gap:14,
      height:64, borderBottom:`3px solid ${GOLD}`, position:"sticky", top:0, zIndex:100 },
    logo: { height:42, width:42, objectFit:"contain", borderRadius:4, background:"white", padding:2 },
    aName: { fontFamily:"Georgia,serif", fontSize:18, fontWeight:700, color:"white" },
    aSub: { fontSize:10, color:"#d4eeee", letterSpacing:"1px", marginTop:1 },
    tag: { marginLeft:"auto", fontSize:11, color:"#d4eeee", letterSpacing:"2px", textTransform:"uppercase" },
    page: { maxWidth:880, margin:"0 auto", padding:"44px 24px" },
    h1: { fontFamily:"Georgia,serif", fontSize:34, fontWeight:900, color:TEAL_DARK, marginBottom:8 },
    sub: { color:MUTED, fontSize:15, marginBottom:36, lineHeight:1.6 },
    grid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 },
    group: { display:"flex", flexDirection:"column", gap:7 },
    label: { fontSize:11, fontWeight:600, letterSpacing:"1.5px", textTransform:"uppercase", color:MUTED },
    input: { fontFamily:"inherit", fontSize:15, background:"white", border:`1.5px solid ${BORDER}`,
      borderRadius:6, padding:"10px 13px", color:"#1a2a2a", outline:"none", width:"100%" },
    btnTeal: { fontFamily:"inherit", fontWeight:600, fontSize:14, padding:"13px 28px",
      borderRadius:6, border:`2px solid ${TEAL_DARK}`, background:TEAL_DARK, color:"white", cursor:"pointer" },
    btnGold: { fontFamily:"inherit", fontWeight:600, fontSize:15, padding:"13px 32px",
      borderRadius:6, border:`2px solid ${GOLD}`, background:GOLD, color:TEAL_DARK, cursor:"pointer" },
    btnSec: { fontFamily:"inherit", fontWeight:500, fontSize:14, padding:"13px 22px",
      borderRadius:6, border:`1.5px solid ${BORDER}`, background:"transparent", color:MUTED, cursor:"pointer" },
    err: { background:"#fff5f3", border:"1.5px solid #f5c6bb", borderRadius:8,
      padding:"14px 18px", color:"#b84c2a", fontSize:14, marginTop:14 },
    loadWrap: { textAlign:"center", padding:"80px 20px" },
    loadTitle: { fontFamily:"Georgia,serif", fontSize:22, marginBottom:8, color:TEAL_DARK },
    loadSub: { color:MUTED, fontSize:14 },
    toolbar: { display:"flex", alignItems:"center", justifyContent:"space-between",
      marginBottom:24, flexWrap:"wrap", gap:12 },
    toolTitle: { fontFamily:"Georgia,serif", fontSize:24, fontWeight:700, color:TEAL_DARK },
    propBox: { background:"white", border:`1px solid ${BORDER}`, borderRadius:10,
      overflow:"hidden", boxShadow:"0 4px 32px rgba(0,0,0,.07)" },
    divider: { height:2, background:`linear-gradient(90deg,${GOLD},transparent)`, margin:"28px 0" },
    footer: { fontSize:13, color:MUTED, display:"flex", gap:24, flexWrap:"wrap" },
    hint: { background:TEAL_LIGHT, border:`1.5px solid ${G}`, borderRadius:8,
      padding:"14px 18px", color:TEAL_DARK, fontSize:13, marginBottom:16 },
  };

  return (
    <div style={s.wrap}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        input:focus,select:focus,textarea:focus{border-color:${G}!important;box-shadow:0 0 0 3px rgba(26,122,122,.15)!important;}
        button:hover{opacity:.88;transition:opacity .15s;}
        @media(max-width:600px){.hh-grid{grid-template-columns:1fr!important}}
      `}</style>

      {/* HEADER */}
      <div style={s.header}>
        <img src={LOGO} alt="Hustle Hazel" style={s.logo}/>
        <div>
          <div style={s.aName}>Hustle Hazel</div>
          <div style={s.aSub}>Digital Marketing Services</div>
        </div>
        <div style={s.tag}>Proposal Generator</div>
      </div>

      <div style={s.page}>

        {/* ── INTAKE ── */}
        {phase === "intake" && (
          <div>
            <div style={s.h1}>Build a Proposal</div>
            <p style={s.sub}>Tell me about your client and I'll craft a tailored, professional proposal ready to send.</p>

            <div style={{...s.grid}} className="hh-grid">
              <div style={s.group}>
                <label style={s.label}>Client / Brand Name *</label>
                <input style={s.input} placeholder="e.g. Radiance Aesthetic Clinic"
                  value={form.clientName} onChange={e=>f("clientName",e.target.value)}/>
              </div>
              <div style={s.group}>
                <label style={s.label}>Industry *</label>
                <select style={s.input} value={form.industry} onChange={e=>f("industry",e.target.value)}>
                  <option value="">Select industry…</option>
                  {INDUSTRIES.map(i=><option key={i}>{i}</option>)}
                </select>
              </div>
              <div style={{...s.group, gridColumn:"1/-1"}}>
                <label style={s.label}>Social Media Goals</label>
                <textarea style={{...s.input, minHeight:88, resize:"vertical"}}
                  placeholder="e.g. Build brand awareness, increase consultation bookings, grow Instagram following…"
                  value={form.goals} onChange={e=>f("goals",e.target.value)}/>
              </div>
              <div style={s.group}>
                <label style={s.label}>Monthly Budget Range</label>
                <select style={s.input} value={form.budget} onChange={e=>f("budget",e.target.value)}>
                  <option value="">Select budget…</option>
                  {BUDGETS.map(b=><option key={b}>{b}</option>)}
                </select>
              </div>
              <div style={s.group}>
                <label style={s.label}>Business Size</label>
                <select style={s.input} value={form.bizSize} onChange={e=>f("bizSize",e.target.value)}>
                  <option value="">Select…</option>
                  {SIZES.map(b=><option key={b}>{b}</option>)}
                </select>
              </div>
              <div style={{...s.group, gridColumn:"1/-1"}}>
                <label style={s.label}>Doctors / Key People to Feature (optional)</label>
                <textarea style={{...s.input, minHeight:70, resize:"vertical"}}
                  placeholder="e.g. Dr. Maria Santos – Dermatologist, Dr. Juan Reyes – Aesthetic Surgeon. Include names, specializations, or anything you want highlighted."
                  value={form.doctors} onChange={e=>f("doctors",e.target.value)}/>
              </div>
              <div style={{...s.group, gridColumn:"1/-1"}}>
                <label style={s.label}>Competitors / Market Context (optional)</label>
                <textarea style={{...s.input, minHeight:70, resize:"vertical"}}
                  placeholder="e.g. Competing with 2 other clinics in the area. Strong foot traffic but weak online presence…"
                  value={form.competitors} onChange={e=>f("competitors",e.target.value)}/>
              </div>
              <div style={{...s.group, gridColumn:"1/-1"}}>
                <label style={s.label}>Anything else I should know?</label>
                <textarea style={{...s.input, minHeight:70, resize:"vertical"}}
                  placeholder="Target audience, brand tone, current social media issues, specific services to highlight…"
                  value={form.extra} onChange={e=>f("extra",e.target.value)}/>
              </div>
            </div>

            {error && <div style={s.err}>{error}</div>}
            <div style={{marginTop:12}}>
              <button style={s.btnTeal} onClick={generate}>Generate Proposal →</button>
            </div>
            <div style={s.divider}/>
            <div style={s.footer}>
              <span>📧 hello@hustlehazel.com</span>
              <span>📞 +63 927 138 9467</span>
              <span>🌐 hustlehazel.com</span>
            </div>
          </div>
        )}

        {/* ── LOADING ── */}
        {phase === "loading" && (
          <div style={s.loadWrap}>
            <div style={{width:52,height:52,border:"3px solid #d4eeee",borderTopColor:GOLD,
              borderRadius:"50%",animation:"spin .9s linear infinite",margin:"0 auto 24px"}}/>
            <div style={s.loadTitle}>{LOADING_STEPS[step][0]}</div>
            <div style={s.loadSub}>{LOADING_STEPS[step][1]}</div>
          </div>
        )}

        {/* ── PROPOSAL ── */}
        {phase === "proposal" && (
          <div>
            <div style={s.toolbar}>
              <div style={s.toolTitle}>Proposal Ready ✦</div>
              <div style={{display:"flex", gap:10, flexWrap:"wrap"}}>
                <button style={s.btnSec} onClick={reset}>← New Proposal</button>
                <button style={{...s.btnGold, opacity: downloading ? 0.7 : 1}}
                  onClick={download} disabled={downloading}>
                  {downloading ? "Preparing…" : "⬇ Download File"}
                </button>
              </div>
            </div>
            <div style={s.hint}>
              💡 <strong>To save as PDF:</strong> Click "⬇ Download File" → open the downloaded file in Chrome → press <strong>Ctrl+P</strong> (Windows) or <strong>Cmd+P</strong> (Mac) → set destination to <strong>"Save as PDF"</strong> → Save.
            </div>
            <div style={s.propBox}>
              <div dangerouslySetInnerHTML={{__html: proposal}}/>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
