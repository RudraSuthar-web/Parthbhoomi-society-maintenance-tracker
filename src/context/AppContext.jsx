import React, { createContext, useState, useEffect } from 'react';
import { initialTenements, initialNotices, mockUsers } from '../data/mockData';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Load initial states from localStorage if available
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('society_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem('society_users');
    return savedUsers ? JSON.parse(savedUsers) : mockUsers;
  });

  const [tenements, setTenements] = useState(() => {
    const savedTenements = localStorage.getItem('society_tenements');
    return savedTenements ? JSON.parse(savedTenements) : initialTenements;
  });

  const [notices, setNotices] = useState(() => {
    const savedNotices = localStorage.getItem('society_notices');
    return savedNotices ? JSON.parse(savedNotices) : initialNotices;
  });

  // Sync to localStorage
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

  // Authentication action
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

  // Register a new tenement/resident
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

    // Check if tenement number already registered
    const tenementExists = tenements.some(t => t.tenementNumber === formattedUnit);
    const userExists = users.some(u => u.username === formattedUnit);
    
    if (tenementExists || userExists) {
      return { success: false, message: `Tenement ${formattedUnit} is already registered. Please login.` };
    }

    const defaultOwnerName = `Resident Unit ${formattedUnit}`;

    // Prepare default 12-month dues
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    const defaultDues = [
      { month: "January", status: "Paid", amount: 1200, dateCleared: formattedDate, reference: "TXN" + Math.floor(10000 + Math.random() * 90000), method: "Bank Transfer" },
      { month: "February", status: "Paid", amount: 1200, dateCleared: formattedDate, reference: "TXN" + Math.floor(10000 + Math.random() * 90000), method: "Bank Transfer" },
      { month: "March", status: "Paid", amount: 1200, dateCleared: formattedDate, reference: "TXN" + Math.floor(10000 + Math.random() * 90000), method: "Bank Transfer" },
      { month: "April", status: "Paid", amount: 1200, dateCleared: formattedDate, reference: "TXN" + Math.floor(10000 + Math.random() * 90000), method: "Bank Transfer" },
      { month: "May", status: "Paid", amount: 1200, dateCleared: formattedDate, reference: "TXN" + Math.floor(10000 + Math.random() * 90000), method: "Bank Transfer" },
      { month: "June", status: "Paid", amount: 1200, dateCleared: formattedDate, reference: "TXN" + Math.floor(10000 + Math.random() * 90000), method: "Bank Transfer" },
      { month: "July", status: "Unpaid", amount: 1200 },
      { month: "August", status: "Unbilled", amount: 1200 },
      { month: "September", status: "Unbilled", amount: 1200 },
      { month: "October", status: "Unbilled", amount: 1200 },
      { month: "November", status: "Unbilled", amount: 1200 },
      { month: "December", status: "Unbilled", amount: 1200 }
    ];

    const newTenement = {
      tenementNumber: formattedUnit,
      ownerName: defaultOwnerName,
      contact: contact.trim(),
      dues: defaultDues
    };

    const newUser = {
      username: formattedUnit,
      role: "resident",
      password: password,
      name: defaultOwnerName
    };

    // Update states
    setTenements(prev => [...prev, newTenement]);
    setUsers(prev => [...prev, newUser]);
    
    // Auto login if admin is not already logged in
    if (!user || user.role !== 'admin') {
      setUser(newUser);
    }
    return { success: true };
  };

  // Update Profile for Resident
  const updateProfile = (ownerName, contact) => {
    if (!user || user.role === 'admin') return { success: false, message: 'Only residents can update profiles.' };

    const formattedName = ownerName.trim();
    const formattedContact = contact.trim();

    if (!formattedName || !formattedContact) {
      return { success: false, message: 'Name and contact are required.' };
    }

    setTenements(prevTenements => {
      return prevTenements.map(t => {
        if (t.tenementNumber === user.username) {
          return { ...t, ownerName: formattedName, contact: formattedContact };
        }
        return t;
      });
    });

    setUsers(prevUsers => {
      return prevUsers.map(u => {
        if (u.username === user.username) {
          return { ...u, name: formattedName };
        }
        return u;
      });
    });

    setUser(prevUser => {
      const updated = { ...prevUser, name: formattedName };
      localStorage.setItem('society_user', JSON.stringify(updated));
      return updated;
    });

    return { success: true };
  };

  // Toggle payment status (Unpaid <=> Paid)
  const togglePaymentStatus = (tenementNumber, monthName, customMethod = 'Cash') => {
    setTenements((prevTenements) => {
      return prevTenements.map((tenement) => {
        if (tenement.tenementNumber === tenementNumber) {
          const updatedDues = tenement.dues.map((due) => {
            if (due.month === monthName) {
              if (due.status === 'Paid') {
                // Toggle to Unpaid
                const { dateCleared, reference, method, ...unpaidDue } = due;
                return { ...unpaidDue, status: 'Unpaid' };
              } else {
                // Toggle to Paid
                const today = new Date();
                const formattedDate = today.toISOString().split('T')[0];
                const randomRef = 'TXN' + Math.floor(10000 + Math.random() * 90000);
                return {
                  ...due,
                  status: 'Paid',
                  dateCleared: formattedDate,
                  reference: randomRef,
                  method: customMethod
                };
              }
            }
            return due;
          });
          return { ...tenement, dues: updatedDues };
        }
        return tenement;
      });
    });
  };

  // Add a new notice
  const addNotice = (title, content, severity = 'info') => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    const newNotice = {
      id: 'N' + (notices.length + 1) + '-' + Math.floor(Math.random() * 1000),
      title,
      content,
      date: formattedDate,
      severity
    };
    setNotices((prevNotices) => [newNotice, ...prevNotices]);
  };

  // Delete a notice (useful utility)
  const deleteNotice = (id) => {
    setNotices((prevNotices) => prevNotices.filter((n) => n.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        users,
        tenements,
        notices,
        login,
        logout,
        registerTenement,
        updateProfile,
        togglePaymentStatus,
        addNotice,
        deleteNotice
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
