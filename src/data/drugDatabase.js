// src/data/drugDatabase.js
// Complete drug registry — every batch resolves dynamically from this source of truth.

const hashSeed = (str) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
};

export const generateTxHash = (seed) => `0x${hashSeed(seed)}${hashSeed(seed + "salt")}`;

export const DRUGS = {
  // ── Antibiotics ──────────────────────────────────────────────────────────
  "AM": {
    name: "Amoxicillin", strength: "500mg", class: "Antibiotic",
    type: "Penicillin-class", costBand: "Low", sdgTarget: "12.4",
    icon: "💊", color: "#0A5A2E",
    manufacturers: ["PharmaCo Ltd, Abuja", "Cipla India Ltd", "GSK Nigeria"],
    qcLabs: ["NAFDAC Lab, Lagos", "WHO Pre-Qual Lab, Geneva", "MHRA Lab, London"],
    distributors: ["MedLogix NG", "AfriMed Logistics", "Global Health Supply"],
    riskProfile: { baseRisk: 0.34, priceVariance: 0.41, supplyChainRisk: 0.28 },
  },
  "CP": {
    name: "Ciprofloxacin", strength: "500mg", class: "Antibiotic",
    type: "Fluoroquinolone", costBand: "Medium", sdgTarget: "12.4",
    icon: "🧬", color: "#1A8C52",
    manufacturers: ["Bayer AG, Germany", "Sun Pharma, India", "Aurobindo Pharma"],
    qcLabs: ["EMA Lab, Amsterdam", "CDSCO Lab, India", "NAFDAC Lab, Lagos"],
    distributors: ["EuroMed Logistics", "IndoPharma Chain", "ColdShip Africa"],
    riskProfile: { baseRisk: 0.22, priceVariance: 0.30, supplyChainRisk: 0.19 },
  },
  "AZ": {
    name: "Azithromycin", strength: "250mg", class: "Antibiotic",
    type: "Macrolide", costBand: "Medium", sdgTarget: "12.5",
    icon: "🔬", color: "#6D28D9",
    manufacturers: ["Pfizer Inc, USA", "Teva Pharmaceuticals", "Macleods Pharma"],
    qcLabs: ["FDA Lab, Maryland", "EMA Lab, Amsterdam", "SANAS Lab, SA"],
    distributors: ["PharmaLink Global", "MedConnect Africa", "HealthBridge NG"],
    riskProfile: { baseRisk: 0.18, priceVariance: 0.22, supplyChainRisk: 0.15 },
  },
  // ── Antimalarials ─────────────────────────────────────────────────────────
  "AL": {
    name: "Artemether-Lumefantrine", strength: "20/120mg", class: "Antimalarial",
    type: "Combination ACT", costBand: "Medium", sdgTarget: "12.4",
    icon: "🦟", color: "#B91C1C",
    manufacturers: ["Novartis AG, Basel", "Ipca Labs, India", "Guilin Pharma, China"],
    qcLabs: ["WHO Pre-Qual Lab, Geneva", "NAFDAC Lab, Lagos", "KEBS Lab, Nairobi"],
    distributors: ["GlobalMed Freight", "EastAfrica MedSupply", "WHO Supply Chain"],
    riskProfile: { baseRisk: 0.62, priceVariance: 0.55, supplyChainRisk: 0.71 },
  },
  "CQ": {
    name: "Chloroquine Phosphate", strength: "250mg", class: "Antimalarial",
    type: "4-Aminoquinoline", costBand: "Low", sdgTarget: "12.4",
    icon: "🌿", color: "#B45309",
    manufacturers: ["Sanofi SA, France", "EMCURE Pharma", "Bliss GVS, Nigeria"],
    qcLabs: ["AFSSA Lab, Dakar", "NAFDAC Lab, Lagos", "KEMRI Lab, Kenya"],
    distributors: ["WestAfrica PharmaNet", "SahBridge Logistics", "RedMed Chain"],
    riskProfile: { baseRisk: 0.51, priceVariance: 0.48, supplyChainRisk: 0.60 },
  },
  // ── Analgesics ────────────────────────────────────────────────────────────
  "IB": {
    name: "Ibuprofen", strength: "400mg", class: "Analgesic / NSAID",
    type: "Non-steroidal anti-inflammatory", costBand: "Low", sdgTarget: "12.5",
    icon: "🩺", color: "#0A5A2E",
    manufacturers: ["Abbott Labs, USA", "EMZOR Pharma, Nigeria", "Reckitt Benckiser"],
    qcLabs: ["NAFDAC Lab, Lagos", "MCC Lab, Pretoria", "CDSCO Lab, India"],
    distributors: ["NigeriaMed Logistics", "SouthAfrica PharmaDist", "OTC Global"],
    riskProfile: { baseRisk: 0.14, priceVariance: 0.18, supplyChainRisk: 0.12 },
  },
  "PC": {
    name: "Paracetamol", strength: "500mg", class: "Analgesic / Antipyretic",
    type: "Para-aminophenol derivative", costBand: "Low", sdgTarget: "12.5",
    icon: "💉", color: "#0A5A2E",
    manufacturers: ["GSK Consumer, UK", "May & Baker, Nigeria", "Emzor Pharma"],
    qcLabs: ["NAFDAC Lab, Lagos", "MHRA Lab, London", "TGA Lab, Canberra"],
    distributors: ["WestMed Nigeria", "PacificPharma Dist", "AfriMed Logistics"],
    riskProfile: { baseRisk: 0.11, priceVariance: 0.12, supplyChainRisk: 0.09 },
  },
  // ── Antidiabetics ─────────────────────────────────────────────────────────
  "MT": {
    name: "Metformin HCl", strength: "500mg", class: "Antidiabetic",
    type: "Biguanide", costBand: "Low", sdgTarget: "12.8",
    icon: "⚗️", color: "#1A8C52",
    manufacturers: ["Merck KGaA, Germany", "Sun Pharma, India", "Strides Pharma"],
    qcLabs: ["EMA Lab, Amsterdam", "CDSCO Lab, India", "NAFDAC Lab, Lagos"],
    distributors: ["GlobalMed Freight", "IndoPharma Chain", "AfricaDrugNet"],
    riskProfile: { baseRisk: 0.09, priceVariance: 0.10, supplyChainRisk: 0.08 },
  },
  // ── Insulin ───────────────────────────────────────────────────────────────
  "IG": {
    name: "Insulin Glargine", strength: "100IU/mL", class: "Insulin Analogue",
    type: "Long-acting basal insulin", costBand: "High", sdgTarget: "12.4",
    icon: "🧪", color: "#B91C1C",
    manufacturers: ["Sanofi-Aventis, France", "Eli Lilly, USA", "Biocon, India"],
    qcLabs: ["FDA Lab, Maryland", "EMA Lab, Amsterdam", "CDSCO Lab, India"],
    distributors: ["ColdChain Medical", "BioFreight Global", "ThermoMed Express"],
    riskProfile: { baseRisk: 0.78, priceVariance: 0.66, supplyChainRisk: 0.82 },
  },
  // ── Uterotonics ───────────────────────────────────────────────────────────
  "OX": {
    name: "Oxytocin", strength: "10IU/mL", class: "Uterotonic",
    type: "Synthetic hormone", costBand: "Low", sdgTarget: "12.4",
    icon: "🏥", color: "#6D28D9",
    manufacturers: ["Ferring Pharma, Denmark", "Rotex Medica, Germany", "BHATT Labs, India"],
    qcLabs: ["EMA Lab, Amsterdam", "WHO Pre-Qual Lab, Geneva", "CDSCO Lab, India"],
    distributors: ["ColdChain Medical", "WHO Supply Chain", "UNICEF Supply Div"],
    riskProfile: { baseRisk: 0.55, priceVariance: 0.44, supplyChainRisk: 0.69 },
  },
  // ── ARVs ──────────────────────────────────────────────────────────────────
  "EF": {
    name: "Efavirenz", strength: "600mg", class: "Antiretroviral",
    type: "NNRTI", costBand: "Medium", sdgTarget: "12.4",
    icon: "🔴", color: "#B91C1C",
    manufacturers: ["Bristol-Myers Squibb", "Mylan Pharma, India", "Strides Arc"],
    qcLabs: ["FDA Lab, Maryland", "WHO Pre-Qual Lab, Geneva", "NAFDAC Lab, Lagos"],
    distributors: ["PEPFAR Supply Chain", "GlobalFund Logistics", "WHO Supply Chain"],
    riskProfile: { baseRisk: 0.38, priceVariance: 0.29, supplyChainRisk: 0.41 },
  },
  // ── Antihypertensives ─────────────────────────────────────────────────────
  "AM2": {
    name: "Amlodipine", strength: "5mg", class: "Calcium Channel Blocker",
    type: "Dihydropyridine CCB", costBand: "Low", sdgTarget: "12.8",
    icon: "❤️", color: "#B45309",
    manufacturers: ["Pfizer Inc, USA", "Norvasc Generic, UK", "Torrent Pharma"],
    qcLabs: ["MHRA Lab, London", "EMA Lab, Amsterdam", "CDSCO Lab, India"],
    distributors: ["EuroMed Logistics", "UKPharma Dist", "AfricaDrugNet"],
    riskProfile: { baseRisk: 0.08, priceVariance: 0.09, supplyChainRisk: 0.07 },
  },
};

