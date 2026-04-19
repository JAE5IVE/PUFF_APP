import { useState, useRef, useCallback, useEffect } from "react";

// ─── SUPABASE ────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://rejdvxzjvihkcgoseztu.supabase.co";
const SUPABASE_KEY = "sb_publishable_1CSJLDFUW4ZgpPUEHmb_2w_QxLUumSV";

const sb = {
  h: { "Content-Type":"application/json", apikey:SUPABASE_KEY, Authorization:`Bearer ${SUPABASE_KEY}` },
  ah: (t) => ({ "Content-Type":"application/json", apikey:SUPABASE_KEY, Authorization:`Bearer ${t}` }),
  async signUp(email, password, name) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/signup`, { method:"POST", headers:this.h, body:JSON.stringify({ email, password, data:{ name } }) });
    return r.json();
  },
  async signIn(email, password) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, { method:"POST", headers:this.h, body:JSON.stringify({ email, password }) });
    return r.json();
  },
  async signOut(t) { await fetch(`${SUPABASE_URL}/auth/v1/logout`, { method:"POST", headers:this.ah(t) }); },
  async verifyEmailOTP(email, token) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/verify`, { method:"POST", headers:this.h, body:JSON.stringify({ email, token, type:"signup" }) });
    return r.json();
  },
  async resendOTP(email) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/resend`, { method:"POST", headers:this.h, body:JSON.stringify({ email, type:"signup" }) });
    return r.json();
  },
  async req(table, t, method, body, qs="", extra={}) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${qs}`, { method, headers:{ ...this.ah(t), ...extra }, body:body?JSON.stringify(body):undefined });
    try { return await r.json(); } catch { return null; }
  },
  sel: (table, t, qs="") => sb.req(table, t, "GET", null, `select=*${qs}`),
  ins: (table, t, d) => sb.req(table, t, "POST", d, "", { Prefer:"return=representation" }),
  upsert: (table, t, d) => sb.req(table, t, "POST", d, "", { Prefer:"return=representation,resolution=merge-duplicates" }),
};

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const ALL_STRAINS = [
  "Blue Dream","OG Kush","Sour Diesel","Wedding Cake","Girl Scout Cookies",
  "Purple Haze","Jack Herer","Gelato","Amnesia Haze","Northern Lights",
  "Runtz","Gorilla Glue","Pineapple Express","White Widow","AK-47",
  "Death Bubba","Pink Kush","God's Green Crack","Romulan","Jean Guy",
  "Shishkaberry","Nuken","Rockstar","BC Big Bud","Island Sweet Skunk",
  "Blueberry","Purple Kush","Trainwreck","Master Kush","Platinum OG",
];
const ALL_VIBES = ["Chill & Mellow","Deep Conversations","Music & Vibes","Outdoor Sessions","Gaming & Smoke","Creative Mode","Late Night Thinker","Social Butterfly","Solo Puffer","Spiritual Journey","Movie Nights","Fitness & Smoke"];
const SMOKE_STYLES = ["Joint","Blunt","Bong","Pipe","Vape","Dab Rig","Edibles","Spliff"];
const REPORT_REASONS = ["Inappropriate content","Harassment","Fake profile","Underage user","Other"];
const BOT_REPLIES = ["haha that's such a mood 😂","fr fr, pull up anytime 🌿","okayyyy I see you 👀","vibes only tonight 💨","yesss let's make it happen 🔥","roll one and tell me more 🍃","you're speaking my language rn ✨","no cap that's exactly my vibe 🤝","bro come through already 😤","lowkey facts tho 💯"];
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

// ─── THEME SYSTEM ─────────────────────────────────────────────────────────────
const DARK = {
  bg:"#070a07", surface:"#0f140f", surface2:"#141c14",
  border:"#1c2c1c", green:"#5da85d", greenL:"#a8e6a3",
  muted:"#4a6a4a", text:"#cce6cc", dim:"#7a9a7a",
  red:"#ff6060", redDim:"#5a1a1a",
  card:"#0f140f", inputBg:"#0c120c",
  navBg:"rgba(7,10,7,0.92)",
  headerBg:"rgba(7,10,7,0.85)",
  matchBg:"rgba(7,10,7,0.97)",
  shadow:"rgba(0,0,0,0.6)",
  toggleBg:"#1a3d1a",
};
const LIGHT = {
  bg:"#f4f8f4", surface:"#ffffff", surface2:"#f0f5f0",
  border:"#ddeedd", green:"#3d8a35", greenL:"#2d6b25",
  muted:"#7a9a7a", text:"#1a2e1a", dim:"#4a6a4a",
  red:"#cc3333", redDim:"#ffeeee",
  card:"#ffffff", inputBg:"#f8faf8",
  navBg:"rgba(244,248,244,0.95)",
  headerBg:"rgba(244,248,244,0.9)",
  matchBg:"rgba(244,248,244,0.98)",
  shadow:"rgba(0,0,0,0.12)",
  toggleBg:"#c8e6c8",
};

// ─── AVATAR ──────────────────────────────────────────────────────────────────
function Avatar({ avatarId, name="?", size=56, uploadUrl=null }) {
  const style = AVATAR_STYLES.find((a) => a.id === avatarId) || AVATAR_STYLES[0];
  const initials = (name||"?").split(" ").map((w)=>w[0]).join("").slice(0,2).toUpperCase();
  if (uploadUrl) return <div style={{ width:size, height:size, borderRadius:"50%", overflow:"hidden", flexShrink:0 }}><img src={uploadUrl} alt={name} style={{ width:"100%", height:"100%", objectFit:"cover" }} /></div>;
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:style.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 4px 20px rgba(0,0,0,0.3)" }}>
      <span style={{ fontSize:size*0.32 }}>{style.icon}</span>
      <span style={{ fontSize:size*0.18, color:"rgba(255,255,255,0.8)", fontFamily:"'Syne',sans-serif", fontWeight:700, marginTop:1 }}>{initials}</span>
    </div>
  );
}

