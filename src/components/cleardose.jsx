import { useState, useEffect, useCallback, useRef } from "react";

/* ══════════════════════════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════════════════════════ */
const T = {
  bg:"#F5F1E8", bgDeep:"#EDE8DB", surface:"#FFFFFF",
  border:"#DDD5C4", borderHov:"rgba(10,80,46,0.28)",
  text:"#18150E", sub:"#6B5D4A", muted:"#A09078",
  green:"#0A5A2E", greenMid:"#1A8C52", greenLight:"#E5F4EC",
  greenDim:"rgba(10,90,46,0.1)", greenGlow:"rgba(10,90,46,0.18)",
  amber:"#B45309", amberLight:"#FEF3E2", amberDim:"rgba(180,83,9,0.1)",
  warn:"#B45309", warnLight:"#FEF3E2", warnDim:"rgba(180,83,9,0.1)",
  danger:"#B91C1C", dangerLight:"#FEF2F2", dangerDim:"rgba(185,28,28,0.08)",
  safe:"#0A5A2E", safeLight:"#E5F4EC", safeDim:"rgba(10,90,46,0.1)",
  ink:"#111008",
  purple:"#6D28D9", purpleLight:"#EDE9FE", purpleDim:"rgba(109,40,217,0.1)",
};
const F = { display:"'Playfair Display',Georgia,serif", body:"'DM Sans',system-ui,sans-serif", mono:"'Courier New',monospace" };

/* ══════════════════════════════════════════════════════════
   ADMIN LOCK — only this email can ever access Admin panel
   or hold the ADMIN role. Set via env var in production.
══════════════════════════════════════════════════════════ */
const ADMIN_EMAIL = "tejas.yadav3453@gmail.com";
const isAdmin = (user) => user?.email === ADMIN_EMAIL;

/* ══════════════════════════════════════════════════════════
   MOCK AUTH STORE  (replace with NextAuth in production)
══════════════════════════════════════════════════════════ */
const MOCK_USERS = [
  { id:"1", name:"Admin Tejas",    email:"tejas.yadav3453@gmail.com", password:"Admin@1234",  role:"ADMIN",      points:9820, avatar:"AT" },
  { id:"2", name:"Dr. Priya R",    email:"priya@clinic.org",      password:"Doctor@1234", role:"REGULATOR",  points:5410, avatar:"PR" },
  { id:"3", name:"PharmaSeal NG",  email:"pharma@seal.ng",        password:"Pharma@1234", role:"PROFESSIONAL",points:3200,avatar:"PS" },
  { id:"4", name:"Alice Okafor",   email:"alice@gmail.com",       password:"User@1234",   role:"USER",       points:820,  avatar:"AO" },
];
const ROLE_META = {
  ADMIN:        { label:"Admin",        color:T.purple,  bg:T.purpleLight,  dim:T.purpleDim  },
  REGULATOR:    { label:"Regulator",    color:T.danger,  bg:T.dangerLight,  dim:T.dangerDim  },
  PROFESSIONAL: { label:"Professional", color:T.amber,   bg:T.amberLight,   dim:T.amberDim   },
  USER:         { label:"User",         color:T.green,   bg:T.greenLight,   dim:T.greenDim   },
};
const LEVEL_THRESHOLDS = [
  { min:0,    label:"Observer",       icon:"👁" },
  { min:500,  label:"Watcher",        icon:"🔍" },
  { min:2000, label:"Investigator",   icon:"🧪" },
  { min:5000, label:"SDG-12 Champion",icon:"🏆" },
];
const getLevel = (pts) => [...LEVEL_THRESHOLDS].reverse().find(l=>pts>=l.min) || LEVEL_THRESHOLDS[0];

