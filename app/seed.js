// Maplewood Ledger — starter figures for the Alvarez household.
// Two adults, two children and a cat, living in a four-bedroom house on
// Maplewood Lane. This file only seeds the ledger the first time it opens;
// the live copy lives in local storage and every change the household
// makes is saved there instead.

export const HOUSEHOLD = {
  name: 'The Alvarez Household',
  members: ['Sofia Alvarez', 'Daniel Alvarez', 'Mia Alvarez (8)', 'Noah Alvarez (5)', 'Miso the cat'],
  home: 'Four-bedroom house, Maplewood Lane',
  currency: 'USD',
  paydayDay: 1,
};

export const CATEGORIES = [
  { id: 'groceries', label: 'Groceries', color: '#0f766e', mark: '●' },
  { id: 'dining', label: 'Eating out', color: '#c2410c', mark: '●' },
  { id: 'housing', label: 'Housing', color: '#1d4ed8', mark: '●' },
  { id: 'utilities', label: 'Utilities', color: '#6d28d9', mark: '●' },
  { id: 'transport', label: 'Transport', color: '#0e7490', mark: '●' },
  { id: 'childcare', label: 'Childcare', color: '#be185d', mark: '●' },
  { id: 'health', label: 'Health', color: '#15803d', mark: '●' },
  { id: 'fun', label: 'Fun & outings', color: '#b45309', mark: '●' },
  { id: 'clothing', label: 'Clothing', color: '#92400e', mark: '●' },
  { id: 'home', label: 'Home & garden', color: '#4d7c0f', mark: '●' },
  { id: 'pets', label: 'Pets', color: '#9f1239', mark: '●' },
  { id: 'subscriptions', label: 'Subscriptions', color: '#475569', mark: '●' },
  { id: 'other', label: 'Everything else', color: '#a8a29e', mark: '●' },
];

export const INCOME = [
  { id: 'sofia-pay', label: "Sofia's pay — dental hygienist", amount: 4120 },
  { id: 'daniel-pay', label: "Daniel's pay — electrician", amount: 3680 },
  { id: 'daniel-side', label: 'Daniel weekend call-outs', amount: 310 },
];

export const PLAN = {
  groceries: 680,
  dining: 240,
  housing: 1720,
  utilities: 295,
  transport: 350,
  childcare: 590,
  health: 165,
  fun: 200,
  clothing: 110,
  home: 130,
  pets: 85,
  subscriptions: 61,
  other: 120,
};

export const GOALS_SEED = [
  { id: 'goal-rainy', name: 'Rainy-day fund', note: 'Six months of essentials, in a separate savings account.', target: 15000, saved: 9800, monthly: 400 },
  { id: 'goal-beach', name: 'Beach house week', note: 'A week by the coast next summer — rental, food and fuel.', target: 3800, saved: 2140, monthly: 220 },
  { id: 'goal-truck', name: 'New work truck', note: 'Down payment for a used truck when the old one retires.', target: 7500, saved: 1980, monthly: 300 },
  { id: 'goal-school', name: 'Kids’ school fund', note: 'A little each month for Mia and Noah’s schooling.', target: 20000, saved: 6230, monthly: 200 },
];

export const BILLS_SEED = [
  { id: 'bill-rent', name: 'Mortgage', category: 'housing', amount: 1720, dueDay: 1, autopay: true, paidMonths: ['2026-09', '2026-10', '2026-11'] },
  { id: 'bill-power', name: 'Maplewood Electric', category: 'utilities', amount: 118, dueDay: 11, autopay: true, paidMonths: ['2026-09', '2026-10'] },
  { id: 'bill-water', name: 'Water & sewer', category: 'utilities', amount: 66, dueDay: 14, autopay: false, paidMonths: ['2026-09', '2026-10', '2026-11'] },
  { id: 'bill-net', name: 'Fiber internet', category: 'utilities', amount: 72, dueDay: 7, autopay: true, paidMonths: ['2026-09', '2026-10', '2026-11'] },
  { id: 'bill-phones', name: 'Mobile phones (2 lines)', category: 'utilities', amount: 88, dueDay: 19, autopay: true, paidMonths: ['2026-09', '2026-10'] },
  { id: 'bill-insurance', name: 'Home insurance', category: 'housing', amount: 104, dueDay: 4, autopay: true, paidMonths: ['2026-09', '2026-10', '2026-11'] },
  { id: 'bill-van', name: 'Van payment', category: 'transport', amount: 264, dueDay: 16, autopay: true, paidMonths: ['2026-09', '2026-10'] },
  { id: 'bill-afterschool', name: 'After-school club', category: 'childcare', amount: 590, dueDay: 3, autopay: true, paidMonths: ['2026-09', '2026-10', '2026-11'] },
  { id: 'bill-gym', name: 'Community gym', category: 'health', amount: 46, dueDay: 9, autopay: false, paidMonths: ['2026-09', '2026-10', '2026-11'] },
  { id: 'bill-stream', name: 'Streaming bundle', category: 'subscriptions', amount: 29, dueDay: 23, autopay: true, paidMonths: ['2026-09', '2026-10'] },
];

