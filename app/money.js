// Maplewood Ledger — the arithmetic. Every figure the pages show is
// computed here from the ledger, so the numbers always agree with each other.

import { CATEGORIES } from './seed.js';
import { categoryById } from './store.js';

export function usd(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(amount);
}

export function usdSigned(amount) {
  const sign = amount > 0 ? '+' : amount < 0 ? '−' : '';
  return `${sign}${usd(Math.abs(amount))}`;
}

export function entriesForMonth(state, month) {
  return state.entries.filter((e) => e.date.slice(0, 7) === month);
}

export function incomeForMonth(state, month) {
  return entriesForMonth(state, month).filter((e) => e.amount > 0).reduce((sum, e) => sum + e.amount, 0);
}

export function spendingForMonth(state, month) {
  return entriesForMonth(state, month).filter((e) => e.amount < 0).reduce((sum, e) => sum + -e.amount, 0);
}

export function leftForMonth(state, month) {
  return incomeForMonth(state, month) - spendingForMonth(state, month);
}

export function savingsRateForMonth(state, month) {
  const income = incomeForMonth(state, month);
  if (income <= 0) return 0;
  return leftForMonth(state, month) / income;
}

export function spendByCategory(state, month) {
  const totals = new Map(CATEGORIES.map((c) => [c.id, 0]));
  for (const e of entriesForMonth(state, month)) {
    if (e.amount < 0 && e.category && totals.has(e.category)) {
      totals.set(e.category, totals.get(e.category) + -e.amount);
    }
  }
  return CATEGORIES.map((c) => ({ ...c, spent: Math.round(totals.get(c.id) * 100) / 100 }));
}

export function planStatus(state, month) {
  return spendByCategory(state, month).map((row) => {
    const target = state.plan[row.id] ?? 0;
    const ratio = target > 0 ? row.spent / target : row.spent > 0 ? 1 : 0;
    const stateName = ratio > 1 ? 'over' : ratio >= 0.8 ? 'near' : 'ok';
    return { ...row, target, ratio, stateName, remaining: Math.round((target - row.spent) * 100) / 100 };
  });
}

export function totalPlanned(state) {
  return Object.values(state.plan).reduce((sum, v) => sum + v, 0);
}

export function historyByMonth(state) {
  const months = [...new Set(state.entries.map((e) => e.date.slice(0, 7)))].sort();
  return months.map((m) => ({
    month: m,
    income: incomeForMonth(state, m),
    spending: spendingForMonth(state, m),
    left: leftForMonth(state, m),
  }));
}

export function biggestCategories(state, month, count = 5) {
  return spendByCategory(state, month)
    .filter((row) => row.spent > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, count);
}

export function goalTotals(state) {
  const saved = state.goals.reduce((sum, g) => sum + g.saved, 0);
  const target = state.goals.reduce((sum, g) => sum + g.target, 0);
  return { saved, target };
}

export function goalEta(goal) {
  if (goal.saved >= goal.target) return 'Reached';
  if (!goal.monthly || goal.monthly <= 0) return 'No monthly amount set';
  const months = Math.ceil((goal.target - goal.saved) / goal.monthly);
  if (months === 1) return 'About 1 more month';
  return `About ${months} more months`;
}

export function billsDue(state, month) {
  return state.bills.map((bill) => ({
    ...bill,
    paid: bill.paidMonths.includes(month),
    categoryLabel: categoryById(bill.category)?.label ?? 'Other',
  }));
}

export function billsStillDue(state, month) {
  return billsDue(state, month).filter((b) => !b.paid).sort((a, b) => a.dueDay - b.dueDay);
}

export function billsTotalDue(state, month) {
  return billsStillDue(state, month).reduce((sum, b) => sum + b.amount, 0);
}

export function monthInsights(state, month) {
  const out = [];
  const income = incomeForMonth(state, month);
  const spending = spendingForMonth(state, month);
  const rate = savingsRateForMonth(state, month);
  const rows = planStatus(state, month);
  const over = rows.filter((r) => r.stateName === 'over');
  const near = rows.filter((r) => r.stateName === 'near');

  if (rate >= 0.2) {
    out.push({ mark: '✓', text: `You kept ${Math.round(rate * 100)}% of ${usd(income)} this month — a strong savings rate for a family of four.` });
  } else if (rate >= 0) {
    out.push({ mark: '→', text: `You kept ${Math.round(rate * 100)}% of your income. Aim for 20% by trimming the categories marked “nearly there”.` });
  } else {
    out.push({ mark: '!', text: `Spending beat income by ${usd(-leftForMonth(state, month))} this month. Look at the biggest categories below first.` });
  }
  for (const row of over) {
    out.push({ mark: '!', text: `${row.label} is ${usd(-row.remaining)} over its ${usd(row.target)} plan. Move money from a category with room, or raise the plan if the cost is real.` });
  }
  for (const row of near) {
    out.push({ mark: '→', text: `${row.label} is at ${Math.round(row.ratio * 100)}% of its plan with the month still to go.` });
  }
  const top = biggestCategories(state, month, 1)[0];
  if (top && top.id !== 'housing') {
    out.push({ mark: '★', text: `Biggest flexible cost this month: ${top.label} at ${usd(top.spent)}. One cheaper week there saves real money.` });
  }
  const prev = historyByMonth(state).filter((h) => h.month < month).at(-1);
  if (prev && spending < prev.spending) {
    out.push({ mark: '↓', text: `Spending is down ${usd(prev.spending - spending)} from last month. Whatever changed, keep it.` });
  }
  if (out.length === 0) {
    out.push({ mark: '✓', text: 'Every category is inside its plan and the month is on track.' });
  }
  return out;
}

export function toCsvRows(state, month) {
  const lines = ['Date,Payee,Category,Amount,Note'];
  for (const e of entriesForMonth(state, month)) {
    const cat = e.category ? categoryById(e.category)?.label ?? e.category : 'Income';
    const fields = [e.date, e.payee, cat, e.amount.toFixed(2), e.note ?? ''];
    lines.push(fields.map((f) => `"${String(f).replaceAll('"', '""')}"`).join(','));
  }
  return lines.join('\n');
}
