'use client';

import { useState, useEffect, useCallback } from 'react';

const MONTHS = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];
const PLATFORMS = ['Diretto', 'Airbnb', 'Booking.com', 'VRBO', 'Altro'];
const EXPENSE_CATEGORIES = ['Pulizie', 'Manutenzione', 'Utenze', 'Tasse/Imposte', 'Commissioni', 'Assicurazione', 'Arredamento', 'Altro'];

export default function Home() {
  const [tab, setTab] = useState('dashboard');
  const [year, setYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const fetchAll = useCallback(async () => {
    const [sRes, bRes, eRes] = await Promise.all([
      fetch(`/api/stats?year=${year}`),
      fetch(`/api/bookings?year=${year}`),
      fetch(`/api/expenses?year=${year}`),
    ]);
    const [s, b, e] = await Promise.all([sRes.json(), bRes.json(), eRes.json()]);
    setStats(s);
    setBookings(b.bookings || []);
    setExpenses(e.expenses || []);
  }, [year]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #0077BE 0%, #00C4CC 100%)', color: 'white', padding: '20px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24 }}>Sardegna Rent</h1>
            <p style={{ margin: '4px 0 0', opacity: 0.85, fontSize: 13 }}>Gestionale Affitti</p>
          </div>
          <select value={year} onChange={e => setYear(parseInt(e.target.value))}
            style={{ padding: '6px 12px', borderRadius: 8, border: 'none', fontSize: 15, fontWeight: 700, color: '#0077BE', cursor: 'pointer' }}>
            {[2023, 2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </header>

      {/* Tab bar */}
      <nav style={{ background: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex' }}>
          {[
            { key: 'dashboard', label: 'Dashboard' },
            { key: 'bookings', label: 'Prenotazioni' },
            { key: 'expenses', label: 'Spese' },
            { key: 'report', label: 'Riepilogo' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '14px 20px', border: 'none', background: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: 14, color: tab === t.key ? '#0077BE' : '#64748b',
              borderBottom: tab === t.key ? '2px solid #0077BE' : '2px solid transparent',
            }}>{t.label}</button>
          ))}
        </div>
      </nav>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
        {tab === 'dashboard' && <Dashboard stats={stats} year={year} />}
        {tab === 'bookings' && <Bookings bookings={bookings} onRefresh={fetchAll} />}
        {tab === 'expenses' && <Expenses expenses={expenses} onRefresh={fetchAll} />}
        {tab === 'report' && <Report stats={stats} year={year} />}
      </main>
    </div>
  );
}

/* ─── DASHBOARD ─── */
function Dashboard({ stats, year }) {
  if (!stats) return <p style={{ color: '#888' }}>Caricamento...</p>;

  const kpis = [
    { label: 'Ricavi', value: `€${stats.totalRevenue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`, color: '#16a34a', bg: '#f0fdf4' },
    { label: 'Spese', value: `€${stats.totalExpenses.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`, color: '#dc2626', bg: '#fef2f2' },
    { label: 'Utile netto', value: `€${stats.netProfit.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`, color: stats.netProfit >= 0 ? '#0077BE' : '#dc2626', bg: '#eff6ff' },
    { label: 'Prenotazioni', value: stats.totalBookings, color: '#7c3aed', bg: '#f5f3ff' },
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background: k.bg, border: `1px solid ${k.color}22`, borderRadius: 12, padding: '20px 24px' }}>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b', fontWeight: 600 }}>{k.label} {year}</p>
            <p style={{ margin: '8px 0 0', fontSize: 26, fontWeight: 800, color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Spese per categoria</h3>
          {Object.keys(stats.byCategory).length === 0
            ? <p style={{ color: '#888', fontSize: 14 }}>Nessuna spesa registrata.</p>
            : Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => (
              <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 14 }}>{cat}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#dc2626' }}>€{parseFloat(amount).toFixed(2)}</span>
              </div>
            ))
          }
        </div>

        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Ricavi per piattaforma</h3>
          {Object.keys(stats.byPlatform).length === 0
            ? <p style={{ color: '#888', fontSize: 14 }}>Nessuna prenotazione registrata.</p>
            : Object.entries(stats.byPlatform).sort((a, b) => b[1] - a[1]).map(([plat, amount]) => (
              <div key={plat} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 14 }}>{plat}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#16a34a' }}>€{parseFloat(amount).toFixed(2)}</span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

/* ─── PRENOTAZIONI ─── */
function Bookings({ bookings, onRefresh }) {
  const emptyForm = { guestName: '', email: '', checkIn: '', checkOut: '', guests: 1, totalPrice: '', platform: 'Diretto', notes: '' };
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) { setMessage('Prenotazione aggiunta!'); setForm(emptyForm); onRefresh(); }
    else setMessage(data.error || 'Errore.');
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm('Eliminare questa prenotazione?')) return;
    await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
    onRefresh();
  }

  const nights = b => {
    const d = (new Date(b.checkOut) - new Date(b.checkIn)) / 86400000;
    return isNaN(d) ? '-' : d;
  };

  return (
    <div>
      <div style={cardStyle}>
        <h2 style={cardTitleStyle}>Nuova Prenotazione</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Nome ospite"><input style={inputStyle} required value={form.guestName} onChange={e => setForm({ ...form, guestName: e.target.value })} /></Field>
            <Field label="Email"><input style={inputStyle} type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="Check-in"><input style={inputStyle} type="date" required value={form.checkIn} onChange={e => setForm({ ...form, checkIn: e.target.value })} /></Field>
            <Field label="Check-out"><input style={inputStyle} type="date" required value={form.checkOut} onChange={e => setForm({ ...form, checkOut: e.target.value })} /></Field>
            <Field label="Ospiti"><input style={inputStyle} type="number" min="1" max="20" value={form.guests} onChange={e => setForm({ ...form, guests: e.target.value })} /></Field>
            <Field label="Totale (€)"><input style={inputStyle} type="number" min="0" step="0.01" required value={form.totalPrice} onChange={e => setForm({ ...form, totalPrice: e.target.value })} /></Field>
            <Field label="Piattaforma">
              <select style={inputStyle} value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}>
                {PLATFORMS.map(p => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Note"><input style={inputStyle} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></Field>
          </div>
          <button type="submit" disabled={loading} style={btnPrimary}>{loading ? 'Salvataggio...' : 'Aggiungi Prenotazione'}</button>
          {message && <p style={{ marginTop: 10, fontSize: 14, color: message.includes('!') ? '#16a34a' : '#dc2626' }}>{message}</p>}
        </form>
      </div>

      <div style={cardStyle}>
        <h2 style={cardTitleStyle}>Prenotazioni ({bookings.length})</h2>
        {bookings.length === 0 ? <p style={{ color: '#888' }}>Nessuna prenotazione per questo anno.</p> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  {['Ospite', 'Check-in', 'Check-out', 'Notti', 'Ospiti', 'Piattaforma', 'Totale', ''].map(h => <th key={h} style={thStyle}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={tdStyle}><div style={{ fontWeight: 600 }}>{b.guestName}</div><div style={{ fontSize: 12, color: '#888' }}>{b.email}</div></td>
                    <td style={tdStyle}>{fmtDate(b.checkIn)}</td>
                    <td style={tdStyle}>{fmtDate(b.checkOut)}</td>
                    <td style={tdStyle}>{nights(b)}</td>
                    <td style={tdStyle}>{b.guests}</td>
                    <td style={tdStyle}><span style={platformBadge(b.platform)}>{b.platform}</span></td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#16a34a' }}>€{parseFloat(b.totalPrice).toFixed(2)}</td>
                    <td style={tdStyle}><button onClick={() => handleDelete(b.id)} style={deleteBtnStyle}>Elimina</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── SPESE ─── */
function Expenses({ expenses, onRefresh }) {
  const emptyForm = { date: '', category: 'Pulizie', description: '', amount: '', notes: '' };
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) { setMessage('Spesa aggiunta!'); setForm(emptyForm); onRefresh(); }
    else setMessage(data.error || 'Errore.');
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm('Eliminare questa spesa?')) return;
    await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    onRefresh();
  }

  const total = expenses.reduce((s, e) => s + parseFloat(e.amount), 0);

  return (
    <div>
      <div style={cardStyle}>
        <h2 style={cardTitleStyle}>Nuova Spesa</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Data"><input style={inputStyle} type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></Field>
            <Field label="Categoria">
              <select style={inputStyle} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Descrizione"><input style={inputStyle} required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></Field>
            <Field label="Importo (€)"><input style={inputStyle} type="number" min="0" step="0.01" required value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></Field>
            <Field label="Note"><input style={inputStyle} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></Field>
          </div>
          <button type="submit" disabled={loading} style={btnDanger}>{loading ? 'Salvataggio...' : 'Aggiungi Spesa'}</button>
          {message && <p style={{ marginTop: 10, fontSize: 14, color: message.includes('!') ? '#16a34a' : '#dc2626' }}>{message}</p>}
        </form>
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ ...cardTitleStyle, marginBottom: 0 }}>Spese ({expenses.length})</h2>
          <span style={{ fontWeight: 800, fontSize: 18, color: '#dc2626' }}>Totale: €{total.toFixed(2)}</span>
        </div>
        {expenses.length === 0 ? <p style={{ color: '#888' }}>Nessuna spesa per questo anno.</p> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  {['Data', 'Categoria', 'Descrizione', 'Note', 'Importo', ''].map(h => <th key={h} style={thStyle}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {expenses.map(e => (
                  <tr key={e.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={tdStyle}>{fmtDate(e.date)}</td>
                    <td style={tdStyle}><span style={catBadge(e.category)}>{e.category}</span></td>
                    <td style={tdStyle}>{e.description}</td>
                    <td style={{ ...tdStyle, color: '#888', fontSize: 13 }}>{e.notes}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#dc2626' }}>€{parseFloat(e.amount).toFixed(2)}</td>
                    <td style={tdStyle}><button onClick={() => handleDelete(e.id)} style={deleteBtnStyle}>Elimina</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── RIEPILOGO ─── */
function Report({ stats, year }) {
  if (!stats) return <p style={{ color: '#888' }}>Caricamento...</p>;
  const maxVal = Math.max(...stats.monthly.map(m => Math.max(m.revenue, m.expenses)), 1);

  return (
    <div style={cardStyle}>
      <h2 style={cardTitleStyle}>Riepilogo mensile {year}</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
              {['Mese', 'Ricavi', 'Spese', 'Utile netto', 'Barre'].map(h => <th key={h} style={thStyle}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {stats.monthly.map((m, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: m.profit < 0 ? '#fff5f5' : 'white' }}>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{MONTHS[i]}</td>
                <td style={{ ...tdStyle, color: '#16a34a', fontWeight: 600 }}>€{m.revenue.toFixed(2)}</td>
                <td style={{ ...tdStyle, color: '#dc2626', fontWeight: 600 }}>€{m.expenses.toFixed(2)}</td>
                <td style={{ ...tdStyle, fontWeight: 800, color: m.profit >= 0 ? '#0077BE' : '#dc2626' }}>€{m.profit.toFixed(2)}</td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 120 }}>
                    <div style={{ background: '#dcfce7', borderRadius: 4, overflow: 'hidden', height: 10 }}>
                      <div style={{ background: '#16a34a', height: '100%', width: `${(m.revenue / maxVal) * 100}%` }} />
                    </div>
                    <div style={{ background: '#fee2e2', borderRadius: 4, overflow: 'hidden', height: 10 }}>
                      <div style={{ background: '#dc2626', height: '100%', width: `${(m.expenses / maxVal) * 100}%` }} />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '2px solid #e2e8f0', background: '#f8fafc' }}>
              <td style={{ ...tdStyle, fontWeight: 800 }}>TOTALE</td>
              <td style={{ ...tdStyle, color: '#16a34a', fontWeight: 800 }}>€{stats.totalRevenue.toFixed(2)}</td>
              <td style={{ ...tdStyle, color: '#dc2626', fontWeight: 800 }}>€{stats.totalExpenses.toFixed(2)}</td>
              <td style={{ ...tdStyle, fontWeight: 800, color: stats.netProfit >= 0 ? '#0077BE' : '#dc2626' }}>€{stats.netProfit.toFixed(2)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

/* ─── Helpers ─── */
function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#374151' }}>{label}</label>
      {children}
    </div>
  );
}

function fmtDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('it-IT');
}

function platformBadge(p) {
  const colors = { Airbnb: '#ff5a5f', 'Booking.com': '#003580', VRBO: '#1d5c87', Diretto: '#16a34a', Altro: '#888' };
  const c = colors[p] || '#888';
  return { background: c + '22', color: c, padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 700 };
}

function catBadge(c) {
  const colors = { Pulizie: '#0077BE', Manutenzione: '#f97316', Utenze: '#7c3aed', 'Tasse/Imposte': '#dc2626', Commissioni: '#d97706', Assicurazione: '#0891b2', Arredamento: '#16a34a', Altro: '#888' };
  const col = colors[c] || '#888';
  return { background: col + '22', color: col, padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 700 };
}

const cardStyle = { background: 'white', padding: 24, borderRadius: 12, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' };
const cardTitleStyle = { marginTop: 0, marginBottom: 18, color: '#0077BE', fontSize: 18, fontWeight: 700 };
const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' };
const btnPrimary = { marginTop: 16, background: 'linear-gradient(135deg, #0077BE 0%, #00C4CC 100%)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontSize: 15, fontWeight: 700 };
const btnDanger = { marginTop: 16, background: 'linear-gradient(135deg, #dc2626 0%, #f97316 100%)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontSize: 15, fontWeight: 700 };
const thStyle = { padding: '10px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 13 };
const tdStyle = { padding: '10px', fontSize: 14, color: '#374151', verticalAlign: 'middle' };
const deleteBtnStyle = { background: '#fee2e2', color: '#dc2626', border: 'none', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 };
