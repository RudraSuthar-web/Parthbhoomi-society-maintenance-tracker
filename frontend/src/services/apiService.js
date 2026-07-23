import { supabase, isSupabaseConfigured } from './supabaseClient';
import { DUES_AMOUNT } from '../utils/dateUtils';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ── Helper for FastAPI fetch ──────────────────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'API request failed');
    }
    return await res.json();
  } catch (e) {
    console.warn(`FastAPI fetch error (${endpoint}):`, e.message);
    return null;
  }
}

// ── Service Layer ─────────────────────────────────────────────────────────────

/**
 * Fetch global society settings (e.g. maintenance amount)
 */
export async function getMaintenanceAmount() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('society_settings')
        .select('value')
        .eq('key', 'maintenance_amount')
        .single();
      if (!error && data?.value) {
        return Number(data.value);
      }
    } catch (e) {
      console.warn('Supabase fetch error for maintenance amount:', e);
    }
  }

  const data = await apiFetch('/settings/maintenance_amount');
  if (data?.value) {
    return Number(data.value);
  }
  return DUES_AMOUNT;
}

/**
 * Update global maintenance amount
 */
export async function saveMaintenanceAmount(amount) {
  const val = Number(amount);
  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('society_settings')
        .upsert({ key: 'maintenance_amount', value: JSON.stringify(val) });
    } catch (e) {
      console.error('Supabase update error:', e);
    }
    return;
  }

  await apiFetch('/settings/maintenance_amount', {
    method: 'POST',
    body: JSON.stringify({ value: String(val) }),
  });
}

/**
 * Fetch all tenements with dues and installments
 */
export async function getTenements() {
  if (isSupabaseConfigured) {
    try {
      const { data: tenementsData, error: tErr } = await supabase
        .from('tenements')
        .select('*');

      // Fetch all dues in paginated batches (Supabase caps single request at 1000 rows)
      let duesData = [];
      let from = 0;
      const batchSize = 1000;
      let hasMore = true;
      while (hasMore) {
        const { data: page, error: dErr } = await supabase
          .from('dues')
          .select('*')
          .range(from, from + batchSize - 1);
        if (dErr || !page || page.length === 0) {
          hasMore = false;
        } else {
          duesData = duesData.concat(page);
          if (page.length < batchSize) hasMore = false;
          else from += batchSize;
        }
      }

      // Fetch all installments in paginated batches
      let instData = [];
      from = 0;
      hasMore = true;
      while (hasMore) {
        const { data: page, error: iErr } = await supabase
          .from('installments')
          .select('*')
          .range(from, from + batchSize - 1);
        if (iErr || !page || page.length === 0) {
          hasMore = false;
        } else {
          instData = instData.concat(page);
          if (page.length < batchSize) hasMore = false;
          else from += batchSize;
        }
      }

      if (!tErr && tenementsData && duesData) {
        return tenementsData.map(t => {
          const dues = duesData
            .filter(d => d.tenement_number === t.tenement_number)
            .map(d => {
              const installments = (instData || [])
                .filter(i => i.due_id === d.id || (i.tenement_number === d.tenement_number && i.month === d.month && i.year === d.year))
                .map(i => ({
                  amount: Number(i.amount),
                  date: i.date,
                  reference: i.reference,
                  method: i.method,
                }));
              return {
                id: d.id,
                month: d.month,
                year: d.year,
                status: d.status,
                amount: Number(d.amount),
                amountPaid: Number(d.amount_paid || 0),
                dateCleared: d.date_cleared,
                reference: d.reference,
                method: d.method,
                installments,
              };
            });
          return {
            tenementNumber: t.tenement_number,
            ownerName: t.owner_name,
            contact: t.contact,
            dues,
          };
        });
      }
    } catch (e) {
      console.warn('Supabase fetch tenements error:', e);
    }
  }

  // Fetch from FastAPI backend
  const data = await apiFetch('/tenements');
  if (Array.isArray(data)) {
    return data.map(t => ({
      tenementNumber: t.tenement_number,
      ownerName: t.owner_name,
      contact: t.contact,
      dues: (t.dues || []).map(d => ({
        id: d.id,
        month: d.month,
        year: d.year,
        status: d.status,
        amount: Number(d.amount),
        amountPaid: Number(d.amount_paid || 0),
        dateCleared: d.date_cleared,
        reference: d.reference,
        method: d.method,
        installments: (d.installments || []).map(i => ({
          amount: Number(i.amount),
          date: i.date,
          reference: i.reference,
          method: i.method,
        })),
      })),
    }));
  }

  return [];
}

