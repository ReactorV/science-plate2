/* global React */
const { useState } = React;

// =====================================================================
// PLATE MOBILE — five screens
// =====================================================================

const M = {
  user: { name: "Mara" },
  totals: { kcal: 2114, protein: 121, carbs: 258, fat: 71 },
  targets: { kcal: 2180, protein: 124, carbs: 270, fat: 72 },
  pral: -7.4,
  meals: [
    { id: "m1", time: "06:45", name: "Pre-run sip",        kcal: 120, w: "sun"   },
    { id: "m2", time: "09:00", name: "Recovery breakfast", kcal: 540, w: "sun"   },
    { id: "m3", time: "12:45", name: "Grain bowl",         kcal: 620, w: "sun"   },
    { id: "m4", time: "16:30", name: "Snack",              kcal: 180, w: "cloud" },
    { id: "m5", time: "19:30", name: "Post-lift dinner",   kcal: 654, w: "sun"   },
  ],
  training: [
    { time: "07:30", label: "Z2 run",         kcal: 410 },
    { time: "18:00", label: "Strength · low", kcal: 290 },
  ],
  nutrients: [
    { k: "Iron",    v: 17.4, u: "mg", pri: 16,  band: "ok",  conf: "med",  abs: "2.4–3.6 absorbable" },
    { k: "Zinc",    v: 11.2, u: "mg", pri: 7.5, band: "ok",  conf: "med",  abs: "4.1–5.8 absorbable" },
    { k: "Vit D",   v: 12,   u: "µg", pri: 15,  band: "mid", conf: "med",  abs: null },
    { k: "Calcium", v: 980,  u: "mg", pri: 950, band: "ok",  conf: "high", abs: null },
    { k: "Mg",      v: 412,  u: "mg", pri: 300, band: "ok",  conf: "high", abs: null },
    { k: "Folate",  v: 488,  u: "µg", pri: 330, band: "ok",  conf: "high", abs: null },
    { k: "B12",     v: 4.8,  u: "µg", pri: 4,   band: "ok",  conf: "high", abs: null },
    { k: "Iodine",  v: 96,   u: "µg", pri: 150, band: "lo",  conf: "low",  abs: null },
    { k: "Ω-3",    v: 2.1,  u: "g",  pri: 2.5, band: "mid", conf: "med",  abs: null },
  ],
};

// ---------- shared bits ----------
const Conf = ({ level }) => {
  const n = { high: 3, med: 2, low: 1 }[level] ?? 2;
  return (
    <span className="m-conf">
      {[0,1,2].map(i => <span key={i} className={"t " + (i < n ? "on" : "")} />)}
    </span>
  );
};

const Sun = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" className="m-w sun">
    <circle cx="12" cy="12" r="4" fill="currentColor"/>
    {[0,45,90,135,180,225,270,315].map(a =>
      <line key={a} x1="12" y1="12"
            x2={12+8.5*Math.cos(a*Math.PI/180)}
            y2={12+8.5*Math.sin(a*Math.PI/180)}
            stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>)}
  </svg>
);
const Cloud = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" className="m-w cloud">
    <path d="M6 16h12a4 4 0 0 0 0-8 6 6 0 0 0-11.5-1.2A4 4 0 0 0 6 16Z"
          fill="none" stroke="currentColor" strokeWidth="1.6"/>
  </svg>
);
const Weather = ({ k }) => k === "sun" ? <Sun /> : <Cloud />;

