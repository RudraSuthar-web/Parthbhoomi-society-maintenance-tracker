import { initialTenements, initialNotices } from '../data/mockData';
import { DUES_AMOUNT } from '../utils/dateUtils';

const readStoredValue = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;

  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return fallback;
    return JSON.parse(stored);
  } catch (error) {
    console.warn(`Failed to read localStorage key ${key}:`, error);
    return fallback;
  }
};

const writeStoredValue = (key, value) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to write localStorage key ${key}:`, error);
  }
};

export const getMaintenanceAmount = async () => {
  const saved = readStoredValue('society_maintenance_amount', String(DUES_AMOUNT));
  const amount = Number(saved);
  return Number.isFinite(amount) && amount > 0 ? amount : DUES_AMOUNT;
};

export const saveMaintenanceAmount = async (amount) => {
  const value = Number(amount);
  if (value > 0) {
    writeStoredValue('society_maintenance_amount', value);
    return value;
  }
  return DUES_AMOUNT;
};

export const getTenements = async () => {
  return readStoredValue('society_tenements', initialTenements);
};

export const getNotices = async () => {
  return readStoredValue('society_notices', initialNotices);
};

export const createNotice = async (title, content) => {
  const notices = await getNotices();
  const newNotice = {
    id: Date.now(),
    title,
    content,
    createdAt: new Date().toISOString(),
  };

  const nextNotices = [newNotice, ...notices];
  writeStoredValue('society_notices', nextNotices);
  return newNotice;
};

export const deleteNoticeById = async (id) => {
  const notices = await getNotices();
  const nextNotices = notices.filter((notice) => notice.id !== id);
  writeStoredValue('society_notices', nextNotices);
  return true;
};

export const registerTenementBackend = async () => {
  return true;
};

export const recordInstallmentBackend = async () => {
  return true;
};

export const revertPaymentBackend = async () => {
  return true;
};

export const updateProfileBackend = async () => {
  return true;
};