// ── Batch Registry ────────────────────────────────────────────────────────────
// Each batch is uniquely linked to a drug prefix + year + sequence
export const BATCH_REGISTRY = {
  // Amoxicillin
  "AM-2024-04471": { prefix:"AM", year:2024, seq:"04471", mfrIdx:0, riskLevel:"Caution",   purity:91.2, transitDays:38, anomalyScore:0.64 },
  "AM-2024-01200": { prefix:"AM", year:2024, seq:"01200", mfrIdx:1, riskLevel:"Safe",      purity:98.7, transitDays:14, anomalyScore:0.11 },
  "AM-2023-88812": { prefix:"AM", year:2023, seq:"88812", mfrIdx:2, riskLevel:"High Risk", purity:61.3, transitDays:72, anomalyScore:0.89 },
  // Ciprofloxacin
  "CP-2024-03312": { prefix:"CP", year:2024, seq:"03312", mfrIdx:0, riskLevel:"Safe",      purity:99.1, transitDays:12, anomalyScore:0.08 },
  "CP-2024-07441": { prefix:"CP", year:2024, seq:"07441", mfrIdx:1, riskLevel:"Caution",   purity:87.4, transitDays:29, anomalyScore:0.51 },
  // Azithromycin
  "AZ-2024-00551": { prefix:"AZ", year:2024, seq:"00551", mfrIdx:0, riskLevel:"Safe",      purity:99.4, transitDays:9,  anomalyScore:0.06 },
  // Artemether-Lumefantrine
  "AL-2024-00821": { prefix:"AL", year:2024, seq:"00821", mfrIdx:0, riskLevel:"High Risk", purity:54.8, transitDays:61, anomalyScore:0.91 },
  "AL-2024-02233": { prefix:"AL", year:2024, seq:"02233", mfrIdx:1, riskLevel:"Caution",   purity:79.2, transitDays:44, anomalyScore:0.58 },
  "AL-2023-99901": { prefix:"AL", year:2023, seq:"99901", mfrIdx:2, riskLevel:"Safe",      purity:97.6, transitDays:18, anomalyScore:0.12 },
  // Chloroquine
  "CQ-2024-11140": { prefix:"CQ", year:2024, seq:"11140", mfrIdx:0, riskLevel:"Caution",   purity:83.1, transitDays:33, anomalyScore:0.56 },
  // Ibuprofen
  "IB-2024-07821": { prefix:"IB", year:2024, seq:"07821", mfrIdx:0, riskLevel:"Safe",      purity:98.2, transitDays:11, anomalyScore:0.09 },
  "IB-2023-55501": { prefix:"IB", year:2023, seq:"55501", mfrIdx:1, riskLevel:"High Risk", purity:58.4, transitDays:84, anomalyScore:0.82 },
  // Paracetamol
  "PC-2024-00102": { prefix:"PC", year:2024, seq:"00102", mfrIdx:0, riskLevel:"Safe",      purity:99.6, transitDays:7,  anomalyScore:0.04 },
  "PC-2024-08832": { prefix:"PC", year:2024, seq:"08832", mfrIdx:2, riskLevel:"Caution",   purity:88.9, transitDays:26, anomalyScore:0.43 },
  // Metformin
  "MT-2024-00441": { prefix:"MT", year:2024, seq:"00441", mfrIdx:0, riskLevel:"Safe",      purity:99.8, transitDays:10, anomalyScore:0.03 },
  // Insulin Glargine
  "IG-2024-01134": { prefix:"IG", year:2024, seq:"01134", mfrIdx:0, riskLevel:"High Risk", purity:49.7, transitDays:92, anomalyScore:0.94 },
  "IG-2024-03310": { prefix:"IG", year:2024, seq:"03310", mfrIdx:1, riskLevel:"Caution",   purity:82.4, transitDays:31, anomalyScore:0.47 },
  // Oxytocin
  "OX-2024-00881": { prefix:"OX", year:2024, seq:"00881", mfrIdx:0, riskLevel:"Caution",   purity:76.3, transitDays:44, anomalyScore:0.66 },
  // Efavirenz
  "EF-2024-02991": { prefix:"EF", year:2024, seq:"02991", mfrIdx:0, riskLevel:"Safe",      purity:97.3, transitDays:16, anomalyScore:0.14 },
  // Amlodipine
  "AM2-2024-00021":{ prefix:"AM2",year:2024, seq:"00021", mfrIdx:0, riskLevel:"Safe",      purity:99.1, transitDays:8,  anomalyScore:0.05 },
};

