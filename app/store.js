// Maplewood Ledger — the household's saved state.
// Everything lives in one localStorage key so the site works offline and
// remembers every change between visits. Reset restores the seed figures.

import { HOUSEHOLD, CATEGORIES, INCOME, PLAN, GOALS_SEED, BILLS_SEED, TRANSACTIONS_SEED, FIRST_MONTH } from './seed.js';

const KEY = 'maplewood-ledger-v1';

function freshState() {
  return {
    householdName: HOUSEHOLD.name,
    month: FIRST_MONTH,
    plan: { ...PLAN },
    goals: GOALS_SEED.map((g) => ({ ...g })),
    bills: BILLS_SEED.map((b) => ({ ...b, paidMonths: [...b.paidMonths] })),
    incomeSources: INCOME.map((s) => ({ ...s })),
    entries: TRANSACTIONS_SEED.map((t) => ({ ...t })),
  };
}

export function loadLedger() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.entries) || !parsed.plan) return freshState();
    return parsed;
  } catch {
    return freshState();
  }
}

export function saveLedger(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function resetLedger() {
  const state = freshState();
  saveLedger(state);
  return state;
}

export function monthsAvailable(state) {
  const seen = new Set(state.entries.map((e) => e.date.slice(0, 7)));
  return [...seen].sort().reverse();
}

export function addEntry(state, entry) {
  const id = `x-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
  const next = { ...entry, id };
  state.entries.push(next);
  state.entries.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  saveLedger(state);
  return next;
}

export function updateEntry(state, id, patch) {
  const item = state.entries.find((e) => e.id === id);
  if (!item) return false;
  Object.assign(item, patch);
  state.entries.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  saveLedger(state);
  return true;
}

export function removeEntry(state, id) {
  const at = state.entries.findIndex((e) => e.id === id);
  if (at < 0) return false;
  state.entries.splice(at, 1);
  saveLedger(state);
  return true;
}

export function setPlanAmount(state, categoryId, amount) {
  state.plan[categoryId] = Math.max(0, Math.round(amount));
  saveLedger(state);
}

export function addToGoal(state, goalId, amount) {
  const goal = state.goals.find((g) => g.id === goalId);
  if (!goal) return false;
  goal.saved = Math.max(0, Math.round((goal.saved + amount) * 100) / 100);
  saveLedger(state);
  return true;
}

export function addGoal(state, goal) {
  const id = `goal-${Date.now().toString(36)}`;
  state.goals.push({ ...goal, id });
  saveLedger(state);
  return id;
}

export function removeGoal(state, goalId) {
  const at = state.goals.findIndex((g) => g.id === goalId);
  if (at < 0) return false;
  state.goals.splice(at, 1);
  saveLedger(state);
  return true;
}

export function markBillPaid(state, billId, month, paid) {
  const bill = state.bills.find((b) => b.id === billId);
  if (!bill) return false;
  const at = bill.paidMonths.indexOf(month);
  if (paid && at < 0) bill.paidMonths.push(month);
  if (!paid && at >= 0) bill.paidMonths.splice(at, 1);
  saveLedger(state);
  return true;
}

export function addBill(state, bill) {
  const id = `bill-${Date.now().toString(36)}`;
  state.bills.push({ ...bill, id, paidMonths: [] });
  saveLedger(state);
  return id;
}

export function removeBill(state, billId) {
  const at = state.bills.findIndex((b) => b.id === billId);
  if (at < 0) return false;
  state.bills.splice(at, 1);
  saveLedger(state);
  return true;
}

export function setIncomeSource(state, sourceId, amount) {
  const src = state.incomeSources.find((s) => s.id === sourceId);
  if (!src) return false;
  src.amount = Math.max(0, Math.round(amount));
  saveLedger(state);
  return true;
}

export function categoryById(id) {
  return CATEGORIES.find((c) => c.id === id) ?? null;
}