const Spinner = () => <span style={{ width:16, height:16, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.8s linear infinite", display:"inline-block" }} />;

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
function GlobalStyles({ T }) {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
      *, *::before, *::after { box-sizing:border-box; -webkit-tap-highlight-color:transparent; margin:0; padding:0; }
      body { background:${T.bg}; transition:background 0.3s ease; }
      ::-webkit-scrollbar { width:0; }
      input:-webkit-autofill { -webkit-box-shadow:0 0 0 30px ${T.inputBg} inset !important; -webkit-text-fill-color:${T.text} !important; }
      @keyframes floatUp { 0%{opacity:1;transform:translateY(0)scale(1)} 100%{opacity:0;transform:translateY(-160px)scale(1.6)} }
      @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
      @keyframes bounceIn { 0%{transform:scale(0.4)} 60%{transform:scale(1.15)} 100%{transform:scale(1)} }
      @keyframes slideDown { from{opacity:0;transform:translateX(-50%) translateY(-16px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
      @keyframes slideUp { from{opacity:0;transform:translateY(100%)} to{opacity:1;transform:translateY(0)} }
      @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      @keyframes drift { from{transform:translateY(0)rotate(0deg)} to{transform:translateY(-24px)rotate(10deg)} }
      input[type=range] { -webkit-appearance:none; height:4px; border-radius:4px; background:${T.border}; cursor:pointer; }
      input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:20px; height:20px; border-radius:50%; background:linear-gradient(135deg,${T.green},${T.greenL}); cursor:pointer; }
      textarea { font-family:'DM Sans',sans-serif; }
      button:active { transform:scale(0.97); }
      select { font-family:'DM Sans',sans-serif; }
      input::placeholder, textarea::placeholder { color:transparent; }
      * { transition:background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease; }
      button, input, select, textarea { transition:none; }
    `}</style>
  );
}

// ─── THEME TOGGLE ─────────────────────────────────────────────────────────────
function ThemeToggle({ dark, onToggle, T }) {
  return (
    <button
      onClick={onToggle}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      style={{ width:46, height:26, borderRadius:13, border:`1.5px solid ${T.border}`, background:T.toggleBg, cursor:"pointer", position:"relative", flexShrink:0, display:"flex", alignItems:"center", padding:"2px 3px", justifyContent:dark?"flex-end":"flex-start", transition:"all 0.3s ease" }}
    >
      <div style={{ width:18, height:18, borderRadius:"50%", background:dark?"#1e3d1e":"#ffffff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, boxShadow:"0 1px 4px rgba(0,0,0,0.3)", transition:"all 0.3s ease" }}>
        {dark ? "🌙" : "☀️"}
      </div>
    </button>
  );
}

// ─── TOAST ───────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  if (!msg) return null;
  const bg = { error:"#5a1a1a", success:"#1a3d1a", info:"#1a2a3d" }[type] || "#1a2a3d";
  const icon = { error:"✕", success:"✓", info:"ℹ" }[type] || "ℹ";
  return (
    <div style={{ position:"fixed", top:24, left:"50%", transform:"translateX(-50%)", background:bg, color:"#fff", padding:"13px 20px", borderRadius:14, fontSize:14, zIndex:9999, maxWidth:340, textAlign:"center", boxShadow:"0 8px 40px rgba(0,0,0,0.5)", animation:"slideDown 0.3s ease", display:"flex", alignItems:"center", gap:10, border:"1px solid rgba(255,255,255,0.12)" }}>
      <span>{icon}</span><span>{msg}</span>
    </div>
  );
}

// ─── FAKE INPUT (no placeholder) ──────────────────────────────────────────────
function FakeInput({ label, value, onChange, type="text", T, multiline=false, min, max, ...rest }) {
  const INP = { background:T.inputBg, border:`1.5px solid ${T.border}`, borderRadius:13, padding:"13px 15px", color:T.text, fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none", width:"100%", boxSizing:"border-box" };
  return (
    <div style={{ position:"relative" }}>
      {multiline
        ? <textarea style={{ ...INP, resize:"none", height:90 }} value={value} onChange={onChange} {...rest} />
        : <input style={INP} type={type} value={value} onChange={onChange} min={min} max={max} {...rest} />
      }
      {!value && <div style={{ position:"absolute", top:multiline?"14px":"50%", left:15, transform:multiline?"none":"translateY(-50%)", color:T.muted, fontSize:14, pointerEvents:"none" }}>{label}</div>}
    </div>
  );
}

// ─── OTP BOXES ───────────────────────────────────────────────────────────────
function OTPBoxes({ value, onChange, onSubmit, T }) {
  return (
    <div style={{ display:"flex", gap:10, justifyContent:"center", marginBottom:28 }}>
      {[...Array(6)].map((_, i) => (
        <input
          key={i}
          id={`otp-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i]||""}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g,"");
            const arr = value.split("");
            arr[i] = v;
            const next = arr.join("").slice(0,6);
            onChange(next);
            if (v) document.getElementById(`otp-${i+1}`)?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key==="Backspace" && !value[i]) document.getElementById(`otp-${i-1}`)?.focus();
            if (e.key==="Enter" && value.length===6) onSubmit();
          }}
          style={{ width:46, height:56, textAlign:"center", fontSize:22, fontFamily:"'Syne',sans-serif", fontWeight:700, background:T.inputBg, border:`2px solid ${value[i]?T.green:T.border}`, borderRadius:12, color:T.text, outline:"none", transition:"border-color 0.2s" }}
        />
      ))}
    </div>
  );
}

// ─── SPLASH ──────────────────────────────────────────────────────────────────
function Splash({ onLogin, onSignup, dark, onToggle, T }) {
  return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
      {/* Ambient blobs */}
      {[...Array(5)].map((_,i) => (
        <div key={i} style={{ position:"fixed", width:200+i*100, height:200+i*100, borderRadius:"50%", background:`radial-gradient(circle, rgba(61,107,53,${dark?0.04:0.06}) 0%, transparent 70%)`, top:`${10+i*14}%`, left:`${4+i*18}%`, pointerEvents:"none" }}/>
      ))}
      {/* Theme toggle top right */}
      <div style={{ position:"fixed", top:20, right:20, zIndex:10 }}>
        <ThemeToggle dark={dark} onToggle={onToggle} T={T}/>
      </div>
      <div style={{ textAlign:"center", animation:"fadeUp 0.8s ease both", zIndex:1 }}>
        <div style={{ width:110, height:110, borderRadius:"50%", background:"linear-gradient(135deg,#1a3d1a,#3d6b35)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", boxShadow:`0 0 60px rgba(93,168,93,${dark?0.25:0.2})`, fontSize:54 }}>🌿</div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:56, color:T.greenL, letterSpacing:"-3px", lineHeight:1 }}>puff</div>
        <div style={{ color:T.muted, fontSize:15, marginTop:8, marginBottom:48 }}>find your smoke circle</div>
        <div style={{ display:"flex", flexDirection:"column", gap:12, width:300, margin:"0 auto" }}>
          <button style={{ background:"linear-gradient(135deg,#3d6b35,#4d8a44)", border:"none", borderRadius:13, padding:"15px", color:"#c8f5c8", fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, cursor:"pointer", width:"100%" }} onClick={onSignup}>Create Account 🌿</button>
          <button style={{ background:"transparent", border:`1.5px solid ${T.green}`, borderRadius:13, padding:"15px", color:T.greenL, fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, cursor:"pointer", width:"100%" }} onClick={onLogin}>Log In →</button>
        </div>
        <p style={{ color:T.muted, fontSize:11, marginTop:24, maxWidth:260, lineHeight:1.7, margin:"24px auto 0" }}>18+ only · Use responsibly · Legal jurisdictions only</p>
      </div>
    </div>
  );
}