/**
 * Fetch all notices
 */
export async function getNotices() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data.map(n => ({
          id: n.id,
          title: n.title,
          content: n.content,
          date: n.date,
        }));
      }
    } catch (e) {
      console.warn('Supabase fetch notices error:', e);
    }
  }

  const data = await apiFetch('/notices');
  if (Array.isArray(data)) {
    return data.map(n => ({
      id: n.id,
      title: n.title,
      content: n.content,
      date: n.date,
    }));
  }

  return [];
}

/**
 * Add a new notice
 */
export async function createNotice(title, content) {
  const today = new Date().toISOString().split('T')[0];
  const newNotice = {
    id: 'N' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    title,
    content,
    date: today,
  };

  if (isSupabaseConfigured) {
    try {
      await supabase.from('notices').insert([
        {
          id: newNotice.id,
          title: newNotice.title,
          content: newNotice.content,
          date: newNotice.date,
        },
      ]);
    } catch (e) {
      console.error('Supabase create notice error:', e);
    }
    return newNotice;
  }

  const data = await apiFetch('/notices', {
    method: 'POST',
    body: JSON.stringify({ title, content }),
  });

  return data ? { id: data.id, title: data.title, content: data.content, date: data.date } : newNotice;
}

/**
 * Delete a notice
 */
export async function deleteNoticeById(id) {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('notices').delete().eq('id', id);
    } catch (e) {
      console.error('Supabase delete notice error:', e);
    }
    return;
  }

  await apiFetch(`/notices/${id}`, { method: 'DELETE' });
}

/**
 * Register a new tenement & user
 */
export async function registerTenementBackend(tenementNumber, ownerName, contact, password, maintenanceAmount) {
  const formattedOwnerName = ownerName && ownerName.trim() ? ownerName.trim() : `Resident Unit ${tenementNumber}`;
  if (isSupabaseConfigured) {
    try {
      await supabase.from('tenements').insert([
        { tenement_number: tenementNumber, owner_name: formattedOwnerName, contact },
      ]);
      await supabase.from('users').insert([{
        username: tenementNumber,
        role: 'resident',
        password,
        name: formattedOwnerName,
      }]);

      // Generate default dues for 2025, 2026, 2027
      const ALL_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const DEFAULT_YEARS = [2025, 2026, 2027];
      const now = new Date();
      const cy = now.getFullYear();
      const cm_idx = now.getMonth();

      const defaultDues = [];
      for (const year of DEFAULT_YEARS) {
        for (let m_idx = 0; m_idx < ALL_MONTHS.length; m_idx++) {
          const month = ALL_MONTHS[m_idx];
          const status = (year < cy || (year === cy && m_idx <= cm_idx)) ? 'Unpaid' : 'Unbilled';
          defaultDues.push({
            tenement_number: tenementNumber,
            month,
            year,
            status,
            amount: maintenanceAmount || 1200,
            amount_paid: 0,
          });
        }
      }

      await supabase.from('dues').insert(defaultDues);
    } catch (e) {
      console.error('Supabase register error:', e);
    }
    return;
  }

  await apiFetch('/tenements', {
    method: 'POST',
    body: JSON.stringify({
      tenement_number: tenementNumber,
      owner_name: formattedOwnerName,
      contact,
      password,
    }),
  });
}

/**
 * Add payment installment to due
 */
