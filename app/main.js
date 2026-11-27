// Maplewood Ledger — the wiring. Loads the ledger, draws the page for the
// current hash route, paints the charts, and makes every control do what
// it says. Nothing here talks to a server.

import {
  loadLedger, saveLedger, resetLedger, monthsAvailable,
  addEntry, updateEntry, removeEntry, setPlanAmount,
  addToGoal, addGoal, removeGoal, markBillPaid, addBill, removeBill,
  setIncomeSource,
} from './store.js';
import { renderPage, currentPage, escapeText, PAGES } from './pages.js';
import { paintDonut, paintMonthBars } from './charts.js';
import { spendByCategory, historyByMonth, toCsvRows } from './money.js';
import { monthTitle } from './seed.js';

const view = document.getElementById('view');
const monthSelect = document.getElementById('month-select');
let ledger = loadLedger();

function refreshMonthSelect() {
  const months = monthsAvailable(ledger);
  monthSelect.innerHTML = months
    .map((m) => `<option value="${m}"${m === ledger.month ? ' selected' : ''}>${monthTitle(m)}</option>`)
    .join('');
}

function paintCharts() {
  const donut = document.getElementById('donut');
  if (donut) paintDonut(donut, spendByCategory(ledger, ledger.month));
  const bars = document.getElementById('month-bars');
  if (bars) paintMonthBars(bars, historyByMonth(ledger));
}

function markNav() {
  const route = currentPage();
  for (const link of document.querySelectorAll('.main-nav a')) {
    link.classList.toggle('active', link.dataset.nav === route.slice(2));
  }
}

function draw() {
  refreshMonthSelect();
  markNav();
  view.innerHTML = renderPage(ledger);
  paintCharts();
}