// ── Dynamic resolver ──────────────────────────────────────────────────────────
export const resolveBatch = (rawInput) => {
  const batchCode = rawInput.trim().toUpperCase().replace(/\s+/g, "-");

  // Exact match
  if (BATCH_REGISTRY[batchCode]) {
    const b = BATCH_REGISTRY[batchCode];
    const drug = DRUGS[b.prefix];
    return drug ? buildResult(batchCode, b, drug) : null;
  }

  // Fuzzy: try to find prefix in the input (e.g. "am2024" → AM)
  const prefixMatch = Object.keys(DRUGS).find(p =>
    batchCode.startsWith(p) || batchCode.includes(p)
  );
  if (prefixMatch) {
    // Return the first batch for that drug as a fallback
    const fallbackKey = Object.keys(BATCH_REGISTRY).find(k => BATCH_REGISTRY[k].prefix === prefixMatch);
    if (fallbackKey) {
      const b = BATCH_REGISTRY[fallbackKey];
      return buildResult(batchCode, { ...b, anomalyScore: b.anomalyScore + 0.05 }, DRUGS[prefixMatch]);
    }
  }

  // Unknown batch: generate a synthetic unknown result
  return buildUnknown(batchCode);
};

const buildResult = (batchCode, b, drug) => {
  const mfr = drug.manufacturers[b.mfrIdx % drug.manufacturers.length];
  const lab = drug.qcLabs[b.mfrIdx % drug.qcLabs.length];
  const dist = drug.distributors[b.mfrIdx % drug.distributors.length];

  // Derive hypotheses dynamically from risk profile
  const hypotheses = [];
  const r = drug.riskProfile;

  if (b.anomalyScore > 0.5) {
    hypotheses.push({
      conf: Math.round(60 + b.anomalyScore * 30),
      text: `Unverified distribution gap detected — no QC event recorded for ${Math.round(b.transitDays * 0.4)} days between registered handlers.`,
      agent: "Supply-Chain",
    });
  }
  if (b.purity < 90) {
    hypotheses.push({
      conf: Math.round(45 + (100 - b.purity) * 0.8),
      text: `Active ingredient purity estimated at ${b.purity.toFixed(1)}% — ${(100 - b.purity).toFixed(1)}% below stated concentration. Dilution or degradation suspected.`,
      agent: "Vision",
    });
  }
  if (r.priceVariance > 0.35) {
    hypotheses.push({
      conf: Math.round(50 + r.priceVariance * 20),
      text: `Price reported ${Math.round(r.priceVariance * 100)}% below regional low-cost band for ${drug.class.toLowerCase()} in this region — possible relabelling.`,
      agent: "Price",
    });
  }
  if (b.anomalyScore > 0.7) {
    hypotheses.push({
      conf: Math.round(b.anomalyScore * 75),
      text: `Abductive synthesis: convergence of supply-chain gap and purity anomaly raises composite risk to ${Math.round(b.anomalyScore * 100)}% confidence of counterfeit origin.`,
      agent: "Abductive",
    });
  }
  if (hypotheses.length === 0) {
    hypotheses.push({
      conf: Math.round((1 - b.anomalyScore) * 95),
      text: `All chain-of-custody events verified on-chain. Active ingredient within ±${(100 - b.purity).toFixed(1)}% of stated concentration. No anomalies detected.`,
      agent: "Abductive",
    });
  }
  hypotheses.sort((a, b2) => b2.conf - a.conf);

  // Build ledger events with real hashes
  const year = b.year;
  const d = (m, dd) => `${year}-${String(m).padStart(2,"0")}-${String(dd).padStart(2,"0")}`;
  const events = [
    { date: d(1, 8 + (b.seq.charCodeAt(0) % 7)), event: "Manufactured",        actor: mfr,               status: "verified", txHash: generateTxHash(batchCode+"mfr"),  detail: `Batch initiated. GMP compliance confirmed.` },
    { date: d(1, 20 + (b.seq.charCodeAt(1) % 8)), event: "QualityChecked",     actor: lab,               status: "verified", txHash: generateTxHash(batchCode+"qc"),   detail: `WHO-standard dissolution test passed.` },
    { date: d(2, 2 + (b.seq.charCodeAt(2) % 6)), event: "Released",             actor: mfr,               status: "verified", txHash: generateTxHash(batchCode+"rel"),  detail: `Certificate of analysis issued. Batch cleared.` },
    { date: d(2, 12 + (b.seq.charCodeAt(0) % 5)),event: "Shipped",              actor: dist,              status: b.anomalyScore>0.4?"flagged":"verified", txHash: b.anomalyScore>0.4?null:generateTxHash(batchCode+"ship"), detail: b.anomalyScore>0.4?`Cold-chain integrity uncertain during transit.`:`Shipped via verified cold-chain carrier.` },
    ...(b.anomalyScore > 0.55 ? [{
      date: d(2, 24 + (b.seq.charCodeAt(1) % 4)), event: "—",
      actor: "Unregistered intermediary", status: "missing", txHash: null, detail: `No blockchain event recorded for this handler. Identity unverifiable.`,
    }] : []),
    { date: d(3, 5 + (b.seq.charCodeAt(2) % 9)), event: "Received",             actor: `Central Pharmacy, ${mfr.split(",")[1]?.trim()||"Region"}`, status: b.anomalyScore>0.6?"flagged":"verified", txHash: generateTxHash(batchCode+"recv"), detail: `Inventory logged. ${b.anomalyScore>0.6?"Discrepancy in unit count noted.":"Count matched manifest."}` },
    { date: d(3, 18 + (b.seq.charCodeAt(0) % 6)), event: "Dispensed",           actor: "End-point pharmacy", status: "verified", txHash: generateTxHash(batchCode+"disp"), detail: `Patient dispensing recorded.` },
  ];

  return {
    found: true,
    batchCode,
    drug: `${drug.name} ${drug.strength}`,
    drugInfo: drug,
    riskLevel: b.riskLevel,
    purity: b.purity,
    anomalyScore: b.anomalyScore,
    transitDays: b.transitDays,
    hypotheses,
    events,
    sdg12: buildSDGNote(b.riskLevel, drug),
    stats: [
      { label: "Purity estimate",    value: `${b.purity.toFixed(1)}%`, sub: b.purity>95?"Within spec":b.purity>80?"Marginal":"Below threshold", good: b.purity>90 },
      { label: "Anomaly risk score", value: `${Math.round(b.anomalyScore*100)}/100`, sub: b.anomalyScore<0.25?"Low risk":b.anomalyScore<0.55?"Moderate":"High risk", good: b.anomalyScore<0.3 },
      { label: "Transit duration",   value: `${b.transitDays}d`, sub: b.transitDays<21?"Fast — optimal":b.transitDays<45?"Standard":"Extended — risk", good: b.transitDays<30 },
      { label: "Chain integrity",    value: `${events.filter(e=>e.status==="verified").length}/${events.length}`, sub: "Verified events", good: events.every(e=>e.status!=="missing") },
    ],
  };
};