export async function recordInstallmentBackend(tenementNumber, month, year, installmentData, currentDueStatus, totalPaid, maintenanceAmount) {
  const isFullyPaid = totalPaid >= maintenanceAmount;
  const newStatus = isFullyPaid ? 'Paid' : totalPaid > 0 ? 'Partial' : 'Unpaid';

  if (isSupabaseConfigured) {
    try {
      const { data: dueData, error: dueError } = await supabase
        .from('dues')
        .update({
          status: newStatus,
          amount: maintenanceAmount,
          amount_paid: totalPaid,
          ...(isFullyPaid ? {
            date_cleared: installmentData.date,
            reference: installmentData.reference,
            method: installmentData.method,
          } : {}),
        })
        .eq('tenement_number', tenementNumber)
        .eq('year', year)
        .eq('month', month)
        .select()
        .single();

      if (dueError) throw dueError;

      if (dueData?.id) {
        await supabase.from('installments').insert([
          {
            due_id: dueData.id,
            tenement_number: tenementNumber,
            year,
            month,
            amount: installmentData.amount,
            date: installmentData.date,
            reference: installmentData.reference,
            method: installmentData.method,
          },
        ]);
      }
    } catch (e) {
      console.error('Supabase record installment error:', e);
    }
    return;
  }

  await apiFetch(`/tenements/${tenementNumber}/dues/${month}/${year}/installments`, {
    method: 'POST',
    body: JSON.stringify({
      amount: installmentData.amount,
      date: installmentData.date,
      reference: installmentData.reference,
      method: installmentData.method,
    }),
  });
}

/**
 * Revert payment (clear installments)
 */
export async function revertPaymentBackend(tenementNumber, month, year, maintenanceAmount) {
  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('installments')
        .delete()
        .eq('tenement_number', tenementNumber)
        .eq('year', year)
        .eq('month', month);

      const { error: revertError } = await supabase
        .from('dues')
        .update({
          status: 'Unpaid',
          amount: maintenanceAmount,
          amount_paid: 0,
          date_cleared: null,
          reference: null,
          method: null,
        })
        .eq('tenement_number', tenementNumber)
        .eq('year', year)
        .eq('month', month);

      if (revertError) throw revertError;
    } catch (e) {
      console.error('Supabase revert payment error:', e);
    }
    return;
  }

  await apiFetch(`/tenements/${tenementNumber}/dues/${month}/${year}/revert`, {
    method: 'DELETE',
  });
}

/**
 * Update resident profile
 */
export async function updateProfileBackend(username, ownerName, contact) {
  if (isSupabaseConfigured) {
    try {
      await supabase
        .from('tenements')
        .update({ owner_name: ownerName, contact })
        .eq('tenement_number', username);

      await supabase
        .from('users')
        .update({ name: ownerName })
        .eq('username', username);
    } catch (e) {
      console.error('Supabase update profile error:', e);
    }
    return;
  }

  await apiFetch(`/tenements/${username}`, {
    method: 'PUT',
    body: JSON.stringify({ owner_name: ownerName, contact }),
  });
}

/**
 * Delete a tenement unit
 */
export async function deleteTenementBackend(tenementNumber) {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('installments').delete().eq('tenement_number', tenementNumber);
      await supabase.from('dues').delete().eq('tenement_number', tenementNumber);
      await supabase.from('tenements').delete().eq('tenement_number', tenementNumber);
      await supabase.from('users').delete().eq('username', tenementNumber);
    } catch (e) {
      console.error('Supabase delete tenement error:', e);
    }
    return;
  }

  await apiFetch(`/tenements/${tenementNumber}`, {
    method: 'DELETE',
  });
}

/**
 * Login credentials check against Supabase or FastAPI backend
 */
export async function loginBackend(username, password) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();
      if (!error && data) {
        if (data.password === password) {
          return {
            username: data.username,
            role: data.role,
            name: data.name,
          };
        }
      }
    } catch (e) {
      console.warn('Supabase login error:', e);
    }
    return null;
  }

  return await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}
