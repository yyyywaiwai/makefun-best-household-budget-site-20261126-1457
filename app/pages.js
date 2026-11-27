// Maplewood Ledger — one render function per page. The shell in main.js
// drops the returned HTML into #view and then paints the canvases.
// Every page is reached by a link; every control on it does something.

import { CATEGORIES, MONTH_NAMES, monthTitle } from './seed.js';
import {
  usd, usdSigned, entriesForMonth, incomeForMonth, spendingForMonth,
  leftForMonth, savingsRateForMonth, spendByCategory, planStatus,
  totalPlanned, historyByMonth, biggestCategories, goalTotals, goalEta,
  billsDue, billsStillDue, billsTotalDue, monthInsights,
} from './money.js';

export const PAGES = [
  { route: '#/dashboard', label: 'Dashboard' },
  { route: '#/transactions', label: 'Transactions' },
  { route: '#/budget', label: 'Budget' },
  { route: '#/goals', label: 'Goals' },
  { route: '#/bills', label: 'Bills' },
  { route: '#/reports', label: 'Reports' },
  { route: '#/settings', label: 'Settings' },
];

export function currentPage() {
  const hash = window.location.hash || '#/dashboard';
  return PAGES.some((p) => p.route === hash) ? hash : '#/dashboard';
}

export function escapeText(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function prettyDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTH_NAMES[m - 1].slice(0, 3)} ${d}, ${y}`;
}

function tile(label, value, note, tone = '') {
  return `<div class="card"><div class="tile-label">${label}</div>
    <div class="tile-value ${tone}">${value}</div>
    <div class="tile-note">${note}</div></div>`;
}

function categoryOptions(selected) {
  return CATEGORIES.map((c) => `<option value="${c.id}"${c.id === selected ? ' selected' : ''}>${c.label}</option>`).join('');
}

function entryItem(e) {
  const cat = e.category ? CATEGORIES.find((c) => c.id === e.category) : null;
  const kind = e.amount >= 0 ? 'pos' : 'neg';
  return `<li class="tx-item">
    <div><div class="tx-payee">${escapeText(e.payee)}</div>
    <div class="tx-sub">${prettyDate(e.date)} · ${cat ? cat.label : 'Income'}${e.note ? ` · ${escapeText(e.note)}` : ''}</div></div>
    <div class="tx-amount ${kind}">${usdSigned(e.amount)}</div>
    <div class="tx-actions">
      <button type="button" class="link-btn" data-edit-entry="${e.id}">Edit</button>
      <button type="button" class="link-btn red" data-remove-entry="${e.id}">Delete</button>
    </div>
  </li>`;
}

function planBar(row) {
  const pct = Math.round(row.ratio * 100);
  const chip = row.stateName === 'over'
    ? `<span class="chip over">${usd(-row.remaining)} over</span>`
    : row.stateName === 'near'
      ? `<span class="chip near">${usd(row.remaining)} left</span>`
      : `<span class="chip ok">${usd(row.remaining)} left</span>`;
  return `<div class="bar-row">
    <span class="bar-name"><span class="dot" style="background:${row.color}"></span>${row.label}</span>
    <span class="bar-track"><span class="bar-fill ${row.stateName}" style="display:block;width:${Math.min(100, pct)}%"></span></span>
    <span class="bar-amt">${usd(row.spent)} of ${usd(row.target)} · ${pct}% ${chip}</span>
  </div>`;
}

// --- Dashboard ---
function pageDashboard(state) {
  const month = state.month;
  const income = incomeForMonth(state, month);
  const spent = spendingForMonth(state, month);
  const left = leftForMonth(state, month);
  const rate = Math.round(savingsRateForMonth(state, month) * 100);
  const rows = planStatus(state, month).sort((a, b) => b.ratio - a.ratio);
  const over = rows.filter((r) => r.stateName === 'over').length;
  const due = billsStillDue(state, month);
  const recent = entriesForMonth(state, month).slice(0, 6);
  const goals = goalTotals(state);
  const insights = monthInsights(state, month);
  const top = biggestCategories(state, month, 5);

  return `<div class="page-head"><h1>Good ${new Date().getHours() < 12 ? 'morning' : 'afternoon'}, Alvarez household</h1>
    <p>Here is ${monthTitle(month)} at a glance — what came in, what went out, and what is left for the rest of the month.</p></div>
  <div class="grid four">
    ${tile('Income', usd(income), `${state.incomeSources.length} sources · payday the 1st`)}
    ${tile('Spent', usd(spent), `${entriesForMonth(state, month).filter((e) => e.amount < 0).length} expenses`, spent > income ? 'bad' : '')}
    ${tile('Left over', usd(left), left >= 0 ? 'Money still to play with' : 'Over income this month', left >= 0 ? 'good' : 'bad')}
    ${tile('Savings rate', `${rate}%`, over ? `${over} categor${over === 1 ? 'y' : 'ies'} over plan` : 'Every category inside its plan', rate >= 20 ? 'good' : 'warn')}
  </div>
  <div class="grid two" style="margin-top:16px">
    <section class="card"><h2>Where the money went</h2>
      <canvas class="chart" id="donut" width="480" height="300" role="img" aria-label="Donut chart of spending by category"></canvas>
      <ul class="legend">${top.map((r) => `<li><span class="dot" style="background:${r.color}"></span>${r.label}<span class="amt">${usd(r.spent)}</span></li>`).join('')}</ul>
      <p class="small muted"><a href="#/budget">See the full budget planner →</a></p>
    </section>
    <section class="card"><h2>Budget at a glance</h2>
      ${rows.slice(0, 5).map(planBar).join('')}
      <p class="small muted" style="margin-top:10px">Planned ${usd(totalPlanned(state))} across ${CATEGORIES.length} categories. <a href="#/budget">Adjust the plan →</a></p>
    </section>
  </div>
  <div class="grid two" style="margin-top:16px">
    <section class="card"><h2>Coming up</h2>
      ${due.length === 0
        ? '<p class="empty">Every bill for this month is paid. Nice work.</p>'
        : `<p class="lede">${due.length} bill${due.length === 1 ? '' : 's'} still to pay — ${usd(billsTotalDue(state, month))} in total.</p>
          ${due.slice(0, 4).map((b) => `<div class="bill-row"><div><div class="bill-name">${escapeText(b.name)}</div><div class="bill-sub">Due day ${b.dueDay} · ${b.categoryLabel}</div></div><span class="bill-amt">${usd(b.amount)}</span><button type="button" class="ghost small-btn" data-pay-bill="${b.id}">Mark paid</button></div>`).join('')}`}
      <p class="small muted" style="margin-top:10px"><a href="#/bills">All bills &amp; the calendar →</a></p>
    </section>
    <section class="card"><h2>Savings goals</h2>
      <p class="lede">${usd(goals.saved)} saved toward ${usd(goals.target)} across ${state.goals.length} goals.</p>
      ${state.goals.slice(0, 3).map((g) => {
        const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
        return `<div class="bar-row"><span class="bar-name">${escapeText(g.name)}</span><span class="bar-track"><span class="bar-fill" style="display:block;width:${pct}%"></span></span><span class="bar-amt">${pct}% · ${usd(g.saved)}</span></div>`;
      }).join('')}
      <p class="small muted" style="margin-top:10px"><a href="#/goals">Add money to a goal →</a></p>
    </section>
  </div>
  <div class="grid two" style="margin-top:16px">
    <section class="card"><h2>Latest spending</h2>
      <ul class="tx-list">${recent.map(entryItem).join('')}</ul>
      <p class="small muted" style="margin-top:10px"><a href="#/transactions">All transactions →</a></p>
    </section>
    <section class="card"><h2>What the numbers say</h2>
      ${insights.map((i) => `<div class="insight"><span class="mark" aria-hidden="true">${i.mark}</span><p>${i.text}</p></div>`).join('')}
    </section>
  </div>`;
}

// --- Transactions ---
function pageTransactions(state) {
  const month = state.month;
  const rows = entriesForMonth(state, month);
  const spent = spendingForMonth(state, month);
  const income = incomeForMonth(state, month);
  return `<div class="page-head"><h1>Transactions — ${monthTitle(month)}</h1>
    <p>${rows.length} entries: ${usd(income)} in, ${usd(spent)} out. Add anything the household spent or earned, fix a mistake, or remove a duplicate.</p></div>
  <div class="grid two">
    <section class="card"><h2>Add a transaction</h2>
      <form class="stack" id="add-entry-form">
        <div class="form-row">
          <div class="field"><label for="f-date">Date</label><input id="f-date" name="date" type="date" value="${month}-26" required></div>
          <div class="field"><label for="f-amount">Amount ($)</label><input id="f-amount" name="amount" type="number" step="0.01" min="0.01" placeholder="42.50" required></div>
        </div>
        <div class="field"><label for="f-payee">Payee or source</label><input id="f-payee" name="payee" type="text" maxlength="80" placeholder="FreshMart Grocers" required></div>
        <div class="form-row">
          <div class="field"><label for="f-kind">Type</label><select id="f-kind" name="kind"><option value="expense">Expense</option><option value="income">Income</option></select></div>
          <div class="field"><label for="f-category">Category</label><select id="f-category" name="category">${categoryOptions('groceries')}</select></div>
        </div>
        <div class="field"><label for="f-note">Note (optional)</label><input id="f-note" name="note" type="text" maxlength="120" placeholder="Weekly shop"></div>
        <div class="btn-row"><button type="submit">Add transaction</button><span class="notice" id="add-entry-note" hidden></span></div>
      </form>
    </section>
    <section class="card"><h2>Search &amp; filter</h2>
      <form class="stack" id="filter-form">
        <div class="field"><label for="f-search">Search payee or note</label><input id="f-search" name="search" type="search" placeholder="Try “FreshMart” or “fuel”"></div>
        <div class="form-row">
          <div class="field"><label for="f-filter-cat">Category</label><select id="f-filter-cat" name="category"><option value="">All categories</option>${categoryOptions('')}</select></div>
          <div class="field"><label for="f-filter-kind">Type</label><select id="f-filter-kind" name="kind"><option value="">All</option><option value="expense">Expenses</option><option value="income">Income</option></select></div>
        </div>
        <div class="btn-row"><button type="submit" class="ghost">Apply filter</button><button type="button" class="ghost" id="clear-filter">Clear</button></div>
      </form>
      <p class="lede" style="margin-top:14px">Need the month as a spreadsheet? <button type="button" class="ghost small-btn" id="download-csv">Download ${monthTitle(month)} as CSV</button></p>
    </section>
  </div>
  <section class="card wide" style="margin-top:16px"><h2>All ${monthTitle(month)} entries</h2>
    <ul class="tx-list" id="tx-list">${rows.map(entryItem).join('') || '<li class="empty">No transactions this month yet — add the first one above.</li>'}</ul>
  </section>`;
}

// --- Budget ---
function pageBudget(state) {
  const month = state.month;
  const rows = planStatus(state, month);
  const planned = totalPlanned(state);
  const spent = spendingForMonth(state, month);
  const income = incomeForMonth(state, month);
  return `<div class="page-head"><h1>Budget planner — ${monthTitle(month)}</h1>
    <p>Set a monthly target for each category and watch it fill up. The plan totals ${usd(planned)} against ${usd(income)} of income, leaving ${usd(income - planned)} unassigned.</p></div>
  <div class="grid three">
    ${tile('Planned', usd(planned), `${CATEGORIES.length} categories`)}
    ${tile('Spent so far', usd(spent), `${Math.round((spent / planned) * 100)}% of the plan used`, spent > planned ? 'bad' : '')}
    ${tile('Plan remaining', usd(planned - spent), planned - spent >= 0 ? 'Still inside the plan' : 'Over the plan in total', planned - spent >= 0 ? 'good' : 'bad')}
  </div>
  <section class="card wide" style="margin-top:16px"><h2>Category targets</h2>
    <p class="lede">Change any target and press Enter — the dashboard and reports update at once. The amounts are per month.</p>
    ${rows.map((row) => `<div class="bar-row">
      <span class="bar-name"><span class="dot" style="background:${row.color}"></span>${row.label}</span>
      <span class="bar-track"><span class="bar-fill ${row.stateName}" style="display:block;width:${Math.min(100, Math.round(row.ratio * 100))}%"></span></span>
      <span class="bar-amt"><label class="small muted" for="plan-${row.id}">Target $</label>
        <input id="plan-${row.id}" data-plan-input="${row.id}" type="number" min="0" step="1" value="${row.target}" style="width:92px;padding:6px 8px;border:1px solid #d6cfc2;border-radius:8px;font:inherit;text-align:right">
        <span>· spent ${usd(row.spent)}</span></span>
    </div>`).join('')}
    <p class="small muted" style="margin-top:12px">Tip: a category with nothing spent yet still counts — set its target to 0 if the household does not use it this month.</p>
  </section>
  <section class="card wide" style="margin-top:16px"><h2>How the plan is split</h2>
    <canvas class="chart" id="donut" width="480" height="300" role="img" aria-label="Donut chart of spending by category"></canvas>
    <ul class="legend">${biggestCategories(state, month, 6).map((r) => `<li><span class="dot" style="background:${r.color}"></span>${r.label}<span class="amt">${usd(r.spent)}</span></li>`).join('')}</ul>
  </section>`;
}

// --- Goals ---
function pageGoals(state) {
  const totals = goalTotals(state);
  const overall = totals.target > 0 ? Math.round((totals.saved / totals.target) * 100) : 0;
  return `<div class="page-head"><h1>Savings goals</h1>
    <p>${usd(totals.saved)} of ${usd(totals.target)} saved — ${overall}% of the way there. Add money whenever there is some to spare, and the finish line moves closer.</p></div>
  <div class="grid two">
    ${state.goals.map((g) => {
      const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
      return `<section class="card goal-card"><div class="goal-head"><strong>${escapeText(g.name)}</strong><span class="chip ${pct >= 100 ? 'ok' : 'near'}">${pct}%</span></div>
        <p class="muted small" style="margin:0">${escapeText(g.note)}</p>
        <span class="bar-track"><span class="bar-fill" style="display:block;width:${pct}%"></span></span>
        <div class="goal-amounts"><b>${usd(g.saved)}</b> saved of ${usd(g.target)} · ${usd(g.monthly)}/month · ${goalEta(g)}</div>
        <form class="stack" data-goal-form="${g.id}">
          <div class="form-row">
            <div class="field"><label for="add-${g.id}">Add money ($)</label><input id="add-${g.id}" name="amount" type="number" step="0.01" min="0.01" placeholder="50.00" required></div>
            <div class="field"><label for="note-${g.id}">Note (optional)</label><input id="note-${g.id}" name="note" type="text" maxlength="80" placeholder="From the grocery savings"></div>
          </div>
          <div class="btn-row"><button type="submit">Add to this goal</button><button type="button" class="danger small-btn" data-remove-goal="${g.id}">Delete goal</button></div>
        </form>
      </section>`;
    }).join('')}
    <section class="card goal-card"><h2>Start a new goal</h2>
      <p class="lede">A holiday, a new car, a cushion for surprises — give it a name and a target.</p>
      <form class="stack" id="new-goal-form">
        <div class="field"><label for="g-name">Goal name</label><input id="g-name" name="name" type="text" maxlength="60" placeholder="New bikes for the kids" required></div>
        <div class="form-row">
          <div class="field"><label for="g-target">Target ($)</label><input id="g-target" name="target" type="number" min="1" step="1" placeholder="1200" required></div>
          <div class="field"><label for="g-monthly">Save each month ($)</label><input id="g-monthly" name="monthly" type="number" min="0" step="1" placeholder="100" required></div>
        </div>
        <div class="field"><label for="g-note">Why this goal? (optional)</label><input id="g-note" name="note" type="text" maxlength="120" placeholder="For summer rides together"></div>
        <div class="btn-row"><button type="submit">Create goal</button></div>
      </form>
    </section>
  </div>`;
}

// --- Bills ---
function pageBills(state) {
  const month = state.month;
  const bills = billsDue(state, month);
  const due = bills.filter((b) => !b.paid);
  const paid = bills.filter((b) => b.paid);
  const dueTotal = due.reduce((s, b) => s + b.amount, 0);
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  return `<div class="page-head"><h1>Bills &amp; calendar — ${monthTitle(month)}</h1>
    <p>${due.length} of ${bills.length} bills still to pay (${usd(dueTotal)}). Tick a bill off when the money leaves the account; autopay bills are marked for you only when you confirm them.</p></div>
  <div class="grid two">
    <section class="card"><h2>Still to pay</h2>
      ${due.length === 0 ? '<p class="empty">Nothing left to pay this month.</p>' : due.map((b) => `<div class="bill-row"><div><div class="bill-name">${escapeText(b.name)}</div><div class="bill-sub">Due day ${b.dueDay} · ${b.categoryLabel}${b.autopay ? ' · autopay' : ''}</div></div><span class="bill-amt">${usd(b.amount)}</span><button type="button" class="ghost small-btn" data-pay-bill="${b.id}">Mark paid</button></div>`).join('')}
    </section>
    <section class="card"><h2>Paid this month</h2>
      ${paid.length === 0 ? '<p class="empty">Nothing marked paid yet.</p>' : paid.map((b) => `<div class="bill-row"><div><div class="bill-name">${escapeText(b.name)}</div><div class="bill-sub">Due day ${b.dueDay} · ${b.categoryLabel}</div></div><span class="bill-amt">${usd(b.amount)}</span><button type="button" class="ghost small-btn" data-unpay-bill="${b.id}">Undo</button></div>`).join('')}
      <p class="small muted" style="margin-top:12px">Paid so far: ${usd(paid.reduce((s, b) => s + b.amount, 0))} across ${paid.length} bills.</p>
    </section>
  </div>
  <section class="card wide" style="margin-top:16px"><h2>When each bill lands</h2>
    <table class="ledger"><thead><tr><th>Day</th><th>Bill</th><th>Category</th><th class="num">Amount</th><th>Status</th></tr></thead>
    <tbody>${days.map((day) => {
      const onDay = bills.filter((b) => b.dueDay === day);
      if (onDay.length === 0) return '';
      return onDay.map((b) => `<tr><td>${day}</td><td>${escapeText(b.name)}</td><td>${b.categoryLabel}</td><td class="num">${usd(b.amount)}</td><td>${b.paid ? '<span class="chip ok">Paid</span>' : '<span class="chip near">Due</span>'}</td></tr>`).join('');
    }).join('')}</tbody></table>
  </section>
  <section class="card wide" style="margin-top:16px"><h2>Add a recurring bill</h2>
    <form class="stack" id="new-bill-form">
      <div class="form-row">
        <div class="field"><label for="b-name">Bill name</label><input id="b-name" name="name" type="text" maxlength="60" placeholder="Water & sewer" required></div>
        <div class="field"><label for="b-amount">Amount ($)</label><input id="b-amount" name="amount" type="number" min="0.01" step="0.01" placeholder="66.00" required></div>
      </div>
      <div class="form-row">
        <div class="field"><label for="b-category">Category</label><select id="b-category" name="category">${categoryOptions('utilities')}</select></div>
        <div class="field"><label for="b-day">Due day of the month</label><input id="b-day" name="dueDay" type="number" min="1" max="28" value="15" required></div>
      </div>
      <div class="field"><label><input type="checkbox" name="autopay" style="width:auto"> Paid automatically (autopay)</label></div>
      <div class="btn-row"><button type="submit">Add bill</button></div>
    </form>
    <p class="small muted" style="margin-top:12px">Remove a bill from the list on the <a href="#/settings">Settings</a> page.</p>
  </section>`;
}

// --- Reports ---
function pageReports(state) {
  const month = state.month;
  const history = historyByMonth(state);
  const rows = planStatus(state, month);
  const income = incomeForMonth(state, month);
  const spent = spendingForMonth(state, month);
  const insights = monthInsights(state, month);
  return `<div class="page-head"><h1>Reports — ${monthTitle(month)}</h1>
    <p>Three months of the household's money, side by side. Income ${usd(income)}, spending ${usd(spent)}, ${usd(leftForMonth(state, month))} left over.</p></div>
  <section class="card wide"><h2>Income vs spending, by month</h2>
    <canvas class="chart" id="month-bars" width="900" height="340" role="img" aria-label="Bar chart of income and spending by month"></canvas>
  </section>
  <section class="card wide" style="margin-top:16px"><h2>Month by month</h2>
    <table class="ledger"><thead><tr><th>Month</th><th class="num">Income</th><th class="num">Spending</th><th class="num">Left over</th><th class="num">Savings rate</th></tr></thead>
    <tbody>${history.map((h) => `<tr><td><strong>${monthTitle(h.month)}</strong></td><td class="num">${usd(h.income)}</td><td class="num">${usd(h.spending)}</td><td class="num ${h.left >= 0 ? 'pos' : 'neg'}">${usdSigned(h.left)}</td><td class="num">${h.income > 0 ? `${Math.round((h.left / h.income) * 100)}%` : '—'}</td></tr>`).join('')}</tbody></table>
  </section>
  <div class="grid two" style="margin-top:16px">
    <section class="card"><h2>Spending split — ${monthTitle(month)}</h2>
      <canvas class="chart" id="donut" width="480" height="300" role="img" aria-label="Donut chart of spending by category"></canvas>
      <ul class="legend">${spendByCategory(state, month).filter((r) => r.spent > 0).map((r) => `<li><span class="dot" style="background:${r.color}"></span>${r.label}<span class="amt">${usd(r.spent)}</span></li>`).join('')}</ul>
    </section>
    <section class="card"><h2>Budget scorecard</h2>
      ${rows.map((r) => `<div class="bar-row"><span class="bar-name"><span class="dot" style="background:${r.color}"></span>${r.label}</span><span class="bar-track"><span class="bar-fill ${r.stateName}" style="display:block;width:${Math.min(100, Math.round(r.ratio * 100))}%"></span></span><span class="bar-amt">${Math.round(r.ratio * 100)}% · ${r.stateName === 'over' ? `${usd(-r.remaining)} over` : `${usd(r.remaining)} left`}</span></div>`).join('')}
    </section>
  </div>
  <section class="card wide" style="margin-top:16px"><h2>What the numbers say</h2>
    ${insights.map((i) => `<div class="insight"><span class="mark" aria-hidden="true">${i.mark}</span><p>${i.text}</p></div>`).join('')}
    <div class="btn-row" style="margin-top:12px"><button type="button" class="ghost" id="download-csv">Download ${monthTitle(month)} as CSV</button><a class="btn ghost" href="#/transactions">Review the transactions</a></div>
  </section>`;
}

// --- Settings ---
function pageSettings(state) {
  return `<div class="page-head"><h1>Settings &amp; data</h1>
    <p>Who this ledger belongs to, what comes in each month, and where the data lives. Everything is stored in this browser only.</p></div>
  <div class="grid two">
    <section class="card"><h2>Household</h2>
      <dl class="kv">
        <dt>Household</dt><dd>${escapeText(state.householdName)}</dd>
        <dt>Members</dt><dd>${['Sofia Alvarez', 'Daniel Alvarez', 'Mia Alvarez (8)', 'Noah Alvarez (5)', 'Miso the cat'].join(', ')}</dd>
        <dt>Home</dt><dd>Four-bedroom house, Maplewood Lane</dd>
        <dt>Currency</dt><dd>US dollars ($)</dd>
        <dt>Payday</dt><dd>1st of the month</dd>
        <dt>Entries saved</dt><dd>${state.entries.length} transactions · ${state.goals.length} goals · ${state.bills.length} bills</dd>
      </dl>
    </section>
    <section class="card"><h2>Monthly income</h2>
      <p class="lede">Change a pay amount and press Enter — the dashboard, budget and reports all use the new figure.</p>
      ${state.incomeSources.map((s) => `<div class="bar-row"><span class="bar-name">${escapeText(s.label)}</span><span></span><span class="bar-amt"><label class="small muted" for="inc-${s.id}">$ / month</label>
        <input id="inc-${s.id}" data-income-input="${s.id}" type="number" min="0" step="1" value="${s.amount}" style="width:96px;padding:6px 8px;border:1px solid #d6cfc2;border-radius:8px;font:inherit;text-align:right"></span></div>`).join('')}
      <p class="small muted">Total expected income: <strong>${usd(state.incomeSources.reduce((s, x) => s + x.amount, 0))}</strong> a month.</p>
    </section>
  </div>
  <section class="card wide" style="margin-top:16px"><h2>Your data</h2>
    <p class="lede">Maplewood Ledger keeps every figure in this browser's local storage. Nothing leaves the device, and there is no account to sign into.</p>
    <div class="btn-row">
      <button type="button" class="ghost" id="download-csv">Download this month as CSV</button>
      <button type="button" class="ghost" id="download-json">Download all data as JSON</button>
      <button type="button" class="danger" id="reset-data">Reset to the starter figures</button>
    </div>
    <p class="small muted" style="margin-top:10px">Resetting replaces everything — transactions, budgets, goals and bills — with the Alvarez household's starter figures. Use it if you want to start the demo over.</p>
  </section>
  <section class="card wide" style="margin-top:16px"><h2>Manage bills</h2>
    ${state.bills.map((b) => `<div class="bill-row"><div><div class="bill-name">${escapeText(b.name)}</div><div class="bill-sub">${CATEGORIES.find((c) => c.id === b.category)?.label ?? 'Other'} · due day ${b.dueDay}${b.autopay ? ' · autopay' : ''}</div></div><span class="bill-amt">${usd(b.amount)}</span><button type="button" class="danger small-btn" data-remove-bill="${b.id}">Remove</button></div>`).join('')}
  </section>`;
}

export function renderPage(state) {
  const route = currentPage();
  if (route === '#/transactions') return pageTransactions(state);
  if (route === '#/budget') return pageBudget(state);
  if (route === '#/goals') return pageGoals(state);
  if (route === '#/bills') return pageBills(state);
  if (route === '#/reports') return pageReports(state);
  if (route === '#/settings') return pageSettings(state);
  return pageDashboard(state);
}
