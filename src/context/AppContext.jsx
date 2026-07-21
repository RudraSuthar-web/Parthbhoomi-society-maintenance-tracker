import React, { createContext, useState, useEffect } from 'react';
import { initialTenements, initialNotices, mockUsers } from '../data/mockData';
import { CURRENT_YEAR, CURRENT_MONTH, ALL_MONTHS, DUES_AMOUNT } from '../utils/dateUtils';
import {
  getMaintenanceAmount, saveMaintenanceAmount,
  getTenements, getNotices, createNotice, deleteNoticeById,
  registerTenementBackend, recordInstallmentBackend,
  revertPaymentBackend, updateProfileBackend,
} from '../services/apiService';

export const AppContext = createContext();

// ── Helper: compute due status from installments ──────────────────────────────
export function computeDueStatus(due, maintenanceAmount) {
  if (due.status === 'Unbilled') return 'Unbilled';
  const installments = due.installments || [];
  const totalPaid = installments.reduce((s, i) => s + (i.amount || 0), 0);
  if (totalPaid <= 0) return 'Unpaid';
  if (totalPaid >= maintenanceAmount) return 'Paid';
  return 'Partial';
}

// ── Helper: migrate legacy dues to installments format ────────────────────────
function migrateDue(due) {
  if (due.installments !== undefined) return due;
  if (due.status === 'Paid' && due.amount) {
    return {
      ...due,
      installments: [{
        amount: due.amount,
        date: due.dateCleared || new Date().toISOString().split('T')[0],
        reference: due.reference || '',
        method: due.method || 'Cash',
      }],
      amountPaid: due.amount,
    };
  }
  return { ...due, installments: [], amountPaid: 0 };
}