// Expenses are negative amounts, income positive. Three months of history
// so the Reports page has a real trend to draw.
export const TRANSACTIONS_SEED = [
  // --- November 2026 ---
  { id: 'x-nov-01', date: '2026-11-01', payee: "Sofia's pay", category: '', amount: 4120, note: 'Monthly pay, direct deposit' },
  { id: 'x-nov-02', date: '2026-11-01', payee: "Daniel's pay", category: '', amount: 3680, note: 'Monthly pay, direct deposit' },
  { id: 'x-nov-03', date: '2026-11-01', payee: 'Maplewood Mortgage Co.', category: 'housing', amount: -1720, note: 'Autopay' },
  { id: 'x-nov-04', date: '2026-11-02', payee: 'FreshMart Grocers', category: 'groceries', amount: -128.40, note: 'Weekly shop' },
  { id: 'x-nov-05', date: '2026-11-03', payee: 'Maplewood After-School Club', category: 'childcare', amount: -590, note: 'November club fees' },
  { id: 'x-nov-06', date: '2026-11-04', payee: 'Shell Corner Fuel', category: 'transport', amount: -52.10, note: 'Van fill-up' },
  { id: 'x-nov-07', date: '2026-11-06', payee: 'The Corner Bakery', category: 'dining', amount: -24.75, note: 'Saturday breakfast' },
  { id: 'x-nov-08', date: '2026-11-07', payee: 'FreshMart Grocers', category: 'groceries', amount: -96.85, note: 'Weekly shop' },
  { id: 'x-nov-09', date: '2026-11-08', payee: 'Ridgeview Cinema', category: 'fun', amount: -38.00, note: 'Family movie night' },
  { id: 'x-nov-10', date: '2026-11-09', payee: 'PetCare Plus', category: 'pets', amount: -41.20, note: 'Miso check-up' },
  { id: 'x-nov-11', date: '2026-11-10', payee: 'Maplewood Pharmacy', category: 'health', amount: -27.60, note: 'Prescription refill' },
  { id: 'x-nov-12', date: '2026-11-11', payee: 'Maplewood Electric', category: 'utilities', amount: -118, note: 'October usage' },
  { id: 'x-nov-13', date: '2026-11-12', payee: 'FreshMart Grocers', category: 'groceries', amount: -141.30, note: 'Weekly shop, stocked the pantry' },
  { id: 'x-nov-14', date: '2026-11-13', payee: 'Taco Corner', category: 'dining', amount: -31.50, note: 'Friday takeaway' },
  { id: 'x-nov-15', date: '2026-11-14', payee: 'Daniel weekend call-outs', category: '', amount: 310, note: 'Saturday emergency job' },
  { id: 'x-nov-16', date: '2026-11-15', payee: 'Kids’ Closet', category: 'clothing', amount: -64.90, note: 'Winter coats for Mia and Noah' },
  { id: 'x-nov-17', date: '2026-11-16', payee: 'Garden Centre', category: 'home', amount: -43.25, note: 'Leaf bags and bulbs' },
  { id: 'x-nov-18', date: '2026-11-17', payee: 'Shell Corner Fuel', category: 'transport', amount: -48.60, note: 'Van fill-up' },
  { id: 'x-nov-19', date: '2026-11-18', payee: 'FreshMart Grocers', category: 'groceries', amount: -112.70, note: 'Weekly shop' },
  { id: 'x-nov-20', date: '2026-11-19', payee: 'Pizza Palace', category: 'dining', amount: -28.40, note: 'Pizza night' },
  { id: 'x-nov-21', date: '2026-11-20', payee: 'Streaming bundle', category: 'subscriptions', amount: -29, note: 'Monthly bundle' },
  { id: 'x-nov-22', date: '2026-11-21', payee: 'Maplewood Library', category: 'fun', amount: -12.00, note: 'Book fair' },
  { id: 'x-nov-23', date: '2026-11-22', payee: 'FreshMart Grocers', category: 'groceries', amount: -88.15, note: 'Weekly shop' },
  { id: 'x-nov-24', date: '2026-11-23', payee: 'Corner Hardware', category: 'home', amount: -36.80, note: 'Fix the garden gate' },
  { id: 'x-nov-25', date: '2026-11-24', payee: 'Pet Pantry', category: 'pets', amount: -22.45, note: 'Cat food and litter' },
  { id: 'x-nov-26', date: '2026-11-25', payee: 'FreshMart Grocers', category: 'groceries', amount: -104.90, note: 'Thanksgiving shop' },
  { id: 'x-nov-27', date: '2026-11-26', payee: 'Shell Corner Fuel', category: 'transport', amount: -45.30, note: 'Van fill-up' },
  // --- October 2026 ---
  { id: 'x-oct-01', date: '2026-10-01', payee: "Sofia's pay", category: '', amount: 4120, note: '' },
  { id: 'x-oct-02', date: '2026-10-01', payee: "Daniel's pay", category: '', amount: 3680, note: '' },
  { id: 'x-oct-03', date: '2026-10-01', payee: 'Maplewood Mortgage Co.', category: 'housing', amount: -1720, note: 'Autopay' },
  { id: 'x-oct-04', date: '2026-10-03', payee: 'Maplewood After-School Club', category: 'childcare', amount: -590, note: '' },
  { id: 'x-oct-05', date: '2026-10-04', payee: 'FreshMart Grocers', category: 'groceries', amount: -152.20, note: 'Weekly shop' },
  { id: 'x-oct-06', date: '2026-10-06', payee: 'Shell Corner Fuel', category: 'transport', amount: -55.40, note: '' },
  { id: 'x-oct-07', date: '2026-10-08', payee: 'The Corner Bakery', category: 'dining', amount: -19.80, note: '' },
  { id: 'x-oct-08', date: '2026-10-10', payee: 'FreshMart Grocers', category: 'groceries', amount: -131.60, note: 'Weekly shop' },
  { id: 'x-oct-09', date: '2026-10-11', payee: 'Pumpkin Patch Farm', category: 'fun', amount: -46.00, note: 'Pumpkin picking' },
  { id: 'x-oct-10', date: '2026-10-12', payee: 'Maplewood Electric', category: 'utilities', amount: -124, note: 'September usage' },
  { id: 'x-oct-11', date: '2026-10-14', payee: 'FreshMart Grocers', category: 'groceries', amount: -118.90, note: 'Weekly shop' },
  { id: 'x-oct-12', date: '2026-10-15', payee: 'Dentist — Sofia', category: 'health', amount: -85.00, note: 'Check-up and clean' },
  { id: 'x-oct-13', date: '2026-10-16', payee: 'Van payment', category: 'transport', amount: -264, note: 'Monthly payment' },
  { id: 'x-oct-14', date: '2026-10-17', payee: 'FreshMart Grocers', category: 'groceries', amount: -139.75, note: 'Weekly shop' },
  { id: 'x-oct-15', date: '2026-10-18', payee: 'Taco Corner', category: 'dining', amount: -34.20, note: '' },
  { id: 'x-oct-16', date: '2026-10-20', payee: 'Streaming bundle', category: 'subscriptions', amount: -29, note: '' },
  { id: 'x-oct-17', date: '2026-10-21', payee: 'FreshMart Grocers', category: 'groceries', amount: -97.40, note: 'Weekly shop' },
  { id: 'x-oct-18', date: '2026-10-23', payee: 'Shell Corner Fuel', category: 'transport', amount: -49.90, note: '' },
  { id: 'x-oct-19', date: '2026-10-24', payee: 'Kids’ Closet', category: 'clothing', amount: -52.30, note: 'School shoes' },
  { id: 'x-oct-20', date: '2026-10-25', payee: 'FreshMart Grocers', category: 'groceries', amount: -121.10, note: 'Weekly shop' },
  { id: 'x-oct-21', date: '2026-10-27', payee: 'Pet Pantry', category: 'pets', amount: -19.80, note: '' },
  { id: 'x-oct-22', date: '2026-10-28', payee: 'Maplewood Pharmacy', category: 'health', amount: -18.40, note: '' },
  { id: 'x-oct-23', date: '2026-10-30', payee: 'Pizza Palace', category: 'dining', amount: -26.90, note: 'Halloween pizza' },
  // --- September 2026 ---
  { id: 'x-sep-01', date: '2026-09-01', payee: "Sofia's pay", category: '', amount: 4120, note: '' },
  { id: 'x-sep-02', date: '2026-09-01', payee: "Daniel's pay", category: '', amount: 3680, note: '' },
  { id: 'x-sep-03', date: '2026-09-01', payee: 'Maplewood Mortgage Co.', category: 'housing', amount: -1720, note: 'Autopay' },
  { id: 'x-sep-04', date: '2026-09-03', payee: 'Maplewood After-School Club', category: 'childcare', amount: -590, note: '' },
  { id: 'x-sep-05', date: '2026-09-05', payee: 'FreshMart Grocers', category: 'groceries', amount: -146.80, note: 'Weekly shop' },
  { id: 'x-sep-06', date: '2026-09-07', payee: 'Shell Corner Fuel', category: 'transport', amount: -51.20, note: '' },
  { id: 'x-sep-07', date: '2026-09-09', payee: 'FreshMart Grocers', category: 'groceries', amount: -128.50, note: 'Weekly shop' },
  { id: 'x-sep-08', date: '2026-09-11', payee: 'School Supplies Store', category: 'other', amount: -74.60, note: 'Back-to-school kit' },
  { id: 'x-sep-09', date: '2026-09-12', payee: 'FreshMart Grocers', category: 'groceries', amount: -134.40, note: 'Weekly shop' },
  { id: 'x-sep-10', date: '2026-09-13', payee: 'Maplewood Electric', category: 'utilities', amount: -131, note: 'August usage' },
  { id: 'x-sep-11', date: '2026-09-15', payee: 'The Corner Bakery', category: 'dining', amount: -22.10, note: '' },
  { id: 'x-sep-12', date: '2026-09-16', payee: 'Van payment', category: 'transport', amount: -264, note: '' },
  { id: 'x-sep-13', date: '2026-09-18', payee: 'FreshMart Grocers', category: 'groceries', amount: -119.90, note: 'Weekly shop' },
  { id: 'x-sep-14', date: '2026-09-19', payee: 'County Fair', category: 'fun', amount: -58.00, note: 'Fair tickets and snacks' },
  { id: 'x-sep-15', date: '2026-09-21', payee: 'FreshMart Grocers', category: 'groceries', amount: -105.30, note: 'Weekly shop' },
  { id: 'x-sep-16', date: '2026-09-23', payee: 'Maplewood Pharmacy', category: 'health', amount: -32.75, note: '' },
  { id: 'x-sep-17', date: '2026-09-25', payee: 'FreshMart Grocers', category: 'groceries', amount: -112.60, note: 'Weekly shop' },
  { id: 'x-sep-18', date: '2026-09-26', payee: 'Taco Corner', category: 'dining', amount: -29.60, note: '' },
  { id: 'x-sep-19', date: '2026-09-28', payee: 'Shell Corner Fuel', category: 'transport', amount: -47.80, note: '' },
  { id: 'x-sep-20', date: '2026-09-29', payee: 'Pet Pantry', category: 'pets', amount: -21.30, note: '' },
  { id: 'x-sep-21', date: '2026-09-30', payee: 'Streaming bundle', category: 'subscriptions', amount: -29, note: '' },
];

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function monthTitle(yyyymm) {
  const [y, m] = yyyymm.split('-').map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

export const FIRST_MONTH = '2026-11';