function downloadFile(name, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadCsv() {
  downloadFile(`maplewood-ledger-${ledger.month}.csv`, toCsvRows(ledger, ledger.month), 'text/csv');
}

function showNote(id, text) {
  const el = document.getElementById(id);
  if (!el) return;
  el.hidden = false;
  el.textContent = text;
  window.setTimeout(() => { el.hidden = true; }, 4000);
}

// --- inline transaction editing: swap a row for a form, then save it. ---
function openEntryEditor(id) {
  const entry = ledger.entries.find((e) => e.id === id);
  if (!entry) return;
  const row = document.querySelector(`[data-edit-entry="${id}"]`)?.closest('.tx-item');
  if (!row) return;
  const options = ['groceries', 'dining', 'housing', 'utilities', 'transport', 'childcare', 'health', 'fun', 'clothing', 'home', 'pets', 'subscriptions', 'other']
    .map((c) => `<option value="${c}"${c === entry.category ? ' selected' : ''}>${c}</option>`)
    .join('');
  row.outerHTML = `<li class="tx-item"><form class="stack" data-edit-form="${id}" style="grid-column:1/-1">
    <div class="form-row">
      <div class="field"><label>Date <input type="date" name="date" value="${entry.date}" required></label></div>
      <div class="field"><label>Amount ($) <input type="number" name="amount" step="0.01" min="0.01" value="${Math.abs(entry.amount)}" required></label></div>
    </div>
    <div class="field"><label>Payee <input type="text" name="payee" value="${escapeText(entry.payee)}" maxlength="80" required></label></div>
    <div class="form-row">
      <div class="field"><label>Type <select name="kind"><option value="expense"${entry.amount < 0 ? ' selected' : ''}>Expense</option><option value="income"${entry.amount >= 0 ? ' selected' : ''}>Income</option></select></div>
      <div class="field"><label>Category <select name="category"><option value="">Income (no category)</option>${options}</select></div>
    </div>
    <div class="field"><label>Note <input type="text" name="note" value="${escapeText(entry.note ?? '')}" maxlength="120"></label></div>
    <div class="btn-row"><button type="submit">Save changes</button><button type="button" class="ghost" data-cancel-edit>Cancel</button></div>
  </form></li>`;
}

// --- one delegated listener for every control on every page. ---
view.addEventListener('click', (event) => {
  const target = event.target.closest('[data-edit-entry], [data-remove-entry], [data-pay-bill], [data-unpay-bill], [data-remove-goal], [data-remove-bill], [data-cancel-edit], #download-csv, #download-json, #reset-data, #clear-filter');
  if (!target) return;

  if (target.id === 'download-csv') { downloadCsv(); return; }
  if (target.id === 'download-json') {
    downloadFile('maplewood-ledger.json', JSON.stringify(ledger, null, 2), 'application/json');
    return;
  }
  if (target.id === 'reset-data') {
    if (window.confirm('Reset everything to the starter figures? Your changes will be gone.')) {
      ledger = resetLedger();
      draw();
    }
    return;
  }
  if (target.id === 'clear-filter') {
    document.getElementById('filter-form')?.reset();
    draw();
    return;
  }
  if (target.dataset.cancelEdit !== undefined) { draw(); return; }
  if (target.dataset.editEntry) { openEntryEditor(target.dataset.editEntry); return; }
  if (target.dataset.removeEntry) {
    if (window.confirm('Delete this transaction?')) { removeEntry(ledger, target.dataset.removeEntry); draw(); }
    return;
  }
  if (target.dataset.payBill) { markBillPaid(ledger, target.dataset.payBill, ledger.month, true); draw(); return; }
  if (target.dataset.unpayBill) { markBillPaid(ledger, target.dataset.unpayBill, ledger.month, false); draw(); return; }
  if (target.dataset.removeGoal) {
    if (window.confirm('Delete this savings goal?')) { removeGoal(ledger, target.dataset.removeGoal); draw(); }
    return;
  }
  if (target.dataset.removeBill) {
    if (window.confirm('Remove this recurring bill?')) { removeBill(ledger, target.dataset.removeBill); draw(); }
    return;
  }
});

view.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.target;
  const data = new FormData(form);

  if (form.id === 'add-entry-form') {
    const kind = data.get('kind');
    const amount = Math.abs(Number(data.get('amount')));
    addEntry(ledger, {
      date: String(data.get('date')),
      payee: String(data.get('payee')).trim(),
      category: kind === 'income' ? '' : String(data.get('category')),
      amount: kind === 'income' ? amount : -amount,
      note: String(data.get('note') ?? '').trim(),
    });
    draw();
    showNote('add-entry-note', 'Added. It is in the list below now.');
    return;
  }

  if (form.id === 'filter-form') {
    const query = String(data.get('search') ?? '').trim().toLowerCase();
    const cat = String(data.get('category') ?? '');
    const kind = String(data.get('kind') ?? '');
    const list = document.getElementById('tx-list');
    if (!list) return;
    const rows = ledger.entries.filter((e) => e.date.slice(0, 7) === ledger.month);
    const shown = rows.filter((e) => {
      if (query && !(e.payee.toLowerCase().includes(query) || (e.note ?? '').toLowerCase().includes(query))) return false;
      if (cat && e.category !== cat) return false;
      if (kind === 'expense' && e.amount >= 0) return false;
      if (kind === 'income' && e.amount < 0) return false;
      return true;
    });
    list.innerHTML = shown.map((e) => {
      const label = e.category ? e.category : 'Income';
      const signed = (e.amount >= 0 ? '+' : '−') + '$' + Math.abs(e.amount).toFixed(2);
      return `<li class="tx-item"><div><div class="tx-payee">${escapeText(e.payee)}</div><div class="tx-sub">${e.date} · ${label}${e.note ? ` · ${escapeText(e.note)}` : ''}</div></div><div class="tx-amount ${e.amount >= 0 ? 'pos' : 'neg'}">${signed}</div><div class="tx-actions"><button type="button" class="link-btn" data-edit-entry="${e.id}">Edit</button><button type="button" class="link-btn red" data-remove-entry="${e.id}">Delete</button></div></li>`;
    }).join('') || '<li class="empty">Nothing matches that filter — try clearing it.</li>';
    return;
  }

  if (form.dataset.editForm) {
    const kind = data.get('kind');
    const amount = Math.abs(Number(data.get('amount')));
    updateEntry(ledger, form.dataset.editForm, {
      date: String(data.get('date')),
      payee: String(data.get('payee')).trim(),
      category: kind === 'income' ? '' : String(data.get('category')),
      amount: kind === 'income' ? amount : -amount,
      note: String(data.get('note') ?? '').trim(),
    });
    draw();
    return;
  }

  if (form.dataset.goalForm) {
    const amount = Number(data.get('amount'));
    if (amount > 0) {
      addToGoal(ledger, form.dataset.goalForm, amount);
      addEntry(ledger, {
        date: `${ledger.month}-26`,
        payee: `Moved to savings — ${ledger.goals.find((g) => g.id === form.dataset.goalForm)?.name ?? 'goal'}`,
        category: 'other',
        amount: -amount,
        note: String(data.get('note') ?? '').trim() || 'Savings transfer',
      });
    }
    draw();
    return;
  }

  if (form.id === 'new-goal-form') {
    addGoal(ledger, {
      name: String(data.get('name')).trim(),
      note: String(data.get('note') ?? '').trim(),
      target: Number(data.get('target')),
      saved: 0,
      monthly: Number(data.get('monthly')),
    });
    draw();
    return;
  }

  if (form.id === 'new-bill-form') {
    addBill(ledger, {
      name: String(data.get('name')).trim(),
      category: String(data.get('category')),
      amount: Number(data.get('amount')),
      dueDay: Number(data.get('dueDay')),
      autopay: data.get('autopay') === 'on',
    });
    draw();
    return;
  }
});

view.addEventListener('change', (event) => {
  const target = event.target;
  if (target.dataset.planInput) {
    setPlanAmount(ledger, target.dataset.planInput, Number(target.value));
    draw();
    return;
  }
  if (target.dataset.incomeInput) {
    setIncomeSource(ledger, target.dataset.incomeInput, Number(target.value));
    draw();
  }
});

monthSelect.addEventListener('change', () => {
  ledger.month = monthSelect.value;
  saveLedger(ledger);
  draw();
});

window.addEventListener('hashchange', draw);

draw();
