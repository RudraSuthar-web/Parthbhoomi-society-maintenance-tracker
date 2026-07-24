import React, { createContext, useState, useEffect } from 'react';
import { CURRENT_YEAR, CURRENT_MONTH, ALL_MONTHS, DUES_AMOUNT } from '../utils/dateUtils';
import {
  getMaintenanceAmount, saveMaintenanceAmount,
  getTenements, getNotices, createNotice, deleteNoticeById,
  registerTenementBackend, recordInstallmentBackend,
  revertPaymentBackend, updateProfileBackend, deleteTenementBackend, loginBackend,
  getExpenses, createExpenseBackend, deleteExpenseBackend,
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
  const [maintenanceAmount, setMaintenanceAmountState] = useState(DUES_AMOUNT);

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
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [users, setUsers] = useState([]);

  // ── Tenements ──────────────────────────────────────────────────────────────
  const [tenements, setTenements] = useState([]);

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
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    getNotices().then(fetched => {
      if (fetched && fetched.length > 0) setNotices(fetched);
    });
  }, []);

  // ── Authentication ─────────────────────────────────────────────────────────
  const login = async (username, password) => {
    const trimmedUser = username.trim().toUpperCase();

    // Authenticate against API backend
    const remoteUser = await loginBackend(trimmedUser, password);
    if (remoteUser?.username) {
      const userObj = {
        username: remoteUser.username,
        role: remoteUser.role,
        name: remoteUser.name,
      };
      setUser(userObj);
      localStorage.setItem('currentUser', JSON.stringify(userObj));
      return { success: true, user: userObj };
    }

    // Secondary check against local state if user was registered in session
    const foundUser = users.find(
      (u) => u.username.toUpperCase() === trimmedUser && u.password === password
    );
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      return { success: true, user: foundUser };
    }
    return { success: false, message: 'Invalid credentials. Please check your Tenement ID or Admin username.' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  // ── Register a new tenement ────────────────────────────────────────────────
  const registerTenement = (tenementNumber, ownerName, contact, password) => {
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

    const formattedName = ownerName && ownerName.trim() ? ownerName.trim() : `Resident Unit ${formattedUnit}`;
    const defaultDues = [];
    const cy = CURRENT_YEAR;
    const cmIdx = ALL_MONTHS.indexOf(CURRENT_MONTH);

    availableYears.forEach(year => {
      ALL_MONTHS.forEach((month, mIdx) => {
        let initialStatus = 'Unbilled';
        if (year < cy) {
          initialStatus = 'Unpaid';
        } else if (year === cy && mIdx <= cmIdx) {
          initialStatus = 'Unpaid';
        }

        defaultDues.push({
          month,
          status: initialStatus,
          amount: maintenanceAmount,
          year,
          installments: [],
          amountPaid: 0,
        });
      });
    });

    const newTenement = {
      tenementNumber: formattedUnit,
      ownerName: formattedName,
      contact: contact.trim(),
      dues: defaultDues,
    };

    const newUser = {
      username: formattedUnit,
      role: 'resident',
      password: password,
      name: formattedName,
    };

    setTenements(prev => [...prev, newTenement]);
    setUsers(prev => [...prev, newUser]);

    // Backend sync
    registerTenementBackend(formattedUnit, formattedName, contact.trim(), password, maintenanceAmount);

    if (!user || user.role !== 'admin') {
      setUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
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
      const updatedUser = { ...prevUser, name: formattedName };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      return updatedUser;
    });

    // Backend sync
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

          // Backend sync
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

          // Backend sync
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

  // ── Delete Tenement ────────────────────────────────────────────────────────
  const deleteTenement = (tenementNumber) => {
    setTenements(prev => prev.filter(t => t.tenementNumber !== tenementNumber));
    setUsers(prev => prev.filter(u => u.username !== tenementNumber));
    deleteTenementBackend(tenementNumber);
  };

  // ── Expenses State (Supabase / Backend) ────────────────────────────────────
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    getExpenses().then(fetched => {
      if (fetched && fetched.length > 0) setExpenses(fetched);
    });
  }, []);

  // ── Expenses Actions ───────────────────────────────────────────────────────
  const addExpense = (category, description, amount, date, billData) => {
    const id = "E" + Date.now() + "-" + Math.floor(Math.random() * 1000);
    const driveLink = `https://drive.google.com/file/d/gd-${Math.random().toString(36).substr(2, 9)}/view`;
    const newExpense = {
      id,
      category,
      description: description.trim(),
      amount: Number(amount),
      date,
      driveLink,
      billData
    };
    setExpenses(prev => [newExpense, ...prev]);
    createExpenseBackend(category, description, amount, date, billData);
    return { success: true, expense: newExpense };
  };

  const deleteExpense = (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    deleteExpenseBackend(id);
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
        deleteTenement,
        addInstallment,
        revertPayment,
        togglePaymentStatus,
        addNotice,
        deleteNotice,
        expenses,
        addExpense,
        deleteExpense,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