// =====================================================================
// 1 · TODAY (mobile cockpit)
// =====================================================================
function ScreenToday() {
  return (
    <div className="m-screen today">
      <div className="m-statusbar"/>
      <header className="m-hdr">
        <div>
          <div className="m-eyebrow">Wed · 04 May</div>
          <h1>Good morning, Mara</h1>
        </div>
        <button className="m-avatar">M</button>
      </header>

      <div className="m-ring-wrap">
        <Ring />
        <div className="m-ring-meta">
          <div className="m-ring-num">{M.totals.kcal}</div>
          <div className="m-ring-sub">/&nbsp;{M.targets.kcal}&nbsp;kcal</div>
          <div className="m-ring-sub2">{M.targets.kcal - M.totals.kcal} kcal left</div>
          <div className="m-ring-conf">
            <Conf level="high"/> <span>84% confidence</span>
          </div>
        </div>
      </div>

      <div className="m-mac3">
        <MacroChip k="Protein" v={M.totals.protein} t={M.targets.protein} u="g" tone="p"/>
        <MacroChip k="Carbs"   v={M.totals.carbs}   t={M.targets.carbs}   u="g" tone="c"/>
        <MacroChip k="Fat"     v={M.totals.fat}     t={M.targets.fat}     u="g" tone="f"/>
      </div>

      <section className="m-section">
        <div className="m-sec-head">
          <h2>Today's plan</h2>
          <button className="m-link">Regenerate</button>
        </div>

        <div className="m-meals">
          {M.meals.slice(0, 3).map((mm, i) => {
            const train = M.training.find(t => t.time > (M.meals[i-1]?.time || "00:00") && t.time < mm.time);
            return (
              <React.Fragment key={mm.id}>
                {train && <TrainingLane t={train}/>}
                <MealRow m={mm}/>
              </React.Fragment>
            );
          })}
        </div>
      </section>

      <section className="m-section">
        <div className="m-sec-head"><h2>Day signals</h2></div>
        <div className="m-signal-grid">
          <Signal k="PRAL" v="−7.4" u="mEq" hint="alkaline" tone="ok"/>
          <Signal k="Fiber" v="34" u="g" hint="+2 vs target" tone="ok"/>
          <Signal k="EA" v="38" u="kcal/kg" hint="RED-S low" tone="ok"/>
          <Signal k="Vit D" v="12" u="µg" hint="below PRI" tone="warn"/>
        </div>
      </section>

      <BottomNav active="today"/>
    </div>
  );
}

function Ring() {
  const pct = M.totals.kcal / M.targets.kcal;
  const R = 96, C = 2 * Math.PI * R;
  return (
    <svg viewBox="0 0 240 240" className="m-ring">
      <defs>
        <linearGradient id="rgrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.38 0.18 295)"/>
          <stop offset="50%" stopColor="oklch(0.55 0.20 295)"/>
          <stop offset="100%" stopColor="oklch(0.78 0.16 310)"/>
        </linearGradient>
      </defs>
      <circle cx="120" cy="120" r={R} fill="none" stroke="oklch(0.93 0.014 295)" strokeWidth="14"/>
      <circle cx="120" cy="120" r={R} fill="none"
              stroke="url(#rgrad)" strokeWidth="14" strokeLinecap="round"
              strokeDasharray={`${pct*C} ${C}`}
              transform="rotate(-90 120 120)"/>
      {/* tick marks at meal times */}
      {M.meals.map(mm => {
        const [h, mn] = mm.time.split(":").map(Number);
        const ang = ((h*60 + mn) / 1440) * 360 - 90;
        const r1 = R + 12, r2 = R + 18;
        return (
          <line key={mm.id}
                x1={120 + r1 * Math.cos(ang*Math.PI/180)}
                y1={120 + r1 * Math.sin(ang*Math.PI/180)}
                x2={120 + r2 * Math.cos(ang*Math.PI/180)}
                y2={120 + r2 * Math.sin(ang*Math.PI/180)}
                stroke="oklch(0.55 0.20 295)" strokeWidth="2" strokeLinecap="round"/>
        );
      })}
    </svg>
  );
}

function MacroChip({ k, v, t, u, tone }) {
  const pct = Math.min(100, (v/t)*100);
  return (
    <div className={"m-macro " + tone}>
      <div className="m-macro-k">{k}</div>
      <div className="m-macro-v"><span className="num">{v}</span><span className="unit">{u}</span></div>
      <div className="m-macro-bar"><div style={{width:`${pct}%`}}/></div>
      <div className="m-macro-meta">/ {t}{u}</div>
    </div>
  );
}