// ─── AGE GATE ────────────────────────────────────────────────────────────────
function AgeGate({ onPass, onFail, T }) {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const days = Array.from({length:31},(_,i)=>i+1);
  const years = Array.from({length:82},(_,i)=>new Date().getFullYear()-18-i);
  const check = () => {
    if (!day||!month||!year) return;
    const age = Math.floor((Date.now()-new Date(`${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`))/(365.25*24*3600*1000));
    age>=18?onPass():onFail();
  };
  const selStyle = { background:T.inputBg, border:`1.5px solid ${T.border}`, borderRadius:13, padding:"13px 12px", color:T.text, fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none", width:"100%", boxSizing:"border-box", appearance:"none", backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%234a6a4a' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat:"no-repeat", backgroundPosition:"right 12px center" };
  const LBL = { fontSize:11, color:T.muted, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.7px", fontWeight:700, display:"block" };
  return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 24px" }}>
      <div style={{ width:"100%", maxWidth:380, animation:"fadeUp 0.5s ease both" }}>
        <div style={{ width:72, height:72, borderRadius:"50%", background:"linear-gradient(135deg,#1a2a1a,#2d4a2d)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:32 }}>🔒</div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:28, color:T.greenL, textAlign:"center", marginBottom:8 }}>Age Verification</div>
        <p style={{ color:T.muted, fontSize:14, textAlign:"center", marginBottom:32, lineHeight:1.6 }}>You must be 18 or older to join Puff.</p>
        <label style={LBL}>Date of Birth</label>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr 1fr", gap:10, marginBottom:28 }}>
          {[
            { val:day, set:setDay, label:"Day", opts:days.map(d=>({v:d,l:d})) },
            { val:month, set:setMonth, label:"Month", opts:months.map((m,i)=>({v:i+1,l:m})) },
            { val:year, set:setYear, label:"Year", opts:years.map(y=>({v:y,l:y})) },
          ].map(({ val, set, label, opts }) => (
            <div key={label} style={{ position:"relative" }}>
              <select style={selStyle} value={val} onChange={(e)=>set(e.target.value)}>
                <option value="" disabled hidden></option>
                {opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
              {!val && <div style={{ position:"absolute", top:"50%", left:14, transform:"translateY(-50%)", color:T.muted, fontSize:13, pointerEvents:"none" }}>{label}</div>}
            </div>
          ))}
        </div>
        <button style={{ background:"linear-gradient(135deg,#3d6b35,#4d8a44)", border:"none", borderRadius:13, padding:"15px", color:"#c8f5c8", fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, cursor:"pointer", width:"100%", opacity:day&&month&&year?1:0.4 }} onClick={check} disabled={!day||!month||!year}>Continue →</button>
      </div>
    </div>
  );
}

// ─── LOGIN ───────────────────────────────────────────────────────────────────
function Login({ onBack, onDone, setToast, dark, onToggle, T }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const BTN = { background:"linear-gradient(135deg,#3d6b35,#4d8a44)", border:"none", borderRadius:13, padding:"15px", color:"#c8f5c8", fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, cursor:"pointer", width:"100%" };
  const BTNO = { ...BTN, background:"transparent", border:`1.5px solid ${T.green}`, color:T.greenL };
  const LBL = { fontSize:11, color:T.muted, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.7px", fontWeight:700, display:"block" };
  const submit = async () => {
    if (!email||!pass) return setToast({msg:"Fill all fields",type:"error"});
    setLoading(true);
    try {
      const res = await sb.signIn(email, pass);
      if (res.error||res.error_description) { setToast({msg:res.error_description||res.error?.message||"Invalid credentials",type:"error"}); }
      else { onDone({token:res.access_token,user:res.user,name:res.user?.user_metadata?.name}); }
    } catch { setToast({msg:"Network error",type:"error"}); }
    setLoading(false);
  };
  return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 24px" }}>
      <div style={{ position:"fixed", top:20, right:20 }}><ThemeToggle dark={dark} onToggle={onToggle} T={T}/></div>
      <div style={{ width:"100%", maxWidth:380, animation:"fadeUp 0.5s ease both" }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:T.muted, fontSize:22, marginBottom:32, padding:0, cursor:"pointer" }}>←</button>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:32, color:T.greenL, marginBottom:6 }}>Welcome back 🌿</div>
        <p style={{ color:T.muted, fontSize:14, marginBottom:32 }}>Sign in to your account</p>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div><label style={LBL}>Email</label><FakeInput label="Email address" value={email} onChange={e=>setEmail(e.target.value)} type="email" T={T} onKeyDown={e=>e.key==="Enter"&&submit()}/></div>
          <div>
            <label style={LBL}>Password</label>
            <div style={{ position:"relative" }}>
              <FakeInput label="Password" value={pass} onChange={e=>setPass(e.target.value)} type={showPass?"text":"password"} T={T} onKeyDown={e=>e.key==="Enter"&&submit()}/>
              <button onClick={()=>setShowPass(!showPass)} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:T.muted, fontSize:16, padding:4, cursor:"pointer" }}>{showPass?"🙈":"👁️"}</button>
            </div>
          </div>
          <button style={{ ...BTN, marginTop:8, opacity:loading?0.6:1 }} onClick={submit} disabled={loading}>
            {loading?<span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}><Spinner/>Signing in...</span>:"Log In →"}
          </button>
          <button style={BTNO} onClick={onBack}>No account? Sign up</button>
        </div>
      </div>
    </div>
  );
}

// ─── SIGNUP ──────────────────────────────────────────────────────────────────
function Signup({ onBack, onDone, setToast, dark, onToggle, T }) {
  const [step, setStep] = useState("form"); // form | otp
  const [f, setF] = useState({name:"",email:"",password:""});
  const [showPass, setShowPass] = useState(false);
  const [otp, setOtp] = useState("");
  const [authData, setAuthData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef(null);
  const BTN = { background:"linear-gradient(135deg,#3d6b35,#4d8a44)", border:"none", borderRadius:13, padding:"15px", color:"#c8f5c8", fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, cursor:"pointer", width:"100%" };
  const BTNO = { ...BTN, background:"transparent", border:`1.5px solid ${T.green}`, color:T.greenL };
  const LBL = { fontSize:11, color:T.muted, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.7px", fontWeight:700, display:"block" };

  const startCountdown = (s=60) => {
    setCountdown(s);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(()=>{
      setCountdown(c=>{ if(c<=1){clearInterval(timerRef.current);return 0;} return c-1; });
    },1000);
  };

  const submitForm = async () => {
    if (!f.name||!f.email||!f.password) return setToast({msg:"Fill all fields",type:"error"});
    if (f.password.length<6) return setToast({msg:"Password needs 6+ characters",type:"error"});
    setLoading(true);
    try {
      const res = await sb.signUp(f.email, f.password, f.name);
      if (res.error||res.error_description) {
        setToast({msg:res.error_description||res.error?.message||"Signup failed",type:"error"});
      } else {
        setAuthData(res);
        startCountdown();
        setStep("otp");
        setToast({msg:"Check your email for a 6-digit code",type:"success"});
      }
    } catch { setToast({msg:"Network error",type:"error"}); }
    setLoading(false);
  };

  const verifyOTP = async () => {
    if (otp.length<6) return setToast({msg:"Enter the full 6-digit code",type:"error"});
    setLoading(true);
    try {
      const res = await sb.verifyEmailOTP(f.email, otp);
      if (res.error) {
        setToast({msg:res.error.message||"Incorrect code — try again",type:"error"});
      } else {
        const token = res.access_token || authData?.access_token;
        const user = res.user || authData?.user;
        onDone({token, user, name:f.name});
      }
    } catch { setToast({msg:"Verification failed",type:"error"}); }
    setLoading(false);
  };

  const resend = async () => {
    setLoading(true);
    try {
      await sb.resendOTP(f.email);
      startCountdown();
      setToast({msg:"New code sent to your email",type:"success"});
    } catch { setToast({msg:"Failed to resend",type:"error"}); }
    setLoading(false);
  };

  if (step==="otp") return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 24px" }}>
      <div style={{ position:"fixed", top:20, right:20 }}><ThemeToggle dark={dark} onToggle={onToggle} T={T}/></div>
      <div style={{ width:"100%", maxWidth:380, animation:"fadeUp 0.5s ease both" }}>
        <div style={{ width:80, height:80, borderRadius:"50%", background:"linear-gradient(135deg,#1a2a3a,#2d4a6a)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:36 }}>📧</div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, color:T.greenL, textAlign:"center", marginBottom:8 }}>Check your email</div>
        <p style={{ color:T.muted, fontSize:14, textAlign:"center", marginBottom:4, lineHeight:1.6 }}>We sent a 6-digit code to</p>
        <p style={{ color:T.text, fontSize:16, textAlign:"center", fontWeight:700, marginBottom:32 }}>{f.email}</p>
        <OTPBoxes value={otp} onChange={setOtp} onSubmit={verifyOTP} T={T}/>
        <button style={{ ...BTN, opacity:loading||otp.length<6?0.5:1 }} onClick={verifyOTP} disabled={loading||otp.length<6}>
          {loading?<span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}><Spinner/>Verifying...</span>:"Verify & Continue →"}
        </button>
        <div style={{ textAlign:"center", marginTop:18 }}>
          {countdown>0
            ? <p style={{ color:T.muted, fontSize:13 }}>Resend code in {countdown}s</p>
            : <button onClick={resend} style={{ background:"none", border:"none", color:T.muted, fontSize:13, textDecoration:"underline", cursor:"pointer" }}>Resend code</button>
          }
        </div>
        <div style={{ textAlign:"center", marginTop:12 }}>
          <button onClick={()=>setStep("form")} style={{ background:"none", border:"none", color:T.muted, fontSize:13, cursor:"pointer" }}>← Change email</button>
        </div>
        <div style={{ marginTop:24, padding:"14px 16px", borderRadius:14, background:T.surface2, border:`1px solid ${T.border}` }}>
          <p style={{ color:T.muted, fontSize:12, lineHeight:1.7 }}>
            💡 <strong style={{ color:T.text }}>Can't find it?</strong> Check your spam folder. Make sure you updated the email template in Supabase with the OTP format.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 24px" }}>
      <div style={{ position:"fixed", top:20, right:20 }}><ThemeToggle dark={dark} onToggle={onToggle} T={T}/></div>
      <div style={{ width:"100%", maxWidth:380, animation:"fadeUp 0.5s ease both" }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:T.muted, fontSize:22, marginBottom:32, padding:0, cursor:"pointer" }}>←</button>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:32, color:T.greenL, marginBottom:6 }}>Join Puff 🌿</div>
        <p style={{ color:T.muted, fontSize:14, marginBottom:32 }}>Create your smoke profile</p>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div><label style={LBL}>Full Name</label><FakeInput label="Your full name" value={f.name} onChange={e=>setF(v=>({...v,name:e.target.value}))} T={T}/></div>
          <div><label style={LBL}>Email</label><FakeInput label="Email address" value={f.email} onChange={e=>setF(v=>({...v,email:e.target.value}))} type="email" T={T}/></div>
          <div>
            <label style={LBL}>Password</label>
            <div style={{ position:"relative" }}>
              <FakeInput label="Password (min 6 characters)" value={f.password} onChange={e=>setF(v=>({...v,password:e.target.value}))} type={showPass?"text":"password"} T={T}/>
              <button onClick={()=>setShowPass(!showPass)} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:T.muted, fontSize:16, padding:4, cursor:"pointer" }}>{showPass?"🙈":"👁️"}</button>
            </div>
          </div>
          <button style={{ ...BTN, marginTop:8, opacity:loading?0.6:1 }} onClick={submitForm} disabled={loading}>
            {loading?<span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}><Spinner/>Creating account...</span>:"Continue →"}
          </button>
          <button style={BTNO} onClick={onBack}>Already have an account? Log in</button>
        </div>
      </div>
    </div>
  );
}

