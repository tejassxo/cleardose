// ─────────────────────────────────────────────────────────────────
// src/components/verify/VerifyPage.jsx
// Drop this file at that path in your cleardose repo.
// Also create src/data/drugDatabase.js from the companion file.
//
// In App.jsx, replace the inline VerifyPage with:
//   import VerifyPage from './components/verify/VerifyPage';
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { resolveBatch, BATCH_SUGGESTIONS } from "../../data/drugDatabase";

const T = {
  bg:"#F5F1E8",bgDeep:"#EDE8DB",surface:"#FFFFFF",
  border:"#DDD5C4",text:"#18150E",sub:"#6B5D4A",muted:"#A09078",
  green:"#0A5A2E",greenMid:"#1A8C52",greenLight:"#E5F4EC",
  greenDim:"rgba(10,90,46,0.1)",greenGlow:"rgba(10,90,46,0.25)",
  amber:"#B45309",amberLight:"#FEF3E2",amberDim:"rgba(180,83,9,0.1)",
  danger:"#B91C1C",dangerLight:"#FEF2F2",dangerDim:"rgba(185,28,28,0.08)",
  purple:"#6D28D9",purpleDim:"rgba(109,40,217,0.1)",ink:"#111008",
};
const F={display:"'Playfair Display',Georgia,serif",body:"'DM Sans',system-ui,sans-serif",mono:"'Courier New',monospace"};
const LC={Safe:T.green,Caution:T.amber,"High Risk":T.danger};
const LBG={Safe:T.greenLight,Caution:T.amberLight,"High Risk":T.dangerLight};
const LD={Safe:T.greenDim,Caution:T.amberDim,"High Risk":T.dangerDim};
const SC={verified:T.green,missing:T.amber,flagged:T.danger};
const SBG={verified:T.greenLight,missing:T.amberLight,flagged:T.dangerLight};
const ABG={"Supply-Chain":T.greenDim,Vision:T.purpleDim,Price:T.amberDim,Abductive:T.bgDeep};
const AC={"Supply-Chain":T.green,Vision:T.purple,Price:T.amber,Abductive:T.muted};

// Animated particle canvas background
function MeshBg({active}){
  const ref=useRef(null);
  const anim=useRef(null);
  useEffect(()=>{
    const c=ref.current; if(!c)return;
    const ctx=c.getContext("2d");
    let W,H;
    const resize=()=>{W=c.width=c.offsetWidth;H=c.height=c.offsetHeight;};
    resize();
    const ro=new ResizeObserver(resize); ro.observe(c);
    const N=Array.from({length:28},()=>({x:Math.random(),y:Math.random(),vx:(Math.random()-.5)*.00022,vy:(Math.random()-.5)*.00022,r:1.5+Math.random()*2}));
    const draw=(ts)=>{
      const t=ts*.001; ctx.clearRect(0,0,W,H);
      [{cx:.22+.1*Math.sin(t*.17),cy:.28+.07*Math.cos(t*.13),r:.38,cl:"rgba(10,90,46,0.055)"},
       {cx:.74+.09*Math.cos(t*.20),cy:.65+.08*Math.sin(t*.16),r:.30,cl:"rgba(180,83,9,0.04)"},
       {cx:.50+.07*Math.sin(t*.12),cy:.12+.05*Math.cos(t*.18),r:.20,cl:"rgba(109,40,217,0.03)"}
      ].forEach(b=>{
        const g=ctx.createRadialGradient(b.cx*W,b.cy*H,0,b.cx*W,b.cy*H,b.r*Math.min(W,H));
        g.addColorStop(0,b.cl);g.addColorStop(1,"transparent");
        ctx.fillStyle=g;ctx.beginPath();ctx.arc(b.cx*W,b.cy*H,b.r*Math.min(W,H),0,Math.PI*2);ctx.fill();
      });
      N.forEach(n=>{
        n.x=((n.x+n.vx)+1)%1;n.y=((n.y+n.vy)+1)%1;
        ctx.beginPath();ctx.arc(n.x*W,n.y*H,n.r,0,Math.PI*2);
        ctx.fillStyle="rgba(10,90,46,0.18)";ctx.fill();
      });
      for(let i=0;i<N.length;i++)for(let j=i+1;j<N.length;j++){
        const dx=(N[i].x-N[j].x)*W,dy=(N[i].y-N[j].y)*H,d=Math.sqrt(dx*dx+dy*dy);
        if(d<155){ctx.beginPath();ctx.moveTo(N[i].x*W,N[i].y*H);ctx.lineTo(N[j].x*W,N[j].y*H);
          ctx.strokeStyle=`rgba(10,90,46,${.11*(1-d/155)})`;ctx.lineWidth=.6;ctx.stroke();}
      }
      anim.current=requestAnimationFrame(draw);
    };
    anim.current=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(anim.current);ro.disconnect();};
  },[]);
  return <canvas ref={ref} style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:active?.9:.4,transition:"opacity 1.4s ease",pointerEvents:"none"}}/>;
}