const buildUnknown = (batchCode) => ({
  found: false,
  batchCode,
  drug: "Unknown batch",
  drugInfo: null,
  riskLevel: "High Risk",
  purity: null,
  anomalyScore: 0.95,
  transitDays: null,
  hypotheses: [
    { conf: 96, text: "Batch code not found in the ClearDose blockchain registry. This may indicate a counterfeit, a new batch not yet registered, or an entry error.", agent: "Abductive" },
    { conf: 88, text: "No manufacturer record retrievable. Provenance chain cannot be established.", agent: "Supply-Chain" },
    { conf: 74, text: "Without a verifiable chain of custody, active ingredient concentration cannot be estimated.", agent: "Vision" },
  ],
  events: [
    { date: new Date().toISOString().slice(0,10), event: "Query received", actor: "ClearDose AI", status: "verified", txHash: generateTxHash(batchCode), detail: "Batch lookup initiated." },
    { date: new Date().toISOString().slice(0,10), event: "Registry miss",  actor: "Blockchain Gateway", status: "missing", txHash: null, detail: "No matching record found on-chain." },
  ],
  sdg12: "An unregistered batch cannot be verified for SDG-12 compliance. Do not use this medicine. Report it to your national regulatory authority.",
  stats: [
    { label:"Purity estimate",    value:"—",    sub:"Cannot be determined", good:false },
    { label:"Anomaly risk score", value:"95/100",sub:"Batch not registered",  good:false },
    { label:"Transit duration",   value:"—",    sub:"No records found",     good:false },
    { label:"Chain integrity",    value:"0/—",  sub:"No verified events",   good:false },
  ],
});

const buildSDGNote = (level, drug) => {
  const notes = {
    Safe: `Batch ${drug.name} meets SDG ${drug.sdgTarget} requirements: sustainable production confirmed, chemical management compliant, packaging traceable.`,
    Caution: `Marginal compliance with SDG ${drug.sdgTarget}. Supply chain gaps represent risks to chemical accountability and informed consumption per SDG 12.8.`,
    "High Risk": `Critical SDG ${drug.sdgTarget} violation. If counterfeit, this batch represents unregistered chemical production, unsafe waste generation, and consumer deception — all directly contrary to SDG 12.4, 12.5, and 12.8.`,
  };
  return notes[level] || notes.Caution;
};

// ── Batch suggestions for autocomplete ───────────────────────────────────────
export const BATCH_SUGGESTIONS = Object.keys(BATCH_REGISTRY).map(k => ({
  code: k,
  drug: DRUGS[BATCH_REGISTRY[k].prefix]?.name || "Unknown",
  level: BATCH_REGISTRY[k].riskLevel,
}));