// ─── PROFILE SETUP ───────────────────────────────────────────────────────────
function ProfileSetup({ auth, onDone, setToast, T }) {
  const [step, setStep] = useState(0);
  const [d, setD] = useState({avatar:"a1",avatarUrl:null,age:"",bio:"",gender:"",vibes:[],styles:[],strains:[]});
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);
  const LBL = { fontSize:11, color:T.muted, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.7px", fontWeight:700, display:"block" };
  const BTN = { background:"linear-gradient(135deg,#3d6b35,#4d8a44)", border:"none", borderRadius:13, padding:"15px", color:"#c8f5c8", fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, cursor:"pointer", width:"100%" };
  const BTNO = { ...BTN, background:"transparent", border:`1.5px solid ${T.green}`, color:T.greenL };
  const chipStyle = (on) => ({ display:"inline-flex", alignItems:"center", padding:"8px 14px", borderRadius:20, fontSize:12, fontWeight:600, cursor:"pointer", border:`1.5px solid ${on?"#5da85d":T.border}`, background:on?"#1e3d1e":T.surface, color:on?"#a8e6a3":T.muted, transition:"all 0.18s", userSelect:"none" });

  const tog = (key, val, max=99) => {
    setD(p=>{
      const arr=p[key];
      if (arr.includes(val)) return {...p,[key]:arr.filter(x=>x!==val)};
      if (arr.length>=max) { setToast({msg:`Max ${max} selections`,type:"info"}); return p; }
      return {...p,[key]:[...arr,val]};
    });
  };

  const save = async () => {
    if (!d.age||parseInt(d.age)<18) return setToast({msg:"Must be 18+ to use Puff",type:"error"});
    if (!d.gender) return setToast({msg:"Please select your gender",type:"error"});
    setSaving(true);
    try {
      if (auth?.token && auth?.user?.id) {
        const payload = { id:auth.user.id, name:auth.name||auth.user?.user_metadata?.name||"Puffer", age:parseInt(d.age), bio:d.bio||"", avatar:d.avatar, vibe:d.vibes.join(", "), styles:d.styles, strains:d.strains, gender:d.gender };
        const result = await sb.upsert("profiles", auth.token, payload);
        if (result && !Array.isArray(result) && result.code && result.message) {
          setToast({msg:result.message||"Database error",type:"error"});
          setSaving(false);
          return;
        }
      }
      onDone(d);
    } catch(e) {
      setToast({msg:"Failed to save profile",type:"error"});
    }
    setSaving(false);
  };

  const steps = [
    {
      title:"What's your gender?", sub:"Helps us personalise your experience",
      body:(
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {[{val:"male",icon:"♂️",label:"Man"},{val:"female",icon:"♀️",label:"Woman"},{val:"nonbinary",icon:"⚧️",label:"Non-binary"},{val:"other",icon:"✨",label:"Prefer not to say"}].map(({val,icon,label})=>(
            <div key={val} onClick={()=>setD(p=>({...p,gender:val}))} style={{ display:"flex", alignItems:"center", gap:14, padding:"16px 18px", borderRadius:16, border:`1.5px solid ${d.gender===val?"#5da85d":T.border}`, background:d.gender===val?"#1e3d1e":T.surface, cursor:"pointer", transition:"all 0.2s" }}>
              <span style={{ fontSize:22 }}>{icon}</span>
              <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:600, fontSize:16, color:d.gender===val?"#a8e6a3":T.text }}>{label}</span>
              {d.gender===val&&<span style={{ marginLeft:"auto", color:"#5da85d", fontSize:18 }}>✓</span>}
            </div>
          ))}
        </div>
      )
    },
    {
      title:"About you", sub:"Tell people who's behind the smoke",
      body:(
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div><label style={LBL}>Age</label><FakeInput label="Your age (18+)" value={d.age} onChange={e=>setD(p=>({...p,age:e.target.value}))} type="number" min={18} max={100} T={T}/></div>
          <div><label style={LBL}>Bio</label><FakeInput label="Describe your vibe..." value={d.bio} onChange={e=>setD(p=>({...p,bio:e.target.value}))} T={T} multiline/></div>
        </div>
      )
    },
    {
      title:"Pick your avatar", sub:"Choose a style or upload a photo",
      body:(
        <div>
          <div onClick={()=>fileRef.current?.click()} style={{ display:"flex", alignItems:"center", gap:14, padding:"16px 18px", borderRadius:16, border:`1.5px dashed ${d.avatarUrl?"#5da85d":T.border}`, background:d.avatarUrl?"#1e3d1e":"transparent", cursor:"pointer", marginBottom:20 }}>
            {d.avatarUrl?<img src={d.avatarUrl} alt="preview" style={{ width:44, height:44, borderRadius:"50%", objectFit:"cover" }}/>:<div style={{ width:44, height:44, borderRadius:"50%", background:"#1a2a1a", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>📷</div>}
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:600, fontSize:14, color:d.avatarUrl?"#a8e6a3":T.text }}>{d.avatarUrl?"Photo uploaded ✓":"Upload a photo"}</div>
              <div style={{ fontSize:12, color:T.muted, marginTop:2 }}>{d.avatarUrl?"Tap to change":"JPG or PNG, max 3MB"}</div>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e=>{ const f=e.target.files[0]; if(!f) return; if(f.size>3*1024*1024) return setToast({msg:"Max 3MB",type:"error"}); setD(p=>({...p,avatarUrl:URL.createObjectURL(f)})); }}/>
          {!d.avatarUrl&&(
            <>
              <div style={{ fontSize:12, color:T.muted, marginBottom:14, textAlign:"center" }}>— or choose an avatar style —</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
                {AVATAR_STYLES.map(a=>(
                  <div key={a.id} onClick={()=>setD(p=>({...p,avatar:a.id}))} style={{ aspectRatio:"1", borderRadius:16, background:a.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:"pointer", border:`2px solid ${d.avatar===a.id?"#5da85d":"transparent"}`, boxShadow:d.avatar===a.id?"0 0 20px rgba(93,168,93,0.4)":"none", position:"relative" }}>
                    <span style={{ fontSize:24 }}>{a.icon}</span>
                    <span style={{ fontSize:10, color:"rgba(255,255,255,0.6)", marginTop:4 }}>{a.label}</span>
                    {d.avatar===a.id&&<div style={{ position:"absolute", top:6, right:6, width:16, height:16, borderRadius:"50%", background:"#5da85d", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"#fff" }}>✓</div>}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )
    },
    {
      title:"Your session vibes", sub:"Pick up to 3",
      body:(
        <div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {ALL_VIBES.map(v=>{const on=d.vibes.includes(v);return <span key={v} style={{...chipStyle(on),opacity:!on&&d.vibes.length>=3?0.35:1}} onClick={()=>tog("vibes",v,3)}>{v}</span>;})}
          </div>
          {d.vibes.length>0&&<div style={{ marginTop:14, padding:"10px 14px", borderRadius:12, background:"#1e3d1e", border:"1px solid #1c2c1c", fontSize:12, color:"#a8e6a3" }}>{d.vibes.length}/3 selected · {3-d.vibes.length} remaining</div>}
        </div>
      )
    },
    {
      title:"Smoke method", sub:"How do you consume?",
      body:<div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>{SMOKE_STYLES.map(s=><span key={s} style={chipStyle(d.styles.includes(s))} onClick={()=>tog("styles",s)}>🔥 {s}</span>)}</div>
    },
    {
      title:"Favourite strains", sub:"🌿 Classic · 🍁 Canadian",
      body:<div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>{ALL_STRAINS.map((s,i)=><span key={s} style={chipStyle(d.strains.includes(s))} onClick={()=>tog("strains",s)}>{i>=15?"🍁":"🌿"} {s}</span>)}</div>
    },
  ];

  const cur = steps[step];
  return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", flexDirection:"column", alignItems:"center" }}>
      <div style={{ width:"100%", maxWidth:430, padding:"36px 24px 100px", boxSizing:"border-box" }}>
        <div style={{ display:"flex", gap:6, marginBottom:28 }}>
          {steps.map((_,i)=><div key={i} style={{ flex:1, height:3, borderRadius:3, background:i<=step?"#5da85d":T.border, transition:"background 0.4s" }}/>)}
        </div>
        <p style={{ color:T.muted, fontSize:11, marginBottom:16, textTransform:"uppercase", letterSpacing:"0.6px", fontWeight:700 }}>Step {step+1} of {steps.length}</p>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, color:T.greenL, marginBottom:5 }}>{cur.title}</div>
        <p style={{ color:T.muted, fontSize:14, marginBottom:24 }}>{cur.sub}</p>
        <div key={step} style={{ animation:"fadeUp 0.3s ease both" }}>{cur.body}</div>
        <div style={{ display:"flex", gap:10, marginTop:32 }}>
          {step>0&&<button style={{...BTNO,flex:1,padding:"14px"}} onClick={()=>setStep(s=>s-1)}>← Back</button>}
          <button style={{ ...BTN, flex:2, opacity:saving?0.6:1 }} onClick={()=>step<steps.length-1?setStep(s=>s+1):save()} disabled={saving}>
            {step===steps.length-1?(saving?<span style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:10 }}><Spinner/>Saving...</span>:"Let's Puff 🌿"):"Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── REPORT MODAL ────────────────────────────────────────────────────────────
