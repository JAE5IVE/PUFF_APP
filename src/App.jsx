import { useState, useRef, useCallback, useEffect } from "react";

// ─── SUPABASE ────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://rejdvxzjvihkcgoseztu.supabase.co";
const SUPABASE_KEY = "sb_publishable_1CSJLDFUW4ZgpPUEHmb_2w_QxLUumSV";

const sb = {
  h: { "Content-Type": "application/json", apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  ah: (t) => ({ "Content-Type": "application/json", apikey: SUPABASE_KEY, Authorization: `Bearer ${t}` }),
  async signUp(email, password, name) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/signup`, { method: "POST", headers: this.h, body: JSON.stringify({ email, password, data: { name } }) });
    return r.json();
  },
  async signIn(email, password) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, { method: "POST", headers: this.h, body: JSON.stringify({ email, password }) });
    return r.json();
  },
  async signOut(t) { await fetch(`${SUPABASE_URL}/auth/v1/logout`, { method: "POST", headers: this.ah(t) }); },
  async sendPhoneOTP(phone) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/otp`, { method: "POST", headers: this.h, body: JSON.stringify({ phone }) });
    return r.json();
  },
  async verifyPhoneOTP(phone, token) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/verify`, { method: "POST", headers: this.h, body: JSON.stringify({ phone, token, type: "sms" }) });
    return r.json();
  },
  async resendEmailOTP(email) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/resend`, { method: "POST", headers: this.h, body: JSON.stringify({ email, type: "signup" }) });
    return r.json();
  },
  async req(table, t, method, body, qs = "", extra = {}) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${qs}`, { method, headers: { ...this.ah(t), ...extra }, body: body ? JSON.stringify(body) : undefined });
    try { return await r.json(); } catch { return null; }
  },
  sel: (table, t, qs = "") => sb.req(table, t, "GET", null, `select=*${qs}`),
  ins: (table, t, d) => sb.req(table, t, "POST", d, "", { Prefer: "return=representation" }),
  upsert: (table, t, d) => sb.req(table, t, "POST", d, "", { Prefer: "return=representation,resolution=merge-duplicates" }),
};

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const ALL_STRAINS = [
  // Classic
  "Blue Dream","OG Kush","Sour Diesel","Wedding Cake","Girl Scout Cookies",
  "Purple Haze","Jack Herer","Gelato","Amnesia Haze","Northern Lights",
  "Runtz","Gorilla Glue","Pineapple Express","White Widow","AK-47",
  // Canadian
  "Death Bubba","Pink Kush","God's Green Crack","Romulan","Jean Guy",
  "Shishkaberry","Nuken","Rockstar","BC Big Bud","Island Sweet Skunk",
  "Blueberry","Purple Kush","Trainwreck","Master Kush","Platinum OG",
];
const ALL_VIBES = [
  "Chill & Mellow","Deep Conversations","Music & Vibes","Outdoor Sessions",
  "Gaming & Smoke","Creative Mode","Late Night Thinker","Social Butterfly",
  "Solo Puffer","Spiritual Journey","Movie Nights","Fitness & Smoke",
];
const SMOKE_STYLES = ["Joint","Blunt","Bong","Pipe","Vape","Dab Rig","Edibles","Spliff"];
const REPORT_REASONS = ["Inappropriate content","Harassment","Fake profile","Underage user","Other"];
const BOT_REPLIES = ["haha that's such a mood 😂","fr fr, pull up anytime 🌿","okayyyy I see you 👀","vibes only tonight 💨","yesss let's make it happen 🔥","roll one and tell me more 🍃","you're speaking my language rn ✨","no cap that's exactly my vibe 🤝","bro/sis come through already 😤","that's lowkey facts tho 💯"];

// Modern avatar system — gradient cards with initials + vibe icons
const AVATAR_STYLES = [
  { id:"a1", bg:"linear-gradient(135deg,#1a3a1a,#2d6b2d)", icon:"🎵", label:"Music" },
  { id:"a2", bg:"linear-gradient(135deg,#1a1a3a,#2d2d8a)", icon:"🌙", label:"Night" },
  { id:"a3", bg:"linear-gradient(135deg,#3a1a1a,#8a2d2d)", icon:"🔥", label:"Fire" },
  { id:"a4", bg:"linear-gradient(135deg,#1a2a3a,#2d5a8a)", icon:"🌊", label:"Wave" },
  { id:"a5", bg:"linear-gradient(135deg,#2a1a3a,#6a2d8a)", icon:"✨", label:"Star" },
  { id:"a6", bg:"linear-gradient(135deg,#3a2a1a,#8a6a2d)", icon:"🏕️", label:"Wild" },
  { id:"a7", bg:"linear-gradient(135deg,#1a3a2a,#2d8a5a)", icon:"🍃", label:"Leaf" },
  { id:"a8", bg:"linear-gradient(135deg,#3a3a1a,#8a8a2d)", icon:"☀️", label:"Sun" },
  { id:"a9", bg:"linear-gradient(135deg,#2a3a1a,#5a8a2d)", icon:"🌿", label:"Herb" },
  { id:"a10", bg:"linear-gradient(135deg,#1a2a2a,#2d6a6a)", icon:"🎨", label:"Art" },
  { id:"a11", bg:"linear-gradient(135deg,#3a1a2a,#8a2d5a)", icon:"💫", label:"Glow" },
  { id:"a12", bg:"linear-gradient(135deg,#2a2a3a,#5a5a8a)", icon:"🎧", label:"Beat" },
];

const DEMO = [
  { id:"d1", name:"Zara", age:24, distance:2, gender:"female", vibe:["Chill & Mellow","Music & Vibes"], styles:["Joint","Vape"], strains:["Blue Dream","OG Kush"], bio:"Late night thinker. Deep convos + good music 🎵", avatarId:"a12", bg:"#0d2a0d", accent:"#7dba7d" },
  { id:"d2", name:"Kofi", age:27, distance:5, gender:"male", vibe:["Gaming & Smoke"], styles:["Blunt","Bong"], strains:["Sour Diesel","Death Bubba"], bio:"Board games + blunts = perfect evening 🎲", avatarId:"a3", bg:"#1a1a00", accent:"#c8b560" },
  { id:"d3", name:"Luna", age:22, distance:1, gender:"female", vibe:["Creative Mode","Spiritual Journey"], styles:["Joint","Pipe"], strains:["Purple Haze","Pink Kush"], bio:"Painter by day, stargazer by night 🌙", avatarId:"a5", bg:"#150a22", accent:"#b48fd8" },
  { id:"d4", name:"Dayo", age:30, distance:8, gender:"male", vibe:["Music & Vibes","Late Night Thinker"], styles:["Vape"], strains:["Jack Herer","Gelato"], bio:"DJ & producer. Sessions hit different 🎧", avatarId:"a1", bg:"#04121e", accent:"#6aaed4" },
  { id:"d5", name:"Ife", age:25, distance:3, gender:"nonbinary", vibe:["Outdoor Sessions","Fitness & Smoke"], styles:["Joint","Blunt"], strains:["Northern Lights","Island Sweet Skunk"], bio:"Hiking trails & rolling papers 🏕️", avatarId:"a6", bg:"#1a0d00", accent:"#d4946a" },
  { id:"d6", name:"Amara", age:23, distance:4, gender:"female", vibe:["Deep Conversations"], styles:["Pipe","Bong"], strains:["Runtz","Blueberry"], bio:"Philosophy student. Every sesh is a rabbit hole 🐇", avatarId:"a11", bg:"#1a0a18", accent:"#c87dba" },
  { id:"d7", name:"Tunde", age:28, distance:6, gender:"male", vibe:["Late Night Thinker","Solo Puffer"], styles:["Joint","Vape"], strains:["Jean Guy","God's Green Crack"], bio:"Night owl. 2am vibes only 🌃", avatarId:"a2", bg:"#051a10", accent:"#7dbaa8" },
];

const getRand = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const C = {
  bg: "#070a07", surface: "#0f140f", surface2: "#141c14",
  border: "#1c2c1c", green: "#5da85d", greenL: "#a8e6a3",
  muted: "#4a6a4a", text: "#cce6cc", dim: "#7a9a7a",
  red: "#ff6060", redDim: "#5a1a1a",
};

const INP = { background:"#0c120c", border:`1.5px solid ${C.border}`, borderRadius:13, padding:"13px 15px", color:C.text, fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none", width:"100%", boxSizing:"border-box", transition:"border-color 0.2s" };
const BTN = { background:"linear-gradient(135deg,#3d6b35,#4d8a44)", border:"none", borderRadius:13, padding:"15px", color:"#c8f5c8", fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, cursor:"pointer", width:"100%", transition:"all 0.2s", letterSpacing:"0.2px" };
const BTNO = { ...BTN, background:"transparent", border:`1.5px solid ${C.green}`, color:C.greenL };
const LBL = { fontSize:11, color:C.muted, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.7px", fontWeight:700, display:"block" };
const CARD = { background:C.surface, borderRadius:22, padding:22, border:`1px solid ${C.border}` };
const chip = (on) => ({ display:"inline-flex", alignItems:"center", padding:"8px 14px", borderRadius:20, fontSize:12, fontWeight:600, cursor:"pointer", border:`1.5px solid ${on ? "#5da85d" : "#1c2c1c"}`, background:on ? "#1e3d1e" : C.surface, color:on ? C.greenL : C.muted, transition:"all 0.18s", userSelect:"none" });

// ─── AVATAR COMPONENT ────────────────────────────────────────────────────────
function Avatar({ avatarId, name = "?", size = 56, uploadUrl = null }) {
  const style = AVATAR_STYLES.find((a) => a.id === avatarId) || AVATAR_STYLES[0];
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  if (uploadUrl) {
    return <div style={{ width:size, height:size, borderRadius:"50%", overflow:"hidden", flexShrink:0 }}><img src={uploadUrl} alt={name} style={{ width:"100%", height:"100%", objectFit:"cover" }} /></div>;
  }
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:style.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:`0 4px 20px rgba(0,0,0,0.4)` }}>
      <span style={{ fontSize:size * 0.32 }}>{style.icon}</span>
      <span style={{ fontSize:size * 0.2, color:"rgba(255,255,255,0.7)", fontFamily:"'Syne',sans-serif", fontWeight:700, marginTop:1 }}>{initials}</span>
    </div>
  );
}

// ─── GLOBAL STYLES ───────────────────────────────────────────────────────────
function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
      *, *::before, *::after { box-sizing: border-box; -webkit-tap-highlight-color: transparent; margin: 0; padding: 0; }
      body { background: #070a07; overflow-x: hidden; }
      ::-webkit-scrollbar { width: 0; }
      input:-webkit-autofill { -webkit-box-shadow: 0 0 0 30px #0c120c inset !important; -webkit-text-fill-color: #cce6cc !important; }
      @keyframes floatUp { 0%{opacity:1;transform:translateY(0)scale(1)} 100%{opacity:0;transform:translateY(-160px)scale(1.6)} }
      @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
      @keyframes fadeIn { from{opacity:0} to{opacity:1} }
      @keyframes bounceIn { 0%{transform:scale(0.4)} 60%{transform:scale(1.15)} 100%{transform:scale(1)} }
      @keyframes slideDown { from{opacity:0;transform:translateX(-50%) translateY(-16px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
      @keyframes slideUp { from{opacity:0;transform:translateY(100%)} to{opacity:1;transform:translateY(0)} }
      @keyframes drift { from{transform:translateY(0)rotate(0deg)} to{transform:translateY(-24px)rotate(10deg)} }
      @keyframes pulse { 0%,100%{opacity:0.6} 50%{opacity:1} }
      @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      input[type=range] { -webkit-appearance:none; height:4px; border-radius:4px; background:#1c2c1c; cursor:pointer; }
      input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:20px; height:20px; border-radius:50%; background:linear-gradient(135deg,#3d6b35,#5da85d); cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.4); }
      textarea { font-family: 'DM Sans', sans-serif; }
      button { cursor: pointer; }
      button:active { transform: scale(0.97); }
      select { font-family: 'DM Sans', sans-serif; appearance: none; }
    `}</style>
  );
}

