export interface FormulaEntry {
  code: string
  nav: string
  title: string
  html: string
}

export const FORMULA_WIKI_ORDER = ['start', 'F1', 'F2', 'F3', 'F4', 'F5', 'D1', 'D2', 'AW', 'playbooks', 'antipatterns']

export const FORMULA_WIKI: Record<string, FormulaEntry> = {
  start: {
    code: 'start',
    nav: 'Start here',
    title: 'How to pick a formula',
    html:
      "<p>Seven metrics once shared the label <strong>Avg $/wk · unit</strong>. Each code answers a different question.</p>" +
      "<ol class='mb-3'>" +
      '<li><strong>Whose money?</strong> Fleet · Trailer type · Desk · One truck</li>' +
      '<li><strong>Window or one week?</strong> Whole filter vs one ledger row</li>' +
      '<li><strong>÷ trucks?</strong> Fairness (yes) vs scale only (no)</li>' +
      '</ol>' +
      "<div class='fw-formula'>Window blend (F1,F3,D1): gross ÷ weeks ÷ trucks</div>" +
      "<div class='fw-formula'>Each week (F2,F4,D2): this week's gross ÷ this week's trucks</div>" +
      "<div class='fw-formula'>One truck (F5): gross ÷ hauling weeks only</div>",
  },
  F1: {
    code: 'F1',
    nav: 'F1 · Fleet window',
    title: 'F1 — Fleet: avg/wk ÷ trucks',
    html:
      '<p><strong>UI:</strong> General → KPI card (lower line)</p>' +
      "<div class='fw-formula'>Σ fleet gross in window ÷ (weeks in filter × fleet trucks)</div>" +
      '<p><strong>School steps:</strong> 1) fleet gross ÷ weeks → 2) ÷ trucks</p>' +
      '<p><strong>Use for:</strong> Investor / quarter headline.</p>' +
      '<p><strong>Not for:</strong> Dispatcher ranking (D1), weekly ops (F2), one truck (F5).</p>',
  },
  F2: {
    code: 'F2',
    nav: 'F2 · Fleet week',
    title: 'F2 — Fleet: week gross ÷ trucks',
    html:
      '<p><strong>UI:</strong> Momentum · Weekly ledger (one row per week)</p>' +
      "<div class='fw-formula'>This week's fleet gross ÷ this week's fleet trucks</div>" +
      '<p>With a 2+ week filter you get <strong>one value per week</strong>, not one blend.</p>' +
      '<p>When filter is <strong>one week only</strong>, F2 equals F1 for that week.</p>',
  },
  F3: {
    code: 'F3',
    nav: 'F3 · Family window',
    title: 'F3 — {Family}: avg/wk ÷ trucks',
    html:
      '<p><strong>UI:</strong> General cohort table · Per trailer bubble (window)</p>' +
      "<div class='fw-formula'>Σ family gross ÷ (weeks × family trucks in window)</div>" +
      '<p>Same as F1, scoped to Reefer / Flatbed / Stepdeck / etc.</p>',
  },
  F4: {
    code: 'F4',
    nav: 'F4 · Family week',
    title: 'F4 — {Family}: week gross ÷ trucks',
    html:
      '<p><strong>UI:</strong> Per trailer → weekly histogram</p>' +
      "<div class='fw-formula'>This week's family gross ÷ this week's family trucks</div>" +
      '<p>Equipment seasonality; one-week spikes vs F3 window blend.</p>',
  },
  F5: {
    code: 'F5',
    nav: 'F5 · Truck hauling',
    title: 'F5 — Truck: gross ÷ hauling weeks',
    html:
      '<p><strong>UI:</strong> Per trailer → Units &amp; economics (column 6)</p>' +
      "<div class='fw-formula'>Unit Σ gross ÷ weeks this truck had loads</div>" +
      '<p><strong>Not</strong> avg/wk ÷ trucks. Idle calendar weeks are excluded.</p>' +
      '<p>Pair with col 5 <strong>Truck: avg/wk</strong> (all header weeks) to see idle penalty.</p>',
  },
  D1: {
    code: 'D1',
    nav: 'D1 · Desk window',
    title: 'D1 — AVG/WK UNIT (desk avg/wk ÷ trucks)',
    html:
      '<p><strong>UI:</strong> Per dispatchers → Overview → <strong>AVG/WK UNIT</strong></p>' +
      "<div class='fw-formula'>Desk Σ gross ÷ (weeks × trucks on that desk)</div>" +
      '<p><strong>Use for:</strong> Fair dispatcher compare when desk sizes differ.</p>' +
      '<p>Pair with <strong>Σ gross</strong> (scale) and <strong>AVG/WK</strong> (step 1 only).</p>',
  },
  D2: {
    code: 'D2',
    nav: 'D2 · Desk week',
    title: 'D2 — Desk: week gross ÷ trucks',
    html:
      '<p><strong>UI:</strong> Per dispatchers → trend chart</p>' +
      "<div class='fw-formula'>This week's desk gross ÷ this week's desk trucks</div>" +
      '<p>Explain one good/bad week after D1 ranking.</p>',
  },
  AW: {
    code: 'AW',
    nav: 'AW · avg/wk only',
    title: 'AW — AVG/WK (no truck divisor)',
    html:
      '<p><strong>UI:</strong> AVG/WK columns · Fleet: avg/wk on KPI card</p>' +
      "<div class='fw-formula'>Σ gross ÷ weeks in filter — no ÷ trucks</div>" +
      '<p>Answers desk/fleet size per calendar week. <strong>D1 = AW ÷ trucks</strong> in the same scope.</p>',
  },
  playbooks: {
    code: 'playbooks',
    nav: 'Playbooks',
    title: 'Analytics playbooks',
    html:
      '<h4>Investor call</h4><p>General tab → <strong>Σ gross</strong> + <strong>F1</strong>. Do not read dispatcher AVG/WK UNIT as F1.</p>' +
      '<h4>Dispatcher review</h4><p>Sort <strong>Σ gross</strong> (scale) and <strong>AVG/WK UNIT / D1</strong> (per truck).</p>' +
      '<h4>Fleet manager</h4><p>Units table → sort <strong>F5</strong>; check WEEKS·active for underused trucks.</p>' +
      '<h4>Week filter</h4><p>W20→W21 = <strong>2 weeks</strong> inclusive. One-week filter: F1=F2, D1=D2.</p>',
  },
  antipatterns: {
    code: 'antipatterns',
    nav: 'Anti-patterns',
    title: 'Common mistakes',
    html:
      '<ul>' +
      '<li>Comparing F1 to the average of weekly F2 rows</li>' +
      '<li>Using AVG/WK alone for dispatcher fairness (use D1)</li>' +
      '<li>Reading F5 like D1 (one truck vs whole desk)</li>' +
      '<li>Stopping at avg/wk when you meant avg/wk ÷ trucks</li>' +
      '</ul>',
  },
}