// Orbital AI loader
function OrbLoader({progress,agents,activeIdx,drugName}){
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"44px 0 28px"}}>
      <div style={{position:"relative",width:108,height:108,marginBottom:36}}>
        <svg width="108" height="108" style={{position:"absolute",inset:0,animation:"vfySpin 1.4s linear infinite"}}>
          <circle cx="54" cy="54" r="48" fill="none" stroke={T.green} strokeWidth="2" strokeDasharray="76 225" strokeLinecap="round"/>
        </svg>
        <svg width="108" height="108" style={{position:"absolute",inset:0,animation:"vfySpin 2.5s linear infinite reverse"}}>
          <circle cx="54" cy="54" r="34" fill="none" stroke={T.amber} strokeWidth="1.5" strokeDasharray="52 163" strokeLinecap="round"/>
        </svg>
        <svg width="108" height="108" style={{position:"absolute",inset:0,animation:"vfySpin 3.3s linear infinite"}}>
          <circle cx="54" cy="54" r="20" fill="none" stroke={T.purple} strokeWidth="1" strokeDasharray="22 104" strokeLinecap="round" opacity="0.5"/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{width:24,height:24,borderRadius:"50%",background:T.greenDim,border:`2.5px solid ${T.green}`,animation:"vfyPulse 1.7s ease-in-out infinite"}}/>
        </div>
        <div style={{position:"absolute",inset:0,animation:"vfyOrbA 2.0s linear infinite",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:T.green,boxShadow:`0 0 10px ${T.green}`}}/>
        </div>
        <div style={{position:"absolute",inset:0,animation:"vfyOrbB 3.0s linear infinite",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{width:5,height:5,borderRadius:"50%",background:T.amber}}/>
        </div>
      </div>
      <div style={{fontSize:13,color:T.muted,marginBottom:12,fontStyle:"italic",textAlign:"center"}}>
        {drugName?`Analysing ${drugName}…`:"Running verification squad…"}
      </div>
      <div style={{width:"min(320px,90%)",background:T.border,borderRadius:100,height:5,marginBottom:32,overflow:"hidden"}}>
        <div style={{background:`linear-gradient(90deg,${T.green},${T.greenMid})`,height:"100%",width:`${progress}%`,transition:"width .65s cubic-bezier(.22,1,.36,1)",borderRadius:100}}/>
      </div>
      <div style={{width:"100%",maxWidth:400,display:"flex",flexDirection:"column",gap:14}}>
        {agents.map((a,i)=>{
          const done=i<activeIdx,active=i===activeIdx;
          return(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:14,opacity:done||active?1:.22,transition:"opacity .5s ease"}}>
              <div style={{width:26,height:26,borderRadius:"50%",flexShrink:0,marginTop:1,
                background:done?T.greenDim:"transparent",
                border:active?`2px solid ${T.green}`:done?`2px solid ${T.green}`:`1.5px solid ${T.border}`,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:done?T.green:T.sub,
                animation:active?"vfyPulse 1.1s ease-in-out infinite":"none",transition:"all .4s"}}>
                {done?"✓":active?<span style={{width:7,height:7,borderRadius:"50%",background:T.green,display:"block"}}/>:i+1}
              </div>
              <div>
                <div style={{fontSize:14,fontWeight:600,color:active?T.green:done?T.text:T.sub,transition:"color .3s"}}>{a.name}</div>
                <div style={{fontSize:11,color:T.muted,lineHeight:1.5,marginTop:2}}>{a.task}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Progressive ledger timeline
function LedgerTimeline({events}){
  const [rev,setRev]=useState(0);
  useEffect(()=>{
    setRev(0);let i=0;
    const t=setInterval(()=>{i++;setRev(i);if(i>=events.length)clearInterval(t);},265);
    return()=>clearInterval(t);
  },[events]);
  return(
    <div style={{position:"relative",paddingLeft:30}}>
      <div style={{position:"absolute",left:11,top:14,bottom:14,width:2,background:`linear-gradient(to bottom,${T.green}88,${T.border})`,borderRadius:2}}/>
      {events.map((e,i)=>{
        const vis=i<rev,sC=SC[e.status]||T.muted,sBg=SBG[e.status]||T.bgDeep;
        return(
          <div key={i} style={{marginBottom:i<events.length-1?22:0,opacity:vis?1:0,transform:vis?"none":"translateY(14px)",transition:`opacity .45s ease ${i*.05}s,transform .45s ease ${i*.05}s`}}>
            <div style={{position:"absolute",left:6,width:12,height:12,borderRadius:"50%",background:e.status==="missing"?T.border:sC,border:`2px solid ${e.status==="missing"?T.border:sC}`,boxShadow:e.status==="verified"?`0 0 9px ${sC}55`:"none",marginTop:6}}/>
            <div style={{background:"rgba(255,255,255,.92)",border:`1.5px solid ${T.border}`,borderRadius:10,padding:"12px 16px"}}
              onMouseEnter={ev=>ev.currentTarget.style.borderColor=sC}
              onMouseLeave={ev=>ev.currentTarget.style.borderColor=T.border}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,flexWrap:"wrap",marginBottom:7}}>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:e.status==="missing"?T.muted:T.text,marginBottom:2}}>{e.event}</div>
                  <div style={{fontSize:12,color:T.sub}}>{e.actor}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <span style={{fontSize:9,fontWeight:700,letterSpacing:".07em",textTransform:"uppercase",padding:"3px 8px",borderRadius:4,background:sBg,color:sC}}>{e.status}</span>
                  <div style={{fontSize:10,color:T.muted,marginTop:4}}>{e.date}</div>
                </div>
              </div>
              <div style={{fontSize:11,color:T.sub,lineHeight:1.55,marginBottom:9}}>{e.detail}</div>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <div style={{fontFamily:F.mono,fontSize:10,padding:"3px 10px",borderRadius:5,background:e.txHash?T.greenDim:T.bgDeep,border:`1px solid ${e.txHash?"rgba(10,90,46,.2)":T.border}`,color:e.txHash?T.green:T.muted,maxWidth:260,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {e.txHash||"⚠ No blockchain record"}
                </div>
                {e.txHash&&<span style={{fontSize:9,color:T.green,fontWeight:700}}>ON-CHAIN ✓</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Stat card
function StatCard({label,value,sub,good,delay=0}){
  return(
    <div style={{background:"rgba(255,255,255,.9)",border:`1.5px solid ${good?"rgba(10,90,46,.2)":"rgba(185,28,28,.15)"}`,borderRadius:12,padding:"clamp(14px,2.5vw,22px)",textAlign:"center",animation:`vfyFadeUp .5s ease ${delay}s both`}}>
      <div style={{fontFamily:F.display,fontSize:"clamp(22px,3.5vw,30px)",fontWeight:700,color:good?T.green:T.danger,marginBottom:4,lineHeight:1}}>{value}</div>
      <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:3}}>{label}</div>
      <div style={{fontSize:10,color:T.muted,lineHeight:1.4}}>{sub}</div>
    </div>
  );
}

// Tag helper
const Tag=({children,bg,color})=><span style={{display:"inline-block",fontSize:9,fontWeight:700,letterSpacing:".07em",textTransform:"uppercase",padding:"3px 8px",borderRadius:4,background:bg||T.greenDim,color:color||T.green,whiteSpace:"nowrap"}}>{children}</span>;

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function VerifyPage({user,setPage}){
  const [step,setStep]=useState("input");
  const [batchId,setBatchId]=useState("");
  const [country,setCountry]=useState("Nigeria");
  const [progress,setProgress]=useState(0);
  const [activeIdx,setActiveIdx]=useState(-1);
  const [result,setResult]=useState(null);
  const [showLedger,setShowLedger]=useState(false);
  const [suggestions,setSuggestions]=useState([]);
  const [showSug,setShowSug]=useState(false);
  const [activeDrug,setActiveDrug]=useState(null);
  const inputRef=useRef(null);

  const agents=[
    {name:"Vision Agent",task:"Scanning packaging geometry, logo authenticity & QR integrity…"},
    {name:"Supply-Chain Agent",task:"Tracing all registered chain-of-custody events on-chain…"},
    {name:"Price & Regulation Agent",task:"Cross-referencing regional cost bands and jurisdiction ban map…"},
    {name:"Abductive Risk Agent",task:"Synthesising weighted hypotheses from all agent outputs…"},
  ];

  useEffect(()=>{
    if(document.getElementById("vfy-kf"))return;
    const s=document.createElement("style");s.id="vfy-kf";
    s.textContent=`
      @keyframes vfySpin{to{transform:rotate(360deg)}}
      @keyframes vfyPulse{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.16);opacity:1}}
      @keyframes vfyOrbA{from{transform:rotate(0deg) translateX(28px) rotate(0deg)}to{transform:rotate(360deg) translateX(28px) rotate(-360deg)}}
      @keyframes vfyOrbB{from{transform:rotate(0deg) translateX(17px) rotate(0deg)}to{transform:rotate(-360deg) translateX(17px) rotate(360deg)}}
      @keyframes vfyFadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
      @keyframes vfySlide{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:none}}
      .vfy-inp:focus{border-color:${T.green}!important;box-shadow:0 0 0 3px ${T.greenDim}!important;outline:none}
      .vfy-upload:hover{border-color:${T.green}!important;background:${T.bgDeep}!important}
      .vfy-run{transition:transform .14s,box-shadow .18s}
      .vfy-run:hover:not(:disabled){transform:scale(1.018);box-shadow:0 0 24px ${T.greenGlow},0 5px 16px rgba(0,0,0,.12)}
      .vfy-run:active:not(:disabled){transform:scale(.978)}
      .vfy-ledger-btn:hover{background:${T.bgDeep}!important}
    `;
    document.head.appendChild(s);
  },[]);

  const handleInput=val=>{
    setBatchId(val);
    if(val.length>=2){
      const q=val.toUpperCase();
      const m=BATCH_SUGGESTIONS.filter(s=>s.code.includes(q)||s.drug.toUpperCase().includes(q)).slice(0,7);
      setSuggestions(m);setShowSug(m.length>0);
    }else setShowSug(false);
  };

  const run=()=>{
    if(!batchId.trim())return;
    const r=resolveBatch(batchId);
    setResult(r);setActiveDrug(r?.drugInfo||null);
    setStep("loading");setProgress(0);setActiveIdx(0);setShowLedger(false);
    [0,1100,2200,3400,4600].forEach((t,i)=>setTimeout(()=>{setProgress([0,25,50,75,100][i]);setActiveIdx(i);},t));
    setTimeout(()=>setStep("result"),5200);
  };

  const reset=()=>{setStep("input");setBatchId("");setResult(null);setActiveDrug(null);setShowLedger(false);setShowSug(false);};

  const level=result?.riskLevel||"Safe";
  const lC=LC[level]||T.muted,lB=LBG[level]||T.bgDeep,lD=LD[level]||T.bgDeep;
  const lIcon={Safe:"✓",Caution:"⚠","High Risk":"✕"}[level]||"?";
  const inp={display:"block",marginTop:6,width:"100%",padding:"12px 16px",fontSize:14,fontFamily:F.body,background:T.bgDeep,border:`1.5px solid ${T.border}`,borderRadius:9,color:T.text,outline:"none",transition:"border-color .18s,box-shadow .18s"};
  const QUICK=[{c:"AM-2024-04471",l:"Amoxicillin · Caution"},{c:"AL-2024-00821",l:"Artemether · High Risk"},{c:"PC-2024-00102",l:"Paracetamol · Safe"},{c:"IG-2024-01134",l:"Insulin · High Risk"},{c:"IB-2024-07821",l:"Ibuprofen · Safe"}];

  return(
    <div style={{paddingTop:56,minHeight:"100svh",position:"relative",overflow:"hidden"}}>
      {/* Animated canvas bg */}
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none"}}>
        <MeshBg active={step!=="input"}/>
      </div>

      <div style={{position:"relative",zIndex:1,maxWidth:740,margin:"0 auto",padding:"clamp(36px,6vw,72px) clamp(16px,4vw,40px) 64px"}}>

        {/* Header */}
        <div style={{marginBottom:32,animation:"vfyFadeUp .5s ease both"}}>
          <Tag bg={T.greenDim} color={T.green}>AI · Blockchain · Multi-Agent</Tag>
          <h1 style={{fontFamily:F.display,fontSize:"clamp(28px,5.5vw,48px)",fontWeight:700,letterSpacing:"-.025em",color:T.text,lineHeight:1.08,margin:"14px 0 10px"}}>Verify a medicine</h1>
          <p style={{fontSize:"clamp(14px,1.8vw,16px)",color:T.sub,lineHeight:1.72,maxWidth:520,margin:0}}>
            Enter any batch ID — 4 specialised AI agents verify it against the blockchain provenance trail and return a full integrity report.
          </p>
        </div>

        {/* Guest banner */}
        {!user&&(
          <div style={{background:T.amberLight,border:"1px solid rgba(180,83,9,.2)",borderRadius:10,padding:"12px 16px",marginBottom:24,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",animation:"vfyFadeUp .5s .05s ease both"}}>
            <span style={{fontSize:13,color:T.amber,flex:1}}>⚠ You're verifying as a guest. <strong>Sign in</strong> to save results and earn points.</span>
            <button onClick={()=>setPage("Login")} style={{padding:"6px 14px",borderRadius:7,background:T.amberDim,border:"1px solid rgba(180,83,9,.25)",color:T.amber,fontSize:12,fontWeight:600,cursor:"pointer"}}>Sign in</button>
          </div>
        )}

        {/* INPUT */}
        {step==="input"&&(
          <div style={{background:"rgba(255,255,255,.88)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:`1.5px solid ${T.border}`,borderRadius:16,padding:"clamp(20px,4vw,38px)",boxShadow:"0 4px 28px rgba(0,0,0,.07)",animation:"vfyFadeUp .4s ease both"}}>
            <div style={{position:"relative",marginBottom:18}}>
              <label style={{fontSize:11,color:T.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em"}}>Batch / Serial Number</label>
              <input ref={inputRef} className="vfy-inp" value={batchId}
                onChange={e=>handleInput(e.target.value)}
                onBlur={()=>setTimeout(()=>setShowSug(false),180)}
                onKeyDown={e=>{if(e.key==="Enter")run();if(e.key==="Escape")setShowSug(false);}}
                placeholder="e.g. AM-2024-04471  ·  AL-2024-00821  ·  IG-2024-01134"
                style={{...inp,fontSize:15,padding:"13px 16px"}}/>
              {showSug&&(
                <div style={{position:"absolute",top:"100%",left:0,right:0,zIndex:60,background:T.surface,border:`1.5px solid ${T.border}`,borderRadius:"0 0 10px 10px",boxShadow:"0 8px 28px rgba(0,0,0,.1)",overflow:"hidden",marginTop:2}}>
                  {suggestions.map((s,i)=>(
                    <div key={i} onClick={()=>{setBatchId(s.code);setShowSug(false);}}
                      style={{padding:"9px 14px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,transition:"background .15s"}}
                      onMouseEnter={e=>e.currentTarget.style.background=T.bgDeep}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <div>
                        <div style={{fontFamily:F.mono,fontSize:12,color:T.text,fontWeight:600}}>{s.code}</div>
                        <div style={{fontSize:11,color:T.sub}}>{s.drug}</div>
                      </div>
                      <Tag bg={LD[s.level]||T.bgDeep} color={LC[s.level]||T.muted}>{s.level}</Tag>
                    </div>
                  ))}
                  <div style={{padding:"7px 14px",fontSize:10,color:T.muted,borderTop:`1px solid ${T.border}`}}>{BATCH_SUGGESTIONS.length} batches in registry</div>
                </div>
              )}
            </div>

            <label style={{fontSize:11,color:T.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",display:"block",marginBottom:18}}>
              Country / Region
              <select value={country} onChange={e=>setCountry(e.target.value)} style={{...inp,cursor:"pointer",appearance:"auto"}}>
                {["Nigeria","Ghana","India","Brazil","Kenya","Indonesia","Pakistan","South Africa","Ethiopia","Tanzania","Uganda","Bangladesh"].map(c=><option key={c}>{c}</option>)}
              </select>
            </label>

            <div className="vfy-upload" style={{border:`2px dashed ${T.border}`,borderRadius:10,padding:"clamp(16px,3vw,24px)",textAlign:"center",color:T.muted,fontSize:13,cursor:"pointer",transition:"border-color .2s,background .2s",marginBottom:22}}>
              <div style={{fontSize:28,marginBottom:6}}>📦</div>
              Upload packaging photo <span style={{fontSize:11}}>(optional — powers Vision Agent)</span>
            </div>

            <div style={{marginBottom:22,padding:"11px 16px",background:T.bgDeep,borderRadius:9,fontSize:12}}>
              <strong style={{color:T.sub,display:"block",marginBottom:7}}>Try a live batch:</strong>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {QUICK.map(b=>(
                  <button key={b.c} onClick={()=>{setBatchId(b.c);setShowSug(false);}}
                    style={{fontFamily:F.mono,fontSize:11,padding:"4px 10px",borderRadius:6,border:`1px solid ${T.border}`,background:T.surface,color:T.green,cursor:"pointer",transition:"all .15s"}}
                    onMouseEnter={e=>{e.currentTarget.style.background=T.greenDim;}}
                    onMouseLeave={e=>{e.currentTarget.style.background=T.surface;}}>
                    {b.l}
                  </button>
                ))}
              </div>
            </div>

            <button className="vfy-run" onClick={run} disabled={!batchId.trim()}
              style={{width:"100%",padding:"15px",borderRadius:10,border:"none",background:batchId.trim()?T.green:"rgba(10,90,46,.25)",color:"#fff",fontSize:15,fontWeight:600,cursor:batchId.trim()?"pointer":"not-allowed",letterSpacing:".01em"}}>
              Run verification squad →
            </button>
          </div>
        )}

        {/* LOADING */}
        {step==="loading"&&(
          <div style={{background:"rgba(255,255,255,.88)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:`1.5px solid ${T.border}`,borderRadius:16,padding:"clamp(24px,4vw,48px)",boxShadow:"0 4px 28px rgba(0,0,0,.07)",animation:"vfyFadeUp .3s ease both"}}>
            <OrbLoader progress={progress} agents={agents} activeIdx={activeIdx} drugName={activeDrug?.name}/>
          </div>
        )}

        {/* RESULT */}
        {step==="result"&&result&&(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>

            {/* Risk banner */}
            <div style={{background:`linear-gradient(135deg,${lB},${T.surface})`,border:`1.5px solid ${lC}55`,borderRadius:16,padding:"clamp(18px,3vw,30px)",animation:"vfyFadeUp .4s ease both",boxShadow:`0 6px 24px ${lC}18`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,flexWrap:"wrap"}}>
                <div style={{minWidth:0}}>
                  <Tag bg={lD} color={lC}>{level}</Tag>
                  <h2 style={{fontFamily:F.display,fontSize:"clamp(22px,4vw,34px)",fontWeight:700,margin:"10px 0 6px",letterSpacing:"-.025em",wordBreak:"break-word",color:T.text}}>{result.drug}</h2>
                  <div style={{fontFamily:F.mono,fontSize:11,color:T.sub,marginBottom:10}}>{result.batchCode} · {country}</div>
                  {result.drugInfo&&(
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      <Tag bg={T.bgDeep} color={T.sub}>{result.drugInfo.class}</Tag>
                      <Tag bg={T.bgDeep} color={T.sub}>{result.drugInfo.costBand} cost</Tag>
                      <Tag bg={T.greenDim} color={T.green}>SDG {result.drugInfo.sdgTarget}</Tag>
                    </div>
                  )}
                </div>
                <div style={{fontFamily:F.display,fontSize:"clamp(48px,9vw,64px)",lineHeight:1,color:lC,flexShrink:0,filter:`drop-shadow(0 0 14px ${lC}44)`}}>{lIcon}</div>
              </div>
            </div>

            {/* Stats */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10}}>
              {result.stats.map((s,i)=><StatCard key={i} {...s} delay={i*.07}/>)}
            </div>

            {/* Hypotheses */}
            <div style={{animation:"vfyFadeUp .5s .1s ease both"}}>
              <div style={{fontSize:10,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:".09em",marginBottom:12}}>AI Hypotheses</div>
              {result.hypotheses.map((h,i)=>(
                <div key={i} style={{background:"rgba(255,255,255,.9)",backdropFilter:"blur(12px)",border:`1.5px solid ${T.border}`,borderRadius:12,padding:"13px 16px",display:"flex",gap:12,alignItems:"flex-start",marginBottom:9,animation:`vfySlide .4s ease ${i*.08}s both`}}>
                  <div style={{minWidth:46,textAlign:"center",padding:"3px 0",borderRadius:6,fontSize:12,fontWeight:800,flexShrink:0,background:h.conf>65?T.amberDim:T.greenDim,color:h.conf>65?T.amber:T.green}}>{h.conf}%</div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{margin:"0 0 7px",fontSize:13,lineHeight:1.65,color:T.text}}>{h.text}</p>
                    <Tag bg={ABG[h.agent]||T.bgDeep} color={AC[h.agent]||T.muted}>{h.agent} Agent</Tag>
                  </div>
                </div>
              ))}
            </div>

            {/* SDG note */}
            <div style={{background:T.greenLight,border:"1px solid rgba(10,90,46,.2)",borderRadius:12,padding:"14px 18px",animation:"vfyFadeUp .5s .16s ease both"}}>
              <div style={{fontSize:9,fontWeight:700,color:T.green,textTransform:"uppercase",letterSpacing:".09em",marginBottom:5}}>SDG-12 Impact Note</div>
              <p style={{margin:0,fontSize:13,color:T.sub,lineHeight:1.65}}>{result.sdg12}</p>
            </div>

            {/* Ledger accordion */}
            <div style={{background:"rgba(255,255,255,.9)",backdropFilter:"blur(14px)",WebkitBackdropFilter:"blur(14px)",border:`1.5px solid ${T.border}`,borderRadius:14,overflow:"hidden",animation:"vfyFadeUp .5s .2s ease both"}}>
              <button className="vfy-ledger-btn" onClick={()=>setShowLedger(l=>!l)}
                style={{width:"100%",padding:"17px 20px",background:"none",border:"none",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",textAlign:"left",transition:"background .15s"}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontSize:18,color:T.green}}>⬡</span>
                  <div>
                    <div style={{fontSize:14,fontWeight:700,color:T.text}}>Cryptographic Ledger</div>
                    <div style={{fontSize:11,color:T.muted,marginTop:2}}>{result.events.length} chain events · {result.events.filter(e=>e.txHash).length} on-chain hashes</div>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <Tag bg={result.events.some(e=>e.status==="missing")?T.amberDim:T.greenDim} color={result.events.some(e=>e.status==="missing")?T.amber:T.green}>
                    {result.events.some(e=>e.status==="missing")?"Gaps detected":"Chain intact"}
                  </Tag>
                  <span style={{fontSize:20,color:T.muted,display:"inline-block",transform:showLedger?"rotate(180deg)":"none",transition:"transform .3s",lineHeight:1}}>›</span>
                </div>
              </button>
              {showLedger&&(
                <div style={{borderTop:`1px solid ${T.border}`,padding:"22px 20px 22px 30px",animation:"vfyFadeUp .4s ease both"}}>
                  <LedgerTimeline events={result.events}/>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{display:"flex",gap:10,flexWrap:"wrap",animation:"vfyFadeUp .5s .25s ease both"}}>
              <button onClick={reset} style={{padding:"11px 22px",borderRadius:9,background:T.green,color:"#fff",border:"none",fontSize:14,fontWeight:600,cursor:"pointer"}}>Verify another →</button>
              <button onClick={()=>setPage("Community")} style={{padding:"11px 22px",borderRadius:9,background:T.dangerDim,color:T.danger,border:"1px solid rgba(185,28,28,.2)",fontSize:14,fontWeight:500,cursor:"pointer"}}>Report anomaly</button>
              {!showLedger&&<button onClick={()=>setShowLedger(true)} style={{padding:"11px 22px",borderRadius:9,background:T.bgDeep,color:T.sub,border:`1px solid ${T.border}`,fontSize:14,fontWeight:500,cursor:"pointer"}}>View ledger ⬡</button>}
              {user&&<button style={{padding:"11px 22px",borderRadius:9,background:"transparent",color:T.green,border:`1.5px solid ${T.border}`,fontSize:14,fontWeight:500,cursor:"pointer"}}>Save to profile</button>}
            </div>

            <p style={{fontSize:11,color:T.muted,lineHeight:1.65,margin:"2px 0 0",padding:"0 2px"}}>
              ⚠ ClearDose provides decision-support only. Results are AI-generated estimates. Always consult a licensed pharmacist before acting on this information.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