/* ══════════════════════════════════════════════════════════
   GLOBAL STYLES
══════════════════════════════════════════════════════════ */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
    body{background:${T.bg};color:${T.text};font-family:${F.body};overflow-x:hidden;min-width:320px}
    .wrap{width:100%;max-width:1100px;margin:0 auto;padding:0 20px}
    .wrap-sm{width:100%;max-width:680px;margin:0 auto;padding:0 20px}
    @media(min-width:640px){.wrap,.wrap-sm{padding:0 36px}}
    @media(min-width:1024px){.wrap{padding:0 60px}}

    /* Animations */
    @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes arcSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    @keyframes orbA{from{transform:rotate(0deg) translateX(22px) rotate(0deg)}to{transform:rotate(360deg) translateX(22px) rotate(-360deg)}}
    @keyframes orbB{from{transform:rotate(0deg) translateX(14px) rotate(0deg)}to{transform:rotate(-360deg) translateX(14px) rotate(360deg)}}
    @keyframes pulseRing{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.15);opacity:1}}
    @keyframes statusPulse{0%,100%{box-shadow:0 0 0 0 rgba(10,90,46,.45)}50%{box-shadow:0 0 0 5px rgba(10,90,46,0)}}
    @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}
    @keyframes ripOut{to{transform:scale(4);opacity:0}}
    @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
    @keyframes spin{to{transform:rotate(360deg)}}

    /* Reveal */
    .reveal{opacity:0;transform:translateY(20px);transition:opacity .5s ease,transform .5s ease}
    .reveal.in{opacity:1;transform:none}

    /* Stagger */
    .stagger>*{animation:fadeUp .48s cubic-bezier(.22,1,.36,1) both}
    .stagger>*:nth-child(1){animation-delay:.04s}.stagger>*:nth-child(2){animation-delay:.1s}
    .stagger>*:nth-child(3){animation-delay:.16s}.stagger>*:nth-child(4){animation-delay:.22s}
    .stagger>*:nth-child(5){animation-delay:.28s}.stagger>*:nth-child(6){animation-delay:.34s}
    .stagger>*:nth-child(7){animation-delay:.40s}.stagger>*:nth-child(8){animation-delay:.46s}

    /* Card */
    .card{background:${T.surface};border:1.5px solid ${T.border};border-radius:14px;box-shadow:0 1px 6px rgba(0,0,0,.05);transition:transform .2s,box-shadow .2s,border-color .2s}
    @media(hover:hover){.card:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,.1),0 0 0 1.5px ${T.borderHov};border-color:${T.borderHov}!important}}
    .card-flat{background:${T.surface};border:1.5px solid ${T.border};border-radius:14px;box-shadow:0 1px 6px rgba(0,0,0,.05)}

    /* Buttons */
    .btn-g{transition:transform .14s,box-shadow .18s}
    @media(hover:hover){.btn-g:hover{transform:scale(1.025);box-shadow:0 0 18px ${T.greenGlow},0 4px 12px rgba(0,0,0,.12)}}
    .btn-g:active{transform:scale(.975)}
    .rip{position:relative;overflow:hidden}
    .rip-wave{position:absolute;border-radius:50%;background:rgba(255,255,255,.28);transform:scale(0);animation:ripOut .55s linear;pointer-events:none}

    /* Inputs */
    input,select,textarea{transition:border-color .18s,box-shadow .18s}
    input:focus,select:focus,textarea:focus{border-color:${T.green}!important;box-shadow:0 0 0 3px ${T.greenDim}!important;outline:none}
    :focus-visible{outline:2px solid ${T.green};outline-offset:3px;border-radius:6px}

    /* Nav */
    .nav-wrap{position:fixed;top:0;left:0;right:0;z-index:200;height:56px;background:rgba(245,241,232,.94);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-bottom:1px solid ${T.border};display:flex;align-items:center;justify-content:space-between;padding:0 16px;gap:8px}
    @media(min-width:640px){.nav-wrap{padding:0 24px}}
    @media(min-width:1024px){.nav-wrap{padding:0 40px}}
    .nav-links{display:flex;gap:2px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;flex:1;justify-content:center}
    .nav-links::-webkit-scrollbar{display:none}

    /* Page */
    .page-top{padding-top:56px}
    .sec{padding:56px 20px}
    @media(min-width:640px){.sec{padding:64px 36px}}
    @media(min-width:1024px){.sec{padding:80px 60px}}
    .pg{transition:opacity .18s ease,transform .18s ease}

    /* Grids */
    .grid-2{display:grid;grid-template-columns:1fr;gap:14px}
    .grid-3{display:grid;grid-template-columns:1fr;gap:14px}
    .grid-4{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    @media(min-width:640px){.grid-2{grid-template-columns:1fr 1fr}.grid-3{grid-template-columns:1fr 1fr}.grid-4{grid-template-columns:1fr 1fr}}
    @media(min-width:900px){.grid-3{grid-template-columns:1fr 1fr 1fr}}
    @media(min-width:1024px){.grid-4{grid-template-columns:repeat(4,1fr)}}

    /* Stats band */
    .stats-band{background:${T.ink};padding:44px 20px;display:grid;grid-template-columns:1fr 1fr;gap:28px 20px}
    @media(min-width:640px){.stats-band{padding:48px 36px}}
    @media(min-width:900px){.stats-band{grid-template-columns:repeat(4,1fr);padding:56px 60px}}

    /* Flip grid */
    .flip-grid{display:grid;grid-template-columns:1fr;gap:14px}
    @media(min-width:640px){.flip-grid{grid-template-columns:1fr 1fr}}
    @media(min-width:900px){.flip-grid{grid-template-columns:1fr 1fr 1fr}}

    /* Drug grid */
    .drug-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    @media(min-width:900px){.drug-grid{grid-template-columns:repeat(3,1fr)}}

    /* Trail */
    .trail-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px 16px;align-items:center}
    @media(min-width:640px){.trail-row{grid-template-columns:100px 1fr 1fr 80px;gap:12px}}

    /* Leaderboard */
    .lb-row{display:grid;grid-template-columns:32px 1fr 80px;gap:10px;padding:12px 14px;border-radius:10px;margin-bottom:4px;align-items:center}
    @media(min-width:640px){.lb-row{grid-template-columns:40px 1fr 140px 90px;gap:14px}}
    .lb-pts-d{display:none}
    @media(min-width:640px){.lb-pts-d{display:block}}

    /* Hero */
    .hero-section{min-height:100svh;display:flex;flex-direction:column;justify-content:center;padding:96px 20px 72px}
    @media(min-width:640px){.hero-section{padding:100px 36px 80px}}
    @media(min-width:1024px){.hero-section{padding:120px 60px 80px;max-width:1100px;margin:0 auto}}
    .hero-h1{font-family:${F.display};font-size:clamp(34px,7vw,72px);font-weight:700;line-height:1.08;margin:20px 0 16px;letter-spacing:-.02em}
    .hero-p{font-size:clamp(15px,2vw,18px);line-height:1.72;margin-bottom:32px;max-width:520px}
    .hero-btns{display:flex;gap:10px;flex-wrap:wrap}

    /* Admin / Regulator layout */
    .dash-layout{display:grid;grid-template-columns:1fr;gap:20px}
    @media(min-width:900px){.dash-layout{grid-template-columns:220px 1fr}}
    .dash-sidebar{display:flex;flex-direction:row;gap:4px;overflow-x:auto;padding:0 0 8px}
    @media(min-width:900px){.dash-sidebar{flex-direction:column;overflow:visible;padding:0}}

    /* Shimmer skeleton */
    .shimmer{background:linear-gradient(90deg,${T.border} 25%,${T.bgDeep} 50%,${T.border} 75%);background-size:400px 100%;animation:shimmer 1.4s infinite}

    /* SDG meter */
    .sdg-meter-bar{height:8px;border-radius:100px;background:${T.border};overflow:hidden}
    .sdg-meter-fill{height:100%;border-radius:100px;transition:width .8s cubic-bezier(.22,1,.36,1)}

    /* Badge */
    .badge{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:100px;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;white-space:nowrap}

    /* Mission grid */
    .mission-grid{display:grid;grid-template-columns:1fr;gap:16px}
    @media(min-width:768px){.mission-grid{grid-template-columns:1fr 1fr}}

    /* SDG targets */
    .sdg-grid{display:grid;grid-template-columns:1fr;gap:12px;margin-top:44px}
    @media(min-width:640px){.sdg-grid{grid-template-columns:1fr 1fr 1fr}}

    /* Hyp conf */
    .hyp-conf{min-width:44px;text-align:center;padding:3px 0;border-radius:5px;font-size:12px;font-weight:700;flex-shrink:0}

    /* Footer */
    .footer{border-top:1px solid ${T.border};padding:22px 20px;background:rgba(245,241,232,.85);backdrop-filter:blur(12px);display:flex;flex-direction:column;gap:8px}
    @media(min-width:640px){.footer{flex-direction:row;justify-content:space-between;align-items:center;padding:22px 36px}}
    @media(min-width:1024px){.footer{padding:22px 60px}}

    /* Scrollbar */
    ::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px}

    /* Reduced motion */
    @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}.reveal{opacity:1;transform:none}}

    /* Toast */
    .toast{position:fixed;bottom:24px;right:24px;z-index:9999;background:${T.ink};color:#fff;padding:12px 18px;border-radius:10px;font-size:13px;font-weight:500;box-shadow:0 8px 24px rgba(0,0,0,.2);animation:slideIn .3s ease}

    /* Modal overlay */
    .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:500;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .18s ease}
    .modal-box{background:${T.surface};border-radius:18px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;box-shadow:0 24px 64px rgba(0,0,0,.18);animation:fadeUp .22s ease}

    /* Strength bar */
    .strength-bar{height:4px;border-radius:100px;transition:width .3s,background .3s}

    /* Comm tabs */
    .comm-form{display:flex;flex-direction:column;gap:14px}
    .quiz-opts{display:flex;flex-direction:column;gap:9px;margin-bottom:22px}
  `}</style>
);

/* ══════════════════════════════════════════════════════════
   BACKGROUND
══════════════════════════════════════════════════════════ */
const Background = () => (
  <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",background:T.bg}}>
    <div style={{position:"absolute",top:"-8%",left:"-4%",width:"55%",height:"55%",background:"radial-gradient(ellipse at 30% 30%,rgba(10,90,46,.07) 0%,transparent 68%)"}}/>
    <div style={{position:"absolute",bottom:"-12%",right:"-8%",width:"55%",height:"60%",background:"radial-gradient(ellipse at 65% 65%,rgba(180,83,9,.06) 0%,transparent 65%)"}}/>
    <svg width="100%" height="100%" style={{position:"absolute",inset:0,opacity:.5}}>
      <defs><pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".9" fill="rgba(18,14,8,.12)"/></pattern></defs>
      <rect width="100%" height="100%" fill="url(#dots)"/>
    </svg>
    <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 120% 120% at 50% 50%,transparent 50%,rgba(225,218,205,.4) 100%)"}}/>
  </div>
);

/* ══════════════════════════════════════════════════════════
   HOOKS
══════════════════════════════════════════════════════════ */
const useRipple = () => useCallback((e) => {
  const b=e.currentTarget, el=document.createElement("span");
  const d=Math.max(b.clientWidth,b.clientHeight), r=b.getBoundingClientRect();
  el.className="rip-wave";
  el.style.cssText=`width:${d}px;height:${d}px;left:${e.clientX-r.left-d/2}px;top:${e.clientY-r.top-d/2}px;`;
  b.appendChild(el); setTimeout(()=>el.remove(),600);
},[]);

const useReveal = () => {
  useEffect(()=>{
    const els=document.querySelectorAll(".reveal");
    const obs=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add("in")),{threshold:.1});
    els.forEach(el=>obs.observe(el)); return()=>obs.disconnect();
  },[]);
};

/* ══════════════════════════════════════════════════════════
   PRIMITIVES
══════════════════════════════════════════════════════════ */
const Btn = ({children,onClick,variant="primary",style:s={},disabled,type="button"}) => {
  const rip=useRipple();
  const base={fontFamily:F.body,fontWeight:500,fontSize:14,border:"none",borderRadius:8,padding:"11px 20px",
    cursor:disabled?"not-allowed":"pointer",display:"inline-flex",alignItems:"center",gap:6,
    opacity:disabled?.48:1,letterSpacing:".01em",whiteSpace:"nowrap",flexShrink:0,...s};
  const v={
    primary:{background:T.green,color:"#fff",...base},
    ghost:{background:"transparent",color:T.text,border:`1.5px solid ${T.border}`,...base},
    amber:{background:T.amberDim,color:T.amber,border:`1px solid rgba(180,83,9,.22)`,...base},
    danger:{background:T.dangerDim,color:T.danger,border:`1px solid rgba(185,28,28,.2)`,...base},
    dim:{background:T.bgDeep,color:T.sub,border:`1px solid ${T.border}`,...base},
    purple:{background:T.purpleDim,color:T.purple,border:`1px solid rgba(109,40,217,.2)`,...base},
    ink:{background:T.ink,color:"rgba(245,241,232,.9)",...base},
  };
  return <button type={type} disabled={disabled} className="btn-g rip" style={v[variant]||v.primary} onClick={e=>{rip(e);onClick?.(e);}}>{children}</button>;
};

const Tag = ({children,color,text,style:s={}}) => (
  <span style={{display:"inline-block",fontSize:10,fontWeight:700,letterSpacing:".07em",textTransform:"uppercase",
    padding:"3px 8px",borderRadius:4,background:color||T.greenDim,color:text||T.green,whiteSpace:"nowrap",...s}}>
    {children}
  </span>
);

const RoleBadge = ({role}) => {
  const m=ROLE_META[role]||ROLE_META.USER;
  return <span className="badge" style={{background:m.bg,color:m.color}}>{m.label}</span>;
};

const Avatar = ({initials,role,size=32}) => {
  const m=ROLE_META[role]||ROLE_META.USER;
  return (
    <div style={{width:size,height:size,borderRadius:"50%",background:m.bg,color:m.color,
      border:`2px solid ${m.color}`,display:"flex",alignItems:"center",justifyContent:"center",
      fontSize:size*.32,fontWeight:700,fontFamily:F.body,flexShrink:0,userSelect:"none"}}>
      {initials}
    </div>
  );
};

const Toast = ({msg,onClose}) => {
  useEffect(()=>{const t=setTimeout(onClose,3000);return()=>clearTimeout(t);},[]);
  return <div className="toast" onClick={onClose}>{msg}</div>;
};

const Spinner = ({size=18,color=T.green}) => (
  <div style={{width:size,height:size,border:`2px solid transparent`,borderTop:`2px solid ${color}`,
    borderRadius:"50%",animation:"spin .7s linear infinite",flexShrink:0}}/>
);

const inp = {display:"block",marginTop:6,width:"100%",padding:"11px 14px",fontSize:14,
  fontFamily:F.body,background:T.bgDeep,border:`1.5px solid ${T.border}`,
  borderRadius:8,color:T.text,outline:"none"};

/* ══════════════════════════════════════════════════════════
   NAVIGATION
══════════════════════════════════════════════════════════ */
const MAIN_PAGES = ["Home","Verify","Scam Hub","Community","Drugs","Learn"];

const Nav = ({page, setPage, user, onLogout}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(()=>{
    const h=(e)=>{ if(menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h);
  },[]);

  return (
    <nav className="nav-wrap">
      <button onClick={()=>setPage("Home")}
        style={{fontFamily:F.display,fontSize:17,fontWeight:700,color:T.green,background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:7,flexShrink:0}}>
        <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:20,height:20,borderRadius:"50%",border:`2px solid ${T.green}`,fontSize:9}}>✦</span>
        ClearDose
      </button>

      <div className="nav-links">
        {MAIN_PAGES.map(l=>(
          <button key={l} onClick={()=>setPage(l)}
            style={{fontFamily:F.body,fontSize:13,padding:"6px 9px",borderRadius:6,border:"none",
              background:page===l?T.greenDim:"transparent",color:page===l?T.green:T.sub,
              cursor:"pointer",fontWeight:page===l?600:400,transition:"all .16s",whiteSpace:"nowrap"}}>
            {l}
          </button>
        ))}
        {isAdmin(user) && (
          <button onClick={()=>setPage("Admin")}
            style={{fontFamily:F.body,fontSize:13,padding:"6px 9px",borderRadius:6,border:"none",
              background:page==="Admin"?T.purpleDim:"transparent",color:page==="Admin"?T.purple:T.sub,
              cursor:"pointer",fontWeight:page==="Admin"?600:400,transition:"all .16s",whiteSpace:"nowrap"}}>
            Admin
          </button>
        )}
        {(user?.role==="REGULATOR"||isAdmin(user)) && (
          <button onClick={()=>setPage("Regulator")}
            style={{fontFamily:F.body,fontSize:13,padding:"6px 9px",borderRadius:6,border:"none",
              background:page==="Regulator"?T.dangerDim:"transparent",color:page==="Regulator"?T.danger:T.sub,
              cursor:"pointer",fontWeight:page==="Regulator"?600:400,transition:"all .16s",whiteSpace:"nowrap"}}>
            Regulator
          </button>
        )}
      </div>

      <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}} ref={menuRef}>
        {!user ? (
          <>
            <Btn variant="ghost" style={{padding:"7px 12px",fontSize:12}} onClick={()=>setPage("Login")}>Sign in</Btn>
            <Btn style={{padding:"7px 12px",fontSize:12}} onClick={()=>setPage("Register")}>Join →</Btn>
          </>
        ) : (
          <div style={{position:"relative"}}>
            <button onClick={()=>setMenuOpen(o=>!o)}
              style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
              <Avatar initials={user.avatar} role={user.role} size={32}/>
              <div style={{display:"none",flexDirection:"column",alignItems:"flex-start",gap:1}}>
                <span style={{fontSize:12,fontWeight:600,color:T.text}}>{user.name}</span>
              </div>
            </button>
            {menuOpen && (
              <div style={{position:"absolute",top:"calc(100% + 10px)",right:0,background:T.surface,
                border:`1.5px solid ${T.border}`,borderRadius:12,minWidth:180,boxShadow:"0 12px 36px rgba(0,0,0,.12)",
                zIndex:300,overflow:"hidden",animation:"fadeUp .18s ease"}}>
                <div style={{padding:"14px 16px 10px",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{fontWeight:600,fontSize:14,color:T.text,marginBottom:3}}>{user.name}</div>
                  <div style={{fontSize:12,color:T.muted,marginBottom:6}}>{user.email}</div>
                  <RoleBadge role={user.role}/>
                </div>
                {[
                  {label:"My Profile",  page:"Profile",    icon:"◉"},
                  {label:"SDG Metrics", page:"SDGMetrics", icon:"◈"},
                ].map(item=>(
                  <button key={item.page} onClick={()=>{setPage(item.page);setMenuOpen(false);}}
                    style={{width:"100%",padding:"10px 16px",background:"none",border:"none",cursor:"pointer",
                      textAlign:"left",fontSize:13,color:T.text,display:"flex",alignItems:"center",gap:8,
                      transition:"background .15s"}}
                    onMouseEnter={e=>e.target.style.background=T.bgDeep}
                    onMouseLeave={e=>e.target.style.background="none"}>
                    <span style={{color:T.muted,fontSize:11}}>{item.icon}</span>{item.label}
                  </button>
                ))}
                <div style={{borderTop:`1px solid ${T.border}`,padding:"6px 8px"}}>
                  <button onClick={()=>{onLogout();setMenuOpen(false);}}
                    style={{width:"100%",padding:"9px 10px",background:"none",border:"none",cursor:"pointer",
                      textAlign:"left",fontSize:13,color:T.danger,display:"flex",alignItems:"center",gap:8,
                      borderRadius:8,transition:"background .15s"}}
                    onMouseEnter={e=>e.currentTarget.style.background=T.dangerLight}
                    onMouseLeave={e=>e.currentTarget.style.background="none"}>
                    ⟶ Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

/* ══════════════════════════════════════════════════════════
   AUTH PAGES
══════════════════════════════════════════════════════════ */
const pwStrength = (pw) => {
  let s=0;
  if(pw.length>=8)s++; if(pw.length>=12)s++;
  if(/[A-Z]/.test(pw))s++; if(/[0-9]/.test(pw))s++; if(/[^A-Za-z0-9]/.test(pw))s++;
  return s;
};
const strengthLabel = [
  {label:"Too short",color:"#B91C1C",w:"20%"},
  {label:"Weak",     color:"#DC2626",w:"30%"},
  {label:"Fair",     color:T.amber,  w:"50%"},
  {label:"Good",     color:"#16A34A",w:"75%"},
  {label:"Strong",   color:T.green,  w:"100%"},
];

const LoginPage = ({setPage, onLogin}) => {
  const [email,setEmail]=useState(""); const [pw,setPw]=useState("");
  const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
  const [showPw,setShowPw]=useState(false);

  const handle = async()=>{
    setErr(""); setLoading(true);
    await new Promise(r=>setTimeout(r,900));
    const u=MOCK_USERS.find(u=>u.email===email&&u.password===pw);
    setLoading(false);
    if(u){onLogin(u);}
    else setErr("Invalid email or password. Try a demo account below.");
  };

  // Admin demo intentionally excluded — admin access is email-locked
  const demos=[
    {label:"Regulator",   ...MOCK_USERS[1]},
    {label:"Professional",...MOCK_USERS[2]},
    {label:"User",        ...MOCK_USERS[3]},
  ];

  return (
    <div className="page-top" style={{minHeight:"100svh",display:"flex",alignItems:"center",justifyContent:"center",padding:"80px 20px 40px"}}>
      <div style={{width:"100%",maxWidth:420,animation:"fadeUp .4s ease both"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontFamily:F.display,fontSize:28,fontWeight:700,color:T.green,marginBottom:6}}>Welcome back</div>
          <div style={{color:T.sub,fontSize:14}}>Sign in to ClearDose</div>
        </div>

        <div className="card-flat" style={{padding:"clamp(24px,5vw,36px)"}}>
          {err && <div style={{background:T.dangerLight,border:`1px solid rgba(185,28,28,.2)`,borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:13,color:T.danger}}>{err}</div>}

          <label style={{fontSize:12,color:T.sub,fontWeight:600,textTransform:"uppercase",letterSpacing:".06em"}}>
            Email address
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="you@example.com" style={inp}
              onKeyDown={e=>e.key==="Enter"&&handle()}/>
          </label>
          <div style={{height:14}}/>
          <label style={{fontSize:12,color:T.sub,fontWeight:600,textTransform:"uppercase",letterSpacing:".06em"}}>
            Password
            <div style={{position:"relative"}}>
              <input value={pw} onChange={e=>setPw(e.target.value)} type={showPw?"text":"password"} placeholder="••••••••" style={{...inp,paddingRight:40}}
                onKeyDown={e=>e.key==="Enter"&&handle()}/>
              <button type="button" onClick={()=>setShowPw(s=>!s)}
                style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:T.muted,fontSize:14,marginTop:3}}>
                {showPw?"🙈":"👁"}
              </button>
            </div>
          </label>

          <div style={{height:20}}/>
          <Btn onClick={handle} disabled={loading||!email||!pw} style={{width:"100%",justifyContent:"center",padding:13}}>
            {loading ? <><Spinner size={16} color="#fff"/> Signing in…</> : "Sign in →"}
          </Btn>

          <div style={{textAlign:"center",marginTop:16,fontSize:13,color:T.muted}}>
            No account?{" "}
            <button onClick={()=>setPage("Register")} style={{background:"none",border:"none",color:T.green,cursor:"pointer",fontWeight:600,fontSize:13}}>Create one</button>
          </div>
        </div>

        <div style={{marginTop:20}}>
          <div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:".07em",textAlign:"center",marginBottom:10}}>Quick demo logins</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
            {demos.map(d=>(
              <button key={d.label} onClick={()=>{setEmail(d.email);setPw(d.password);}}
                style={{padding:"6px 12px",borderRadius:100,border:`1.5px solid ${ROLE_META[d.role].color}22`,
                  background:ROLE_META[d.role].bg,color:ROLE_META[d.role].color,fontSize:12,fontWeight:600,cursor:"pointer"}}>
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const RegisterPage = ({setPage, onLogin}) => {
  const [form,setForm]=useState({name:"",email:"",password:"",role:"USER"});
  const [err,setErr]=useState(""); const [loading,setLoading]=useState(false); const [showPw,setShowPw]=useState(false);
  const s=pwStrength(form.password);
  const sl=strengthLabel[Math.min(s,4)];

  const handle=async()=>{
    setErr("");
    if(!form.name||!form.email||!form.password){setErr("All fields required.");return;}
    if(s<2){setErr("Password too weak — add uppercase, numbers, or symbols.");return;}
    setLoading(true); await new Promise(r=>setTimeout(r,900)); setLoading(false);
    // Hard-lock: ADMIN role can only be assigned to ADMIN_EMAIL
    const safeRole = form.role === "ADMIN" ? "USER" : form.role;
    const newUser={id:Date.now().toString(),name:form.name,email:form.email,
      password:form.password,role:safeRole,points:0,avatar:form.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)};
    onLogin(newUser);
  };

  return (
    <div className="page-top" style={{minHeight:"100svh",display:"flex",alignItems:"center",justifyContent:"center",padding:"80px 20px 40px"}}>
      <div style={{width:"100%",maxWidth:420,animation:"fadeUp .4s ease both"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontFamily:F.display,fontSize:28,fontWeight:700,color:T.green,marginBottom:6}}>Join ClearDose</div>
          <div style={{color:T.sub,fontSize:14}}>Create your account · free forever</div>
        </div>

        <div className="card-flat" style={{padding:"clamp(24px,5vw,36px)"}}>
          {err && <div style={{background:T.dangerLight,border:`1px solid rgba(185,28,28,.2)`,borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:13,color:T.danger}}>{err}</div>}

          {[
            {key:"name",label:"Full name",type:"text",ph:"Alice Okafor"},
            {key:"email",label:"Email address",type:"email",ph:"you@example.com"},
          ].map(f=>(
            <div key={f.key} style={{marginBottom:14}}>
              <label style={{fontSize:12,color:T.sub,fontWeight:600,textTransform:"uppercase",letterSpacing:".06em"}}>
                {f.label}
                <input value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} type={f.type} placeholder={f.ph} style={inp}/>
              </label>
            </div>
          ))}

          <label style={{fontSize:12,color:T.sub,fontWeight:600,textTransform:"uppercase",letterSpacing:".06em"}}>
            Password
            <div style={{position:"relative"}}>
              <input value={form.password} onChange={e=>setForm({...form,password:e.target.value})} type={showPw?"text":"password"} placeholder="Min 8 chars" style={{...inp,paddingRight:40}}/>
              <button type="button" onClick={()=>setShowPw(s=>!s)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:T.muted,fontSize:14,marginTop:3}}>
                {showPw?"🙈":"👁"}
              </button>
            </div>
          </label>
          {form.password.length>0 && (
            <div style={{marginTop:8,marginBottom:4}}>
              <div style={{background:T.border,borderRadius:100,height:4,overflow:"hidden",marginBottom:4}}>
                <div className="strength-bar" style={{width:sl.w,background:sl.color,height:"100%"}}/>
              </div>
              <div style={{fontSize:11,color:sl.color,fontWeight:600}}>{sl.label}</div>
            </div>
          )}

          <div style={{height:14}}/>
          <label style={{fontSize:12,color:T.sub,fontWeight:600,textTransform:"uppercase",letterSpacing:".06em"}}>
            I am a…
            <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} style={inp}>
              <option value="USER">Patient / General public</option>
              <option value="PROFESSIONAL">Pharmacist / Healthcare professional</option>
              <option value="REGULATOR">Regulator / Law-enforcement</option>
              {/* ADMIN role is not self-assignable — granted by the platform admin only */}
            </select>
          </label>

          <div style={{height:20}}/>
          <Btn onClick={handle} disabled={loading} style={{width:"100%",justifyContent:"center",padding:13}}>
            {loading?<><Spinner size={16} color="#fff"/> Creating account…</>:"Create account →"}
          </Btn>

          <div style={{textAlign:"center",marginTop:16,fontSize:13,color:T.muted}}>
            Already have one?{" "}
            <button onClick={()=>setPage("Login")} style={{background:"none",border:"none",color:T.green,cursor:"pointer",fontWeight:600,fontSize:13}}>Sign in</button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   HOME
══════════════════════════════════════════════════════════ */
const HomePage = ({setPage, user}) => {
  useReveal();
  const stats=[
    {n:"1 in 10",l:"medicines in low-income countries is substandard or falsified"},
    {n:"700K+",  l:"deaths per year linked to counterfeit antimalarials & antibiotics"},
    {n:"SDG 12.4",l:"requires sound management of chemicals across their lifecycle"},
    {n:"200+",   l:"countries affected by falsified medicine supply chains"},
  ];
  const features=[
    {icon:"◎",t:"Abductive AI",      d:"Multi-agent reasoning: Vision, Supply-Chain, Price & Regulation, and Risk agents work in concert."},
    {icon:"⬡",t:"Blockchain Trail",  d:"Every batch event stored immutably on Polygon. Tamper-proof provenance, not speculation."},
    {icon:"◈",t:"Community Watch",   d:"Impact points, not tokens. Report anomalies, climb from Observer to SDG-12 Champion."},
    {icon:"◇",t:"SDG-12 Aligned",    d:"Every feature maps to targets 12.4, 12.5, 12.8: less waste, safer chemicals, informed choices."},
  ];

  return (
    <div>
      <section className="hero-section stagger">
        <Tag>Open Platform · SDG 12 · AI + Blockchain</Tag>
        <h1 className="hero-h1">Every medicine deserves<br/><em style={{color:T.green,fontStyle:"italic"}}>a clean story.</em></h1>
        <p className="hero-p" style={{color:T.sub}}>ClearDose traces drug batches, flags counterfeits with abductive AI reasoning, and empowers communities to make safer, more sustainable medicine choices.</p>
        <div className="hero-btns">
          <Btn onClick={()=>setPage("Verify")}>Verify my medicine →</Btn>
          <Btn variant="ghost" onClick={()=>setPage("Scam Hub")}>See scam alerts</Btn>
          <Btn variant="amber" onClick={()=>setPage("Community")}>Join anomaly hunters</Btn>
          {!user && <Btn variant="ink" onClick={()=>setPage("Register")}>Create account</Btn>}
        </div>
        {user && (
          <div style={{marginTop:24,padding:"12px 16px",background:T.greenLight,border:`1px solid rgba(10,90,46,.2)`,borderRadius:10,display:"inline-flex",alignItems:"center",gap:10}}>
            <Avatar initials={user.avatar} role={user.role} size={28}/>
            <span style={{fontSize:13,color:T.green}}>
              Welcome back, <strong>{user.name}</strong> · <strong>{user.points.toLocaleString()} pts</strong> · {getLevel(user.points).icon} {getLevel(user.points).label}
            </span>
          </div>
        )}
      </section>

      <div className="stats-band reveal">
        {stats.map((s,i)=>(
          <div key={i}>
            <div style={{fontFamily:F.display,fontSize:"clamp(22px,4vw,34px)",fontWeight:700,color:T.greenMid,marginBottom:6}}>{s.n}</div>
            <div style={{fontSize:13,color:"rgba(245,241,232,.5)",lineHeight:1.55}}>{s.l}</div>
          </div>
        ))}
      </div>

      <section className="sec reveal">
        <div className="wrap">
          <h2 style={{fontFamily:F.display,fontSize:"clamp(22px,3.5vw,34px)",fontWeight:700,marginBottom:36,letterSpacing:"-.02em"}}>What ClearDose does</h2>
          <div className="grid-2">
            {features.map((f,i)=><FeatureCard key={i} {...f}/>)}
          </div>
        </div>
      </section>

      <section className="sec reveal" style={{paddingTop:0}}>
        <div className="wrap">
          <div className="mission-grid">
            <div className="card" style={{padding:"clamp(22px,4vw,40px)",background:T.greenLight,borderColor:"rgba(10,90,46,.18)"}}>
              <Tag>The problem</Tag>
              <p style={{fontFamily:F.display,fontSize:"clamp(15px,2vw,20px)",lineHeight:1.6,margin:"16px 0 12px",fontStyle:"italic"}}>
                "Counterfeit medicines are not just a health crisis — they are a sustainability crisis."
              </p>
              <p style={{fontSize:14,color:T.sub,lineHeight:1.7}}>Every fake pill represents failed production standards, dangerous chemical waste, and a supply chain no one can trace. SDG 12 demands better.</p>
            </div>
            <div className="card" style={{padding:"clamp(22px,4vw,40px)",background:T.ink,border:"none"}}>
              <Tag color="rgba(26,140,82,.18)" text={T.greenMid}>Mission</Tag>
              <p style={{fontFamily:F.display,fontSize:"clamp(15px,2vw,20px)",lineHeight:1.6,margin:"16px 0 18px",color:"rgba(245,241,232,.92)",fontStyle:"italic"}}>
                "To make medicine supply chains transparent, counterfeit-free, and SDG-12 aligned — so every person, everywhere, can trust what they take."
              </p>
              <Btn variant="ghost" onClick={()=>setPage("Learn")} style={{color:T.greenMid,borderColor:"rgba(26,140,82,.3)",fontSize:13}}>Explore SDG-12 →</Btn>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({icon,t,d}) => {
  const [hov,setHov]=useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} className="card"
      style={{background:hov?T.green:T.surface,borderColor:hov?T.green:T.border,padding:"clamp(18px,3vw,28px)",cursor:"default",transition:"all .22s",borderRadius:14}}>
      <div style={{fontFamily:F.display,fontSize:22,marginBottom:10,color:hov?"rgba(255,255,255,.5)":T.green,transition:"color .2s"}}>{icon}</div>
      <h3 style={{fontFamily:F.display,fontSize:17,fontWeight:700,marginBottom:8,color:hov?"#fff":T.text,transition:"color .2s"}}>{t}</h3>
      <p style={{fontSize:14,color:hov?"rgba(255,255,255,.62)":T.sub,lineHeight:1.65,margin:0}}>{d}</p>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   VERIFY
══════════════════════════════════════════════════════════ */
const OrbLoader = ({progress,agents,activeIdx}) => (
  <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"32px 0 12px"}}>
    <div style={{position:"relative",width:90,height:90,marginBottom:28}}>
      <svg width="90" height="90" style={{position:"absolute",inset:0,animation:"arcSpin 1.3s linear infinite"}}>
        <circle cx="45" cy="45" r="40" fill="none" stroke={T.green} strokeWidth="2.5" strokeDasharray="68 200" strokeLinecap="round"/>
      </svg>
      <svg width="90" height="90" style={{position:"absolute",inset:0,animation:"arcSpin 2.2s linear infinite reverse"}}>
        <circle cx="45" cy="45" r="28" fill="none" stroke={T.amber} strokeWidth="1.5" strokeDasharray="44 168" strokeLinecap="round"/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",animation:"pulseRing 1.6s ease-in-out infinite"}}>
        <div style={{width:20,height:20,borderRadius:"50%",background:T.greenDim,border:`2px solid ${T.green}`}}/>
      </div>
      <div style={{position:"absolute",inset:0,animation:"orbA 1.9s linear infinite",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{width:6,height:6,borderRadius:"50%",background:T.green,boxShadow:`0 0 7px ${T.green}`}}/>
      </div>
      <div style={{position:"absolute",inset:0,animation:"orbB 2.6s linear infinite",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{width:5,height:5,borderRadius:"50%",background:T.amber}}/>
      </div>
    </div>
    <div style={{width:"min(280px,90%)",background:T.border,borderRadius:100,height:4,marginBottom:24,overflow:"hidden"}}>
      <div style={{background:`linear-gradient(90deg,${T.green},${T.greenMid})`,height:"100%",width:`${progress}%`,transition:"width .5s ease",borderRadius:100}}/>
    </div>
    <div style={{width:"100%",maxWidth:360,display:"flex",flexDirection:"column",gap:10}}>
      {agents.map((a,i)=>{
        const done=i<activeIdx,active=i===activeIdx;
        return (
          <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,opacity:done||active?1:.28,transition:"opacity .4s"}}>
            <div style={{width:22,height:22,borderRadius:"50%",flexShrink:0,marginTop:1,
              background:done?T.greenDim:"transparent",border:active?`1.5px solid ${T.green}`:done?"none":`1px solid ${T.border}`,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:done?T.green:T.sub,
              animation:active?"pulseRing 1.2s ease-in-out infinite":"none"}}>
              {done?"✓":i+1}
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:active?T.green:done?T.text:T.sub}}>{a.name}</div>
              <div style={{fontSize:11,color:T.muted}}>{a.task}</div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const VerifyPage = ({user,setPage}) => {
  const [step,setStep]=useState("input");
  const [batchId,setBatchId]=useState(""); const [country,setCountry]=useState("Nigeria");
  const [progress,setProgress]=useState(0); const [activeIdx,setActiveIdx]=useState(-1);
  const [showFullTrail,setShowFullTrail]=useState(false);

  const agents=[
    {name:"Vision Agent",             task:"Analysing packaging for layout & logo anomalies…"},
    {name:"Supply-Chain Agent",       task:"Tracing batch events on-chain across 5 hops…"},
    {name:"Price & Regulation Agent", task:"Comparing price vs cost band & regional ban map…"},
    {name:"Abductive Risk Agent",     task:"Synthesising weighted hypotheses from all agents…"},
  ];

  const result={
    level:"Caution",drug:"Amoxicillin 500mg",batchId:batchId||"AM-2024-04471",
    hypotheses:[
      {conf:72,text:"Unverified distribution hop between Lagos and Accra — no QC checkpoint recorded on-chain.",agent:"Supply-Chain"},
      {conf:58,text:"Reported price 34% below regional low-cost band — possible dilution or relabelling.",agent:"Price"},
      {conf:40,text:"QR certificate timestamp predates the manufacturing event by 72 hours — possible digital forgery.",agent:"Vision"},
    ],
    sdg12:"If counterfeit: this batch represents unnecessary chemical production, unsafe disposal risk, and consumer misinformation — directly undermining SDG 12.4 and 12.5.",
    events:[
      {date:"2024-02-01",event:"Manufactured",   actor:"PharmaCo Ltd, Abuja",       status:"verified", txHash:"0xab12…"},
      {date:"2024-02-14",event:"QualityChecked", actor:"NAFDAC Lab, Lagos",          status:"verified", txHash:"0xcd34…"},
      {date:"2024-02-19",event:"Shipped",         actor:"MedLogix NG",               status:"verified", txHash:"0xef56…"},
      {date:"2024-03-02",event:"—",               actor:"Unregistered intermediary", status:"missing",  txHash:null},
      {date:"2024-03-11",event:"Received",        actor:"Central Pharmacy, Accra",   status:"flagged",  txHash:"0x78ab…"},
    ],
  };

  const run=()=>{
    setStep("loading");setProgress(0);setActiveIdx(0);
    [0,25,50,75,100].forEach((p,i)=>setTimeout(()=>{setProgress(p);setActiveIdx(i);},i*960));
    setTimeout(()=>setStep("result"),5050);
  };

  const lC={Safe:T.green,Caution:T.warn,"High Risk":T.danger};
  const sC={verified:T.green,missing:T.warn,flagged:T.danger};
  const sBg={verified:T.safeLight,missing:T.warnLight,flagged:T.dangerLight};

  return (
    <div className="page-top">
      <div className="wrap-sm sec">
        <Tag>AI · Blockchain · Multi-Agent</Tag>
        <h1 style={{fontFamily:F.display,fontSize:"clamp(26px,5vw,40px)",fontWeight:700,margin:"16px 0 6px",letterSpacing:"-.02em"}}>Verify a medicine</h1>
        <p style={{color:T.sub,marginBottom:36,fontSize:15,lineHeight:1.6}}>Run the full AI-agent squad on any batch ID — Vision, Supply-Chain, Price, and Abductive Risk.</p>

        {!user && (
          <div style={{background:T.amberLight,border:`1px solid rgba(180,83,9,.2)`,borderRadius:10,padding:"12px 16px",marginBottom:20,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <span style={{fontSize:13,color:T.amber}}>⚠ You're verifying as a guest. <strong>Sign in</strong> to save results and earn points.</span>
            <Btn variant="amber" style={{padding:"6px 12px",fontSize:12}} onClick={()=>setPage("Login")}>Sign in</Btn>
          </div>
        )}

        {step==="input" && (
          <div className="card stagger" style={{padding:"clamp(20px,4vw,36px)"}}>
            <label style={{fontSize:12,color:T.sub,fontWeight:600,textTransform:"uppercase",letterSpacing:".06em"}}>
              Batch / Serial Number
              <input value={batchId} onChange={e=>setBatchId(e.target.value)} placeholder="e.g. AM-2024-04471" style={inp}/>
            </label>
            <div style={{height:14}}/>
            <label style={{fontSize:12,color:T.sub,fontWeight:600,textTransform:"uppercase",letterSpacing:".06em"}}>
              Country / Region
              <select value={country} onChange={e=>setCountry(e.target.value)} style={inp}>
                {["Nigeria","Ghana","India","Brazil","Kenya","Indonesia","Pakistan","South Africa","Ethiopia"].map(c=><option key={c}>{c}</option>)}
              </select>
            </label>
            <div style={{height:14}}/>
            <div style={{border:`2px dashed ${T.border}`,borderRadius:8,padding:"20px 16px",textAlign:"center",color:T.muted,fontSize:14,cursor:"pointer",transition:"border-color .2s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=T.green} onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
              📦 Upload packaging photo (optional)
            </div>
            <div style={{height:20}}/>
            <Btn onClick={run} style={{width:"100%",justifyContent:"center",padding:13}}>Run verification squad →</Btn>
          </div>
        )}

        {step==="loading" && (
          <div className="card" style={{padding:"28px clamp(16px,4vw,40px)"}}>
            <OrbLoader progress={progress} agents={agents} activeIdx={activeIdx}/>
          </div>
        )}

        {step==="result" && (
          <div className="stagger">
            <div className="card" style={{padding:"clamp(18px,3vw,28px)",marginBottom:14,
              borderColor:result.level==="Safe"?"rgba(10,90,46,.3)":result.level==="Caution"?"rgba(180,83,9,.3)":"rgba(185,28,28,.3)",
              background:result.level==="Safe"?T.safeLight:result.level==="Caution"?T.warnLight:T.dangerLight}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                <div style={{minWidth:0}}>
                  <Tag color={result.level==="Safe"?T.safeDim:result.level==="Caution"?T.warnDim:T.dangerDim} text={lC[result.level]}>{result.level}</Tag>
                  <h2 style={{fontFamily:F.display,fontSize:"clamp(20px,4vw,28px)",fontWeight:700,margin:"10px 0 4px",letterSpacing:"-.02em",wordBreak:"break-word"}}>{result.drug}</h2>
                  <div style={{fontSize:12,color:T.sub,fontFamily:F.mono,wordBreak:"break-all"}}>Batch: {result.batchId} · {country}</div>
                </div>
                <div style={{fontFamily:F.display,fontSize:"clamp(36px,8vw,50px)",lineHeight:1,color:lC[result.level],flexShrink:0}}>
                  {result.level==="Safe"?"✓":result.level==="Caution"?"⚠":"✕"}
                </div>
              </div>
            </div>

            <div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>AI Hypotheses</div>
            {result.hypotheses.map((h,i)=>(
              <div key={i} className="card" style={{padding:"12px 16px",display:"flex",gap:12,alignItems:"flex-start",marginBottom:8}}>
                <div className="hyp-conf" style={{background:h.conf>65?T.warnDim:T.greenDim,color:h.conf>65?T.warn:T.green}}>{h.conf}%</div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{margin:"0 0 4px",fontSize:14,lineHeight:1.65,color:T.text}}>{h.text}</p>
                  <Tag color={T.bgDeep} text={T.muted}>{h.agent} Agent</Tag>
                </div>
              </div>
            ))}

            <div className="card" style={{padding:"14px 16px",margin:"4px 0 16px",background:T.greenLight,borderColor:"rgba(10,90,46,.18)"}}>
              <div style={{fontSize:10,fontWeight:700,color:T.green,textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>SDG-12 Note</div>
              <p style={{margin:0,fontSize:13,color:T.sub,lineHeight:1.65}}>{result.sdg12}</p>
            </div>

            <div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:".08em",marginBottom:10}}>Blockchain Trail</div>
            <div className="card" style={{overflow:"hidden",marginBottom:22}}>
              {(showFullTrail?result.events:result.events.slice(0,3)).map((e,i)=>(
                <div key={i} className="trail-row" style={{background:i%2===0?T.surface:T.bg,borderBottom:i<result.events.length-1?`1px solid ${T.border}`:"none"}}>
                  <span style={{fontSize:11,color:T.muted,fontFamily:F.mono}}>{e.date}</span>
                  <span style={{fontSize:13,fontWeight:500}}>{e.event}</span>
                  <span style={{fontSize:12,color:T.sub,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.actor}</span>
                  <Tag color={sBg[e.status]} text={sC[e.status]}>{e.status}</Tag>
                </div>
              ))}
              {result.events.length>3 && (
                <button onClick={()=>setShowFullTrail(s=>!s)}
                  style={{width:"100%",padding:"10px",background:T.bgDeep,border:"none",borderTop:`1px solid ${T.border}`,cursor:"pointer",fontSize:12,color:T.sub}}>
                  {showFullTrail?"Show less ↑":`Show all ${result.events.length} events ↓`}
                </button>
              )}
            </div>

            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              <Btn onClick={()=>{setStep("input");setShowFullTrail(false);}}>Verify another</Btn>
              <Btn variant="danger" onClick={()=>setPage("Community")}>Report anomaly</Btn>
              <Btn variant="dim">Share result</Btn>
              {user && <Btn variant="ghost">Save to profile</Btn>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   SCAM HUB
══════════════════════════════════════════════════════════ */
const ScamHub = () => {
  useReveal();
  const [isMobile,setIsMobile]=useState(window.innerWidth<640);
  useEffect(()=>{
    const h=()=>setIsMobile(window.innerWidth<640);
    window.addEventListener("resize",h); return()=>window.removeEventListener("resize",h);
  },[]);

  const scams=[
    {emoji:"💊",t:"Fake Online Pharmacies",   sub:"Too-good-to-be-true",color:T.warn,
      front:"Websites offering branded antibiotics at 70–90% discount, no prescription required, anonymous checkout.",
      back:"No physical address, no pharmacist, crypto-only payment. Verify via your national pharmacy board registry.",
      sdg:"Creates untracked chemical waste and falsified packaging chains."},
    {emoji:"📱",t:"WhatsApp / Telegram Scams",sub:"Forwarded offers",    color:T.danger,
      front:"Mass-forwarded messages claiming limited supplies of insulin or oncology meds at half price, impersonating clinics.",
      back:"Never buy medicines via messaging apps. Block and report. Official health alerts never arrive via WhatsApp.",
      sdg:"Drives unregulated production and bypasses safety quality checks."},
    {emoji:"📦",t:"Relabelled Expired Stock", sub:"New date, old risk",  color:T.warn,
      front:"Expired medicines re-packaged with new expiry dates and batch numbers — common for analgesics and vitamins.",
      back:"Check for uneven expiry font, tampered seal, or a batch number that fails ClearDose verification.",
      sdg:"Wastes resources and creates hazardous disposal risks — SDG 12.4."},
    {emoji:"🏪",t:"Street Market Dispensing", sub:"No chain of custody", color:T.danger,
      front:"Medicines sold loose in markets with no blister pack, no batch ID, and no cold-chain guarantee.",
      back:"No traceability, no QC. Even genuine drugs degrade without proper storage. Insist on sealed packaging.",
      sdg:"Breaks the traceable supply chain that SDG 12 targets require."},
    {emoji:"⚗️",t:"Under-dosed Ingredients", sub:"Looks real, isn't",   color:T.warn,
      front:"Pills identical to originals but containing only 20–40% of the stated active ingredient — especially antimalarials.",
      back:"Treatment failure, antibiotic resistance. Report unusual non-response to your doctor immediately.",
      sdg:"Repeat purchases increase waste; drives systemic resistance globally."},
    {emoji:"🔗",t:"Broken QR / Fake Barcodes",sub:"Digital forgery",    color:T.amber,
      front:"Sophisticated fakes include QR codes redirecting to convincing fake verification pages — not the blockchain.",
      back:"Use ClearDose to cross-reference. A valid code resolves to an immutable blockchain event, never a static page.",
      sdg:"Undermines digital traceability infrastructure critical for SDG 12 compliance."},
  ];

  return (
    <div className="page-top">
      <div className="wrap sec">
        <Tag color={T.warnDim} text={T.warn}>Scam Awareness</Tag>
        <h1 style={{fontFamily:F.display,fontSize:"clamp(26px,5vw,40px)",fontWeight:700,margin:"16px 0 6px",letterSpacing:"-.02em"}}>Know the patterns</h1>
        <p style={{color:T.sub,marginBottom:36,fontSize:15,lineHeight:1.6,maxWidth:560}}>
          {isMobile?"Tap a card to reveal what to watch for and what to do.":"Hover a card to flip it — front: the scam. Back: what to do."}
        </p>
        <div className="flip-grid stagger">
          {scams.map((s,i)=>isMobile?<AccordionCard key={i} {...s}/>:<FlipCard key={i} {...s}/>)}
        </div>
        <div className="sdg-grid reveal">
          {[
            {t:"SDG 12.4",d:"Achieve environmentally sound management of chemicals and wastes throughout their lifecycle."},
            {t:"SDG 12.5",d:"Substantially reduce waste generation through prevention, reduction, recycling, and reuse."},
            {t:"SDG 12.8",d:"Ensure people everywhere have relevant information for sustainable development and lifestyles."},
          ].map((s,i)=>(
            <div key={i} className="card" style={{padding:20,background:T.greenLight,borderColor:"rgba(10,90,46,.15)"}}>
              <div style={{fontSize:11,fontWeight:700,color:T.green,textTransform:"uppercase",letterSpacing:".08em",marginBottom:5}}>{s.t}</div>
              <p style={{fontSize:13,color:T.sub,lineHeight:1.65,margin:0}}>{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AccordionCard = ({emoji,t,sub,front,back,sdg,color}) => {
  const [open,setOpen]=useState(false);
  return (
    <div className="card" style={{overflow:"hidden",borderColor:open?color+"66":T.border}}>
      <button onClick={()=>setOpen(o=>!o)}
        style={{width:"100%",background:"none",border:"none",padding:"18px 16px",display:"flex",alignItems:"flex-start",gap:12,cursor:"pointer",textAlign:"left"}}>
        <span style={{fontSize:22,flexShrink:0}}>{emoji}</span>
        <div style={{minWidth:0}}>
          <div style={{fontSize:10,color,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:3}}>{sub}</div>
          <div style={{fontFamily:F.display,fontWeight:700,fontSize:15,color:T.text,marginBottom:6}}>{t}</div>
          <p style={{fontSize:13,color:T.sub,lineHeight:1.6,margin:0}}>{front}</p>
        </div>
        <span style={{fontSize:18,color:T.muted,flexShrink:0,marginLeft:"auto",transform:open?"rotate(180deg)":"none",transition:"transform .3s"}}>›</span>
      </button>
      {open && (
        <div style={{borderTop:`1px solid ${T.border}`,padding:"16px 16px 16px 52px",background:T.ink}}>
          <div style={{fontSize:10,fontWeight:700,color,textTransform:"uppercase",letterSpacing:".07em",marginBottom:7}}>What to do</div>
          <p style={{fontSize:13,color:"rgba(245,241,232,.85)",lineHeight:1.7,marginBottom:12}}>{back}</p>
          <div style={{fontSize:10,fontWeight:700,color,textTransform:"uppercase",letterSpacing:".07em",marginBottom:4}}>SDG-12 Link</div>
          <p style={{fontSize:12,color:"rgba(245,241,232,.45)",margin:0,lineHeight:1.5}}>{sdg}</p>
        </div>
      )}
    </div>
  );
};

const FlipCard = ({emoji,t,sub,front,back,sdg,color}) => {
  const [flip,setFlip]=useState(false);
  const [tilt,setTilt]=useState({x:0,y:0});
  const move=(e)=>{if(flip)return;const r=e.currentTarget.getBoundingClientRect();setTilt({x:((e.clientY-r.top)/r.height-.5)*8,y:-((e.clientX-r.left)/r.width-.5)*8});};
  return (
    <div onMouseEnter={()=>setFlip(true)} onMouseLeave={()=>{setFlip(false);setTilt({x:0,y:0});}} onMouseMove={move}
      style={{minHeight:220,perspective:"900px",cursor:"pointer"}}>
      <div style={{position:"relative",width:"100%",height:"100%",minHeight:220,transformStyle:"preserve-3d",
        transition:"transform .5s cubic-bezier(.22,1,.36,1)",
        transform:flip?"rotateY(180deg)":`rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`}}>
        <div style={{position:"absolute",inset:0,backfaceVisibility:"hidden",WebkitBackfaceVisibility:"hidden",
          background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:14,padding:22,
          boxShadow:"0 2px 8px rgba(0,0,0,.06)",display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:3,borderRadius:"0 0 14px 14px",background:color,opacity:.7}}/>
          <div style={{fontSize:24,marginBottom:8}}>{emoji}</div>
          <div style={{fontSize:10,color,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:4}}>{sub}</div>
          <div style={{fontFamily:F.display,fontWeight:700,fontSize:15,color:T.text,marginBottom:8}}>{t}</div>
          <p style={{fontSize:13,color:T.sub,lineHeight:1.65,margin:0}}>{front}</p>
        </div>
        <div style={{position:"absolute",inset:0,backfaceVisibility:"hidden",WebkitBackfaceVisibility:"hidden",
          transform:"rotateY(180deg)",background:T.ink,borderRadius:14,padding:22,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div style={{fontSize:10,fontWeight:700,color,textTransform:"uppercase",letterSpacing:".07em",marginBottom:7}}>What to do</div>
          <p style={{fontSize:13,color:"rgba(245,241,232,.85)",lineHeight:1.7,flex:1,marginBottom:12}}>{back}</p>
          <div style={{borderTop:"1px solid rgba(245,241,232,.08)",paddingTop:9}}>
            <div style={{fontSize:10,fontWeight:700,color,textTransform:"uppercase",letterSpacing:".06em",marginBottom:3}}>SDG-12 Link</div>
            <p style={{fontSize:12,color:"rgba(245,241,232,.4)",margin:0,lineHeight:1.5}}>{sdg}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   COMMUNITY
══════════════════════════════════════════════════════════ */
const CommunityPage = ({user,setPage}) => {
  const [tab,setTab]=useState("feed");
  const [submitted,setSubmitted]=useState(false);
  const [form,setForm]=useState({drug:"",desc:"",price:"",category:"PRICE_ANOMALY"});
  useReveal();

  const feed=[
    {region:"West Africa",  type:"Antibiotic",  flag:"Price anomaly",
      detail:"Spike in suspicious amoxicillin batches — 45% below cost band. 12 community reports in 7 days.",
      sdg:"SDG 12.5: Substandard surplus indicates batch diversion.",pts:340,status:"Under review",sc:T.warn},
    {region:"South Asia",   type:"Antimalarial",flag:"Missing chain hop",
      detail:"Artemisinin batches shipped from manufacturer with no QC event recorded before distribution.",
      sdg:"SDG 12.4: Bypassed quality checks risk hazardous exposure.",pts:510,status:"Confirmed",sc:T.danger},
    {region:"East Africa",  type:"Insulin",     flag:"Cold-chain breach",
      detail:"Three reports of insulin arriving warm with no cold-chain log — batch IDs overlap with recalled stock.",
      sdg:"SDG 12.4: Improper storage leads to dangerous waste.",pts:280,status:"Verified",sc:T.green},
    {region:"Latin America",type:"Analgesic",   flag:"Relabelling suspected",
      detail:"Ibuprofen batches with printing inconsistencies — expiry font differs from manufacturer standard.",
      sdg:"SDG 12.8: Mislabelling undermines responsible consumption.",pts:190,status:"Pending",sc:T.muted},
  ];
  const lb=[
    {rank:1,handle:"@rxwatcher_ng",  level:"SDG-12 Champion",pts:4820,role:"REGULATOR"},
    {rank:2,handle:"@pharmadetect",  level:"Investigator",   pts:3640,role:"PROFESSIONAL"},
    {rank:3,handle:"@safedose_ke",   level:"Investigator",   pts:2910,role:"USER"},
    {rank:4,handle:"@medwatch_in",   level:"Watcher",        pts:2100,role:"USER"},
    {rank:5,handle:"@You",           level:user?getLevel(user.points).label:"Observer",pts:user?.points||0,role:user?.role||"USER",hi:true},
  ];

  return (
    <div className="page-top">
      <div className="wrap sec">
        <Tag>Community · Anomaly Hunters</Tag>
        <h1 style={{fontFamily:F.display,fontSize:"clamp(26px,5vw,40px)",fontWeight:700,margin:"16px 0 6px",letterSpacing:"-.02em"}}>The watchdog network</h1>
        <p style={{color:T.sub,marginBottom:28,fontSize:15,lineHeight:1.6,maxWidth:560}}>Report anomalies, track global patterns, earn impact points. No tokens. No NFTs. Just purpose.</p>

        <div style={{display:"flex",gap:8,marginBottom:28,flexWrap:"wrap"}}>
          {["feed","report","leaderboard"].map(tb=>(
            <button key={tb} onClick={()=>setTab(tb)} className="rip"
              style={{fontFamily:F.body,fontSize:13,padding:"8px 16px",borderRadius:100,
                border:`1.5px solid ${tab===tb?T.green:T.border}`,background:tab===tb?T.greenDim:"transparent",
                color:tab===tb?T.green:T.sub,cursor:"pointer",fontWeight:tab===tb?600:400,transition:"all .18s"}}>
              {{feed:"Global Feed",report:"Report Anomaly",leaderboard:"Leaderboard"}[tb]}
            </button>
          ))}
        </div>

        {tab==="feed" && (
          <div className="stagger">
            {feed.map((f,i)=>(
              <div key={i} className="card" style={{padding:"clamp(16px,3vw,22px)",marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10,gap:8,flexWrap:"wrap"}}>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    <Tag>{f.region}</Tag>
                    <Tag color={T.amberDim} text={T.amber}>{f.type}</Tag>
                    <Tag color={T.warnDim} text={T.warn}>{f.flag}</Tag>
                  </div>
                  <span style={{fontSize:12,color:f.sc,fontWeight:600,display:"flex",alignItems:"center",gap:4,whiteSpace:"nowrap"}}>
                    <span style={{display:"inline-block",width:7,height:7,borderRadius:"50%",background:f.sc,animation:f.status==="Confirmed"?"statusPulse 2s ease-in-out infinite":"none"}}/>
                    {f.status}
                  </span>
                </div>
                <p style={{fontSize:14,color:T.text,lineHeight:1.65,margin:"0 0 10px"}}>{f.detail}</p>
                <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:6}}>
                  <span style={{fontSize:12,color:T.green}}>{f.sdg}</span>
                  <span style={{fontSize:12,color:T.muted}}>{f.pts} pts contributed</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab==="report" && !submitted && (
          <div className="card" style={{padding:"clamp(20px,4vw,32px)",maxWidth:560}}>
            {!user && (
              <div style={{background:T.amberLight,border:`1px solid rgba(180,83,9,.2)`,borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:13,color:T.amber}}>
                Sign in to earn +50 Observer points for your report. <button onClick={()=>setPage("Login")} style={{background:"none",border:"none",color:T.amber,fontWeight:700,cursor:"pointer",fontSize:13,textDecoration:"underline"}}>Sign in →</button>
              </div>
            )}
            <h3 style={{fontFamily:F.display,fontSize:22,fontWeight:700,marginTop:0,marginBottom:20}}>Submit an anomaly</h3>
            <div className="comm-form">
              <label style={{fontSize:12,color:T.sub,fontWeight:600,textTransform:"uppercase",letterSpacing:".06em"}}>
                Category
                <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={inp}>
                  <option value="PRICE_ANOMALY">Price Anomaly</option>
                  <option value="MISSING_HOP">Missing Chain Hop</option>
                  <option value="PACKAGING">Packaging Irregularity</option>
                  <option value="COLD_CHAIN">Cold Chain Breach</option>
                  <option value="FAKE_QR">Fake QR / Barcode</option>
                  <option value="OTHER">Other</option>
                </select>
              </label>
              <label style={{fontSize:12,color:T.sub,fontWeight:600,textTransform:"uppercase",letterSpacing:".06em"}}>
                Drug / Batch ID
                <input value={form.drug} onChange={e=>setForm({...form,drug:e.target.value})} placeholder="e.g. Amoxicillin · AM-2024-04471" style={inp}/>
              </label>
              <label style={{fontSize:12,color:T.sub,fontWeight:600,textTransform:"uppercase",letterSpacing:".06em"}}>
                Reported price (optional)
                <input value={form.price} onChange={e=>setForm({...form,price:e.target.value})} placeholder="e.g. $0.30 per capsule" style={inp}/>
              </label>
              <label style={{fontSize:12,color:T.sub,fontWeight:600,textTransform:"uppercase",letterSpacing:".06em"}}>
                Describe the anomaly
                <textarea value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})} rows={4}
                  placeholder="What seemed wrong? Price, packaging, route, expiry, QR code…" style={{...inp,resize:"vertical"}}/>
              </label>
              <p style={{fontSize:12,color:T.muted,lineHeight:1.5}}>Your identity is never published. Reports are anonymised before appearing in the public feed.</p>
              <Btn onClick={()=>setSubmitted(true)} style={{justifyContent:"center",padding:12}}>Submit to AI pre-screen →</Btn>
            </div>
          </div>
        )}

        {tab==="report" && submitted && (
          <div className="card" style={{padding:"clamp(28px,5vw,48px)",textAlign:"center",maxWidth:460,background:T.greenLight,borderColor:"rgba(10,90,46,.25)"}}>
            <div style={{fontSize:40,marginBottom:12,color:T.green}}>✓</div>
            <h3 style={{fontFamily:F.display,fontSize:22,fontWeight:700,color:T.green,marginBottom:8}}>Report submitted</h3>
            <p style={{color:T.sub,fontSize:14,lineHeight:1.65}}>
              AI pre-screen running. A regulator will review within 48 hours.{user&&<> You earned <strong style={{color:T.text}}>+50 Observer points</strong>.</>}
            </p>
            <Btn variant="ghost" onClick={()=>{setSubmitted(false);setForm({drug:"",desc:"",price:"",category:"PRICE_ANOMALY"});}} style={{marginTop:18}}>Submit another</Btn>
          </div>
        )}

        {tab==="leaderboard" && (
          <div className="stagger">
            <div className="lb-row" style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:".06em",paddingBottom:8}}>
              <span>#</span><span>Hunter</span><span>Level</span>
              <span className="lb-pts-d" style={{textAlign:"right"}}>Points</span>
            </div>
            {lb.map((u,i)=>(
              <div key={i} className="lb-row"
                style={{background:u.hi?T.greenLight:i%2===0?T.surface:T.bg,border:u.hi?`1.5px solid rgba(10,90,46,.25)`:"1px solid transparent"}}>
                <span style={{fontFamily:F.display,fontSize:17,color:u.rank<=3?T.green:T.muted}}>{u.rank}</span>
                <div style={{minWidth:0}}>
                  <div style={{fontWeight:600,fontSize:14,color:u.hi?T.green:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.handle}</div>
                  <RoleBadge role={u.role}/>
                </div>
                <span style={{fontSize:13,color:T.sub,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.level}</span>
                <span className="lb-pts-d" style={{textAlign:"right",fontFamily:F.display,fontSize:17,color:u.hi?T.green:T.text}}>{u.pts.toLocaleString()}</span>
              </div>
            ))}
            <div style={{marginTop:16,padding:"14px 16px",background:T.ink,borderRadius:8,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
              <span style={{fontSize:13,color:"rgba(245,241,232,.5)"}}>Observer → Watcher → Investigator → SDG-12 Champion</span>
              <span style={{fontSize:12,color:T.greenMid}}>No financial rewards · Impact only</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   DRUGS
══════════════════════════════════════════════════════════ */
const DrugsPage = () => {
  useReveal();
  const [selected,setSelected]=useState(null);
  const [search,setSearch]=useState("");
  const drugs=[
    {name:"Amoxicillin",            class:"Antibiotic",         type:"Penicillin-class",          cost:"Low",   ban:"Allowed",                banC:T.green,costC:T.green,
      eff:"First-line treatment for bacterial infections; effectiveness depends on regional resistance patterns.",
      choice:"Choose generic. Confirm prescription. Dispose unused supply via pharmacy take-back."},
    {name:"Artemether-Lumefantrine",class:"Antimalarial",       type:"Combination ACT therapy",   cost:"Medium",ban:"Restricted",             banC:T.warn, costC:T.warn,
      eff:"WHO-recommended first-line ACT for uncomplicated malaria — must be taken as a full course.",
      choice:"Verify batch on ClearDose before use. Never buy unsealed. Complete full course to prevent resistance."},
    {name:"Ibuprofen",              class:"Analgesic / NSAID",  type:"Non-steroidal anti-inflammatory",cost:"Low",ban:"Allowed",              banC:T.green,costC:T.green,
      eff:"Effective for mild-to-moderate pain and fever. Short-term use recommended; gastric risk with prolonged use.",
      choice:"Lowest effective dose. Do not combine with other NSAIDs. Dispose via pharmacy, not household waste."},
    {name:"Metformin",              class:"Antidiabetic",       type:"Biguanide",                  cost:"Low",   ban:"Allowed",                banC:T.green,costC:T.green,
      eff:"First-line oral medication for type 2 diabetes; well-established safety profile over decades.",
      choice:"Generic is equivalent to branded. Keep at consistent temperature. Never share prescriptions."},
    {name:"Ciprofloxacin",          class:"Antibiotic",         type:"Fluoroquinolone",            cost:"Medium",ban:"Restricted (paediatric)",banC:T.warn, costC:T.warn,
      eff:"Broad-spectrum antibiotic; effective against many gram-negative bacteria. Rising resistance in some regions.",
      choice:"Only use with confirmed prescription. Completing full course is critical for resistance prevention."},
    {name:"Oxytocin",               class:"Uterotonic",         type:"Hormone (synthetic)",        cost:"Low",   ban:"Controlled",             banC:T.amber,costC:T.green,
      eff:"Essential for preventing postpartum haemorrhage; highly temperature-sensitive, cold-chain dependent.",
      choice:"Cold-chain verification is critical. Verify batch provenance before clinical use."},
  ];
  const filtered=drugs.filter(d=>d.name.toLowerCase().includes(search.toLowerCase())||d.class.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page-top">
      <div className="wrap sec">
        <Tag>Drug Knowledge · Generics Only</Tag>
        <h1 style={{fontFamily:F.display,fontSize:"clamp(26px,5vw,40px)",fontWeight:700,margin:"16px 0 6px",letterSpacing:"-.02em"}}>Generic drug profiles</h1>
        <p style={{color:T.sub,fontSize:15,marginBottom:6,lineHeight:1.6}}>Generic names and classes only. No brands, no marketing. Tap a card to expand.</p>
        <p style={{color:T.warn,fontSize:12,marginBottom:24}}>⚠ Educational reference only. Always consult a healthcare professional.</p>

        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or class…"
          style={{...inp,maxWidth:360,marginBottom:24}}/>

        <div className="drug-grid stagger">
          {filtered.map((d,i)=>{
            const active=selected?.name===d.name;
            return (
              <div key={i} onClick={()=>setSelected(active?null:d)} className="card"
                style={{background:active?T.greenLight:T.surface,borderColor:active?"rgba(10,90,46,.3)":T.border,padding:"clamp(14px,2.5vw,20px)",cursor:"pointer",transition:"all .2s"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:10,flexWrap:"wrap",gap:6}}>
                  <Tag color={d.costC===T.green?T.greenDim:T.warnDim} text={d.costC}>{d.cost} cost</Tag>
                  <Tag color="rgba(0,0,0,.05)" text={d.banC}>{d.ban}</Tag>
                </div>
                <h3 style={{fontFamily:F.display,fontSize:"clamp(14px,2vw,16px)",fontWeight:700,margin:"0 0 3px",color:active?T.green:T.text,wordBreak:"break-word"}}>{d.name}</h3>
                <div style={{fontSize:12,color:T.muted,lineHeight:1.4}}>{d.class}</div>
              </div>
            );
          })}
        </div>

        {selected && (
          <div className="card" style={{marginTop:20,padding:"clamp(20px,4vw,32px)",borderColor:"rgba(10,90,46,.2)",animation:"fadeUp .3s both"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18,gap:12}}>
              <div style={{minWidth:0}}>
                <h2 style={{fontFamily:F.display,fontSize:"clamp(20px,4vw,26px)",fontWeight:700,marginBottom:4,letterSpacing:"-.02em",wordBreak:"break-word"}}>{selected.name}</h2>
                <div style={{color:T.sub,fontSize:13}}>{selected.class} · {selected.type}</div>
              </div>
              <button onClick={()=>setSelected(null)}
                style={{background:T.bgDeep,border:`1px solid ${T.border}`,color:T.sub,width:28,height:28,borderRadius:"50%",cursor:"pointer",fontSize:14,flexShrink:0}}>✕</button>
            </div>
            <div className="grid-2" style={{gap:20}}>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:".07em",marginBottom:7}}>Effectiveness</div>
                <p style={{fontSize:14,color:T.text,lineHeight:1.65,margin:0}}>{selected.eff}</p>
              </div>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:T.green,textTransform:"uppercase",letterSpacing:".07em",marginBottom:7}}>Responsible Choice</div>
                <p style={{fontSize:14,color:T.text,lineHeight:1.65,margin:0}}>{selected.choice}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   LEARN
══════════════════════════════════════════════════════════ */
const LearnPage = () => {
  const [qIdx,setQIdx]=useState(0); const [answered,setAnswered]=useState(null);
  const [score,setScore]=useState(0); const [done,setDone]=useState(false);
  useReveal();
  const modules=[
    {icon:"🛒",t:"Buy Responsibly",d:"Always buy with a prescription. Use registered pharmacies. Check batch IDs on ClearDose. Avoid deals that seem too good to be true."},
    {icon:"💊",t:"Use Correctly",   d:"Complete the full prescribed course. Never self-medicate with leftover antibiotics. Store per label instructions — especially temperature-sensitive medicines."},
    {icon:"♻️",t:"Dispose Safely", d:"Never flush medicines or bin them unsorted. Use pharmacy take-back programmes. Improper disposal contaminates water and soil — SDG 12.4."},
  ];
  const quiz=[
    {q:"What is the first step before buying medicine online?",opts:["Check the price","Verify it's a licensed pharmacy","Read reviews","Compare brands"],correct:1},
    {q:"Which SDG target covers sound management of chemicals & waste?",opts:["SDG 12.1","SDG 12.4","SDG 12.8","SDG 12.2"],correct:1},
    {q:"What should you do with unused medicines?",opts:["Flush them","Give to a neighbour","Use a pharmacy take-back","Leave in a drawer"],correct:2},
    {q:"A counterfeit drug with wrong active ingredient primarily violates:",opts:["SDG 3 only","SDG 12 — unsustainable production","SDG 7 — energy","None of the above"],correct:1},
  ];
  const progress=((qIdx+(answered!==null?1:0))/quiz.length)*100;
  const handle=(i)=>{if(answered!==null)return;setAnswered(i);if(i===quiz[qIdx].correct)setScore(s=>s+1);};
  const next=()=>{if(qIdx<quiz.length-1){setQIdx(q=>q+1);setAnswered(null);}else setDone(true);};

  return (
    <div className="page-top">
      <div className="wrap-sm sec">
        <Tag>SDG-12 Education</Tag>
        <h1 style={{fontFamily:F.display,fontSize:"clamp(26px,5vw,40px)",fontWeight:700,margin:"16px 0 6px",letterSpacing:"-.02em"}}>Responsible medicines</h1>
        <p style={{color:T.sub,fontSize:15,marginBottom:40,lineHeight:1.6}}>Three modules, one quiz. The SDG-12 framework applied to everyday medicine decisions.</p>

        <div className="grid-3 reveal" style={{marginBottom:44}}>
          {modules.map((m,i)=>(
            <div key={i} className="card" style={{padding:"clamp(18px,3vw,24px)"}}>
              <div style={{fontSize:26,marginBottom:10}}>{m.icon}</div>
              <h3 style={{fontFamily:F.display,fontWeight:700,fontSize:15,margin:"0 0 8px",color:T.text}}>{m.t}</h3>
              <p style={{fontSize:13,color:T.sub,lineHeight:1.65,margin:0}}>{m.d}</p>
            </div>
          ))}
        </div>

        <div className="card" style={{padding:"clamp(20px,4vw,36px)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <h3 style={{fontFamily:F.display,fontWeight:700,margin:0,fontSize:20}}>SDG-12 Quiz</h3>
            <span style={{fontSize:13,color:T.muted}}>Q{Math.min(qIdx+1,quiz.length)}/{quiz.length}</span>
          </div>
          <div style={{background:T.border,height:4,borderRadius:100,marginBottom:24,overflow:"hidden"}}>
            <div style={{background:`linear-gradient(90deg,${T.green},${T.greenMid})`,height:"100%",width:`${progress}%`,transition:"width .45s cubic-bezier(.22,1,.36,1)",borderRadius:100}}/>
          </div>
          {!done?(
            <>
              <p style={{fontWeight:500,fontSize:"clamp(14px,2.5vw,16px)",color:T.text,marginBottom:18,lineHeight:1.55}}>{quiz[qIdx].q}</p>
              <div className="quiz-opts">
                {quiz[qIdx].opts.map((o,i)=>{
                  let bg=T.bg,border=T.border,color=T.text;
                  if(answered!==null){
                    if(i===quiz[qIdx].correct){bg=T.safeLight;border=T.green;color=T.green;}
                    else if(i===answered){bg=T.dangerLight;border=T.danger;color=T.danger;}
                    else{color=T.muted;}
                  }
                  return <button key={i} onClick={()=>handle(i)} style={{background:bg,border:`1.5px solid ${border}`,borderRadius:8,padding:"11px 14px",textAlign:"left",fontSize:14,color,cursor:answered===null?"pointer":"default",fontFamily:F.body,transition:"all .2s",width:"100%"}}>{o}</button>;
                })}
              </div>
              {answered!==null && <Btn onClick={next}>{qIdx<quiz.length-1?"Next question →":"See results →"}</Btn>}
            </>
          ):(
            <div style={{textAlign:"center",padding:"16px 0"}}>
              <div style={{fontFamily:F.display,fontSize:"clamp(48px,10vw,64px)",fontWeight:700,color:T.green,marginBottom:8}}>{score}/{quiz.length}</div>
              <h3 style={{fontFamily:F.display,fontSize:"clamp(16px,3vw,22px)",fontWeight:700,color:T.text,marginBottom:8}}>
                {score===quiz.length?"Perfect. SDG-12 Champion material.":score>=2?"Strong understanding. Keep going.":"Good start — review the modules above."}
              </h3>
              <p style={{color:T.sub,fontSize:14,marginBottom:22}}>You earned <strong style={{color:T.green}}>+{score*25} SDG-12 learning points</strong></p>
              <Btn variant="ghost" onClick={()=>{setQIdx(0);setScore(0);setAnswered(null);setDone(false);}}>Retake quiz</Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   PROFILE PAGE
══════════════════════════════════════════════════════════ */
const ProfilePage = ({user, setPage}) => {
  useReveal();
  if(!user) return (
    <div className="page-top" style={{minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
      <div style={{fontFamily:F.display,fontSize:22,color:T.sub}}>Sign in to view your profile</div>
      <Btn onClick={()=>setPage("Login")}>Sign in →</Btn>
    </div>
  );

  const level=getLevel(user.points);
  const nextLevel=LEVEL_THRESHOLDS.find(l=>l.min>user.points)||LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length-1];
  const pct=nextLevel.min>level.min ? Math.min(100,((user.points-level.min)/(nextLevel.min-level.min))*100) : 100;

  const activity=[
    {action:"Verified batch AM-2024-04471",pts:"+10",time:"2h ago",icon:"◎"},
    {action:"Anomaly report submitted",    pts:"+50",time:"1d ago",icon:"◈"},
    {action:"Quiz completed (3/4)",        pts:"+75",time:"3d ago",icon:"◇"},
    {action:"Joined ClearDose",            pts:"+0", time:"7d ago",icon:"✦"},
  ];

  return (
    <div className="page-top">
      <div className="wrap sec">
        <div className="stagger">
          {/* Profile hero */}
          <div className="card" style={{padding:"clamp(24px,4vw,40px)",marginBottom:20,background:T.ink,border:"none"}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:20,flexWrap:"wrap"}}>
              <Avatar initials={user.avatar} role={user.role} size={64}/>
              <div style={{flex:1,minWidth:160}}>
                <div style={{fontFamily:F.display,fontSize:"clamp(20px,4vw,28px)",fontWeight:700,color:"rgba(245,241,232,.95)",marginBottom:4}}>{user.name}</div>
                <div style={{fontSize:14,color:"rgba(245,241,232,.4)",marginBottom:10}}>{user.email}</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                  <RoleBadge role={user.role}/>
                  <span className="badge" style={{background:"rgba(26,140,82,.18)",color:T.greenMid}}>{level.icon} {level.label}</span>
                </div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontFamily:F.display,fontSize:"clamp(32px,6vw,48px)",fontWeight:700,color:T.greenMid,lineHeight:1}}>{user.points.toLocaleString()}</div>
                <div style={{fontSize:12,color:"rgba(245,241,232,.35)",marginTop:2}}>impact points</div>
              </div>
            </div>
            <div style={{marginTop:20}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:12,color:"rgba(245,241,232,.4)"}}>Progress to {nextLevel.label}</span>
                <span style={{fontSize:12,color:T.greenMid}}>{Math.round(pct)}%</span>
              </div>
              <div style={{background:"rgba(255,255,255,.08)",borderRadius:100,height:6,overflow:"hidden"}}>
                <div style={{background:`linear-gradient(90deg,${T.green},${T.greenMid})`,height:"100%",width:`${pct}%`,transition:"width .8s",borderRadius:100}}/>
              </div>
              {nextLevel.min>level.min && <div style={{fontSize:11,color:"rgba(245,241,232,.3)",marginTop:4}}>{(nextLevel.min-user.points).toLocaleString()} pts to {nextLevel.label}</div>}
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid-4" style={{marginBottom:20}}>
            {[
              {n:"12",   l:"Batches verified",  c:T.green},
              {n:"3",    l:"Anomalies reported", c:T.warn},
              {n:"1",    l:"Confirmed reports",  c:T.danger},
              {n:"Level",l:level.label,          c:T.greenMid,big:level.icon},
            ].map((s,i)=>(
              <div key={i} className="card" style={{padding:"clamp(16px,3vw,24px)",textAlign:"center"}}>
                <div style={{fontFamily:F.display,fontSize:s.big?"22px":"clamp(24px,4vw,32px)",fontWeight:700,color:s.c,marginBottom:4}}>{s.big||s.n}</div>
                {s.big && <div style={{fontFamily:F.display,fontSize:22,fontWeight:700,color:s.c,marginBottom:4}}>{s.n}</div>}
                <div style={{fontSize:12,color:T.muted}}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Activity feed */}
          <div className="card" style={{padding:"clamp(20px,3vw,28px)"}}>
            <h3 style={{fontFamily:F.display,fontSize:18,fontWeight:700,marginBottom:16}}>Recent activity</h3>
            {activity.map((a,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 0",borderBottom:i<activity.length-1?`1px solid ${T.border}`:"none"}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:T.greenDim,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:T.green,flexShrink:0}}>{a.icon}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.action}</div>
                  <div style={{fontSize:12,color:T.muted}}>{a.time}</div>
                </div>
                <div style={{fontSize:13,fontWeight:700,color:T.green,flexShrink:0}}>{a.pts}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   SDG METRICS DASHBOARD
══════════════════════════════════════════════════════════ */
const SDGMetricsPage = () => {
  useReveal();
  const kpis=[
    {n:"2,847", l:"Batches verified this month",  sub:"+18% vs last month",  c:T.green, icon:"◎"},
    {n:"347",   l:"Anomaly reports submitted",     sub:"34 confirmed, 12 rejected", c:T.warn, icon:"◈"},
    {n:"12,910",l:"SDG-12 quiz completions",       sub:"890 this week",       c:T.greenMid,icon:"◇"},
    {n:"89",    l:"Counterfeit batches flagged",    sub:"SDG 12.4 impact",     c:T.danger, icon:"⬡"},
  ];
  const targets=[
    {key:"SDG 12.4",label:"Chemical & waste management",val:62,color:T.green,
      detail:"62% of flagged batches had unsafe disposal implications tracked and reported to authorities."},
    {key:"SDG 12.5",label:"Waste reduction",            val:48,color:T.amber,
      detail:"Estimated 48% reduction in repeat counterfeit batch circulation via community watch reports."},
    {key:"SDG 12.8",label:"Informed consumption",       val:78,color:T.greenMid,
      detail:"78% of surveyed users report improved medicine-buying decisions after using ClearDose."},
  ];
  const trend=[
    {month:"Oct",verified:1200,flagged:32},{month:"Nov",verified:1800,flagged:51},{month:"Dec",verified:2100,flagged:67},
    {month:"Jan",verified:2400,flagged:74},{month:"Feb",verified:2650,flagged:81},{month:"Mar",verified:2847,flagged:89},
  ];
  const maxV=Math.max(...trend.map(t=>t.verified));

  return (
    <div className="page-top">
      <div className="wrap sec">
        <Tag>Platform Analytics · SDG-12</Tag>
        <h1 style={{fontFamily:F.display,fontSize:"clamp(26px,5vw,40px)",fontWeight:700,margin:"16px 0 6px",letterSpacing:"-.02em"}}>SDG-12 Impact Metrics</h1>
        <p style={{color:T.sub,fontSize:15,marginBottom:36,lineHeight:1.6,maxWidth:560}}>Live platform stats mapping ClearDose activity to UN Sustainable Development Goal 12 targets.</p>

        <div className="grid-4 stagger" style={{marginBottom:32}}>
          {kpis.map((k,i)=>(
            <div key={i} className="card" style={{padding:"clamp(16px,3vw,24px)"}}>
              <div style={{fontSize:18,color:k.c,marginBottom:8}}>{k.icon}</div>
              <div style={{fontFamily:F.display,fontSize:"clamp(22px,4vw,30px)",fontWeight:700,color:k.c,lineHeight:1,marginBottom:4}}>{k.n}</div>
              <div style={{fontSize:13,color:T.text,marginBottom:4,lineHeight:1.4}}>{k.l}</div>
              <div style={{fontSize:11,color:T.muted}}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* SDG progress bars */}
        <div className="card reveal" style={{padding:"clamp(20px,4vw,32px)",marginBottom:24}}>
          <h3 style={{fontFamily:F.display,fontSize:20,fontWeight:700,marginBottom:20}}>SDG-12 Target Progress</h3>
          {targets.map((t,i)=>(
            <div key={i} style={{marginBottom:i<targets.length-1?24:0}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:8}}>
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:".07em",marginBottom:2}}>{t.key}</div>
                  <div style={{fontSize:14,fontWeight:500,color:T.text}}>{t.label}</div>
                </div>
                <div style={{fontFamily:F.display,fontSize:24,fontWeight:700,color:t.color}}>{t.val}%</div>
              </div>
              <div className="sdg-meter-bar">
                <div className="sdg-meter-fill" style={{width:`${t.val}%`,background:`linear-gradient(90deg,${t.color}88,${t.color})`}}/>
              </div>
              <p style={{fontSize:12,color:T.muted,lineHeight:1.5,marginTop:6}}>{t.detail}</p>
            </div>
          ))}
        </div>

        {/* Mini trend chart */}
        <div className="card reveal" style={{padding:"clamp(20px,4vw,32px)"}}>
          <h3 style={{fontFamily:F.display,fontSize:20,fontWeight:700,marginBottom:20}}>Verification trend (6 months)</h3>
          <div style={{display:"flex",alignItems:"flex-end",gap:"clamp(6px,2vw,16px)",height:120}}>
            {trend.map((t,i)=>(
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <div style={{width:"100%",display:"flex",flexDirection:"column",alignItems:"center",gap:3,justifyContent:"flex-end",height:100}}>
                  <div style={{width:"100%",background:T.green,borderRadius:"4px 4px 0 0",height:`${(t.verified/maxV)*90}px`,transition:"height .8s cubic-bezier(.22,1,.36,1)",minHeight:4,position:"relative"}}>
                    <div style={{width:"100%",background:T.danger,borderRadius:"4px 4px 0 0",height:`${Math.min((t.flagged/t.verified)*100,100)}%`,position:"absolute",bottom:0,opacity:.6}}/>
                  </div>
                </div>
                <div style={{fontSize:10,color:T.muted,whiteSpace:"nowrap"}}>{t.month}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:16,marginTop:12,flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:T.sub}}><div style={{width:10,height:10,borderRadius:2,background:T.green}}/> Verified</div>
            <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:T.sub}}><div style={{width:10,height:10,borderRadius:2,background:T.danger,opacity:.6}}/> Flagged (% of verified)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   REGULATOR DASHBOARD
══════════════════════════════════════════════════════════ */
const MOCK_ANOMALIES = [
  {id:"A001",drug:"Amoxicillin 500mg",batch:"AM-2024-04471",region:"West Africa",category:"Price Anomaly",status:"SUBMITTED",aiScore:0.74,reporter:"@alice_ng",date:"2026-03-07",desc:"Sold at $0.08/capsule — 61% below cost band. Verified 3 batches from same supplier."},
  {id:"A002",drug:"Artemether-Lum.",  batch:"AL-2024-00821",region:"East Africa", category:"Missing Hop",  status:"UNDER_REVIEW",aiScore:0.88,reporter:"@pharmawatch",date:"2026-03-06",desc:"No QC event recorded between manufacturer and distributor. Cold-chain also unverified."},
  {id:"A003",drug:"Insulin Glargine", batch:"IG-2024-01134",region:"South Asia",   category:"Cold-Chain",  status:"CONFIRMED",aiScore:0.91,reporter:"@meddetect_in",date:"2026-03-05",desc:"Arrived warm, no cold-chain log. Batch overlaps with recalled stock from Dec 2023."},
  {id:"A004",drug:"Ibuprofen 400mg",  batch:"IB-2024-07821",region:"Latin America",category:"Relabelling", status:"SUBMITTED",aiScore:0.56,reporter:"@safemedBR",date:"2026-03-04",desc:"Expiry font differs from manufacturer standard. Possible relabelling from 2022 stock."},
  {id:"A005",drug:"Ciprofloxacin",    batch:"CP-2024-03312",region:"South East Asia",category:"Fake QR",   status:"REJECTED", aiScore:0.31,reporter:"@vigilante_id",date:"2026-03-03",desc:"QR code leads to a non-blockchain page. However, batch confirmed legitimate via BPOM check."},
];

const STATUS_META = {
  SUBMITTED:    {label:"Submitted",   color:T.muted,   bg:T.bgDeep},
  UNDER_REVIEW: {label:"Under Review",color:T.amber,   bg:T.amberLight},
  CONFIRMED:    {label:"Confirmed",   color:T.danger,  bg:T.dangerLight},
  REJECTED:     {label:"Rejected",    color:T.muted,   bg:T.bgDeep},
};

const RegulatorPage = ({user, setPage}) => {
  const [anomalies, setAnomalies] = useState(MOCK_ANOMALIES);
  const [selected, setSelected] = useState(null);
  const [decision, setDecision] = useState("");
  const [note, setNote] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [tab, setTab] = useState("anomalies");
  useReveal();

  if(!user || (user.role!=="REGULATOR" && !isAdmin(user))) return (
    <div className="page-top" style={{minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,padding:"80px 20px"}}>
      <div style={{fontFamily:F.display,fontSize:22,color:T.sub,textAlign:"center"}}>Regulator access required</div>
      <p style={{color:T.muted,fontSize:14,textAlign:"center",maxWidth:320}}>This dashboard is for REGULATOR and ADMIN roles only. Sign in with a qualifying account.</p>
      <Btn onClick={()=>setPage("Login")}>Sign in →</Btn>
    </div>
  );

  const filtered = filter==="ALL" ? anomalies : anomalies.filter(a=>a.status===filter);

  const updateStatus = (id, newStatus) => {
    setAnomalies(prev => prev.map(a => a.id===id ? {...a, status:newStatus, regulatorNote:note, reviewedBy:user.name} : a));
    setSelected(null); setNote("");
  };

  const stats = [
    {n:anomalies.filter(a=>a.status==="SUBMITTED").length,    l:"Pending Review",  c:T.muted},
    {n:anomalies.filter(a=>a.status==="UNDER_REVIEW").length, l:"Under Review",    c:T.amber},
    {n:anomalies.filter(a=>a.status==="CONFIRMED").length,    l:"Confirmed Threats",c:T.danger},
    {n:anomalies.filter(a=>a.status==="REJECTED").length,     l:"Rejected",        c:T.green},
  ];

  return (
    <div className="page-top">
      <div className="wrap sec">
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:6,flexWrap:"wrap"}}>
          <Tag color={T.dangerDim} text={T.danger}>Regulator Access</Tag>
          <RoleBadge role={user.role}/>
        </div>
        <h1 style={{fontFamily:F.display,fontSize:"clamp(24px,5vw,38px)",fontWeight:700,margin:"12px 0 6px",letterSpacing:"-.02em"}}>Regulator Dashboard</h1>
        <p style={{color:T.sub,fontSize:15,marginBottom:28,lineHeight:1.6}}>Review community anomaly reports, issue decisions, and track confirmed counterfeit threats.</p>

        <div className="grid-4 stagger" style={{marginBottom:28}}>
          {stats.map((s,i)=>(
            <div key={i} className="card" style={{padding:"clamp(14px,2.5vw,22px)",textAlign:"center"}}>
              <div style={{fontFamily:F.display,fontSize:"clamp(26px,5vw,36px)",fontWeight:700,color:s.c,marginBottom:4}}>{s.n}</div>
              <div style={{fontSize:12,color:T.muted}}>{s.l}</div>
            </div>
          ))}
        </div>

        <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
          {["ALL","SUBMITTED","UNDER_REVIEW","CONFIRMED","REJECTED"].map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              style={{padding:"7px 14px",borderRadius:100,border:`1.5px solid ${filter===f?T.danger:T.border}`,background:filter===f?T.dangerDim:"transparent",
                color:filter===f?T.danger:T.sub,fontSize:12,fontWeight:filter===f?700:400,cursor:"pointer",transition:"all .18s"}}>
              {f==="ALL"?"All":STATUS_META[f]?.label||f}
            </button>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:selected?"1fr":"1fr",gap:12}}>
          {filtered.map(a=>{
            const sm=STATUS_META[a.status]||STATUS_META.SUBMITTED;
            const isSelected=selected?.id===a.id;
            return (
              <div key={a.id} className="card"
                style={{padding:"clamp(16px,2.5vw,22px)",cursor:"pointer",borderColor:isSelected?T.danger:T.border,transition:"all .2s"}}
                onClick={()=>setSelected(isSelected?null:a)}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,flexWrap:"wrap",marginBottom:10}}>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                    <span style={{fontFamily:F.mono,fontSize:12,color:T.muted,fontWeight:600}}>{a.id}</span>
                    <Tag>{a.region}</Tag>
                    <Tag color={T.amberDim} text={T.amber}>{a.category}</Tag>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                    <span style={{fontSize:11,color:T.muted}}>{a.date}</span>
                    <span className="badge" style={{background:sm.bg,color:sm.color}}>{sm.label}</span>
                    <span style={{fontSize:12,fontWeight:700,color:a.aiScore>=.7?T.danger:a.aiScore>=.5?T.warn:T.green}}>AI: {Math.round(a.aiScore*100)}%</span>
                  </div>
                </div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:8}}>
                  <div style={{fontSize:14,fontWeight:600,color:T.text}}>{a.drug}</div>
                  <div style={{fontFamily:F.mono,fontSize:12,color:T.muted}}>·  {a.batch}</div>
                </div>
                <p style={{fontSize:13,color:T.sub,lineHeight:1.6,margin:0}}>{a.desc}</p>

                {isSelected && a.status!=="CONFIRMED" && a.status!=="REJECTED" && (
                  <div style={{marginTop:16,borderTop:`1px solid ${T.border}`,paddingTop:16}} onClick={e=>e.stopPropagation()}>
                    <div style={{fontSize:12,color:T.sub,fontWeight:600,textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>Your decision</div>
                    <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
                      {["UNDER_REVIEW","CONFIRMED","REJECTED"].map(s=>(
                        <button key={s} onClick={()=>setDecision(s)}
                          style={{padding:"7px 14px",borderRadius:8,border:`1.5px solid ${decision===s?T.danger:T.border}`,
                            background:decision===s?T.dangerDim:"transparent",color:decision===s?T.danger:T.sub,
                            fontSize:12,fontWeight:600,cursor:"pointer",transition:"all .18s"}}>
                          {STATUS_META[s]?.label||s}
                        </button>
                      ))}
                    </div>
                    <textarea value={note} onChange={e=>setNote(e.target.value)} rows={3} placeholder="Regulator note (optional — visible to other regulators only)…"
                      style={{...inp,resize:"vertical",marginBottom:12}}/>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      <Btn onClick={()=>updateStatus(a.id,decision||"UNDER_REVIEW")} variant={decision==="CONFIRMED"?"danger":decision==="REJECTED"?"dim":"amber"}>
                        {decision==="CONFIRMED"?"Confirm threat ⚠":decision==="REJECTED"?"Reject report":"Mark under review"}
                      </Btn>
                      <Btn variant="ghost" onClick={()=>setSelected(null)}>Cancel</Btn>
                    </div>
                  </div>
                )}
                {isSelected && (a.status==="CONFIRMED"||a.status==="REJECTED") && (
                  <div style={{marginTop:12,padding:"10px 14px",background:T.bgDeep,borderRadius:8,fontSize:13,color:T.muted}}>
                    Decision recorded. Status: <strong style={{color:sm.color}}>{sm.label}</strong>
                    {a.reviewedBy && <> · Reviewed by: <strong>{a.reviewedBy}</strong></>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   ADMIN DASHBOARD
══════════════════════════════════════════════════════════ */
const MOCK_AUDIT = [
  {id:1,user:"alice@gmail.com",   action:"LOGIN",         ip:"41.203.x.x",  time:"2m ago",   meta:"Success"},
  {id:2,user:"priya@clinic.org",  action:"REGULATOR_DECISION",ip:"103.22.x.x",time:"14m ago", meta:"A002 → UNDER_REVIEW"},
  {id:3,user:"pharma@seal.ng",    action:"ANOMALY_SUBMIT", ip:"197.211.x.x", time:"1h ago",   meta:"A004 submitted"},
  {id:4,user:"alice@gmail.com",   action:"AI_VERIFY",      ip:"41.203.x.x",  time:"2h ago",   meta:"AM-2024-04471 · CAUTION"},
  {id:5,user:"unknown",           action:"LOGIN",          ip:"185.x.x.x",   time:"3h ago",   meta:"FAILED — 5 attempts"},
  {id:6,user:"tejas@cleardose.org",action:"ADMIN_ROLE_CHANGE",ip:"122.x.x.x",time:"1d ago",  meta:"priya → REGULATOR"},
];

const AdminPage = ({user, setPage}) => {
  const [users, setUsers] = useState([...MOCK_USERS]);
  const [auditSearch, setAuditSearch] = useState("");
  const [tab, setTab] = useState("users");
  const [editModal, setEditModal] = useState(null);
  const [toast, setToast] = useState("");
  useReveal();

  if(!user || !isAdmin(user)) return (
    <div className="page-top" style={{minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,padding:"80px 20px"}}>
      <div style={{fontFamily:F.display,fontSize:22,color:T.sub}}>Admin access required</div>
      <Btn onClick={()=>setPage("Login")}>Sign in as Admin →</Btn>
    </div>
  );

  const updateUser = (id, updates) => {
    setUsers(prev=>prev.map(u=>u.id===id?{...u,...updates}:u));
    setToast(`User updated successfully`); setEditModal(null);
  };

  const filteredAudit = MOCK_AUDIT.filter(a=>
    !auditSearch || a.user.includes(auditSearch) || a.action.includes(auditSearch.toUpperCase())
  );

  return (
    <div className="page-top">
      {toast && <Toast msg={toast} onClose={()=>setToast("")}/>}
      {editModal && (
        <div className="modal-bg" onClick={()=>setEditModal(null)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()} style={{padding:28}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <h3 style={{fontFamily:F.display,fontSize:20,fontWeight:700,margin:0}}>Edit user</h3>
              <button onClick={()=>setEditModal(null)} style={{background:T.bgDeep,border:`1px solid ${T.border}`,color:T.sub,width:28,height:28,borderRadius:"50%",cursor:"pointer",fontSize:14}}>✕</button>
            </div>

            {/* Name */}
            <label style={{fontSize:12,color:T.sub,fontWeight:600,textTransform:"uppercase",letterSpacing:".06em"}}>
              Full name
              <input id="modal-name" defaultValue={editModal.name} style={inp} placeholder="Full name"/>
            </label>
            <div style={{height:12}}/>

            {/* Email — read-only, shown for reference */}
            <label style={{fontSize:12,color:T.sub,fontWeight:600,textTransform:"uppercase",letterSpacing:".06em"}}>
              Email (read-only)
              <input value={editModal.email} readOnly style={{...inp,opacity:.55,cursor:"default"}}/>
            </label>
            <div style={{height:12}}/>

            {/* Role — ADMIN can only be assigned to ADMIN_EMAIL */}
            <label style={{fontSize:12,color:T.sub,fontWeight:600,textTransform:"uppercase",letterSpacing:".06em"}}>
              Role
              <select id="modal-role" defaultValue={editModal.role} style={inp}>
                <option value="USER">USER</option>
                <option value="PROFESSIONAL">PROFESSIONAL</option>
                <option value="REGULATOR">REGULATOR</option>
                {/* ADMIN option only shown for the locked admin email */}
                {editModal.email === ADMIN_EMAIL && <option value="ADMIN">ADMIN</option>}
              </select>
            </label>

            {editModal.email === ADMIN_EMAIL && (
              <div style={{marginTop:8,padding:"8px 12px",background:T.purpleDim,borderRadius:8,fontSize:12,color:T.purple}}>
                🔒 This is the platform admin account. Role cannot be downgraded below ADMIN.
              </div>
            )}

            <div style={{height:20}}/>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              <Btn onClick={()=>{
                const newName = document.getElementById("modal-name").value.trim();
                const newRole = document.getElementById("modal-role").value;
                // Prevent stripping ADMIN from the locked admin email
                const safeRole = editModal.email === ADMIN_EMAIL ? "ADMIN" : newRole;
                // Prevent anyone else getting ADMIN
                const finalRole = newRole === "ADMIN" && editModal.email !== ADMIN_EMAIL ? editModal.role : safeRole;
                updateUser(editModal.id,{
                  name: newName || editModal.name,
                  role: finalRole,
                  avatar: (newName||editModal.name).split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2),
                });
              }}>Save changes</Btn>
              {editModal.email !== ADMIN_EMAIL && (
                <Btn variant="danger" onClick={()=>updateUser(editModal.id,{disabled:!editModal.disabled})}>
                  {editModal.disabled ? "Enable account" : "Disable account"}
                </Btn>
              )}
              <Btn variant="ghost" onClick={()=>setEditModal(null)}>Cancel</Btn>
            </div>
          </div>
        </div>
      )}

      <div className="wrap sec">
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:6,flexWrap:"wrap"}}>
          <Tag color={T.purpleDim} text={T.purple}>Admin Access</Tag>
          <RoleBadge role="ADMIN"/>
        </div>
        <h1 style={{fontFamily:F.display,fontSize:"clamp(24px,5vw,38px)",fontWeight:700,margin:"12px 0 6px",letterSpacing:"-.02em"}}>Admin Dashboard</h1>
        <p style={{color:T.sub,fontSize:15,marginBottom:28,lineHeight:1.6}}>Platform management — users, roles, audit logs, and security events.</p>

        <div className="grid-4 stagger" style={{marginBottom:28}}>
          {[
            {n:users.length,    l:"Total users",       c:T.green},
            {n:users.filter(u=>u.role==="REGULATOR"||u.role==="ADMIN").length,l:"Regulators+",c:T.danger},
            {n:MOCK_AUDIT.length,l:"Audit events (24h)",c:T.amber},
            {n:MOCK_AUDIT.filter(a=>a.meta.includes("FAILED")).length,l:"Failed logins",c:T.muted},
          ].map((s,i)=>(
            <div key={i} className="card" style={{padding:"clamp(14px,2.5vw,22px)",textAlign:"center"}}>
              <div style={{fontFamily:F.display,fontSize:"clamp(26px,5vw,36px)",fontWeight:700,color:s.c,marginBottom:4}}>{s.n}</div>
              <div style={{fontSize:12,color:T.muted}}>{s.l}</div>
            </div>
          ))}
        </div>

        <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
          {["users","audit","security"].map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              style={{padding:"8px 16px",borderRadius:100,border:`1.5px solid ${tab===t?T.purple:T.border}`,background:tab===t?T.purpleDim:"transparent",
                color:tab===t?T.purple:T.sub,fontSize:12,fontWeight:tab===t?700:400,cursor:"pointer",transition:"all .18s"}}>
              {{users:"User Management",audit:"Audit Log",security:"Security Events"}[t]}
            </button>
          ))}
        </div>

        {tab==="users" && (
          <div className="stagger">
            {users.map((u,i)=>(
              <div key={u.id} className="card" style={{padding:"clamp(14px,2.5vw,20px)",marginBottom:8,opacity:u.disabled?.5:1}}>
                <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
                  <Avatar initials={u.avatar} role={u.role} size={36}/>
                  <div style={{flex:1,minWidth:120}}>
                    <div style={{fontWeight:600,fontSize:14,color:T.text}}>{u.name}</div>
                    <div style={{fontSize:12,color:T.muted}}>{u.email}</div>
                    {u.email === ADMIN_EMAIL && <div style={{fontSize:10,color:T.purple,fontWeight:700,marginTop:2}}>🔒 Platform Admin — locked</div>}
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                    <RoleBadge role={u.role}/>
                    {u.disabled && <span className="badge" style={{background:T.bgDeep,color:T.muted}}>Disabled</span>}
                    <span style={{fontSize:12,color:T.muted}}>{u.points.toLocaleString()} pts</span>
                  </div>
                  <Btn variant="dim" style={{padding:"6px 12px",fontSize:12}} onClick={()=>setEditModal(u)}>Edit →</Btn>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab==="audit" && (
          <div>
            <input value={auditSearch} onChange={e=>setAuditSearch(e.target.value)} placeholder="Filter by user or action…" style={{...inp,maxWidth:320,marginBottom:16}}/>
            <div className="card" style={{overflow:"hidden"}}>
              {filteredAudit.map((a,i)=>(
                <div key={a.id} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,padding:"12px 16px",background:i%2===0?T.surface:T.bg,borderBottom:i<filteredAudit.length-1?`1px solid ${T.border}`:"none",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:12,fontFamily:F.mono,color:a.action==="LOGIN"&&a.meta.includes("FAILED")?T.danger:T.green,fontWeight:700,marginBottom:2}}>{a.action}</div>
                    <div style={{fontSize:12,color:T.muted}}>{a.user}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:12,color:T.sub,marginBottom:2}}>{a.meta}</div>
                    <div style={{fontSize:11,color:T.muted}}>{a.ip} · {a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="security" && (
          <div className="stagger">
            {[
              {title:"Brute-force protection",    status:"Active",  detail:"Max 5 login attempts per email per 15 min. 1 IP currently on cooldown (185.x.x.x).",color:T.green},
              {title:"Password hashing",           status:"Argon2id",detail:"Memory-hard hashing with per-password salt. 0 plain-text passwords in store.",color:T.green},
              {title:"Session security",           status:"Active",  detail:"httpOnly, Secure, SameSite=Lax cookies. Sessions stored server-side in PostgreSQL.",color:T.green},
              {title:"CSP / Security headers",     status:"Active",  detail:"Content-Security-Policy, X-Frame-Options: DENY, HSTS, X-Content-Type-Options all set.",color:T.green},
              {title:"Suspicious login detected",  status:"Alert",   detail:"5 failed attempts from 185.x.x.x at 03:42 UTC. Account locked for 15 minutes.",color:T.danger},
              {title:"Blockchain key rotation",    status:"Due",     detail:"BLOCKCHAIN_PRIVATE_KEY was last rotated 89 days ago. Recommend rotating every 90 days.",color:T.warn},
            ].map((s,i)=>(
              <div key={i} className="card" style={{padding:"clamp(14px,2.5vw,20px)",marginBottom:8,borderColor:s.color==="Active"?T.border:s.color+"44"}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:14,flexWrap:"wrap"}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:s.color,flexShrink:0,marginTop:5,
                    animation:s.status==="Active"?"statusPulse 2.5s ease-in-out infinite":"none"}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginBottom:4}}>
                      <span style={{fontWeight:600,fontSize:14,color:T.text}}>{s.title}</span>
                      <span className="badge" style={{background:s.color==="Active"?T.safeLight:s.color===T.danger?T.dangerLight:T.amberLight,
                        color:s.color==="Active"?T.green:s.color===T.danger?T.danger:T.amber}}>{s.status}</span>
                    </div>
                    <p style={{fontSize:13,color:T.sub,lineHeight:1.6,margin:0}}>{s.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   APP ROOT
══════════════════════════════════════════════════════════ */
export default function App() {
  const [page,    setPage]    = useState("Home");
  const [display, setDisplay] = useState("Home");
  const [fading,  setFading]  = useState(false);
  const [user,    setUser]    = useState(null);
  const [toast,   setToast]   = useState("");

  const navigate = (next) => {
    if(next===display) return;
    setFading(true);
    setTimeout(()=>{ setDisplay(next); setPage(next); setFading(false); window.scrollTo({top:0}); }, 180);
  };

  const handleLogin = (u) => {
    setUser(u);
    setToast(`Welcome back, ${u.name}! 🎉`);
    navigate("Home");
  };

  const handleLogout = () => {
    setUser(null);
    setToast("Signed out successfully.");
    navigate("Home");
  };

  const Pages = {
    Home: ()=><HomePage setPage={navigate} user={user}/>,
    Verify: ()=><VerifyPage user={user} setPage={navigate}/>,
    "Scam Hub": ()=><ScamHub/>,
    Community: ()=><CommunityPage user={user} setPage={navigate}/>,
    Drugs: ()=><DrugsPage/>,
    Learn: ()=><LearnPage/>,
    Login: ()=><LoginPage setPage={navigate} onLogin={handleLogin}/>,
    Register: ()=><RegisterPage setPage={navigate} onLogin={handleLogin}/>,
    Profile: ()=><ProfilePage user={user} setPage={navigate}/>,
    SDGMetrics: ()=><SDGMetricsPage/>,
    Regulator: ()=><RegulatorPage user={user} setPage={navigate}/>,
    Admin: ()=><AdminPage user={user} setPage={navigate}/>,
  };

  const Page = Pages[display] || Pages.Home;

  return (
    <div style={{minHeight:"100vh",color:T.text,position:"relative"}}>
      <GlobalStyles/>
      <Background/>
      {toast && <Toast msg={toast} onClose={()=>setToast("")}/>}
      <div style={{position:"relative",zIndex:1}}>
        <Nav page={page} setPage={navigate} user={user} onLogout={handleLogout}/>
        <main className="pg" style={{opacity:fading?0:1,transform:fading?"translateY(10px)":"none",transition:"opacity .18s,transform .18s"}}>
          <Page/>
        </main>
        <footer className="footer">
          <div style={{display:"flex",alignItems:"center",gap:8,color:T.sub,fontSize:13}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:T.green,display:"inline-block",animation:"statusPulse 2.5s ease-in-out infinite"}}/>
            ClearDose · SDG-12 Medicine Safety Platform · AI + Blockchain · Open source
          </div>
          <div style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
            {user ? (
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <Avatar initials={user.avatar} role={user.role} size={20}/>
                <span style={{fontSize:12,color:T.muted}}>{user.name} · {user.points} pts</span>
              </div>
            ) : (
              <button onClick={()=>navigate("Login")} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:T.muted,textDecoration:"underline"}}>Sign in</button>
            )}
            <span style={{fontSize:12,color:T.muted}}>Not medical advice. Consult a healthcare professional.</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