export const AppProvider = ({ children }) => {
  // ── Global maintenance amount (admin-configurable) ──────────────────────────
  const [maintenanceAmount, setMaintenanceAmountState] = useState(() => {
    const saved = localStorage.getItem('society_maintenance_amount');
    return saved ? Number(saved) : DUES_AMOUNT;
  });

  useEffect(() => {
    getMaintenanceAmount().then(amount => {
      if (amount && amount !== maintenanceAmount) {
        setMaintenanceAmountState(amount);
      }
    });
  }, []);

  const setMaintenanceAmount = (amount) => {
    const val = Number(amount);
    if (val > 0) {
      setMaintenanceAmountState(val);
      saveMaintenanceAmount(val);
    }
  };

  // ── Auth ───────────────────────────────────────────────────────────────────
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('society_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem('society_users');
    return savedUsers ? JSON.parse(savedUsers) : mockUsers;
  });

  // ── Tenements ──────────────────────────────────────────────────────────────
  const [tenements, setTenements] = useState(() => {
    const savedTenements = localStorage.getItem('society_tenements');
    const parsed = savedTenements ? JSON.parse(savedTenements) : initialTenements;
    return parsed.map(t => {
      let dues = t.dues.map(d => migrateDue({ ...d, year: d.year || 2026 }));
      return { ...t, dues };
    });
  });

  useEffect(() => {
    getTenements().then(fetched => {
      if (fetched && fetched.length > 0) {
        setTenements(fetched.map(t => ({
          ...t,
          dues: t.dues.map(d => migrateDue({ ...d, year: d.year || 2026 })),
        })));
      }
    });
  }, []);

  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH);

  const baseYears = [2025, 2026, 2027, CURRENT_YEAR];
  tenements.forEach(t => t.dues.forEach(d => {
    if (d.year) baseYears.push(d.year);
  }));
  const minYear = Math.min(...baseYears);
  const maxYear = Math.max(...baseYears);

  const availableYears = [];
  for (let y = maxYear; y >= minYear; y--) {
    availableYears.push(y);
  }

  // ── Notices ────────────────────────────────────────────────────────────────
  const [notices, setNotices] = useState(() => {
    const savedNotices = localStorage.getItem('society_notices');
    return savedNotices ? JSON.parse(savedNotices) : initialNotices;
  });

  useEffect(() => {
    getNotices().then(fetched => {
      if (fetched && fetched.length > 0) setNotices(fetched);
    });
  }, []);

  // ── Sync local storage for offline resiliency ─────────────────────────────
  useEffect(() => {
    localStorage.setItem('society_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('society_tenements', JSON.stringify(tenements));
  }, [tenements]);

  useEffect(() => {
    localStorage.setItem('society_notices', JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('society_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('society_user');
    }
  }, [user]);

  // ── Authentication ─────────────────────────────────────────────────────────
  const login = (username, password) => {
    const foundUser = users.find(
      (u) => u.username.toUpperCase() === username.trim().toUpperCase() && u.password === password
    );
    if (foundUser) {
      setUser(foundUser);
      return { success: true, user: foundUser };
    }
    return { success: false, message: 'Invalid credentials. Use Tenement ID (e.g., 42) or ADMIN-01.' };
  };

  const logout = () => {
    setUser(null);
  };

  // ── Register a new tenement ────────────────────────────────────────────────
  const registerTenement = (tenementNumber, contact, password) => {
    const trimmedUnit = tenementNumber.trim();
    if (!/^\d+$/.test(trimmedUnit)) {
      return { success: false, message: 'Tenement number must contain digits only (no characters).' };
    }
    const num = parseInt(trimmedUnit, 10);
    if (num < 1 || num > 60) {
      return { success: false, message: 'Tenement number must be between 1 and 60.' };
    }
    const formattedUnit = String(num);

    const tenementExists = tenements.some(t => t.tenementNumber === formattedUnit);
    const userExists = users.some(u => u.username === formattedUnit);
    if (tenementExists || userExists) {
      return { success: false, message: `Tenement ${formattedUnit} is already registered. Please login.` };
    }

    const defaultOwnerName = `Resident Unit ${formattedUnit}`;
    const defaultDues = [];
    availableYears.forEach(year => {
      ALL_MONTHS.forEach(month => {
        defaultDues.push({
          month,
          status: 'Unbilled',
          amount: maintenanceAmount,
          year,
          installments: [],
          amountPaid: 0,
        });
      });
    });

    const newTenement = {
      tenementNumber: formattedUnit,
      ownerName: defaultOwnerName,
      contact: contact.trim(),
      dues: defaultDues,
    };

    const newUser = {
      username: formattedUnit,
      role: 'resident',
      password: password,
      name: defaultOwnerName,
    };

    setTenements(prev => [...prev, newTenement]);
    setUsers(prev => [...prev, newUser]);

    // Async sync with Supabase / Backend
    registerTenementBackend(formattedUnit, contact.trim(), password, maintenanceAmount);

    if (!user || user.role !== 'admin') {
      setUser(newUser);
    }
    return { success: true };
  };

  // ── Update Profile ─────────────────────────────────────────────────────────
  const updateProfile = (ownerName, contact) => {
    if (!user || user.role === 'admin') return { success: false, message: 'Only residents can update profiles.' };

    const formattedName = ownerName.trim();
    const formattedContact = contact.trim();

    if (!formattedName || !formattedContact) {
      return { success: false, message: 'Name and contact are required.' };
    }

    setTenements(prevTenements => prevTenements.map(t => {
      if (t.tenementNumber === user.username) {
        return { ...t, ownerName: formattedName, contact: formattedContact };
      }
      return t;
    }));

    setUsers(prevUsers => prevUsers.map(u => {
      if (u.username === user.username) {
        return { ...u, name: formattedName };
      }
      return u;
    }));

    setUser(prevUser => {
      const updated = { ...prevUser, name: formattedName };
      localStorage.setItem('society_user', JSON.stringify(updated));
      return updated;
    });

    // Async sync with Supabase / Backend
    updateProfileBackend(user.username, formattedName, formattedContact);

    return { success: true };
  };

  // ── Add an installment payment (partial or full) ───────────────────────────
  const addInstallment = (tenementNumber, monthName, installmentData, customYear = selectedYear) => {
    setTenements(prevTenements =>
      prevTenements.map(tenement => {
        if (tenement.tenementNumber !== tenementNumber) return tenement;

        const updatedDues = tenement.dues.map(due => {
          if (due.month !== monthName || due.year !== customYear) return due;
          if (due.status === 'Unbilled') return due;

          const existingInstallments = due.installments || [];
          const newInstallments = [...existingInstallments, installmentData];
          const totalPaid = newInstallments.reduce((s, i) => s + (i.amount || 0), 0);
          const isFullyPaid = totalPaid >= maintenanceAmount;
          const newStatus = isFullyPaid ? 'Paid' : (totalPaid > 0 ? 'Partial' : 'Unpaid');

          // Async sync with Supabase / Backend
          recordInstallmentBackend(
            tenementNumber,
            monthName,
            customYear,
            installmentData,
            due.status,
            totalPaid,
            maintenanceAmount
          );

          return {
            ...due,
            installments: newInstallments,
            amountPaid: totalPaid,
            status: newStatus,
            ...(isFullyPaid ? {
              dateCleared: installmentData.date,
              reference: installmentData.reference,
              method: installmentData.method,
              amount: maintenanceAmount,
            } : {
              amount: maintenanceAmount,
            }),
          };
        });

        return { ...tenement, dues: updatedDues };
      })
    );
  };

  // ── Revert a payment (clear all installments) ──────────────────────────────
  const revertPayment = (tenementNumber, monthName, customYear = selectedYear) => {
    setTenements(prevTenements =>
      prevTenements.map(tenement => {
        if (tenement.tenementNumber !== tenementNumber) return tenement;

        const updatedDues = tenement.dues.map(due => {
          if (due.month !== monthName || due.year !== customYear) return due;
          if (due.status === 'Unbilled') return due;

          // Async sync with Supabase / Backend
          revertPaymentBackend(tenementNumber, monthName, customYear, maintenanceAmount);

          const { dateCleared, reference, method, ...rest } = due;
          return {
            ...rest,
            status: 'Unpaid',
            installments: [],
            amountPaid: 0,
            amount: maintenanceAmount,
          };
        });

        return { ...tenement, dues: updatedDues };
      })
    );
  };

  // ── Legacy togglePaymentStatus ─────────────────────────────────────────────
  const togglePaymentStatus = (tenementNumber, monthName, customMethod = 'Cash', customAmount = maintenanceAmount, customReference = '', customYear = selectedYear) => {
    if (tenements.find(t => t.tenementNumber === tenementNumber)?.dues.find(d => d.month === monthName && d.year === customYear)?.status === 'Paid') {
      revertPayment(tenementNumber, monthName, customYear);
    } else {
      const today = new Date().toISOString().split('T')[0];
      const randomRef = 'TXN' + Math.floor(10000 + Math.random() * 90000);
      addInstallment(
        tenementNumber,
        monthName,
        { amount: customAmount, date: today, reference: customReference || randomRef, method: customMethod },
        customYear
      );
    }
  };

  // ── Notices ────────────────────────────────────────────────────────────────
  const addNotice = (title, content) => {
    createNotice(title, content).then(newNotice => {
      setNotices(prevNotices => [newNotice, ...prevNotices]);
    });
  };

  const deleteNotice = (id) => {
    setNotices(prevNotices => prevNotices.filter(n => n.id !== id));
    deleteNoticeById(id);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        users,
        selectedYear,
        setSelectedYear,
        selectedMonth,
        setSelectedMonth,
        availableYears,
        tenements,
        notices,
        maintenanceAmount,
        setMaintenanceAmount,
        login,
        logout,
        registerTenement,
        updateProfile,
        addInstallment,
        revertPayment,
        togglePaymentStatus,
        addNotice,
        deleteNotice,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