function ReportModal({ profile, auth, onClose, setToast, T }) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);
  const submit = async () => {
    if (!reason) return setToast({msg:"Select a reason",type:"error"});
    setSending(true);
    try {
      if (auth) await sb.ins("reports", auth.token, {reporter_id:auth.user.id,reported_id:profile.id,reason,details});
      setToast({msg:"Report submitted",type:"success"});
      onClose();
    } catch { setToast({msg:"Failed",type:"error"}); }
    setSending(false);
  };
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:150, backdropFilter:"blur(4px)" }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ width:"100%", maxWidth:430, background:T.surface, borderRadius:"24px 24px 0 0", padding:"28px 22px 40px", border:`1px solid ${T.border}`, animation:"slideUp 0.3s ease" }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:"#ff8080", marginBottom:6 }}>Report {profile.name}</div>
        <p style={{ color:T.muted, fontSize:13, marginBottom:18 }}>Reports are anonymous and reviewed within 24h.</p>
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:14 }}>
          {REPORT_REASONS.map(r=>(
            <div key={r} onClick={()=>setReason(r)} style={{ padding:"13px 16px", borderRadius:14, border:`1.5px solid ${reason===r?"#5da85d":T.border}`, background:reason===r?"#1e3d1e":T.surface2, color:reason===r?"#a8e6a3":T.text, cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              {r} {reason===r&&<span style={{ color:"#5da85d" }}>✓</span>}
            </div>
          ))}
        </div>
        <div style={{ position:"relative", marginBottom:14 }}>
          <textarea style={{ background:T.inputBg, border:`1.5px solid ${T.border}`, borderRadius:13, padding:"13px 15px", color:T.text, fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none", width:"100%", resize:"none", height:70 }} value={details} onChange={e=>setDetails(e.target.value)}/>
          {!details&&<div style={{ position:"absolute", top:14, left:15, color:T.muted, fontSize:13, pointerEvents:"none" }}>Additional details (optional)</div>}
        </div>
        <button style={{ background:"linear-gradient(135deg,#5a1a1a,#8a2a2a)", border:"none", borderRadius:13, padding:"14px", color:"#ffaaaa", fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, cursor:"pointer", width:"100%", marginBottom:10, opacity:sending?0.6:1 }} onClick={submit} disabled={sending}>{sending?"Submitting...":"Submit Report"}</button>
        <button style={{ background:"transparent", border:`1.5px solid ${T.border}`, borderRadius:13, padding:"14px", color:T.muted, fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, cursor:"pointer", width:"100%" }} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function PuffApp() {
  const [dark, setDark] = useState(true);
  const T = dark ? DARK : LIGHT;
  const [screen, setScreen] = useState("splash");
  const [auth, setAuth] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [tab, setTab] = useState("discover");
  const [toast, setToastState] = useState(null);
  const toastTimer = useRef(null);
  const setToast = useCallback(({msg,type})=>{ setToastState({msg,type}); clearTimeout(toastTimer.current); toastTimer.current=setTimeout(()=>setToastState(null),3500); },[]);

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
  const [filters, setFilters] = useState({maxDist:20,vibes:[],styles:[],strains:[]});
  const dragX = useRef(null);
  const msgEnd = useRef(null);

  useEffect(()=>{msgEnd.current?.scrollIntoView({behavior:"smooth"});},[threads,chatOpen]);

  const BTN = { background:"linear-gradient(135deg,#3d6b35,#4d8a44)", border:"none", borderRadius:13, padding:"15px", color:"#c8f5c8", fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, cursor:"pointer", width:"100%" };
  const BTNO = { ...BTN, background:"transparent", border:`1.5px solid ${T.green}`, color:T.greenL };
  const chipStyle = (on) => ({ display:"inline-flex", alignItems:"center", padding:"8px 14px", borderRadius:20, fontSize:12, fontWeight:600, cursor:"pointer", border:`1.5px solid ${on?"#5da85d":T.border}`, background:on?"#1e3d1e":T.surface, color:on?"#a8e6a3":T.muted, transition:"all 0.18s", userSelect:"none" });
  const togF = (key,val) => setFilters(f=>({...f,[key]:f[key].includes(val)?f[key].filter(x=>x!==val):[...f[key],val]}));

  const filtered = deck.filter(p=>{
    if (blocked.has(p.id)) return false;
    if (p.distance>filters.maxDist) return false;
    const pV = Array.isArray(p.vibe)?p.vibe:(p.vibe||"").split(", ").filter(Boolean);
    if (filters.vibes.length&&!filters.vibes.some(v=>pV.includes(v))) return false;
    if (filters.styles.length&&!p.styles.some(s=>filters.styles.includes(s))) return false;
    if (filters.strains.length&&!p.strains.some(s=>filters.strains.includes(s))) return false;
    return true;
  });

  const spawnParticles = () => {
    const em=["💨","🌿","🍃","✨","🔥","😌","💫","🍁"];
    setParticles(Array.from({length:14},(_,i)=>({id:Date.now()+i,x:Math.random()*85+5,e:getRand(em),d:Math.random()*0.7})));
    setTimeout(()=>setParticles([]),2400);
  };

  const swipe = async dir => {
    if (!filtered.length) return;
    const cur = filtered[0];
    setSwipeDir(dir);
    setTimeout(async()=>{
      setSwipeDir(null);
      setDeck(d=>d.filter(p=>p.id!==cur.id));
      if (auth&&!String(cur.id).startsWith("d")) { try { await sb.ins("swipes",auth.token,{swiper_id:auth.user.id,swiped_id:cur.id,direction:dir}); } catch {} }
      if (dir==="right") {
        const mid=`local_${cur.id}_${Date.now()}`;
        setMatches(m=>[{...cur,matchId:mid},...m]);
        setThreads(t=>({...t,[mid]:[]}));
        setMatchFlash({...cur,matchId:mid});
        spawnParticles();
        setTimeout(()=>setMatchFlash(null),3000);
      }
    },420);
  };

  const sendMsg = () => {
    if (!chatTxt.trim()||!chatOpen) return;
    const content=chatTxt.trim(), mid=chatOpen.matchId;
    const um={id:Date.now(),sender_id:auth?.user?.id||"me",content,created_at:new Date().toISOString()};
    setThreads(t=>({...t,[mid]:[...(t[mid]||[]),um]}));
    setChatTxt("");
    if (auth&&!String(mid).startsWith("local")) { sb.ins("messages",auth.token,{match_id:mid,sender_id:auth.user.id,content}).catch(()=>{}); }
    if (String(mid).startsWith("local")) {
      setTimeout(()=>{
        const bm={id:Date.now()+1,sender_id:chatOpen.id,content:getRand(BOT_REPLIES),created_at:new Date().toISOString()};
        setThreads(t=>({...t,[mid]:[...(t[mid]||[]),bm]}));
      },800+Math.random()*1400);
    }
  };

  const blockUser = async id => {
    setBlocked(b=>new Set([...b,id]));
    if (auth) { try { await sb.ins("blocks",auth.token,{blocker_id:auth.user.id,blocked_id:id}); } catch {} }
    setToast({msg:"User blocked",type:"success"});
    if (chatOpen?.id===id) setChatOpen(null);
  };

  const top=filtered[0], nxt=filtered[1];
  const getVibes = v => Array.isArray(v)?v:(v||"").split(", ").filter(Boolean);
  const toggleTheme = () => setDark(d=>!d);

  // ── ROUTING ──
  const sharedProps = { dark, onToggle:toggleTheme, T };
  if (screen==="splash") return <><GlobalStyles T={T}/><Toast {...(toast||{})}/><Splash onLogin={()=>setScreen("login")} onSignup={()=>setScreen("age_s")} {...sharedProps}/></>;
  if (screen==="login") return <><GlobalStyles T={T}/><Toast {...(toast||{})}/><Login onBack={()=>setScreen("splash")} setToast={setToast} onDone={d=>{setAuth(d);setScreen("app");}} {...sharedProps}/></>;
  if (screen==="age_s") return <><GlobalStyles T={T}/><Toast {...(toast||{})}/><AgeGate onPass={()=>setScreen("signup")} onFail={()=>{setToast({msg:"Must be 18+ to use Puff",type:"error"});setScreen("splash");}} T={T}/></>;
  if (screen==="signup") return <><GlobalStyles T={T}/><Toast {...(toast||{})}/><Signup onBack={()=>setScreen("splash")} setToast={setToast} onDone={d=>{setAuth(d);setScreen("setup");}} {...sharedProps}/></>;
  if (screen==="setup") return <><GlobalStyles T={T}/><Toast {...(toast||{})}/><ProfileSetup auth={auth} setToast={setToast} onDone={p=>{setUserProfile(p);setScreen("app");}} T={T}/></>;

  // ── APP TABS ──
  const renderDiscover = () => (
    <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", paddingTop:76, paddingBottom:110 }}>
      <div style={{ position:"relative", width:"88%", maxWidth:380, height:500 }}>
        {filtered.length===0 ? (
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center" }}>
            <div style={{ fontSize:60, marginBottom:14 }}>🌬️</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, color:T.greenL, marginBottom:8 }}>That's everyone nearby</div>
            <div style={{ fontSize:13, color:T.muted, marginBottom:20 }}>Try adjusting your filters</div>
            <button style={{ ...BTN, width:"auto", padding:"12px 28px" }} onClick={()=>setTab("filter")}>Open Filters ⚙️</button>
          </div>
        ):(
          <>
            {nxt&&<div style={{ position:"absolute", inset:0, borderRadius:28, background:`linear-gradient(160deg,${nxt.bg||"#0d2a0d"} 0%,#0f1a0f 100%)`, transform:"scale(0.93) translateY(18px)", opacity:0.45, display:"flex", alignItems:"center", justifyContent:"center" }}><Avatar avatarId={nxt.avatarId} name={nxt.name} size={90} uploadUrl={nxt.avatarUrl}/></div>}
            <div
              style={{ position:"absolute", inset:0, borderRadius:28, overflow:"hidden", cursor:"grab", background:`linear-gradient(160deg,${top.bg||"#0d2a0d"} 0%,#0f1a0f 100%)`, boxShadow:`0 32px 80px ${T.shadow}`, transform:swipeDir==="left"?"translateX(-130%) rotate(-18deg)":swipeDir==="right"?"translateX(130%) rotate(18deg)":"none", transition:swipeDir?"transform 0.42s cubic-bezier(.4,0,.2,1)":"none", userSelect:"none" }}
              onMouseDown={e=>{dragX.current=e.clientX;}}
              onMouseUp={e=>{if(dragX.current===null)return;const d=e.clientX-dragX.current;if(Math.abs(d)>65)swipe(d>0?"right":"left");dragX.current=null;}}
              onTouchStart={e=>{dragX.current=e.touches[0].clientX;}}
              onTouchEnd={e=>{if(dragX.current===null)return;const d=e.changedTouches[0].clientX-dragX.current;if(Math.abs(d)>65)swipe(d>0?"right":"left");dragX.current=null;}}
            >
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.92) 0%,rgba(0,0,0,0.08) 50%,transparent 100%)" }}/>
              <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-80%)" }}><Avatar avatarId={top.avatarId} name={top.name} size={110} uploadUrl={top.avatarUrl}/></div>
              <button onClick={e=>{e.stopPropagation();setReportTarget(top);}} style={{ position:"absolute", top:16, right:16, background:"rgba(0,0,0,0.4)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"6px 12px", color:"rgba(255,255,255,0.4)", fontSize:12, backdropFilter:"blur(4px)", cursor:"pointer" }}>⚠️</button>
              {swipeDir==="left"&&<div style={{ position:"absolute", top:28, left:22, fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:24, color:T.red, border:`3px solid ${T.red}`, borderRadius:10, padding:"4px 12px", transform:"rotate(-15deg)", background:"rgba(255,96,96,0.08)" }}>PASS</div>}
              {swipeDir==="right"&&<div style={{ position:"absolute", top:28, right:22, fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:24, color:top.accent||T.greenL, border:`3px solid ${top.accent||T.greenL}`, borderRadius:10, padding:"4px 12px", transform:"rotate(15deg)", background:"rgba(93,168,93,0.08)" }}>PUFF 🌿</div>}
              <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"24px 22px 28px" }}>
                <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:4 }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:28, color:"#fff" }}>{top.name}</div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:600, fontSize:20, color:"rgba(255,255,255,0.55)" }}>{top.age}</div>
                </div>
                <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginBottom:10 }}>📍 ~{top.distance}km away</div>
                <div style={{ fontSize:13, color:"rgba(255,255,255,0.8)", lineHeight:1.55, marginBottom:14 }}>{top.bio}</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {getVibes(top.vibe).slice(0,2).map(v=><span key={v} style={{ background:"rgba(255,255,255,0.1)", backdropFilter:"blur(6px)", borderRadius:20, padding:"4px 11px", fontSize:11, fontWeight:600, color:top.accent||T.greenL }}>{v}</span>)}
                  {(top.styles||[]).slice(0,2).map(s=><span key={s} style={{ background:"rgba(255,255,255,0.07)", borderRadius:20, padding:"4px 11px", fontSize:11, color:"rgba(255,255,255,0.5)" }}>🔥 {s}</span>)}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {filtered.length>0&&(
        <div style={{ display:"flex", gap:20, justifyContent:"center", marginTop:24, alignItems:"center" }}>
          <button onClick={()=>swipe("left")} style={{ width:62, height:62, borderRadius:"50%", border:`1px solid rgba(255,96,96,0.25)`, background:"rgba(255,96,96,0.08)", color:T.red, fontSize:22, cursor:"pointer" }}>✕</button>
          <button onClick={()=>setTab("filter")} style={{ width:46, height:46, borderRadius:"50%", border:`1px solid ${T.border}`, background:T.surface, color:T.muted, fontSize:16, cursor:"pointer" }}>⚙️</button>
          <button onClick={()=>swipe("right")} style={{ width:70, height:70, borderRadius:"50%", border:`1px solid rgba(93,168,93,0.2)`, background:"rgba(30,61,30,0.9)", color:"#a8e6a3", fontSize:28, boxShadow:"0 8px 32px rgba(61,107,53,0.3)", cursor:"pointer" }}>🌿</button>
        </div>
      )}
      <p style={{ fontSize:11, color:T.muted, marginTop:10, opacity:0.5 }}>Drag or tap · 🌿 match · ✕ pass</p>
    </div>
  );

  const renderMatches = () => {
    if (chatOpen) {
      const thread=threads[chatOpen.matchId]||[];
      return (
        <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:T.bg }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, padding:"52px 18px 14px", borderBottom:`1px solid ${T.border}`, background:T.bg, position:"sticky", top:0, zIndex:10 }}>
            <button onClick={()=>setChatOpen(null)} style={{ background:"none", border:"none", color:T.muted, fontSize:22, padding:0, cursor:"pointer" }}>←</button>
            <Avatar avatarId={chatOpen.avatarId} name={chatOpen.name} size={42} uploadUrl={chatOpen.avatarUrl}/>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, color:T.text }}>{chatOpen.name}{chatOpen.age?`, ${chatOpen.age}`:""}</div>
              <div style={{ fontSize:12, color:T.muted }}>{getVibes(chatOpen.vibe)[0]||""}</div>
            </div>
            <button onClick={()=>{if(window.confirm(`Block ${chatOpen.name}?`))blockUser(chatOpen.id);}} style={{ background:"none", border:"none", color:T.red, fontSize:12, padding:"4px 8px", cursor:"pointer" }}>Block</button>
            <button onClick={()=>setReportTarget(chatOpen)} style={{ background:"none", border:"none", color:T.muted, fontSize:12, padding:"4px 8px", cursor:"pointer" }}>Report</button>
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"16px 16px 90px", display:"flex", flexDirection:"column", gap:10 }}>
            {thread.length===0&&<div style={{ textAlign:"center", color:T.muted, padding:"50px 0" }}><div style={{ fontSize:44, marginBottom:10 }}>🌿</div><p style={{ fontSize:14 }}>Say hi — don't be shy 👋</p></div>}
            {thread.map((m,i)=>{
              const isMe=m.sender_id===(auth?.user?.id||"me");
              return (
                <div key={m.id||i} style={{ display:"flex", justifyContent:isMe?"flex-end":"flex-start", gap:8, alignItems:"flex-end" }}>
                  {!isMe&&<Avatar avatarId={chatOpen.avatarId} name={chatOpen.name} size={28} uploadUrl={chatOpen.avatarUrl}/>}
                  <div style={{ maxWidth:"72%", padding:"11px 15px", borderRadius:isMe?"18px 18px 4px 18px":"18px 18px 18px 4px", background:isMe?"linear-gradient(135deg,#3d6b35,#4d8a44)":T.surface2, color:isMe?"#c8f5c8":T.text, fontSize:14, lineHeight:1.5 }}>
                    {m.content}
                    <div style={{ fontSize:10, opacity:0.4, marginTop:5, textAlign:"right" }}>{new Date(m.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</div>
                  </div>
                </div>
              );
            })}
            <div ref={msgEnd}/>
          </div>
          <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, padding:"10px 14px 20px", background:T.bg, borderTop:`1px solid ${T.border}`, display:"flex", gap:10, boxSizing:"border-box" }}>
            <div style={{ flex:1, position:"relative" }}>
              <input style={{ background:T.surface2, border:`1.5px solid ${T.border}`, borderRadius:24, padding:"11px 18px", color:T.text, fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none", width:"100%", boxSizing:"border-box" }} value={chatTxt} onChange={e=>setChatTxt(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()}/>
              {!chatTxt&&<div style={{ position:"absolute", top:"50%", left:18, transform:"translateY(-50%)", color:T.muted, fontSize:14, pointerEvents:"none" }}>Say something...</div>}
            </div>
            <button onClick={sendMsg} style={{ background:"linear-gradient(135deg,#3d6b35,#4d8a44)", border:"none", borderRadius:"50%", width:46, height:46, fontSize:18, color:"#c8f5c8", flexShrink:0, cursor:"pointer" }}>➤</button>
          </div>
        </div>
      );
    }
    return (
      <div style={{ paddingTop:72, paddingBottom:90 }}>
        <div style={{ padding:"0 20px 20px", fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:24, color:T.greenL }}>Your Matches 💨</div>
        {matches.length===0?(
          <div style={{ textAlign:"center", color:T.muted, padding:"60px 20px" }}>
            <div style={{ fontSize:56, marginBottom:12 }}>🤝</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, color:T.green, marginBottom:8 }}>No matches yet</div>
            <div style={{ fontSize:13 }}>Keep swiping to find your circle</div>
          </div>
        ):(
          <div style={{ padding:"0 14px", display:"flex", flexDirection:"column", gap:10 }}>
            {matches.filter(m=>!blocked.has(m.id)).map(m=>{
              const thread=threads[m.matchId]||[];const last=thread[thread.length-1];
              const unread=thread.filter(msg=>msg.sender_id!==(auth?.user?.id||"me")).length;
              return (
                <div key={m.matchId} onClick={()=>setChatOpen(m)} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", borderRadius:18, background:T.surface, border:`1px solid ${T.border}`, cursor:"pointer" }}>
                  <Avatar avatarId={m.avatarId} name={m.name} size={50} uploadUrl={m.avatarUrl}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, color:T.text }}>{m.name}{m.age?`, ${m.age}`:""}</div>
                    <div style={{ fontSize:13, color:T.muted, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", marginTop:2 }}>{last?last.content:"Tap to start chatting 💬"}</div>
                  </div>
                  {unread>0&&<div style={{ background:"#5da85d", color:"#fff", borderRadius:"50%", width:22, height:22, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700 }}>{unread}</div>}
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
      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:T.greenL, marginBottom:26 }}>Filter Sessions ⚙️</div>
      {[
        { label:"Max Distance", content:<div style={{ display:"flex", alignItems:"center", gap:14 }}><input type="range" min={1} max={50} value={filters.maxDist} onChange={e=>setFilters(f=>({...f,maxDist:+e.target.value}))} style={{ flex:1 }}/><span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:T.greenL, minWidth:56 }}>{filters.maxDist}km</span></div> },
        { label:"Vibe 🌿", content:<div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>{ALL_VIBES.map(v=><span key={v} style={chipStyle(filters.vibes.includes(v))} onClick={()=>togF("vibes",v)}>{v}</span>)}</div> },
        { label:"Smoke Style 🔥", content:<div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>{SMOKE_STYLES.map(s=><span key={s} style={chipStyle(filters.styles.includes(s))} onClick={()=>togF("styles",s)}>{s}</span>)}</div> },
        { label:"Strains 🍃", content:<div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>{ALL_STRAINS.map((s,i)=><span key={s} style={chipStyle(filters.strains.includes(s))} onClick={()=>togF("strains",s)}>{i>=15?"🍁":"🌿"} {s}</span>)}</div> },
      ].map(sec=>(
        <div key={sec.label} style={{ marginBottom:28 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:T.text, marginBottom:12 }}>{sec.label}</div>
          {sec.content}
        </div>
      ))}
      <button style={BTN} onClick={()=>setTab("discover")}>Apply Filters →</button>
      <button style={{ ...BTNO, marginTop:10 }} onClick={()=>setFilters({maxDist:20,vibes:[],styles:[],strains:[]})}>Clear All</button>
    </div>
  );

  const renderProfile = () => (
    <div style={{ padding:"80px 20px 100px", display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ background:T.card, borderRadius:22, padding:22, border:`1px solid ${T.border}` }}>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}><Avatar avatarId={userProfile?.avatar} name={auth?.name||"Puffer"} size={80} uploadUrl={userProfile?.avatarUrl}/></div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:24, textAlign:"center", color:T.text }}>{auth?.name||"Puffer"}</div>
        <div style={{ textAlign:"center", color:T.muted, fontSize:13, marginBottom:18, marginTop:4 }}>{userProfile?.gender?`${userProfile.gender.charAt(0).toUpperCase()+userProfile.gender.slice(1)} · `:""}{userProfile?.vibes?.[0]||"Setting my vibe..."}</div>
        <div style={{ display:"flex", justifyContent:"space-around", borderTop:`1px solid ${T.border}`, paddingTop:16 }}>
          {[["Matches",matches.length],["Swiped",DEMO.length-deck.length],["Age",userProfile?.age||"—"]].map(([l,v])=>(
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:T.greenL }}>{v}</div>
              <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Theme toggle in profile */}
      <div style={{ background:T.card, borderRadius:22, padding:18, border:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:T.text, fontSize:14 }}>{dark?"Dark Mode":"Light Mode"}</div>
          <div style={{ fontSize:12, color:T.muted, marginTop:2 }}>Switch app appearance</div>
        </div>
        <ThemeToggle dark={dark} onToggle={toggleTheme} T={T}/>
      </div>
      <div style={{ background:T.card, borderRadius:22, padding:18, border:`1px solid ${dark?"#1e3a1e":T.border}` }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:T.greenL, marginBottom:10, fontSize:13 }}>🔒 Your Privacy</div>
        <div style={{ fontSize:13, color:T.muted, lineHeight:1.9 }}>• Exact location never shared — only ~distance<br/>• Email verified at signup<br/>• Block or report any user instantly<br/>• Messages secured with row-level security<br/>• Age enforced at signup (18+ only)</div>
      </div>
      {userProfile?.bio&&<div style={{ background:T.card, borderRadius:22, padding:22, border:`1px solid ${T.border}` }}><div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:T.greenL, marginBottom:10 }}>Bio</div><p style={{ color:T.dim, fontSize:14, lineHeight:1.6 }}>{userProfile.bio}</p></div>}
      {userProfile?.vibes?.length>0&&<div style={{ background:T.card, borderRadius:22, padding:22, border:`1px solid ${T.border}` }}><div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:T.greenL, marginBottom:10 }}>Vibes</div><div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>{userProfile.vibes.map(v=><span key={v} style={chipStyle(true)}>{v}</span>)}</div></div>}
      {userProfile?.styles?.length>0&&<div style={{ background:T.card, borderRadius:22, padding:22, border:`1px solid ${T.border}` }}><div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:T.greenL, marginBottom:10 }}>Smoke Style</div><div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>{userProfile.styles.map(s=><span key={s} style={chipStyle(true)}>🔥 {s}</span>)}</div></div>}
      {userProfile?.strains?.length>0&&<div style={{ background:T.card, borderRadius:22, padding:22, border:`1px solid ${T.border}` }}><div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:T.greenL, marginBottom:10 }}>Fav Strains</div><div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>{userProfile.strains.map((s,i)=><span key={s} style={chipStyle(true)}>{i>=15?"🍁":"🌿"} {s}</span>)}</div></div>}
      <button style={BTNO} onClick={()=>setScreen("setup")}>Edit Profile ✏️</button>
      <button style={{ ...BTNO, borderColor:T.redDim, color:T.red, marginTop:4 }} onClick={async()=>{ if(auth)await sb.signOut(auth.token); setScreen("splash"); setAuth(null); setDeck([...DEMO]); setMatches([]); setThreads({}); }}>Log Out</button>
    </div>
  );

  const TABS = [
    {k:"discover",icon:"🔥",label:"Discover"},
    {k:"matches",icon:"💬",label:`Matches${matches.length?` (${matches.length})`:""}`},
    {k:"filter",icon:"⚙️",label:"Filters"},
    {k:"profile",icon:"🌿",label:"Profile"},
  ];

  return (
    <div style={{ minHeight:"100vh", background:T.bg, color:T.text, fontFamily:"'DM Sans',sans-serif", display:"flex", flexDirection:"column", alignItems:"center", position:"relative", overflow:"hidden" }}>
      <GlobalStyles T={T}/>
      <Toast {...(toast||{})}/>
      {particles.map(p=><div key={p.id} style={{ position:"fixed", bottom:"28%", left:`${p.x}%`, fontSize:20, animation:"floatUp 2s ease-out forwards", animationDelay:`${p.d}s`, pointerEvents:"none", zIndex:999 }}>{p.e}</div>)}
      {matchFlash&&(
        <div style={{ position:"fixed", inset:0, background:T.matchBg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", zIndex:100, gap:14 }}>
          <div style={{ animation:"bounceIn 0.6s ease" }}><Avatar avatarId={matchFlash.avatarId} name={matchFlash.name} size={110} uploadUrl={matchFlash.avatarUrl}/></div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:32, color:T.greenL, textAlign:"center", marginTop:8 }}>It's a Match! 🌿</div>
          <div style={{ color:T.muted, fontSize:15 }}>{matchFlash.name} wants to smoke with you</div>
          <div style={{ display:"flex", gap:12, marginTop:8 }}>
            <button style={{ ...BTN, width:150, padding:"14px" }} onClick={()=>{setMatchFlash(null);setChatOpen(matchFlash);setTab("matches");}}>Message 💬</button>
            <button style={{ ...BTNO, width:130, padding:"14px" }} onClick={()=>setMatchFlash(null)}>Keep Swiping</button>
          </div>
        </div>
      )}
      {reportTarget&&<ReportModal profile={reportTarget} auth={auth} onClose={()=>setReportTarget(null)} setToast={setToast} T={T}/>}
      <div style={{ width:"100%", maxWidth:430, minHeight:"100vh", display:"flex", flexDirection:"column" }}>
        {tab==="discover"&&!chatOpen&&(
          <div style={{ position:"fixed", top:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, padding:"16px 22px 10px", boxSizing:"border-box", background:T.headerBg, backdropFilter:"blur(16px)", zIndex:30, display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:`1px solid ${T.border}` }}>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, color:T.greenL, letterSpacing:"-1px" }}>🌿 puff</span>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ background:dark?"#1a3d1a":"#e8f5e8", color:T.greenL, borderRadius:20, padding:"5px 14px", fontSize:12, fontWeight:600 }}>{filtered.length} nearby</span>
              <ThemeToggle dark={dark} onToggle={toggleTheme} T={T}/>
            </div>
          </div>
        )}
        <div style={{ flex:1, overflowY:"auto" }}>
          {tab==="discover"&&renderDiscover()}
          {tab==="matches"&&renderMatches()}
          {tab==="filter"&&renderFilter()}
          {tab==="profile"&&renderProfile()}
        </div>
        {!chatOpen&&(
          <nav style={{ display:"flex", justifyContent:"space-around", padding:"10px 0 20px", borderTop:`1px solid ${T.border}`, background:T.navBg, backdropFilter:"blur(20px)", position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, zIndex:40 }}>
            {TABS.map(t=>(
              <button key={t.k} onClick={()=>setTab(t.k)} style={{ background:"none", border:"none", display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"4px 12px", opacity:tab===t.k?1:0.3, transition:"opacity 0.2s", cursor:"pointer" }}>
                <span style={{ fontSize:22 }}>{t.icon}</span>
                <span style={{ fontSize:10, fontWeight:600, letterSpacing:"0.3px", color:tab===t.k?T.greenL:T.muted }}>{t.label}</span>
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}