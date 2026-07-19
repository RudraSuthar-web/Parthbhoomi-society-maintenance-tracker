export const initialNotices = [
  {
    id: "N1",
    title: "AGM Meeting Scheduled",
    content: "The Annual General Body Meeting is scheduled for July 26, 2026, at 10:00 AM in the Society Club House. Attendance is mandatory for all tenement owners.",
    date: "2026-07-15",
    severity: "warning" // info, warning, critical
  },
  {
    id: "N2",
    title: "Water Supply Interruption",
    content: "Please note that water supply will be suspended on Wednesday, July 22, 2026, from 1:00 PM to 5:00 PM due to overhead tank cleaning.",
    date: "2026-07-18",
    severity: "critical"
  },
  {
    id: "N3",
    title: "Monsoon Preparedness Notice",
    content: "Terrace waterproofing works have been completed. Residents are requested to ensure their balcony drainages are clear of any blockages.",
    date: "2026-07-10",
    severity: "info"
  }
];

export const initialTenements = [
  {
    tenementNumber: "1",
    ownerName: "Amit Patel",
    contact: "+91 98123 45678",
    dues: [
      { month: "January", status: "Paid", amount: 1200, dateCleared: "2026-01-04", reference: "TXN10001", method: "Bank Transfer" },
      { month: "February", status: "Paid", amount: 1200, dateCleared: "2026-02-05", reference: "TXN10012", method: "Bank Transfer" },
      { month: "March", status: "Paid", amount: 1200, dateCleared: "2026-03-03", reference: "TXN10023", method: "Cash" },
      { month: "April", status: "Paid", amount: 1200, dateCleared: "2026-04-05", reference: "TXN10034", method: "Cheque" },
      { month: "May", status: "Paid", amount: 1200, dateCleared: "2026-05-02", reference: "TXN10045", method: "Bank Transfer" },
      { month: "June", status: "Paid", amount: 1200, dateCleared: "2026-06-05", reference: "TXN10056", method: "Bank Transfer" },
      { month: "July", status: "Paid", amount: 1200, dateCleared: "2026-07-04", reference: "TXN10067", method: "Bank Transfer" },
      { month: "August", status: "Unbilled", amount: 1200 },
      { month: "September", status: "Unbilled", amount: 1200 },
      { month: "October", status: "Unbilled", amount: 1200 },
      { month: "November", status: "Unbilled", amount: 1200 },
      { month: "December", status: "Unbilled", amount: 1200 }
    ]
  },
  {
    tenementNumber: "42",
    ownerName: "Rohan Mehta",
    contact: "+91 98765 43210",
    dues: [
      { month: "January", status: "Paid", amount: 1200, dateCleared: "2026-01-05", reference: "TXN99201", method: "Bank Transfer" },
      { month: "February", status: "Paid", amount: 1200, dateCleared: "2026-02-04", reference: "TXN99212", method: "Bank Transfer" },
      { month: "March", status: "Paid", amount: 1200, dateCleared: "2026-03-05", reference: "TXN99223", method: "Cheque" },
      { month: "April", status: "Paid", amount: 1200, dateCleared: "2026-04-02", reference: "TXN99234", method: "Cash" },
      { month: "May", status: "Paid", amount: 1200, dateCleared: "2026-05-05", reference: "TXN99245", method: "Bank Transfer" },
      { month: "June", status: "Paid", amount: 1200, dateCleared: "2026-06-03", reference: "TXN99256", method: "Bank Transfer" },
      { month: "July", status: "Unpaid", amount: 1200 },
      { month: "August", status: "Unbilled", amount: 1200 },
      { month: "September", status: "Unbilled", amount: 1200 },
      { month: "October", status: "Unbilled", amount: 1200 },
      { month: "November", status: "Unbilled", amount: 1200 },
      { month: "December", status: "Unbilled", amount: 1200 }
    ]
  },
  {
    tenementNumber: "15",
    ownerName: "Priya Sharma",
    contact: "+91 98223 34455",
    dues: [
      { month: "January", status: "Paid", amount: 1200, dateCleared: "2026-01-03", reference: "TXN20001", method: "Bank Transfer" },
      { month: "February", status: "Paid", amount: 1200, dateCleared: "2026-02-03", reference: "TXN20012", method: "Bank Transfer" },
      { month: "March", status: "Paid", amount: 1200, dateCleared: "2026-03-05", reference: "TXN20023", method: "Bank Transfer" },
      { month: "April", status: "Paid", amount: 1200, dateCleared: "2026-04-06", reference: "TXN20034", method: "Cheque" },
      { month: "May", status: "Paid", amount: 1200, dateCleared: "2026-05-04", reference: "TXN20045", method: "Bank Transfer" },
      { month: "June", status: "Unpaid", amount: 1200 },
      { month: "July", status: "Unpaid", amount: 1200 },
      { month: "August", status: "Unbilled", amount: 1200 },
      { month: "September", status: "Unbilled", amount: 1200 },
      { month: "October", status: "Unbilled", amount: 1200 },
      { month: "November", status: "Unbilled", amount: 1200 },
      { month: "December", status: "Unbilled", amount: 1200 }
    ]
  },
  {
    tenementNumber: "16",
    ownerName: "Sanjay Shah",
    contact: "+91 98345 67890",
    dues: [
      { month: "January", status: "Paid", amount: 1200, dateCleared: "2026-01-10", reference: "TXN20201", method: "Cash" },
      { month: "February", status: "Paid", amount: 1200, dateCleared: "2026-02-09", reference: "TXN20212", method: "Cash" },
      { month: "March", status: "Paid", amount: 1200, dateCleared: "2026-03-07", reference: "TXN20223", method: "Cash" },
      { month: "April", status: "Paid", amount: 1200, dateCleared: "2026-04-10", reference: "TXN20234", method: "Cheque" },
      { month: "May", status: "Paid", amount: 1200, dateCleared: "2026-05-09", reference: "TXN20245", method: "Cash" },
      { month: "June", status: "Paid", amount: 1200, dateCleared: "2026-06-08", reference: "TXN20256", method: "Cash" },
      { month: "July", status: "Paid", amount: 1200, dateCleared: "2026-07-06", reference: "TXN20267", method: "Cash" },
      { month: "August", status: "Unbilled", amount: 1200 },
      { month: "September", status: "Unbilled", amount: 1200 },
      { month: "October", status: "Unbilled", amount: 1200 },
      { month: "November", status: "Unbilled", amount: 1200 },
      { month: "December", status: "Unbilled", amount: 1200 }
    ]
  },
  {
    tenementNumber: "44",
    ownerName: "Vikram Malhotra",
    contact: "+91 98989 89898",
    dues: [
      { month: "January", status: "Paid", amount: 1200, dateCleared: "2026-01-05", reference: "TXN40401", method: "Bank Transfer" },
      { month: "February", status: "Paid", amount: 1200, dateCleared: "2026-02-05", reference: "TXN40412", method: "Bank Transfer" },
      { month: "March", status: "Paid", amount: 1200, dateCleared: "2026-03-05", reference: "TXN40423", method: "Bank Transfer" },
      { month: "April", status: "Paid", amount: 1200, dateCleared: "2026-04-05", reference: "TXN40434", method: "Bank Transfer" },
      { month: "May", status: "Paid", amount: 1200, dateCleared: "2026-05-05", reference: "TXN40445", method: "Bank Transfer" },
      { month: "June", status: "Paid", amount: 1200, dateCleared: "2026-06-05", reference: "TXN40456", method: "Bank Transfer" },
      { month: "July", status: "Unpaid", amount: 1200 },
      { month: "August", status: "Unbilled", amount: 1200 },
      { month: "September", status: "Unbilled", amount: 1200 },
      { month: "October", status: "Unbilled", amount: 1200 },
      { month: "November", status: "Unbilled", amount: 1200 },
      { month: "December", status: "Unbilled", amount: 1200 }
    ]
  },
  {
    tenementNumber: "22",
    ownerName: "Sunita Rao",
    contact: "+91 97654 32109",
    dues: [
      { month: "January", status: "Paid", amount: 1200, dateCleared: "2026-01-07", reference: "TXN30201", method: "Cheque" },
      { month: "February", status: "Paid", amount: 1200, dateCleared: "2026-02-06", reference: "TXN30212", method: "Cheque" },
      { month: "March", status: "Paid", amount: 1200, dateCleared: "2026-03-07", reference: "TXN30223", method: "Cheque" },
      { month: "April", status: "Paid", amount: 1200, dateCleared: "2026-04-08", reference: "TXN30234", method: "Cheque" },
      { month: "May", status: "Paid", amount: 1200, dateCleared: "2026-05-07", reference: "TXN30245", method: "Cheque" },
      { month: "June", status: "Paid", amount: 1200, dateCleared: "2026-06-06", reference: "TXN30256", method: "Cheque" },
      { month: "July", status: "Unpaid", amount: 1200 },
      { month: "August", status: "Unbilled", amount: 1200 },
      { month: "September", status: "Unbilled", amount: 1200 },
      { month: "October", status: "Unbilled", amount: 1200 },
      { month: "November", status: "Unbilled", amount: 1200 },
      { month: "December", status: "Unbilled", amount: 1200 }
    ]
  },
  {
    tenementNumber: "33",
    ownerName: "Rajesh Gupta",
    contact: "+91 99112 23344",
    dues: [
      { month: "January", status: "Paid", amount: 1200, dateCleared: "2026-01-08", reference: "TXN50001", method: "Bank Transfer" },
      { month: "February", status: "Paid", amount: 1200, dateCleared: "2026-02-07", reference: "TXN50012", method: "Bank Transfer" },
      { month: "March", status: "Paid", amount: 1200, dateCleared: "2026-03-08", reference: "TXN50023", method: "Bank Transfer" },
      { month: "April", status: "Unpaid", amount: 1200 },
      { month: "May", status: "Unpaid", amount: 1200 },
      { month: "June", status: "Unpaid", amount: 1200 },
      { month: "July", status: "Unpaid", amount: 1200 },
      { month: "August", status: "Unbilled", amount: 1200 },
      { month: "September", status: "Unbilled", amount: 1200 },
      { month: "October", status: "Unbilled", amount: 1200 },
      { month: "November", status: "Unbilled", amount: 1200 },
      { month: "December", status: "Unbilled", amount: 1200 }
    ]
  },
  {
    tenementNumber: "51",
    ownerName: "Harish Kumar",
    contact: "+91 98888 77777",
    dues: [
      { month: "January", status: "Paid", amount: 1200, dateCleared: "2026-01-12", reference: "TXN60101", method: "Cash" },
      { month: "February", status: "Paid", amount: 1200, dateCleared: "2026-02-11", reference: "TXN60112", method: "Cash" },
      { month: "March", status: "Paid", amount: 1200, dateCleared: "2026-03-12", reference: "TXN60123", method: "Cash" },
      { month: "April", status: "Paid", amount: 1200, dateCleared: "2026-04-10", reference: "TXN60134", method: "Cash" },
      { month: "May", status: "Paid", amount: 1200, dateCleared: "2026-05-11", reference: "TXN60145", method: "Cash" },
      { month: "June", status: "Paid", amount: 1200, dateCleared: "2026-06-10", reference: "TXN60156", method: "Cash" },
      { month: "July", status: "Paid", amount: 1200, dateCleared: "2026-07-08", reference: "TXN60167", method: "Cash" },
      { month: "August", status: "Unbilled", amount: 1200 },
      { month: "September", status: "Unbilled", amount: 1200 },
      { month: "October", status: "Unbilled", amount: 1200 },
      { month: "November", status: "Unbilled", amount: 1200 },
      { month: "December", status: "Unbilled", amount: 1200 }
    ]
  }
];

export const mockUsers = [
  // Admin User
  { username: "ADMIN-01", role: "admin", password: "password", name: "Society Committee Treasurer" },
  // Resident Users
  ...initialTenements.map(t => ({
    username: t.tenementNumber,
    role: "resident",
    password: "password",
    name: t.ownerName
  }))
];