// ─── TOAST ───────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  if (!msg) return null;
  const bg = { error:"#5a1a1a", success:"#1a3d1a", info:"#1a2a3d" }[type] || "#1a2a3d";
  const icon = { error:"✕", success:"✓", info:"ℹ" }[type] || "ℹ";
  return (
    <div style={{ position:"fixed", top:24, left:"50%", transform:"translateX(-50%)", background:bg, color:"#fff", padding:"13px 20px", borderRadius:14, fontSize:14, zIndex:9999, maxWidth:340, textAlign:"center", boxShadow:"0 8px 40px rgba(0,0,0,0.5)", animation:"slideDown 0.3s ease", display:"flex", alignItems:"center", gap:10, border:`1px solid rgba(255,255,255,0.1)` }}>
      <span style={{ fontSize:16 }}>{icon}</span>
      <span>{msg}</span>
    </div>
  );
}

// ─── SPLASH ──────────────────────────────────────────────────────────────────
function Splash({ onLogin, onSignup }) {
  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
      {[...Array(8)].map((_, i) => (
        <div key={i} style={{ position:"fixed", width: 200+i*80, height: 200+i*80, borderRadius:"50%", background:`radial-gradient(circle, rgba(61,107,53,${0.03+i*0.01}) 0%, transparent 70%)`, top:`${10+i*10}%`, left:`${5+i*12}%`, pointerEvents:"none" }} />
      ))}
      <div style={{ textAlign:"center", animation:"fadeUp 0.8s ease both", zIndex:1 }}>
        <div style={{ position:"relative", display:"inline-block", marginBottom:16 }}>
          <div style={{ width:110, height:110, borderRadius:"50%", background:"linear-gradient(135deg,#1a3d1a,#3d6b35)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto", boxShadow:"0 0 60px rgba(93,168,93,0.3)" }}>
            <span style={{ fontSize:56 }}>🌿</span>
          </div>
        </div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:56, color:C.greenL, letterSpacing:"-3px", lineHeight:1 }}>puff</div>
        <div style={{ color:C.muted, fontSize:15, marginTop:8, marginBottom:48, letterSpacing:"0.3px" }}>find your smoke circle</div>
        <div style={{ display:"flex", flexDirection:"column", gap:12, width:300, margin:"0 auto" }}>
          <button style={BTN} onClick={onSignup}>Create Account 🌿</button>
          <button style={BTNO} onClick={onLogin}>Log In →</button>
        </div>
        <p style={{ color:"#1e3a1e", fontSize:11, marginTop:24, maxWidth:260, lineHeight:1.7, margin:"24px auto 0" }}>18+ only · Use responsibly · Legal jurisdictions only</p>
      </div>
    </div>
  );
}

