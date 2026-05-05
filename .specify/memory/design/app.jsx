/* global React, ReactDOM */
const { useState, useMemo, useEffect, useRef } = React;

// =====================================================================
// DATA — a realistic single day plan to drive the cockpit
// =====================================================================

const TODAY = {
  user: {
    name: "Mara",
    sex: "F", age: 31, weight: 62, height: 168,
    pattern: "Pescatarian", locale: "EU / EFSA",
    goal: "Recomp · −0.25 kg/wk",
  },
  targets: { kcal: 2180, protein: 124, carbs: 270, fat: 72, fiber: 32 },
  totals:  { kcal: 2114, protein: 121, carbs: 258, fat: 71, fiber: 34 },
  pral: -7.4, // mEq/day, alkaline-leaning
  confidence: 0.84,
  redsRisk: "low",
  training: [
    { id: "t1", time: "07:30", end: "08:15", label: "Z2 run", kcal: 410, fuel: "fed-light" },
    { id: "t2", time: "18:00", end: "19:00", label: "Strength · lower", kcal: 290, fuel: "post-fuel" },
  ],
  meals: [
    {
      id: "m1", time: "06:45", name: "Pre-run sip", kcal: 120, p: 2, c: 28, f: 0,
      provenance: "calc", confidence: 0.9, weather: "sun",
      items: ["Banana 100g", "Black coffee 200ml"],
      notes: "Coffee timed 30 min before run; away from iron-rich meal.",
    },
    {
      id: "m2", time: "09:00", name: "Recovery breakfast", kcal: 540, p: 32, c: 64, f: 16,
      provenance: "fdc", confidence: 0.93, weather: "sun",
      items: ["Greek yogurt 200g", "Oats 60g", "Kiwi 120g", "Pumpkin seeds 15g", "Honey 10g"],
      notes: "Vitamin C from kiwi enhances non-haem iron from oats + seeds.",
      synergies: [{ kind: "fe-vitc", strength: 0.7 }],
    },
    {
      id: "m3", time: "12:45", name: "Lunch · grain bowl", kcal: 620, p: 34, c: 78, f: 18,
      provenance: "fdc", confidence: 0.88, weather: "sun",
      items: ["Lentils 180g", "Quinoa 90g (cooked)", "Roast peppers 120g", "Feta 40g", "Tahini 15g", "Lemon"],
      notes: "Lemon + peppers add ascorbate; tahini phytate moderate but offset.",
      synergies: [{ kind: "fe-vitc", strength: 0.6 }],
    },
    {
      id: "m4", time: "16:30", name: "Snack", kcal: 180, p: 6, c: 22, f: 8,
      provenance: "branded", confidence: 0.78, weather: "cloud",
      items: ["Dark chocolate 25g", "Earl grey tea 250ml"],
      notes: "Tea polyphenols may reduce iron absorption — kept distant from iron-heavy meals.",
      cautions: [{ kind: "tea-iron-buffer", strength: 0.4 }],
    },
    {
      id: "m5", time: "19:30", name: "Post-lift dinner", kcal: 654, p: 47, c: 66, f: 29,
      provenance: "fdc", confidence: 0.91, weather: "sun",
      items: ["Salmon fillet 140g", "Sweet potato 220g", "Broccolini 150g", "Olive oil 12g", "Walnuts 10g"],
      notes: "Fat present — supports A/D/E/K absorption from greens.",
      synergies: [{ kind: "fat-fatsol", strength: 0.8 }],
    },
  ],
  // Micronutrient adequacy vs EFSA PRI/AI
  nutrients: [
    { key: "Iron",       group: "min",  intake: 17.4, unit: "mg",  rda: 16, ul: 45,   conf: "med",  abs: { lo: 2.4, hi: 3.6 }, absUnit: "mg" },
    { key: "Zinc",       group: "min",  intake: 11.2, unit: "mg",  rda: 7.5, ul: 25,  conf: "med",  abs: { lo: 4.1, hi: 5.8 }, absUnit: "mg" },
    { key: "Calcium",    group: "min",  intake: 980,  unit: "mg",  rda: 950, ul: 2500,conf: "high" },
    { key: "Magnesium",  group: "min",  intake: 412,  unit: "mg",  rda: 300, ul: 250, conf: "high" },
    { key: "Potassium",  group: "min",  intake: 3640, unit: "mg",  rda: 3500,ul: null,conf: "high" },
    { key: "Sodium",     group: "min",  intake: 1980, unit: "mg",  rda: 2000,ul: 5000,conf: "high" },
    { key: "Iodine",     group: "min",  intake: 96,   unit: "µg",  rda: 150, ul: 600, conf: "low" },
    { key: "Selenium",   group: "min",  intake: 78,   unit: "µg",  rda: 70,  ul: 255, conf: "med" },

    { key: "Vit A",      group: "vit",  intake: 820,  unit: "µg",  rda: 650, ul: 3000,conf: "high" },
    { key: "Vit C",      group: "vit",  intake: 184,  unit: "mg",  rda: 95,  ul: null,conf: "high" },
    { key: "Vit D",      group: "vit",  intake: 12,   unit: "µg",  rda: 15,  ul: 100, conf: "med" },
    { key: "Vit E",      group: "vit",  intake: 14.2, unit: "mg",  rda: 11,  ul: 300, conf: "high" },
    { key: "Vit K",      group: "vit",  intake: 142,  unit: "µg",  rda: 70,  ul: null,conf: "high" },
    { key: "Folate",     group: "vit",  intake: 488,  unit: "µg",  rda: 330, ul: 1000,conf: "high" },
    { key: "B12",        group: "vit",  intake: 4.8,  unit: "µg",  rda: 4,   ul: null,conf: "high" },
    { key: "Omega-3",    group: "fat",  intake: 2.1,  unit: "g",   rda: 2.5, ul: null,conf: "med" },
  ],
  swaps: [
    { id: "s1", title: "Move tea earlier", impact: { fe: "+12%", kcal: "0" }, reason: "Wider buffer from iron-heavy lunch." },
    { id: "s2", title: "Swap feta → sardines", impact: { d: "+4µg", omega3: "+0.6g" }, reason: "Closes vit-D gap; small kcal change." },
    { id: "s3", title: "Add 200g milk to oats", impact: { ca: "+220mg", d: "+1.4µg" }, reason: "Spare protein budget; raises calcium effective." },
  ],
};