function MealRow({ m }) {
  return (
    <button className="m-meal">
      <div className="m-meal-time">{m.time}</div>
      <div className="m-meal-dot"><Weather k={m.w}/></div>
      <div className="m-meal-mid">
        <div className="m-meal-name">{m.name}</div>
        <div className="m-meal-meta">FDC · high confidence</div>
      </div>
      <div className="m-meal-kcal">{m.kcal}<span>kcal</span></div>
    </button>
  );
}
function TrainingLane({ t }) {
  if (!t) return null;
  return (
    <div className="m-train">
      <div className="m-train-time">{t.time}</div>
      <div className="m-train-bar"/>
      <div className="m-train-mid">{t.label}</div>
      <div className="m-train-kcal">−{t.kcal}<span>kcal</span></div>
    </div>
  );
}
function Signal({ k, v, u, hint, tone }) {
  return (
    <div className={"m-sig " + tone}>
      <div className="m-sig-k">{k}</div>
      <div className="m-sig-v"><span className="num">{v}</span><span className="unit">{u}</span></div>
      <div className="m-sig-hint">{hint}</div>
    </div>
  );
}

function BottomNav({ active }) {
  const items = [
    { id: "today",    label: "Today" },
    { id: "plan",     label: "Plan" },
    { id: "scan",     label: "" },
    { id: "foods",    label: "Foods" },
    { id: "you",      label: "You" },
  ];
  return (
    <nav className="m-bnav">
      {items.map(it => (
        <button key={it.id} className={"m-bnav-i " + (active === it.id ? "on" : "") + (it.id === "scan" ? " scan" : "")}>
          {it.id === "scan" ? <span className="m-fab">+</span> : (
            <>
              <span className="m-bnav-glyph">
                {it.id === "today" && <svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="12" r="3.5" fill="currentColor"/></svg>}
                {it.id === "plan"  && <svg viewBox="0 0 24 24" width="20" height="20"><rect x="4" y="6" width="16" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6"/><line x1="4" y1="11" x2="20" y2="11" stroke="currentColor" strokeWidth="1.6"/><line x1="9" y1="3" x2="9" y2="7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><line x1="15" y1="3" x2="15" y2="7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>}
                {it.id === "foods" && <svg viewBox="0 0 24 24" width="20" height="20"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.6"/><line x1="16" y1="16" x2="21" y2="21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>}
                {it.id === "you"   && <svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="9" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M5 20c1-4 4.5-6 7-6s6 2 7 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>}
              </span>
              <span>{it.label}</span>
            </>
          )}
        </button>
      ))}
    </nav>
  );
}

// =====================================================================
// 2 · MEAL DETAIL
// =====================================================================
function ScreenMeal() {
  return (
    <div className="m-screen meal">
      <div className="m-statusbar"/>
      <header className="m-hdr small">
        <button className="m-back">←</button>
        <div className="m-hdr-title">12:45 · Lunch</div>
        <button className="m-icon">⋯</button>
      </header>

      <div className="m-meal-hero">
        <div className="m-meal-img">
          <span className="m-meal-img-tag">grain bowl</span>
        </div>
        <div className="m-meal-hero-row">
          <span className="m-prov">FDC</span>
          <Conf level="high"/>
          <span className="m-w-row"><Sun/> <em>favourable</em></span>
        </div>
        <h1>Lunch · grain bowl</h1>
        <div className="m-meal-stat">
          <div className="big-num">620<em>kcal</em></div>
          <div className="m-meal-mac">
            <span><em>34g</em>P</span>
            <span><em>78g</em>C</span>
            <span><em>18g</em>F</span>
          </div>
        </div>
      </div>

      <ul className="m-ing">
        {["Lentils 180g","Quinoa 90g cooked","Roast peppers 120g","Feta 40g","Tahini 15g","Lemon"].map((i,k) => (
          <li key={k}>
            <span className="m-ing-bullet"/>
            <span className="m-ing-name">{i}</span>
            <span className="m-ing-kcal">{[180,142,76,118,98,8][k]}</span>
          </li>
        ))}
      </ul>

      <div className="m-why">
        <div className="m-why-head">
          <Sun/>
          <span>Why this meal works</span>
        </div>
        <p>Lemon and roast peppers add ascorbate, which raises non-haem iron uptake from lentils. Tahini phytate is moderate but offset by the vitamin-C context.</p>
        <div className="m-why-rules">
          <span>Fe + vit-C synergy</span>
          <span>· phytate moderate</span>
        </div>
      </div>

      <div className="m-actions">
        <button className="m-btn ghost">Swap item</button>
        <button className="m-btn">Lock meal</button>
      </div>
    </div>
  );
}

// =====================================================================
// 3 · NUTRIENT SCORECARD
// =====================================================================
function ScreenNutrients() {
  const [tab, setTab] = useState("all");
  const list = M.nutrients;
  return (
    <div className="m-screen nutri">
      <div className="m-statusbar"/>
      <header className="m-hdr small">
        <button className="m-back">←</button>
        <div className="m-hdr-title">Nutrients</div>
        <button className="m-icon">⚙</button>
      </header>

      <div className="m-pack">
        <div className="m-pack-k">Reference pack</div>
        <div className="m-pack-v">EFSA PRI · adult F · 19–50</div>
      </div>

      <div className="m-tabs">
        {[["all","All"],["min","Minerals"],["vit","Vitamins"],["fat","Fats"]].map(([k,l]) => (
          <button key={k} className={"m-tab " + (tab === k ? "on" : "")} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      <ul className="m-ngrid">
        {list.map((n,i) => {
          const pct = Math.min(150, (n.v/n.pri)*100);
          return (
            <li key={i} className="m-nrow">
              <div className="m-nrow-top">
                <span className="m-n-name">{n.k}</span>
                <Conf level={n.conf}/>
                <span className="m-n-v">{n.v}<em>{n.u}</em></span>
              </div>
              <div className="m-nbar">
                <div className={"fill " + n.band} style={{width: `${pct}%`}}/>
                <div className="pri"/>
              </div>
              <div className="m-nrow-bot">
                <span>PRI {n.pri}{n.u}</span>
                {n.abs && <span className="abs">· {n.abs}</span>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// =====================================================================
// 4 · TRADE-OFF RESOLVER
// =====================================================================
function ScreenTradeoff() {
  const [bal, setBal] = useState(35);
  const fePct = (110 - bal*0.6).toFixed(0);
  const prep = (18 + bal*0.5).toFixed(0);
  const dKcal = ((bal-40)*1.6).toFixed(0);
  return (
    <div className="m-screen trade">
      <div className="m-statusbar"/>
      <header className="m-hdr small dark">
        <button className="m-back">←</button>
        <div className="m-hdr-title">Resolver</div>
        <button className="m-icon">↺</button>
      </header>

      <div className="m-trade-blurb">
        <div className="m-trade-eyebrow">Optimiser · evidence v2026.02</div>
        <h1>Find your trade-off.</h1>
        <p>Drag the dial. The day rebalances against PRI, UL, and your training load.</p>
      </div>

      <div className="m-trade-poles">
        <div className="m-pole">
          <div className="m-pole-k">Iron usability</div>
          <div className="m-pole-v">{fePct}<em>% PRI</em></div>
        </div>
        <div className="m-pole r">
          <div className="m-pole-k">Prep time</div>
          <div className="m-pole-v">{prep}<em>min</em></div>
        </div>
      </div>

      <div className="m-slider">
        <input type="range" min="0" max="100" value={bal}
               onChange={e => setBal(+e.target.value)}/>
        <div className="m-slider-marks">
          {[0,25,50,75,100].map(p => <span key={p} style={{left:`${p}%`}}/>)}
        </div>
      </div>

      <div className="m-trade-readout">
        <div><span>Energy</span><em className={Math.abs(dKcal)<30?"ok":"warn"}>{dKcal>=0?"+":""}{dKcal} kcal</em></div>
        <div><span>Protein</span><em className="ok">held 124 g</em></div>
        <div><span>PRAL</span><em>{(-7.4 + bal*0.04).toFixed(1)} mEq</em></div>
        <div><span>Budget</span><em>€{(11.2 + (100-bal)*0.04).toFixed(2)}</em></div>
      </div>

      <div className="m-trade-cta">
        <button className="m-btn">Apply this plan</button>
        <button className="m-btn ghost">Save preset</button>
      </div>
    </div>
  );
}

// =====================================================================
// 5 · ADD FOOD (search + scan)
// =====================================================================
function ScreenAdd() {
  return (
    <div className="m-screen add">
      <div className="m-statusbar"/>
      <header className="m-hdr small">
        <button className="m-back">×</button>
        <div className="m-hdr-title">Add food</div>
        <button className="m-icon">⌘</button>
      </header>

      <div className="m-search">
        <svg viewBox="0 0 24 24" width="16" height="16"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.6"/><line x1="16" y1="16" x2="21" y2="21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
        <input placeholder="Search 1.4M foods…" defaultValue="lentils"/>
        <span className="m-kbd">⌘K</span>
      </div>

      <div className="m-modes">
        <button className="m-mode on">Search</button>
        <button className="m-mode">Scan</button>
        <button className="m-mode">Photo</button>
        <button className="m-mode">Recipe</button>
      </div>

      <div className="m-results">
        <div className="m-results-head">
          <span>3 sources · ranked by provenance</span>
          <span>FDC ▸ CIQUAL ▸ Branded</span>
        </div>

        {[
          { name: "Lentils, green, cooked", brand: "FDC Foundation", kcal: 116, prov: "FDC", conf: "high", abs: "Fe 1.1 mg · 30% absorbable est." },
          { name: "Lentilles vertes du Puy",  brand: "CIQUAL 2024",     kcal: 119, prov: "CIQUAL", conf: "high", abs: "Fe 1.0 mg" },
          { name: "Organic Lentils",           brand: "BrandX",          kcal: 122, prov: "BRAND", conf: "med",  abs: null },
          { name: "Lentil dal (recipe)",       brand: "Calculated",      kcal: 154, prov: "CALC", conf: "med",  abs: null },
          { name: "Lentil chips",              brand: "User entry",      kcal: 480, prov: "USER", conf: "low",  abs: null },
        ].map((r,i) => (
          <button key={i} className="m-result">
            <div className="m-result-l">
              <div className="m-result-n">{r.name}</div>
              <div className="m-result-b">{r.brand} · per 100 g</div>
              {r.abs && <div className="m-result-abs">{r.abs}</div>}
            </div>
            <div className="m-result-r">
              <span className="m-prov">{r.prov}</span>
              <Conf level={r.conf}/>
              <div className="m-result-kcal">{r.kcal}<em>kcal</em></div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// =====================================================================
// CANVAS WRAPPER
// =====================================================================
function App() {
  // iPhone 15 viewport: 393x852
  const W = 393, H = 852;
  return (
    <window.DesignCanvas projectTitle="Plate · Mobile" projectSubtitle="iPhone web · responsive views">
      <window.DCSection id="phones" title="Plate · Mobile web" subtitle="5 core screens · iPhone 15 · 393×852">
        <window.DCArtboard id="today" label="01 · Today" width={W} height={H}>
          <window.IOSDevice width={W} height={H}><ScreenToday/></window.IOSDevice>
        </window.DCArtboard>
        <window.DCArtboard id="meal" label="02 · Meal detail" width={W} height={H}>
          <window.IOSDevice width={W} height={H}><ScreenMeal/></window.IOSDevice>
        </window.DCArtboard>
        <window.DCArtboard id="nutri" label="03 · Nutrient scorecard" width={W} height={H}>
          <window.IOSDevice width={W} height={H}><ScreenNutrients/></window.IOSDevice>
        </window.DCArtboard>
        <window.DCArtboard id="trade" label="04 · Trade-off resolver" width={W} height={H}>
          <window.IOSDevice width={W} height={H}><ScreenTradeoff/></window.IOSDevice>
        </window.DCArtboard>
        <window.DCArtboard id="add" label="05 · Add food" width={W} height={H}>
          <window.IOSDevice width={W} height={H}><ScreenAdd/></window.IOSDevice>
        </window.DCArtboard>
      </window.DCSection>
    </window.DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