// ─── AGE GATE ────────────────────────────────────────────────────────────────
function AgeGate({ onPass, onFail }) {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const days = Array.from({ length:31 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length:82 }, (_, i) => currentYear - 18 - i);

  const check = () => {
    if (!day || !month || !year) return;
    const dob = new Date(`${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`);
    const age = Math.floor((Date.now() - dob) / (365.25 * 24 * 3600 * 1000));
    age >= 18 ? onPass() : onFail();
  };

  const selectStyle = { ...INP, padding:"12px 15px", appearance:"none", backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%234a6a4a' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat:"no-repeat", backgroundPosition:"right 14px center" };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 24px" }}>
      <div style={{ width:"100%", maxWidth:380, animation:"fadeUp 0.5s ease both" }}>
        <div style={{ width:72, height:72, borderRadius:"50%", background:"linear-gradient(135deg,#1a2a1a,#2d4a2d)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:34 }}>🔒</div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:28, color:C.greenL, textAlign:"center", marginBottom:8 }}>Age Verification</div>
        <p style={{ color:C.muted, fontSize:14, textAlign:"center", marginBottom:32, lineHeight:1.6 }}>You must be 18 or older to join Puff.</p>

        <label style={LBL}>Date of Birth</label>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr 1fr", gap:10, marginBottom:24 }}>
          <select style={selectStyle} value={day} onChange={(e) => setDay(e.target.value)}>
            <option value="">Day</option>
            {days.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select style={selectStyle} value={month} onChange={(e) => setMonth(e.target.value)}>
            <option value="">Month</option>
            {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <select style={selectStyle} value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="">Year</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <button style={{ ...BTN, opacity:day && month && year ? 1 : 0.4 }} onClick={check} disabled={!day || !month || !year}>Continue →</button>
      </div>
    </div>
  );
}

// ─── LOGIN ───────────────────────────────────────────────────────────────────
function Login({ onBack, onDone, setToast }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !password) return setToast({ msg:"Fill all fields", type:"error" });
    setLoading(true);
    try {
      const res = await sb.signIn(email, password);
      if (res.error || res.error_description) {
        setToast({ msg: res.error_description || res.error?.message || "Invalid email or password", type:"error" });
      } else {
        onDone({ token: res.access_token, user: res.user, name: res.user?.user_metadata?.name });
      }
    } catch { setToast({ msg:"Network error — check connection", type:"error" }); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 24px" }}>
      <div style={{ width:"100%", maxWidth:380, animation:"fadeUp 0.5s ease both" }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:C.muted, fontSize:22, marginBottom:32, padding:0 }}>←</button>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:32, color:C.greenL, marginBottom:6 }}>Welcome back 🌿</div>
        <p style={{ color:C.muted, fontSize:14, marginBottom:32 }}>Sign in to your account</p>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div>
            <label style={LBL}>Email</label>
            <input style={INP} type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
          </div>
          <div>
            <label style={LBL}>Password</label>
            <div style={{ position:"relative" }}>
              <input style={{ ...INP, paddingRight:50 }} type={showPass ? "text" : "password"} placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
              <button onClick={() => setShowPass(!showPass)} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:C.muted, fontSize:16, padding:4 }}>{showPass ? "🙈" : "👁️"}</button>
            </div>
          </div>
          <button style={{ ...BTN, marginTop:8, opacity:loading ? 0.6 : 1 }} onClick={submit} disabled={loading}>
            {loading ? <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}><span style={{ width:16, height:16, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.8s linear infinite", display:"inline-block" }} />Signing in...</span> : "Log In →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SIGNUP + OTP VERIFICATION ───────────────────────────────────────────────
function Signup({ onBack, onDone, setToast }) {
  const [step, setStep] = useState("form"); // form | emailOTP | phoneOTP
  const [f, setF] = useState({ name:"", email:"", password:"", phone:"" });
  const [showPass, setShowPass] = useState(false);
  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [authData, setAuthData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef(null);

  const startCountdown = () => {
    setCountdown(60);
    timerRef.current = setInterval(() => {
      setCountdown((c) => { if (c <= 1) { clearInterval(timerRef.current); return 0; } return c - 1; });
    }, 1000);
  };

  const submitForm = async () => {
    if (!f.name || !f.email || !f.password) return setToast({ msg:"Fill all fields", type:"error" });
    if (f.password.length < 6) return setToast({ msg:"Password needs 6+ characters", type:"error" });
    setLoading(true);
    try {
      const res = await sb.signUp(f.email, f.password, f.name);
      if (res.error || res.error_description) {
        setToast({ msg: res.error_description || res.error?.message || "Signup failed", type:"error" });
      } else {
        setAuthData(res);
        setToast({ msg:"Verification email sent! Check your inbox.", type:"success" });
        startCountdown();
        setStep("emailOTP");
      }
    } catch { setToast({ msg:"Network error", type:"error" }); }
    setLoading(false);
  };

  const verifyEmail = async () => {
    // After email verification, move to phone OTP
    if (!f.phone) return setToast({ msg:"Enter your phone number", type:"error" });
    setLoading(true);
    try {
      const phone = f.phone.startsWith("+") ? f.phone : `+${f.phone}`;
      const res = await sb.sendPhoneOTP(phone);
      if (res.error) {
        setToast({ msg: res.error.message || "Failed to send SMS", type:"error" });
      } else {
        setToast({ msg:`Code sent to ${phone}`, type:"success" });
        startCountdown();
        setStep("phoneOTP");
      }
    } catch { setToast({ msg:"SMS failed — check phone number", type:"error" }); }
    setLoading(false);
  };

  const verifyPhone = async () => {
    if (!phoneCode || phoneCode.length < 6) return setToast({ msg:"Enter the 6-digit code", type:"error" });
    setLoading(true);
    try {
      const phone = f.phone.startsWith("+") ? f.phone : `+${f.phone}`;
      const res = await sb.verifyPhoneOTP(phone, phoneCode);
      if (res.error) {
        setToast({ msg: res.error.message || "Invalid code", type:"error" });
      } else {
        const token = authData?.access_token || res.access_token;
        const user = authData?.user || res.user;
        onDone({ token, user, name: f.name });
      }
    } catch { setToast({ msg:"Verification failed", type:"error" }); }
    setLoading(false);
  };

  const OTPInput = ({ value, onChange, onSubmit, label }) => (
    <div style={{ display:"flex", gap:10, justifyContent:"center", marginBottom:24 }}>
      {[...Array(6)].map((_, i) => (
        <input
          key={i}
          type="text"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "");
            const arr = value.split("");
            arr[i] = v;
            onChange(arr.join("").slice(0, 6));
            if (v && e.target.nextSibling) e.target.nextSibling.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !value[i] && e.target.previousSibling) e.target.previousSibling.focus();
            if (e.key === "Enter" && value.length === 6) onSubmit();
          }}
          style={{ width:46, height:54, textAlign:"center", fontSize:22, fontFamily:"'Syne',sans-serif", fontWeight:700, background:"#0c120c", border:`2px solid ${value[i] ? C.green : C.border}`, borderRadius:12, color:C.text, outline:"none", transition:"border-color 0.2s" }}
        />
      ))}
    </div>
  );

  if (step === "emailOTP") return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 24px" }}>
      <div style={{ width:"100%", maxWidth:380, animation:"fadeUp 0.5s ease both" }}>
        <div style={{ width:72, height:72, borderRadius:"50%", background:"linear-gradient(135deg,#1a2a3a,#2d4a6a)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:34 }}>📧</div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, color:C.greenL, textAlign:"center", marginBottom:8 }}>Check your email</div>
        <p style={{ color:C.muted, fontSize:14, textAlign:"center", marginBottom:8, lineHeight:1.6 }}>We sent a verification link to <strong style={{ color:C.text }}>{f.email}</strong></p>
        <p style={{ color:C.muted, fontSize:13, textAlign:"center", marginBottom:32, lineHeight:1.6 }}>Click the link in your email to verify, then come back here and enter your phone number.</p>
        <div style={{ marginBottom:16 }}>
          <label style={LBL}>Phone Number (with country code)</label>
          <input style={INP} type="tel" placeholder="+2348012345678" value={f.phone} onChange={(e) => setF((v) => ({ ...v, phone:e.target.value }))} />
          <p style={{ color:C.muted, fontSize:11, marginTop:6 }}>Include your country code e.g. +234 for Nigeria, +1 for USA/Canada</p>
        </div>
        <button style={{ ...BTN, opacity:loading ? 0.6 : 1 }} onClick={verifyEmail} disabled={loading}>
          {loading ? "Sending SMS..." : "Send Phone Code →"}
        </button>
        <div style={{ textAlign:"center", marginTop:16 }}>
          <button onClick={async () => { await sb.resendEmailOTP(f.email); setToast({ msg:"Email resent!", type:"success" }); }} style={{ background:"none", border:"none", color:C.muted, fontSize:13, textDecoration:"underline" }}>
            Resend verification email
          </button>
        </div>
      </div>
    </div>
  );

  if (step === "phoneOTP") return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 24px" }}>
      <div style={{ width:"100%", maxWidth:380, animation:"fadeUp 0.5s ease both" }}>
        <div style={{ width:72, height:72, borderRadius:"50%", background:"linear-gradient(135deg,#1a3a1a,#2d6b2d)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:34 }}>📱</div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, color:C.greenL, textAlign:"center", marginBottom:8 }}>Phone Verification</div>
        <p style={{ color:C.muted, fontSize:14, textAlign:"center", marginBottom:32, lineHeight:1.6 }}>Enter the 6-digit code sent to <strong style={{ color:C.text }}>{f.phone}</strong></p>
        <OTPInput value={phoneCode} onChange={setPhoneCode} onSubmit={verifyPhone} />
        <button style={{ ...BTN, opacity:loading || phoneCode.length < 6 ? 0.5 : 1 }} onClick={verifyPhone} disabled={loading || phoneCode.length < 6}>
          {loading ? "Verifying..." : "Verify & Continue →"}
        </button>
        <div style={{ textAlign:"center", marginTop:16 }}>
          {countdown > 0 ? (
            <p style={{ color:C.muted, fontSize:13 }}>Resend in {countdown}s</p>
          ) : (
            <button onClick={() => { sb.sendPhoneOTP(f.phone.startsWith("+") ? f.phone : `+${f.phone}`); startCountdown(); setToast({ msg:"Code resent!", type:"success" }); }} style={{ background:"none", border:"none", color:C.muted, fontSize:13, textDecoration:"underline" }}>
              Resend code
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 24px" }}>
      <div style={{ width:"100%", maxWidth:380, animation:"fadeUp 0.5s ease both" }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:C.muted, fontSize:22, marginBottom:32, padding:0 }}>←</button>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:32, color:C.greenL, marginBottom:6 }}>Join Puff 🌿</div>
        <p style={{ color:C.muted, fontSize:14, marginBottom:32 }}>Create your smoke profile</p>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div>
            <label style={LBL}>Full Name</label>
            <input style={INP} placeholder="Your name" value={f.name} onChange={(e) => setF((v) => ({ ...v, name:e.target.value }))} />
          </div>
          <div>
            <label style={LBL}>Email</label>
            <input style={INP} type="email" placeholder="you@email.com" value={f.email} onChange={(e) => setF((v) => ({ ...v, email:e.target.value }))} />
          </div>
          <div>
            <label style={LBL}>Password</label>
            <div style={{ position:"relative" }}>
              <input style={{ ...INP, paddingRight:50 }} type={showPass ? "text" : "password"} placeholder="Min 6 characters" value={f.password} onChange={(e) => setF((v) => ({ ...v, password:e.target.value }))} />
              <button onClick={() => setShowPass(!showPass)} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:C.muted, fontSize:16, padding:4 }}>{showPass ? "🙈" : "👁️"}</button>
            </div>
          </div>
          <button style={{ ...BTN, marginTop:8, opacity:loading ? 0.6 : 1 }} onClick={submitForm} disabled={loading}>
            {loading ? "Creating account..." : "Continue →"}
          </button>
          <button style={BTNO} onClick={onBack}>Already have an account? Log in</button>
        </div>
      </div>
    </div>
  );
}

