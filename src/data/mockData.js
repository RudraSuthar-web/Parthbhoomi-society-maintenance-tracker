import { ALL_MONTHS, CURRENT_YEAR, CURRENT_MONTH, DUES_AMOUNT } from '../utils/dateUtils';

// ── Helper: generate a full year of dues dynamically ──────────────────────────
// months up to & including currentMonth get the given status; rest are Unbilled
function generateDues(year, paidUpToMonth, unpaidMonths = []) {
  const currentMonthIdx = ALL_MONTHS.indexOf(CURRENT_MONTH);
  return ALL_MONTHS.map((month, idx) => {
    const isPastOrCurrent = year < CURRENT_YEAR || (year === CURRENT_YEAR && idx <= currentMonthIdx);

    if (!isPastOrCurrent) {
      return { month, year, status: 'Unbilled', amount: DUES_AMOUNT, installments: [], amountPaid: 0 };
    }

    if (unpaidMonths.includes(month)) {
      return { month, year, status: 'Unpaid', amount: DUES_AMOUNT, installments: [], amountPaid: 0 };
    }

    const paidUpToIdx = ALL_MONTHS.indexOf(paidUpToMonth);
    if (paidUpToIdx >= 0 && idx <= paidUpToIdx) {
      const dayStr = String(5 + (idx % 8)).padStart(2, '0');
      const monthStr = String(idx + 1).padStart(2, '0');
      const ref = `TXN${year}${monthStr}${String(Math.floor(Math.random() * 900) + 100)}`;
      const methods = ['Bank Transfer', 'Cash', 'Cheque', 'UPI'];
      const method = methods[idx % methods.length];
      const dateCleared = `${year}-${monthStr}-${dayStr}`;
      return {
        month,
        year,
        status: 'Paid',
        amount: DUES_AMOUNT,
        dateCleared,
        reference: ref,
        method,
        installments: [{ amount: DUES_AMOUNT, date: dateCleared, reference: ref, method }],
        amountPaid: DUES_AMOUNT,
      };
    }

    return { month, year, status: 'Unpaid', amount: DUES_AMOUNT, installments: [], amountPaid: 0 };
  });
}

export const initialNotices = [
  {
    id: 'N1',
    title: 'AGM Meeting Scheduled',
    content: 'The Annual General Body Meeting is scheduled for the 26th of this month at 10:00 AM in the Society Club House. Attendance is mandatory for all tenement owners.',
    date: `${CURRENT_YEAR}-07-15`,
  },
  {
    id: 'N2',
    title: 'Water Supply Interruption',
    content: 'Please note that water supply will be suspended on the 22nd from 1:00 PM to 5:00 PM due to overhead tank cleaning.',
    date: `${CURRENT_YEAR}-07-18`,
  },
  {
    id: 'N3',
    title: 'Monsoon Preparedness Notice',
    content: 'Terrace waterproofing works have been completed. Residents are requested to ensure their balcony drainages are clear of any blockages.',
    date: `${CURRENT_YEAR}-07-10`,
  },
];

// ── Initial tenements — dues generated dynamically from dateUtils constants ───
export const initialTenements = [
  {
    tenementNumber: '1',
    ownerName: 'Amit Patel',
    contact: '+91 98123 45678',
    dues: generateDues(CURRENT_YEAR, CURRENT_MONTH, []),          // all paid up to current month
  },
  {
    tenementNumber: '42',
    ownerName: 'Rohan Mehta',
    contact: '+91 98765 43210',
    dues: generateDues(CURRENT_YEAR, 'June', [CURRENT_MONTH]),    // June paid, current month unpaid
  },
  {
    tenementNumber: '15',
    ownerName: 'Priya Sharma',
    contact: '+91 98223 34455',
    dues: generateDues(CURRENT_YEAR, 'May', ['June', CURRENT_MONTH]),
  },
  {
    tenementNumber: '16',
    ownerName: 'Sanjay Shah',
    contact: '+91 98345 67890',
    dues: generateDues(CURRENT_YEAR, CURRENT_MONTH, []),
  },
  {
    tenementNumber: '44',
    ownerName: 'Vikram Malhotra',
    contact: '+91 98989 89898',
    dues: generateDues(CURRENT_YEAR, 'June', [CURRENT_MONTH]),
  },
  {
    tenementNumber: '22',
    ownerName: 'Sunita Rao',
    contact: '+91 97654 32109',
    dues: generateDues(CURRENT_YEAR, 'June', [CURRENT_MONTH]),
  },
  {
    tenementNumber: '33',
    ownerName: 'Rajesh Gupta',
    contact: '+91 99112 23344',
    dues: generateDues(CURRENT_YEAR, 'March', ['April', 'May', 'June', CURRENT_MONTH]),
  },
  {
    tenementNumber: '51',
    ownerName: 'Harish Kumar',
    contact: '+91 98888 77777',
    dues: generateDues(CURRENT_YEAR, CURRENT_MONTH, []),
  },
];

export const mockUsers = [
  { username: 'ADMIN-01', role: 'admin', password: 'password', name: 'Society Committee Treasurer' },
  ...initialTenements.map(t => ({
    username: t.tenementNumber,
    role: 'resident',
    password: 'password',
    name: t.ownerName,
  })),
];