// =====================================================================
// PRIMITIVES
// =====================================================================

const Conf = ({ level }) => {
  // 3-tick confidence glyph
  const map = { high: 3, med: 2, low: 1 };
  const n = map[level] ?? 2;
  return (
    <span className="conf" title={`Confidence: ${level}`}>
      {[0,1,2].map(i => (
        <span key={i} className={`conf-tick ${i < n ? "on" : ""}`} />
      ))}
    </span>
  );
};

const Provenance = ({ src }) => {
  const labels = {
    fdc: { l: "FDC", t: "USDA FoodData Central · analytical" },
    ciqual: { l: "CIQUAL", t: "Anses CIQUAL · analytical" },
    branded: { l: "BRAND", t: "Branded label · vendor-supplied" },
    calc: { l: "CALC", t: "Calculated from recipe" },
    user: { l: "USER", t: "User-entered · low confidence" },
    photo: { l: "PHOTO", t: "Image-estimated · low confidence" },
  };
  const it = labels[src] || labels.calc;
  return <span className="prov" title={it.t}>{it.l}</span>;
};

// Weather glyphs for meal-level bioavailability
const Weather = ({ kind }) => {
  if (kind === "sun") return (
    <svg viewBox="0 0 24 24" className="weather sun" aria-label="favourable absorption">
      <circle cx="12" cy="12" r="4.2" fill="currentColor"/>
      {[0,45,90,135,180,225,270,315].map(a => (
        <line key={a} x1="12" y1="12" x2={12+9*Math.cos(a*Math.PI/180)} y2={12+9*Math.sin(a*Math.PI/180)} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      ))}
    </svg>
  );
  if (kind === "cloud") return (
    <svg viewBox="0 0 24 24" className="weather cloud" aria-label="neutral / mixed">
      <path d="M6 16h12a4 4 0 0 0 0-8 6 6 0 0 0-11.5-1.2A4 4 0 0 0 6 16Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" className="weather rain" aria-label="absorption inhibitor">
      <path d="M6 13h12a4 4 0 0 0 0-8 6 6 0 0 0-11.5-1.2A4 4 0 0 0 6 13Z" fill="none" stroke="currentColor" strokeWidth="1.6"/>
      <line x1="9" y1="16" x2="8" y2="20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="13" y1="16" x2="12" y2="20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="17" y1="16" x2="16" y2="20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
};

// =====================================================================
// HEADER
// =====================================================================

function Header({ onOpenInspector }) {
  return (
    <header className="hdr">
      <div className="hdr-l">
        <div className="logo">
          <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden>
            <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="1.6"/>
            <circle cx="16" cy="16" r="5.5" fill="currentColor"/>
            <line x1="16" y1="3" x2="16" y2="29" stroke="currentColor" strokeWidth="1" strokeDasharray="1 2"/>
          </svg>
          <span className="word">Plate</span>
          <span className="ver">v0.4 · evidence pack 2026.02</span>
        </div>
      </div>
      <nav className="hdr-c">
        <a className="nav on">Today</a>
        <a className="nav">Foods</a>
        <a className="nav">Plans</a>
        <a className="nav">Athlete</a>
        <a className="nav">Lab</a>
      </nav>
      <div className="hdr-r">
        <button className="hdr-btn" onClick={onOpenInspector}>
          <span className="dot" /> Evidence
        </button>
        <button className="hdr-btn ghost">⌘K</button>
        <div className="avatar">M</div>
      </div>
    </header>
  );
}

// =====================================================================
// COCKPIT — top numerical band
// =====================================================================

function Cockpit({ d }) {
  const dKcal = d.totals.kcal - d.targets.kcal;
  const items = [
    { k: "Energy",   v: d.totals.kcal,    u: "kcal", t: d.targets.kcal,    delta: dKcal, conf: "high" },
    { k: "Protein",  v: d.totals.protein, u: "g",    t: d.targets.protein, delta: d.totals.protein - d.targets.protein, conf: "high" },
    { k: "Carbs",    v: d.totals.carbs,   u: "g",    t: d.targets.carbs,   delta: d.totals.carbs - d.targets.carbs, conf: "high" },
    { k: "Fat",      v: d.totals.fat,     u: "g",    t: d.targets.fat,     delta: d.totals.fat - d.targets.fat, conf: "high" },
    { k: "Fiber",    v: d.totals.fiber,   u: "g",    t: d.targets.fiber,   delta: d.totals.fiber - d.targets.fiber, conf: "med" },
    { k: "PRAL",     v: d.pral,           u: "mEq",  t: 0, delta: d.pral, conf: "med", note: "alkaline-leaning" },
  ];
  return (
    <section className="cockpit">
      {items.map((it, i) => {
        const pct = it.k === "PRAL" ? null : Math.min(100, Math.round((it.v / it.t) * 100));
        return (
          <div key={i} className="cell">
            <div className="cell-k">
              <span>{it.k}</span>
              <Conf level={it.conf} />
            </div>
            <div className="cell-v">
              <span className="num">{it.v}</span>
              <span className="unit">{it.u}</span>
            </div>
            <div className="cell-meta">
              {it.k === "PRAL" ? (
                <span className="muted">target −5 to +5 · {it.note}</span>
              ) : (
                <>
                  <span className="muted">/ {it.t}{it.u}</span>
                  <span className={"delta " + (Math.abs(it.delta) <= it.t * 0.05 ? "ok" : it.delta < 0 ? "lo" : "hi")}>
                    {it.delta >= 0 ? "+" : ""}{it.delta}
                  </span>
                </>
              )}
            </div>
            {pct !== null && (
              <div className="cell-bar"><div style={{width: `${pct}%`}} /></div>
            )}
            {it.k === "PRAL" && (
              <div className="cell-bar pral">
                <div className="pral-axis" />
                <div className="pral-mark" style={{left: `${50 + (it.v * 2)}%`}} />
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}

// =====================================================================
// TIMELINE — the spine
// =====================================================================

function Timeline({ d, focus, setFocus }) {
  // hours 6 → 22
  const HOURS = Array.from({length: 17}, (_, i) => i + 6);
  const toX = (t) => {
    const [h, m] = t.split(":").map(Number);
    return ((h - 6) + m/60) / 16 * 100;
  };

  return (
    <section className="timeline">
      <div className="tl-head">
        <div className="tl-title">
          <h2>Day · Wed 04 May</h2>
          <div className="tl-sub">
            <span>EA risk <em className="ok">low</em></span>
            <span className="sep">·</span>
            <span>Confidence <em>{Math.round(d.confidence*100)}%</em></span>
            <span className="sep">·</span>
            <span>{d.meals.length} meals · {d.training.length} sessions</span>
          </div>
        </div>
        <div className="tl-actions">
          <button className="btn ghost">Regenerate</button>
          <button className="btn">Lock day</button>
        </div>
      </div>

      <div className="tl-grid">
        {/* hour ticks */}
        <div className="tl-axis">
          {HOURS.map(h => (
            <div key={h} className="tl-tick" style={{left: `${(h-6)/16*100}%`}}>
              <span>{String(h).padStart(2,"0")}</span>
            </div>
          ))}
        </div>

        {/* training rail */}
        <div className="tl-rail train">
          <div className="rail-label">Training</div>
          <div className="rail-track">
            {d.training.map(t => {
              const x1 = toX(t.time), x2 = toX(t.end);
              return (
                <div key={t.id} className="train-block" style={{left: `${x1}%`, width: `${x2-x1}%`}}>
                  <div className="tb-bar" />
                  <div className="tb-meta">
                    <span className="tb-time">{t.time}</span>
                    <span className="tb-label">{t.label}</span>
                    <span className="tb-kcal">−{t.kcal}kcal</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* meal rail */}
        <div className="tl-rail meals">
          <div className="rail-label">Meals</div>
          <div className="rail-track">
            {d.meals.map(m => {
              const x = toX(m.time);
              const w = Math.max(8, Math.min(22, m.kcal / 35));
              const isFocus = focus === m.id;
              return (
                <button key={m.id}
                        className={"meal-pin " + (isFocus ? "on" : "")}
                        style={{left: `${x}%`, width: `${w}%`}}
                        onClick={() => setFocus(m.id)}>
                  <div className="mp-top">
                    <Weather kind={m.weather} />
                    <span className="mp-time">{m.time}</span>
                    <Conf level={m.confidence > 0.9 ? "high" : m.confidence > 0.8 ? "med" : "low"} />
                  </div>
                  <div className="mp-name">{m.name}</div>
                  <div className="mp-kcal">{m.kcal} <span>kcal</span></div>
                  <div className="mp-mac">
                    <span className="mac p" style={{flex: m.p}} />
                    <span className="mac c" style={{flex: m.c}} />
                    <span className="mac f" style={{flex: m.f}} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* energy availability flow line */}
        <div className="tl-rail flow">
          <div className="rail-label">Energy</div>
          <div className="rail-track">
            <EnergyFlow d={d} />
          </div>
        </div>
      </div>
    </section>
  );
}

function EnergyFlow({ d }) {
  // Build a running net energy curve across day 06→22
  const points = [];
  let bal = 0;
  const events = [];
  d.meals.forEach(m => events.push({ t: m.time, dy: m.kcal, kind: "in" }));
  d.training.forEach(t => events.push({ t: t.time, dy: -t.kcal, kind: "out" }));
  events.sort((a,b) => a.t.localeCompare(b.t));

  // base 'expected burn' linear over day ~ targets.kcal * (h-6)/16
  const W = 800, H = 60;
  const toX = (t) => {
    const [h, m] = t.split(":").map(Number);
    return ((h - 6) + m/60) / 16 * W;
  };

  let path = `M 0 ${H/2} `;
  let bal2 = 0;
  let lastX = 0;
  events.forEach(ev => {
    const x = toX(ev.t);
    // baseline drift between
    bal2 -= ((x - lastX) / W) * 1800; // expected burn
    path += `L ${x.toFixed(1)} ${(H/2 - bal2/40).toFixed(1)} `;
    bal2 += ev.dy;
    path += `L ${x.toFixed(1)} ${(H/2 - bal2/40).toFixed(1)} `;
    lastX = x;
  });
  path += `L ${W} ${(H/2 - (bal2 - ((W-lastX)/W)*1800) / 40).toFixed(1)}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="flow-svg" preserveAspectRatio="none">
      <line x1="0" y1={H/2} x2={W} y2={H/2} stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 3" opacity="0.3" />
      <path d={path} fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

// =====================================================================
// MEAL DETAIL panel
// =====================================================================

function MealDetail({ meal, onClose }) {
  if (!meal) return null;
  return (
    <aside className="meal-detail">
      <div className="md-head">
        <div className="md-title">
          <span className="md-time">{meal.time}</span>
          <h3>{meal.name}</h3>
        </div>
        <button className="x" onClick={onClose}>×</button>
      </div>
      <div className="md-row">
        <Provenance src={meal.provenance} />
        <Conf level={meal.confidence > 0.9 ? "high" : meal.confidence > 0.8 ? "med" : "low"} />
        <span className="muted">absorption</span>
        <Weather kind={meal.weather} />
      </div>
      <div className="md-stat">
        <div><span className="num big">{meal.kcal}</span><span className="unit">kcal</span></div>
        <div className="md-mac">
          <span><em>{meal.p}g</em> protein</span>
          <span><em>{meal.c}g</em> carbs</span>
          <span><em>{meal.f}g</em> fat</span>
        </div>
      </div>
      <ul className="md-items">
        {meal.items.map((it, i) => (
          <li key={i}>
            <span className="bullet" />{it}
          </li>
        ))}
      </ul>
      <div className="md-note">
        <div className="md-note-k">Why this meal works</div>
        <p>{meal.notes}</p>
      </div>
      <div className="md-actions">
        <button className="btn ghost">Swap an item</button>
        <button className="btn ghost">Re-time</button>
        <button className="btn ghost">View evidence</button>
      </div>
    </aside>
  );
}

// =====================================================================
// NUTRIENT HEATMAP — replaces radial chart
// =====================================================================

function NutrientGrid({ nutrients, view }) {
  const rows = nutrients.filter(n => view === "all" || n.group === view);
  return (
    <section className="ngrid">
      <div className="ngrid-head">
        <h2>Micronutrient adequacy</h2>
        <div className="ngrid-legend">
          <span><i className="sw lo"/> below AR</span>
          <span><i className="sw mid"/> AR–PRI</span>
          <span><i className="sw ok"/> PRI met</span>
          <span><i className="sw hi"/> over UL</span>
        </div>
      </div>
      <div className="ngrid-table">
        {rows.map((n, i) => {
          const pct = (n.intake / n.rda) * 100;
          const ulPct = n.ul ? (n.intake / n.ul) * 100 : null;
          let band = "ok";
          if (pct < 67) band = "lo";
          else if (pct < 100) band = "mid";
          if (ulPct !== null && ulPct >= 100) band = "hi";

          // bar with PRI marker at pct=100
          return (
            <div key={i} className="nrow">
              <div className="ncell name">{n.key}</div>
              <div className="ncell num">
                <span className="num">{n.intake}</span>
                <span className="unit">{n.unit}</span>
                <Conf level={n.conf} />
              </div>
              <div className="ncell bar">
                <div className="nbar">
                  <div className={"nbar-fill " + band} style={{width: `${Math.min(150, pct)}%`}} />
                  <div className="nbar-pri" />
                  {n.ul && (
                    <div className="nbar-ul" style={{left: `${Math.min(150, (n.ul/n.rda)*100)}%`}} title="UL" />
                  )}
                  {n.abs && (
                    <div className="nbar-abs"
                         style={{left: `${(n.abs.lo/n.rda)*100}%`,
                                 width: `${((n.abs.hi - n.abs.lo)/n.rda)*100}%`}}
                         title={`Absorbable estimate ${n.abs.lo}–${n.abs.hi} ${n.absUnit}`} />
                  )}
                </div>
                <div className="nrow-meta">
                  <span>PRI {n.rda}{n.unit}</span>
                  {n.ul && <span>· UL {n.ul}{n.unit}</span>}
                  {n.abs && <span className="abs">· absorbable {n.abs.lo}–{n.abs.hi}{n.absUnit}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// =====================================================================
// TRADE-OFF SLIDER — novel: drag axis, watch the day rebalance
// =====================================================================

function TradeOff() {
  const [bal, setBal] = useState(40); // 0 = max iron, 100 = max prep speed
  // synthetic outputs
  const fePct = 110 - (bal * 0.6);
  const prepMin = 18 + bal * 0.5;
  const kcalDelta = (bal - 40) * 1.6;
  return (
    <section className="tradeoff">
      <div className="to-head">
        <h2>Trade-off resolver</h2>
        <span className="muted">deterministic optimiser · evidence v2026.02</span>
      </div>
      <div className="to-axis">
        <div className="to-pole l">
          <div className="pole-k">Maximise iron usability</div>
          <div className="pole-v">Fe abs <em className="ok">{fePct.toFixed(0)}%</em> of PRI</div>
        </div>
        <div className="to-track">
          <input type="range" min="0" max="100" value={bal}
                 onChange={e => setBal(+e.target.value)} />
          <div className="to-marks">
            {[0,25,50,75,100].map(m => <span key={m} style={{left: `${m}%`}} />)}
          </div>
        </div>
        <div className="to-pole r">
          <div className="pole-k">Minimise prep time</div>
          <div className="pole-v">Total prep <em>{prepMin.toFixed(0)} min</em></div>
        </div>
      </div>
      <div className="to-readout">
        <div className="to-pill">
          <span>Energy</span>
          <em className={Math.abs(kcalDelta) < 30 ? "ok" : "warn"}>{kcalDelta >= 0 ? "+" : ""}{kcalDelta.toFixed(0)} kcal</em>
        </div>
        <div className="to-pill">
          <span>Protein</span>
          <em className="ok">held at 124 g</em>
        </div>
        <div className="to-pill">
          <span>PRAL</span>
          <em>{(-7.4 + bal*0.04).toFixed(1)} mEq</em>
        </div>
        <div className="to-pill">
          <span>Budget</span>
          <em>€{(11.2 + (100-bal)*0.04).toFixed(2)}</em>
        </div>
      </div>
    </section>
  );
}

// =====================================================================
// SWAP STACK
// =====================================================================

function SwapStack({ swaps }) {
  return (
    <section className="swaps">
      <div className="swaps-head">
        <h2>Swap suggestions</h2>
        <span className="muted">3 of 12 ranked options · keep kcal ±2%</span>
      </div>
      <ul className="swap-list">
        {swaps.map(s => (
          <li key={s.id} className="swap">
            <div className="swap-l">
              <div className="swap-title">{s.title}</div>
              <div className="swap-reason">{s.reason}</div>
            </div>
            <div className="swap-impact">
              {Object.entries(s.impact).map(([k,v]) => (
                <span key={k} className="imp">
                  <em>{k}</em>{v}
                </span>
              ))}
            </div>
            <button className="btn ghost">Apply</button>
          </li>
        ))}
      </ul>
    </section>
  );
}

// =====================================================================
// EVIDENCE INSPECTOR — drawer
// =====================================================================

function EvidenceDrawer({ open, onClose }) {
  return (
    <div className={"drawer " + (open ? "on" : "")}>
      <div className="drawer-head">
        <h3>Evidence inspector</h3>
        <button className="x" onClick={onClose}>×</button>
      </div>
      <div className="drawer-body">
        <div className="ev-stack">
          <div className="ev-row">
            <span className="ev-k">Sources</span>
            <span className="ev-v">USDA FDC · Anses CIQUAL · EFSA DRV 2024</span>
          </div>
          <div className="ev-row">
            <span className="ev-k">Reference pack</span>
            <span className="ev-v">EFSA PRI · adult female 19–50</span>
          </div>
          <div className="ev-row">
            <span className="ev-k">PRAL</span>
            <span className="ev-v">Remer–Manz, computed live from current nutrients</span>
          </div>
          <div className="ev-row">
            <span className="ev-k">Iron bioavail. rules</span>
            <span className="ev-v">vit-C synergy, polyphenol penalty, calcium-suppl. timing</span>
          </div>
          <div className="ev-row">
            <span className="ev-k">RED-S guardrail</span>
            <span className="ev-v">IOC 2023 consensus, EA &lt; 30 kcal/kg FFM flagged</span>
          </div>
          <div className="ev-row">
            <span className="ev-k">Calculation hash</span>
            <span className="ev-v mono">3f9c·a14b·02e8</span>
          </div>
          <div className="ev-row">
            <span className="ev-k">Evidence pack</span>
            <span className="ev-v">2026.02 · changelog</span>
          </div>
        </div>
        <div className="ev-note">
          Plate reports estimates with confidence bands. Numbers shown reflect probabilistic absorbable intake, not lab-grade values. Not a medical device.
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// SIDEBAR — profile, training, RED-S
// =====================================================================

function SidePanel({ d }) {
  return (
    <aside className="side">
      <div className="side-block">
        <div className="side-head">
          <h3>{d.user.name}</h3>
          <span className="muted">{d.user.sex} · {d.user.age} · {d.user.weight}kg</span>
        </div>
        <div className="kv">
          <div><span>Pattern</span><em>{d.user.pattern}</em></div>
          <div><span>Locale</span><em>{d.user.locale}</em></div>
          <div><span>Goal</span><em>{d.user.goal}</em></div>
        </div>
      </div>

      <div className="side-block">
        <div className="side-head">
          <h3>RED-S guardrail</h3>
          <span className="pill ok">low risk</span>
        </div>
        <div className="reds-grid">
          <div className="reds-cell">
            <div className="reds-k">EA estimate</div>
            <div className="reds-v">38 <span>kcal/kg FFM</span></div>
            <div className="reds-bar"><div style={{width: "78%"}} /></div>
            <div className="reds-meta muted">threshold 30 · IOC '23</div>
          </div>
          <div className="reds-cell">
            <div className="reds-k">Loss rate</div>
            <div className="reds-v">−0.25 <span>kg/wk</span></div>
            <div className="reds-meta muted">within safe range</div>
          </div>
        </div>
      </div>

      <div className="side-block">
        <div className="side-head">
          <h3>Pattern · 7 days</h3>
        </div>
        <Spark />
      </div>

      <div className="side-block notice">
        <div className="notice-k">Hidden-calorie mode</div>
        <p>Numbers stay computed but are visually muted. Use during sensitive periods.</p>
        <button className="btn ghost sm">Enable</button>
      </div>
    </aside>
  );
}

function Spark() {
  // 7-day kcal vs target sparkline + protein dots
  const data = [2050, 2160, 2080, 2200, 1990, 2110, 2114];
  const target = 2180;
  const min = 1900, max = 2300;
  const W = 220, H = 56;
  const pts = data.map((v, i) => `${(i/(data.length-1))*W},${H - ((v-min)/(max-min))*H}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="spark">
      <line x1="0" y1={H - ((target-min)/(max-min))*H} x2={W} y2={H - ((target-min)/(max-min))*H}
            stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 3" opacity="0.4" />
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.4" />
      {data.map((v, i) => (
        <circle key={i} cx={(i/(data.length-1))*W} cy={H - ((v-min)/(max-min))*H} r="2" fill="currentColor"/>
      ))}
    </svg>
  );
}

// =====================================================================
// COMMAND BAR — bottom
// =====================================================================

function CommandBar() {
  return (
    <div className="cmdbar">
      <div className="cmd-l">
        <kbd>⌘K</kbd>
        <span>Add food, search nutrient, jump to meal…</span>
      </div>
      <div className="cmd-r">
        <span className="cmd-stat"><i className="dot ok"/>data fresh · 2 min ago</span>
        <span className="cmd-stat">FDC 2026.04 · CIQUAL 2024.1</span>
      </div>
    </div>
  );
}

// =====================================================================
// APP
// =====================================================================

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "vital-green",
  "density": "comfortable",
  "showAbsorbable": true,
  "nutrientView": "all",
  "showFlow": true,
  "showTimelineLabels": true
}/*EDITMODE-END*/;

function App() {
  const [focus, setFocus] = useState("m3");
  const [drawer, setDrawer] = useState(false);
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [tweaks, setTweak] = window.useTweaks ? window.useTweaks(TWEAK_DEFAULTS) : [TWEAK_DEFAULTS, () => {}];

  // edit-mode protocol
  useEffect(() => {
    const onMsg = (e) => {
      if (!e.data || typeof e.data !== "object") return;
      if (e.data.type === "__activate_edit_mode") setTweaksOpen(true);
      if (e.data.type === "__deactivate_edit_mode") setTweaksOpen(false);
    };
    window.addEventListener("message", onMsg);
    window.parent.postMessage({type: "__edit_mode_available"}, "*");
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const meal = TODAY.meals.find(m => m.id === focus);

  // accent colors
  const accentMap = {
    "vital-green": "oklch(0.72 0.14 145)",
    "deep-violet": "oklch(0.58 0.16 295)",
    "ember":       "oklch(0.66 0.17 35)",
    "ink":         "oklch(0.30 0.04 260)",
  };
  const root = useRef(null);
  useEffect(() => {
    if (root.current) {
      root.current.style.setProperty("--accent", accentMap[tweaks.accent] || accentMap["vital-green"]);
    }
  }, [tweaks.accent]);

  return (
    <div ref={root} className={"app " + (tweaks.density === "compact" ? "compact" : "")}
         data-screen-label="Plate · Today">
      <Header onOpenInspector={() => setDrawer(true)} />

      <main className="main">
        <div className="main-l">
          <Cockpit d={TODAY} />
          <Timeline d={TODAY} focus={focus} setFocus={setFocus} />
          <div className="dual">
            <NutrientGrid nutrients={TODAY.nutrients} view={tweaks.nutrientView || "all"} />
            <div className="dual-r">
              <MealDetail meal={meal} onClose={() => setFocus(null)} />
              <TradeOff />
            </div>
          </div>
          <SwapStack swaps={TODAY.swaps} />
        </div>
        <SidePanel d={TODAY} />
      </main>

      <CommandBar />
      <EvidenceDrawer open={drawer} onClose={() => setDrawer(false)} />

      {tweaksOpen && window.TweaksPanel && (
        <window.TweaksPanel onClose={() => setTweaksOpen(false)} title="Tweaks">
          <window.TweakSection title="Aesthetic">
            <window.TweakRadio
              label="Accent"
              value={tweaks.accent}
              onChange={(v) => setTweak("accent", v)}
              options={[
                { value: "vital-green", label: "Vital green" },
                { value: "deep-violet", label: "Violet" },
                { value: "ember", label: "Ember" },
                { value: "ink", label: "Ink" },
              ]}
            />
            <window.TweakRadio
              label="Density"
              value={tweaks.density}
              onChange={(v) => setTweak("density", v)}
              options={[
                { value: "comfortable", label: "Comfortable" },
                { value: "compact", label: "Compact" },
              ]}
            />
          </window.TweakSection>
          <window.TweakSection title="Display">
            <window.TweakToggle
              label="Show absorbable range on bars"
              value={tweaks.showAbsorbable}
              onChange={(v) => setTweak("showAbsorbable", v)}
            />
            <window.TweakSelect
              label="Nutrient view"
              value={tweaks.nutrientView}
              onChange={(v) => setTweak("nutrientView", v)}
              options={[
                { value: "all", label: "All nutrients" },
                { value: "vit", label: "Vitamins only" },
                { value: "min", label: "Minerals only" },
                { value: "fat", label: "Fats" },
              ]}
            />
          </window.TweakSection>
        </window.TweaksPanel>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