// ─── PROFILE SETUP ───────────────────────────────────────────────────────────
function ProfileSetup({ auth, onDone, setToast }) {
  const [step, setStep] = useState(0);
  const [d, setD] = useState({ avatar:"a1", avatarUrl:null, age:"", bio:"", gender:"", vibes:[], styles:[], strains:[] });
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const tog = (key, val, max = 99) => {
    setD((p) => {
      const arr = p[key];
      if (arr.includes(val)) return { ...p, [key]: arr.filter((x) => x !== val) };
      if (arr.length >= max) { setToast({ msg:`Max ${max} selections`, type:"info" }); return p; }
      return { ...p, [key]: [...arr, val] };
    });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) return setToast({ msg:"Image must be under 3MB", type:"error" });
    const url = URL.createObjectURL(file);
    setD((p) => ({ ...p, avatarUrl: url }));
  };

  const save = async () => {
    if (!d.age || parseInt(d.age) < 18) return setToast({ msg:"Must be 18+ to use Puff", type:"error" });
    if (!d.gender) return setToast({ msg:"Please select your gender", type:"error" });
    setSaving(true);
    try {
      if (auth) {
        const payload = {
          id: auth.user.id,
          name: auth.name || "Puffer",
          age: parseInt(d.age),
          bio: d.bio,
          avatar: d.avatar,
          vibe: d.vibes.join(", "),
          styles: d.styles,
          strains: d.strains,
          gender: d.gender,
        };
        const result = await sb.upsert("profiles", auth.token, payload);
        if (result && result[0]?.id) {
          onDone(d);
        } else if (Array.isArray(result) && result.length === 0) {
          onDone(d); // upsert succeeded but returned empty
        } else if (result?.code) {
          setToast({ msg: result.message || "Failed to save profile", type:"error" });
          setSaving(false);
          return;
        } else {
          onDone(d);
        }
      } else {
        onDone(d);
      }
    } catch (e) {
      setToast({ msg:"Failed to save — check connection", type:"error" });
    }
    setSaving(false);
  };

  const genderAvatarFilter = (styleId) => {
    // All avatars available for all genders — style is personal
    return true;
  };

  const steps = [
    {
      title: "What's your gender?", sub: "Helps us personalise your experience",
      body: (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {[
            { val:"male", icon:"♂️", label:"Man" },
            { val:"female", icon:"♀️", label:"Woman" },
            { val:"nonbinary", icon:"⚧️", label:"Non-binary" },
            { val:"other", icon:"✨", label:"Prefer not to say" },
          ].map(({ val, icon, label }) => (
            <div key={val} onClick={() => setD((p) => ({ ...p, gender:val }))} style={{ display:"flex", alignItems:"center", gap:14, padding:"16px 18px", borderRadius:16, border:`1.5px solid ${d.gender === val ? C.green : C.border}`, background:d.gender === val ? "#1e3d1e" : C.surface, cursor:"pointer", transition:"all 0.2s" }}>
              <span style={{ fontSize:24 }}>{icon}</span>
              <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:600, fontSize:16, color:d.gender === val ? C.greenL : C.text }}>{label}</span>
              {d.gender === val && <span style={{ marginLeft:"auto", color:C.green, fontSize:18 }}>✓</span>}
            </div>
          ))}
        </div>
      )
    },
    {
      title: "Build your profile", sub: "Tell people who's behind the smoke",
      body: (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div>
            <label style={LBL}>Age (18+ only)</label>
            <input style={INP} type="number" min={18} max={100} placeholder="Your age" value={d.age} onChange={(e) => setD((p) => ({ ...p, age:e.target.value }))} />
          </div>
          <div>
            <label style={LBL}>Bio</label>
            <textarea style={{ ...INP, resize:"none", height:90 }} placeholder="Describe your vibe in a few words..." value={d.bio} onChange={(e) => setD((p) => ({ ...p, bio:e.target.value }))} />
          </div>
        </div>
      )
    },
    {
      title: "Pick your avatar", sub: "Choose a style or upload a photo",
      body: (
        <div>
          {/* Upload photo option */}
          <div onClick={() => fileRef.current?.click()} style={{ display:"flex", alignItems:"center", gap:14, padding:"16px 18px", borderRadius:16, border:`1.5px dashed ${d.avatarUrl ? C.green : C.border}`, background:d.avatarUrl ? "#1e3d1e" : "transparent", cursor:"pointer", marginBottom:20, transition:"all 0.2s" }}>
            {d.avatarUrl ? (
              <img src={d.avatarUrl} alt="preview" style={{ width:44, height:44, borderRadius:"50%", objectFit:"cover" }} />
            ) : (
              <div style={{ width:44, height:44, borderRadius:"50%", background:"#1a2a1a", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>📷</div>
            )}
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:600, fontSize:14, color:d.avatarUrl ? C.greenL : C.text }}>{d.avatarUrl ? "Photo uploaded ✓" : "Upload a photo"}</div>
              <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{d.avatarUrl ? "Tap to change" : "JPG or PNG, max 3MB"}</div>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handlePhotoUpload} />

          {!d.avatarUrl && (
            <>
              <div style={{ fontSize:12, color:C.muted, marginBottom:14, textAlign:"center" }}>— or choose an avatar style —</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
                {AVATAR_STYLES.map((a) => (
                  <div key={a.id} onClick={() => setD((p) => ({ ...p, avatar:a.id }))} style={{ aspectRatio:"1", borderRadius:16, background:a.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:"pointer", border:`2px solid ${d.avatar === a.id ? C.green : "transparent"}`, transition:"all 0.2s", boxShadow:d.avatar === a.id ? `0 0 20px rgba(93,168,93,0.4)` : "none", position:"relative" }}>
                    <span style={{ fontSize:26 }}>{a.icon}</span>
                    <span style={{ fontSize:10, color:"rgba(255,255,255,0.6)", marginTop:4 }}>{a.label}</span>
                    {d.avatar === a.id && <div style={{ position:"absolute", top:6, right:6, width:16, height:16, borderRadius:"50%", background:C.green, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"#fff" }}>✓</div>}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )
    },
    {
      title: "Your session vibes", sub: "Pick up to 3 that describe you",
      body: (
        <div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {ALL_VIBES.map((v) => {
              const on = d.vibes.includes(v);
              return <span key={v} style={{ ...chip(on), opacity:!on && d.vibes.length >= 3 ? 0.4 : 1 }} onClick={() => tog("vibes", v, 3)}>{v}</span>;
            })}
          </div>
          {d.vibes.length > 0 && (
            <div style={{ marginTop:14, padding:"10px 14px", borderRadius:12, background:"#1e3d1e", border:`1px solid ${C.border}` }}>
              <span style={{ fontSize:12, color:C.greenL }}>{d.vibes.length}/3 selected</span>
            </div>
          )}
        </div>
      )
    },
    {
      title: "Smoke method", sub: "How do you like to consume?",
      body: <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>{SMOKE_STYLES.map((s) => <span key={s} style={chip(d.styles.includes(s))} onClick={() => tog("styles", s)}>🔥 {s}</span>)}</div>
    },
    {
      title: "Favourite strains", sub: "Pick your go-tos (scroll for Canadian strains 🍁)",
      body: (
        <div>
          <div style={{ fontSize:12, color:C.muted, marginBottom:10, padding:"6px 12px", background:C.surface2, borderRadius:10, display:"inline-block" }}>🌿 Classic · 🍁 Canadian</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {ALL_STRAINS.map((s, i) => (
              <span key={s} style={chip(d.strains.includes(s))} onClick={() => tog("strains", s)}>
                {i >= 15 ? "🍁" : "🌿"} {s}
              </span>
            ))}
          </div>
        </div>
      )
    },
  ];

  const cur = steps[step];
  const progress = ((step + 1) / steps.length * 100).toFixed(0);

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center" }}>
      <div style={{ width:"100%", maxWidth:430, padding:"36px 24px 100px", boxSizing:"border-box" }}>
        {/* Progress bar */}
        <div style={{ display:"flex", gap:6, marginBottom:28 }}>
          {steps.map((_, i) => (
            <div key={i} style={{ flex:1, height:3, borderRadius:3, background:i <= step ? C.green : "#1a2e1a", transition:"background 0.4s ease" }} />
          ))}
        </div>
        <p style={{ color:C.muted, fontSize:11, marginBottom:16, textTransform:"uppercase", letterSpacing:"0.6px", fontWeight:700 }}>Step {step + 1} of {steps.length}</p>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, color:C.greenL, marginBottom:5 }}>{cur.title}</div>
        <p style={{ color:C.muted, fontSize:14, marginBottom:24 }}>{cur.sub}</p>
        <div key={step} style={{ animation:"fadeUp 0.3s ease both" }}>{cur.body}</div>
        <div style={{ display:"flex", gap:10, marginTop:32 }}>
          {step > 0 && <button style={{ ...BTNO, flex:1, padding:"14px" }} onClick={() => setStep((s) => s - 1)}>← Back</button>}
          <button style={{ ...BTN, flex:2, opacity:saving ? 0.6 : 1 }} onClick={() => step < steps.length - 1 ? setStep((s) => s + 1) : save()} disabled={saving}>
            {step === steps.length - 1 ? (saving ? <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}><span style={{ width:16, height:16, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.8s linear infinite", display:"inline-block" }} />Saving...</span> : "Let's Puff 🌿") : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── REPORT MODAL ────────────────────────────────────────────────────────────
function ReportModal({ profile, auth, onClose, setToast }) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);
  const submit = async () => {
    if (!reason) return setToast({ msg:"Select a reason", type:"error" });
    setSending(true);
    try {
      if (auth) await sb.ins("reports", auth.token, { reporter_id:auth.user.id, reported_id:profile.id, reason, details });
      setToast({ msg:"Report submitted — we'll review it shortly", type:"success" });
      onClose();
    } catch { setToast({ msg:"Failed to submit", type:"error" }); }
    setSending(false);
  };
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:150, backdropFilter:"blur(4px)" }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ width:"100%", maxWidth:430, background:"#0f140f", borderRadius:"24px 24px 0 0", padding:"28px 22px 40px", border:`1px solid ${C.border}`, animation:"slideUp 0.3s ease" }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:"#ff8080", marginBottom:6 }}>Report {profile.name}</div>
        <p style={{ color:C.muted, fontSize:13, marginBottom:18 }}>Reports are anonymous and reviewed by our team within 24 hours.</p>
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:14 }}>
          {REPORT_REASONS.map((r) => (
            <div key={r} onClick={() => setReason(r)} style={{ padding:"13px 16px", borderRadius:14, border:`1.5px solid ${reason === r ? C.green : C.border}`, background:reason === r ? "#1e3d1e" : C.surface, color:reason === r ? C.greenL : C.text, cursor:"pointer", fontSize:14, transition:"all 0.15s", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              {r} {reason === r && <span style={{ color:C.green }}>✓</span>}
            </div>
          ))}
        </div>
        <textarea style={{ ...INP, resize:"none", height:70, marginBottom:14 }} placeholder="Additional details (optional)" value={details} onChange={(e) => setDetails(e.target.value)} />
        <button style={{ ...BTN, background:"linear-gradient(135deg,#5a1a1a,#8a2a2a)", color:"#ffaaaa", marginBottom:10, opacity:sending ? 0.6 : 1 }} onClick={submit} disabled={sending}>{sending ? "Submitting..." : "Submit Report"}</button>
        <button style={BTNO} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function PuffApp() {
  const [screen, setScreen] = useState("splash");
  const [auth, setAuth] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [tab, setTab] = useState("discover");
  const [toast, setToastState] = useState(null);
  const toastTimer = useRef(null);

  const setToast = useCallback(({ msg, type }) => {
    setToastState({ msg, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastState(null), 3500);
  }, []);

  const [deck, setDeck] = useState([...DEMO]);
  const [matches, setMatches] = useState([]);
  const [threads, setThreads] = useState({});
  const [swipeDir, setSwipeDir] = useState(null);
  const [matchFlash, setMatchFlash] = useState(null);
  const [particles, setParticles] = useState([]);
  const [reportTarget, setReportTarget] = useState(null);
  const [blocked, setBlocked] = useState(new Set());
  const [chatOpen, setChatOpen] = useState(null);
  const [chatTxt, setChatTxt] = useState("");
  const [filters, setFilters] = useState({ maxDist:20, vibes:[], styles:[], strains:[] });

  const dragX = useRef(null);
  const msgEnd = useRef(null);

  useEffect(() => { msgEnd.current?.scrollIntoView({ behavior:"smooth" }); }, [threads, chatOpen]);

  const togF = (key, val) => setFilters((f) => ({ ...f, [key]: f[key].includes(val) ? f[key].filter((x) => x !== val) : [...f[key], val] }));

  const filtered = deck.filter((p) => {
    if (blocked.has(p.id)) return false;
    if (p.distance > filters.maxDist) return false;
    if (filters.vibes.length) {
      const pVibes = Array.isArray(p.vibe) ? p.vibe : (p.vibe || "").split(", ");
      if (!filters.vibes.some((v) => pVibes.includes(v))) return false;
    }
    if (filters.styles.length && !p.styles.some((s) => filters.styles.includes(s))) return false;
    if (filters.strains.length && !p.strains.some((s) => filters.strains.includes(s))) return false;
    return true;
  });

  const spawnParticles = () => {
    const em = ["💨","🌿","🍃","✨","🔥","😌","💫","🍁"];
    setParticles(Array.from({ length:14 }, (_, i) => ({ id:Date.now() + i, x:Math.random() * 85 + 5, e:getRand(em), d:Math.random() * 0.7 })));
    setTimeout(() => setParticles([]), 2400);
  };

  const swipe = async (dir) => {
    if (!filtered.length) return;
    const cur = filtered[0];
    setSwipeDir(dir);
    setTimeout(async () => {
      setSwipeDir(null);
      setDeck((d) => d.filter((p) => p.id !== cur.id));
      if (auth && !String(cur.id).startsWith("d")) {
        try { await sb.ins("swipes", auth.token, { swiper_id:auth.user.id, swiped_id:cur.id, direction:dir }); } catch {}
      }
      if (dir === "right") {
        const mid = `local_${cur.id}_${Date.now()}`;
        setMatches((m) => [{ ...cur, matchId:mid }, ...m]);
        setThreads((t) => ({ ...t, [mid]:[] }));
        setMatchFlash({ ...cur, matchId:mid });
        spawnParticles();
        setTimeout(() => setMatchFlash(null), 3000);
      }
    }, 420);
  };

  const sendMsg = () => {
    if (!chatTxt.trim() || !chatOpen) return;
    const content = chatTxt.trim();
    const mid = chatOpen.matchId;
    const um = { id:Date.now(), sender_id:auth?.user?.id || "me", content, created_at:new Date().toISOString() };
    setThreads((t) => ({ ...t, [mid]:[...(t[mid] || []), um] }));
    setChatTxt("");
    if (auth && !String(mid).startsWith("local")) {
      sb.ins("messages", auth.token, { match_id:mid, sender_id:auth.user.id, content }).catch(() => {});
    }
    if (String(mid).startsWith("local")) {
      setTimeout(() => {
        const bm = { id:Date.now() + 1, sender_id:chatOpen.id, content:getRand(BOT_REPLIES), created_at:new Date().toISOString() };
        setThreads((t) => ({ ...t, [mid]:[...(t[mid] || []), bm] }));
      }, 800 + Math.random() * 1400);
    }
  };

  const blockUser = async (id) => {
    setBlocked((b) => new Set([...b, id]));
    if (auth) { try { await sb.ins("blocks", auth.token, { blocker_id:auth.user.id, blocked_id:id }); } catch {} }
    setToast({ msg:"User blocked", type:"success" });
    if (chatOpen?.id === id) setChatOpen(null);
  };

  const top = filtered[0];
  const nxt = filtered[1];

  // ── SCREEN ROUTING ──
  if (screen === "splash") return <><GlobalStyles /><Toast {...(toast || {})} /><Splash onLogin={() => setScreen("login")} onSignup={() => setScreen("age_s")} /></>;
  if (screen === "login") return <><GlobalStyles /><Toast {...(toast || {})} /><Login onBack={() => setScreen("splash")} setToast={setToast} onDone={(d) => { setAuth(d); setScreen("app"); }} /></>;
  if (screen === "age_s") return <><GlobalStyles /><Toast {...(toast || {})} /><AgeGate onPass={() => setScreen("signup")} onFail={() => { setToast({ msg:"Must be 18+ to use Puff", type:"error" }); setScreen("splash"); }} /></>;
  if (screen === "signup") return <><GlobalStyles /><Toast {...(toast || {})} /><Signup onBack={() => setScreen("splash")} setToast={setToast} onDone={(d) => { setAuth(d); setScreen("setup"); }} /></>;
  if (screen === "setup") return <><GlobalStyles /><Toast {...(toast || {})} /><ProfileSetup auth={auth} setToast={setToast} onDone={(p) => { setUserProfile(p); setScreen("app"); }} /></>;

  // ── APP ──
  const getVibeDisplay = (vibe) => Array.isArray(vibe) ? vibe : (vibe || "").split(", ").filter(Boolean);

  const renderDiscover = () => (
    <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", paddingTop:76, paddingBottom:110 }}>
      <div style={{ position:"relative", width:"88%", maxWidth:380, height:500 }}>
        {filtered.length === 0 ? (
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center" }}>
            <div style={{ fontSize:60, marginBottom:14 }}>🌬️</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, color:C.greenL, marginBottom:8 }}>That's everyone nearby</div>
            <div style={{ fontSize:13, color:C.muted, marginBottom:20 }}>Try adjusting your filters</div>
            <button style={{ ...BTN, width:"auto", padding:"12px 28px" }} onClick={() => setTab("filter")}>Open Filters ⚙️</button>
          </div>
        ) : (
          <>
            {nxt && (
              <div style={{ position:"absolute", inset:0, borderRadius:28, background:`linear-gradient(160deg,${nxt.bg || "#0d2a0d"} 0%,#0f1a0f 100%)`, transform:"scale(0.93) translateY(18px)", opacity:0.45 }}>
                <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-60%)" }}>
                  <Avatar avatarId={nxt.avatarId} name={nxt.name} size={90} uploadUrl={nxt.avatarUrl} />
                </div>
              </div>
            )}
            <div
              style={{ position:"absolute", inset:0, borderRadius:28, overflow:"hidden", cursor:"grab", background:`linear-gradient(160deg,${top.bg || "#0d2a0d"} 0%,#0f1a0f 100%)`, boxShadow:`0 32px 80px rgba(0,0,0,0.6),0 4px 24px rgba(0,0,0,0.4)`, transform:swipeDir === "left" ? "translateX(-130%) rotate(-18deg)" : swipeDir === "right" ? "translateX(130%) rotate(18deg)" : "none", transition:swipeDir ? "transform 0.42s cubic-bezier(.4,0,.2,1)" : "none", userSelect:"none" }}
              onMouseDown={(e) => { dragX.current = e.clientX; }}
              onMouseUp={(e) => { if (dragX.current === null) return; const d = e.clientX - dragX.current; if (Math.abs(d) > 65) swipe(d > 0 ? "right" : "left"); dragX.current = null; }}
              onTouchStart={(e) => { dragX.current = e.touches[0].clientX; }}
              onTouchEnd={(e) => { if (dragX.current === null) return; const d = e.changedTouches[0].clientX - dragX.current; if (Math.abs(d) > 65) swipe(d > 0 ? "right" : "left"); dragX.current = null; }}
            >
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.92) 0%,rgba(0,0,0,0.1) 50%,transparent 100%)" }} />

              {/* Avatar */}
              <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-80%)" }}>
                <Avatar avatarId={top.avatarId} name={top.name} size={110} uploadUrl={top.avatarUrl} />
              </div>

              {/* Report btn */}
              <button onClick={(e) => { e.stopPropagation(); setReportTarget(top); }} style={{ position:"absolute", top:16, right:16, background:"rgba(0,0,0,0.45)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"6px 12px", color:"rgba(255,255,255,0.4)", fontSize:12, backdropFilter:"blur(4px)" }}>⚠️</button>

              {/* Swipe stamps */}
              {swipeDir === "left" && <div style={{ position:"absolute", top:28, left:22, fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:24, color:C.red, border:`3px solid ${C.red}`, borderRadius:10, padding:"4px 12px", transform:"rotate(-15deg)", background:"rgba(255,96,96,0.1)" }}>PASS</div>}
              {swipeDir === "right" && <div style={{ position:"absolute", top:28, right:22, fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:24, color:top.accent || C.greenL, border:`3px solid ${top.accent || C.greenL}`, borderRadius:10, padding:"4px 12px", transform:"rotate(15deg)", background:"rgba(93,168,93,0.1)" }}>PUFF 🌿</div>}

              {/* Info */}
              <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"24px 22px 28px" }}>
                <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:4 }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:28, color:"#fff" }}>{top.name}</div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:600, fontSize:20, color:"rgba(255,255,255,0.6)" }}>{top.age}</div>
                </div>
                <div style={{ fontSize:13, color:"rgba(255,255,255,0.45)", marginBottom:10 }}>📍 ~{top.distance}km away</div>
                <div style={{ fontSize:13, color:"rgba(255,255,255,0.8)", lineHeight:1.55, marginBottom:14 }}>{top.bio}</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {getVibeDisplay(top.vibe).slice(0,2).map((v) => <span key={v} style={{ background:"rgba(255,255,255,0.1)", backdropFilter:"blur(6px)", borderRadius:20, padding:"4px 11px", fontSize:11, fontWeight:600, color:top.accent || C.greenL, border:"1px solid rgba(255,255,255,0.1)" }}>{v}</span>)}
                  {(top.styles || []).slice(0,2).map((s) => <span key={s} style={{ background:"rgba(255,255,255,0.07)", borderRadius:20, padding:"4px 11px", fontSize:11, color:"rgba(255,255,255,0.55)" }}>🔥 {s}</span>)}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {filtered.length > 0 && (
        <div style={{ display:"flex", gap:20, justifyContent:"center", marginTop:24, alignItems:"center" }}>
          <button onClick={() => swipe("left")} style={{ width:62, height:62, borderRadius:"50%", border:`1px solid rgba(255,96,96,0.2)`, background:"rgba(255,96,96,0.08)", color:C.red, fontSize:22, boxShadow:"0 4px 20px rgba(255,96,96,0.1)" }}>✕</button>
          <button onClick={() => setTab("filter")} style={{ width:46, height:46, borderRadius:"50%", border:`1px solid ${C.border}`, background:C.surface, color:C.muted, fontSize:16 }}>⚙️</button>
          <button onClick={() => swipe("right")} style={{ width:70, height:70, borderRadius:"50%", border:`1px solid rgba(93,168,93,0.2)`, background:"rgba(30,61,30,0.9)", color:C.greenL, fontSize:28, boxShadow:"0 8px 32px rgba(61,107,53,0.3)" }}>🌿</button>
        </div>
      )}
      <p style={{ fontSize:11, color:"#1e3a1e", marginTop:10 }}>Drag or tap · 🌿 match · ✕ pass</p>
    </div>
  );

  const renderMatches = () => {
    if (chatOpen) {
      const thread = threads[chatOpen.matchId] || [];
      return (
        <div style={{ display:"flex", flexDirection:"column", height:"100vh" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, padding:"52px 18px 14px", borderBottom:`1px solid ${C.border}`, background:C.bg, position:"sticky", top:0, zIndex:10 }}>
            <button onClick={() => setChatOpen(null)} style={{ background:"none", border:"none", color:C.muted, fontSize:22, padding:0 }}>←</button>
            <Avatar avatarId={chatOpen.avatarId} name={chatOpen.name} size={42} uploadUrl={chatOpen.avatarUrl} />
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, color:C.text }}>{chatOpen.name}{chatOpen.age ? `, ${chatOpen.age}` : ""}</div>
              <div style={{ fontSize:12, color:C.muted }}>{getVibeDisplay(chatOpen.vibe)[0] || ""}</div>
            </div>
            <button onClick={() => { if (window.confirm(`Block ${chatOpen.name}?`)) blockUser(chatOpen.id); }} style={{ background:"none", border:"none", color:"#ff7070", fontSize:12, padding:"4px 8px" }}>Block</button>
            <button onClick={() => setReportTarget(chatOpen)} style={{ background:"none", border:"none", color:C.muted, fontSize:12, padding:"4px 8px" }}>Report</button>
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"16px 16px 90px", display:"flex", flexDirection:"column", gap:10 }}>
            {thread.length === 0 && (
              <div style={{ textAlign:"center", color:C.muted, padding:"50px 0" }}>
                <div style={{ fontSize:44, marginBottom:10 }}>🌿</div>
                <p style={{ fontSize:14 }}>Say hi — don't be shy 👋</p>
              </div>
            )}
            {thread.map((m, i) => {
              const isMe = m.sender_id === (auth?.user?.id || "me");
              return (
                <div key={m.id || i} style={{ display:"flex", justifyContent:isMe ? "flex-end" : "flex-start", gap:8, alignItems:"flex-end" }}>
                  {!isMe && <Avatar avatarId={chatOpen.avatarId} name={chatOpen.name} size={28} uploadUrl={chatOpen.avatarUrl} />}
                  <div style={{ maxWidth:"72%", padding:"11px 15px", borderRadius:isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background:isMe ? "linear-gradient(135deg,#3d6b35,#4d8a44)" : C.surface2, color:isMe ? "#c8f5c8" : C.text, fontSize:14, lineHeight:1.5 }}>
                    {m.content}
                    <div style={{ fontSize:10, opacity:0.4, marginTop:5, textAlign:"right" }}>{new Date(m.created_at).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}</div>
                  </div>
                </div>
              );
            })}
            <div ref={msgEnd} />
          </div>
          <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, padding:"10px 14px 20px", background:C.bg, borderTop:`1px solid ${C.border}`, display:"flex", gap:10, boxSizing:"border-box" }}>
            <input style={{ flex:1, background:C.surface2, border:`1.5px solid ${C.border}`, borderRadius:24, padding:"11px 18px", color:C.text, fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none" }} placeholder="Say something..." value={chatTxt} onChange={(e) => setChatTxt(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMsg()} />
            <button onClick={sendMsg} style={{ background:"linear-gradient(135deg,#3d6b35,#4d8a44)", border:"none", borderRadius:"50%", width:46, height:46, fontSize:18, color:"#c8f5c8", flexShrink:0 }}>➤</button>
          </div>
        </div>
      );
    }
    return (
      <div style={{ paddingTop:72, paddingBottom:90 }}>
        <div style={{ padding:"0 20px 20px", fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:24, color:C.greenL }}>Your Matches 💨</div>
        {matches.length === 0 ? (
          <div style={{ textAlign:"center", color:C.muted, padding:"60px 20px" }}>
            <div style={{ fontSize:56, marginBottom:12 }}>🤝</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, color:"#6aaa65", marginBottom:8 }}>No matches yet</div>
            <div style={{ fontSize:13 }}>Keep swiping to find your circle</div>
          </div>
        ) : (
          <div style={{ padding:"0 14px", display:"flex", flexDirection:"column", gap:10 }}>
            {matches.filter((m) => !blocked.has(m.id)).map((m) => {
              const thread = threads[m.matchId] || [];
              const last = thread[thread.length - 1];
              const unread = thread.filter((msg) => msg.sender_id !== (auth?.user?.id || "me")).length;
              return (
                <div key={m.matchId} onClick={() => setChatOpen(m)} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", borderRadius:18, background:C.surface, border:`1px solid ${C.border}`, cursor:"pointer", transition:"background 0.2s" }}>
                  <Avatar avatarId={m.avatarId} name={m.name} size={50} uploadUrl={m.avatarUrl} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, color:C.text }}>{m.name}{m.age ? `, ${m.age}` : ""}</div>
                    <div style={{ fontSize:13, color:C.muted, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", marginTop:2 }}>{last ? last.content : "Tap to start chatting 💬"}</div>
                  </div>
                  {unread > 0 && <div style={{ background:C.green, color:"#fff", borderRadius:"50%", width:22, height:22, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, flexShrink:0 }}>{unread}</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderFilter = () => (
    <div style={{ padding:"80px 20px 100px" }}>
      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:C.greenL, marginBottom:26 }}>Filter Sessions ⚙️</div>
      {[
        { label:"Max Distance", content: (
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <input type="range" min={1} max={50} value={filters.maxDist} onChange={(e) => setFilters((f) => ({ ...f, maxDist:+e.target.value }))} style={{ flex:1 }} />
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:C.greenL, minWidth:56 }}>{filters.maxDist}km</span>
          </div>
        )},
        { label:"Vibe 🌿", content: <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>{ALL_VIBES.map((v) => <span key={v} style={chip(filters.vibes.includes(v))} onClick={() => togF("vibes", v)}>{v}</span>)}</div> },
        { label:"Smoke Style 🔥", content: <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>{SMOKE_STYLES.map((s) => <span key={s} style={chip(filters.styles.includes(s))} onClick={() => togF("styles", s)}>{s}</span>)}</div> },
        { label:"Strains 🍃", content: <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>{ALL_STRAINS.map((s, i) => <span key={s} style={chip(filters.strains.includes(s))} onClick={() => togF("strains", s)}>{i >= 15 ? "🍁" : "🌿"} {s}</span>)}</div> },
      ].map((sec) => (
        <div key={sec.label} style={{ marginBottom:28 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:C.text, marginBottom:12 }}>{sec.label}</div>
          {sec.content}
        </div>
      ))}
      <button style={BTN} onClick={() => setTab("discover")}>Apply Filters →</button>
      <button style={{ ...BTNO, marginTop:10 }} onClick={() => setFilters({ maxDist:20, vibes:[], styles:[], strains:[] })}>Clear All</button>
    </div>
  );

  const renderProfile = () => (
    <div style={{ padding:"80px 20px 100px", display:"flex", flexDirection:"column", gap:14 }}>
      <div style={CARD}>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}>
          <Avatar avatarId={userProfile?.avatar} name={auth?.name || "Puffer"} size={80} uploadUrl={userProfile?.avatarUrl} />
        </div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:24, textAlign:"center", color:C.text }}>{auth?.name || "Puffer"}</div>
        <div style={{ textAlign:"center", color:C.muted, fontSize:13, marginBottom:18, marginTop:4 }}>
          {userProfile?.gender ? `${userProfile.gender.charAt(0).toUpperCase() + userProfile.gender.slice(1)} · ` : ""}
          {userProfile?.vibes?.[0] || "Setting my vibe..."}
        </div>
        <div style={{ display:"flex", justifyContent:"space-around", borderTop:`1px solid ${C.border}`, paddingTop:16 }}>
          {[["Matches", matches.length], ["Swiped", DEMO.length - deck.length], ["Age", userProfile?.age || "—"]].map(([l, v]) => (
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:C.greenL }}>{v}</div>
              <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...CARD, border:"1px solid #1e3a1e" }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:C.greenL, marginBottom:10, fontSize:13 }}>🔒 Your Privacy</div>
        <div style={{ fontSize:13, color:C.muted, lineHeight:1.9 }}>
          • Exact location never shared — only ~distance<br />
          • Phone & email verified at signup<br />
          • Block or report any user instantly<br />
          • Messages secured with row-level security<br />
          • Age enforced at signup (18+ only)
        </div>
      </div>

      {userProfile?.bio && <div style={CARD}><div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:C.greenL, marginBottom:10 }}>Bio</div><p style={{ color:C.dim, fontSize:14, lineHeight:1.6 }}>{userProfile.bio}</p></div>}
      {userProfile?.vibes?.length > 0 && <div style={CARD}><div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:C.greenL, marginBottom:10 }}>Vibes</div><div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>{userProfile.vibes.map((v) => <span key={v} style={chip(true)}>{v}</span>)}</div></div>}
      {userProfile?.styles?.length > 0 && <div style={CARD}><div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:C.greenL, marginBottom:10 }}>Smoke Style</div><div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>{userProfile.styles.map((s) => <span key={s} style={chip(true)}>🔥 {s}</span>)}</div></div>}
      {userProfile?.strains?.length > 0 && <div style={CARD}><div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:C.greenL, marginBottom:10 }}>Fav Strains</div><div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>{userProfile.strains.map((s, i) => <span key={s} style={chip(true)}>{i >= 15 ? "🍁" : "🌿"} {s}</span>)}</div></div>}

      <button style={BTNO} onClick={() => setScreen("setup")}>Edit Profile ✏️</button>
      <button style={{ ...BTNO, borderColor:C.redDim, color:"#ff7070", marginTop:4 }} onClick={async () => { if (auth) await sb.signOut(auth.token); setScreen("splash"); setAuth(null); setDeck([...DEMO]); setMatches([]); setThreads({}); }}>Log Out</button>
    </div>
  );

  const TABS = [
    { k:"discover", icon:"🔥", label:"Discover" },
    { k:"matches", icon:"💬", label:`Matches${matches.length ? ` (${matches.length})` : ""}` },
    { k:"filter", icon:"⚙️", label:"Filters" },
    { k:"profile", icon:"🌿", label:"Profile" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'DM Sans',sans-serif", display:"flex", flexDirection:"column", alignItems:"center", position:"relative", overflow:"hidden" }}>
      <GlobalStyles />
      <Toast {...(toast || {})} />

      {particles.map((p) => <div key={p.id} style={{ position:"fixed", bottom:"28%", left:`${p.x}%`, fontSize:20, animation:"floatUp 2s ease-out forwards", animationDelay:`${p.d}s`, pointerEvents:"none", zIndex:999 }}>{p.e}</div>)}

      {matchFlash && (
        <div style={{ position:"fixed", inset:0, background:"rgba(7,10,7,0.96)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", zIndex:100, gap:14 }}>
          <div style={{ animation:"bounceIn 0.6s ease" }}>
            <Avatar avatarId={matchFlash.avatarId} name={matchFlash.name} size={110} uploadUrl={matchFlash.avatarUrl} />
          </div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:32, color:C.greenL, textAlign:"center", marginTop:8 }}>It's a Match! 🌿</div>
          <div style={{ color:C.muted, fontSize:15 }}>{matchFlash.name} wants to smoke with you</div>
          <div style={{ display:"flex", gap:12, marginTop:8 }}>
            <button style={{ ...BTN, width:150, padding:"14px" }} onClick={() => { setMatchFlash(null); setChatOpen(matchFlash); setTab("matches"); }}>Message 💬</button>
            <button style={{ ...BTNO, width:130, padding:"14px" }} onClick={() => setMatchFlash(null)}>Keep Swiping</button>
          </div>
        </div>
      )}

      {reportTarget && <ReportModal profile={reportTarget} auth={auth} onClose={() => setReportTarget(null)} setToast={setToast} />}

      <div style={{ width:"100%", maxWidth:430, minHeight:"100vh", display:"flex", flexDirection:"column" }}>
        {tab === "discover" && !chatOpen && (
          <div style={{ position:"fixed", top:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, padding:"16px 22px 10px", boxSizing:"border-box", background:`linear-gradient(to bottom,${C.bg} 75%,transparent)`, zIndex:30, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, color:C.greenL, letterSpacing:"-1px" }}>🌿 puff</span>
            <span style={{ background:"#1a3d1a", color:C.greenL, borderRadius:20, padding:"5px 14px", fontSize:12, fontWeight:600 }}>{filtered.length} nearby</span>
          </div>
        )}

        <div style={{ flex:1, overflowY:"auto" }}>
          {tab === "discover" && renderDiscover()}
          {tab === "matches" && renderMatches()}
          {tab === "filter" && renderFilter()}
          {tab === "profile" && renderProfile()}
        </div>

        {!chatOpen && (
          <nav style={{ display:"flex", justifyContent:"space-around", padding:"10px 0 20px", borderTop:`1px solid ${C.border}`, background:`${C.bg}dd`, backdropFilter:"blur(20px)", position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, zIndex:40 }}>
            {TABS.map((t) => (
              <button key={t.k} onClick={() => setTab(t.k)} style={{ background:"none", border:"none", display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"4px 12px", opacity:tab === t.k ? 1 : 0.3, transition:"opacity 0.2s" }}>
                <span style={{ fontSize:22 }}>{t.icon}</span>
                <span style={{ fontSize:10, fontWeight:600, letterSpacing:"0.3px", color:tab === t.k ? C.greenL : C.muted }}>{t.label}</span>
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
