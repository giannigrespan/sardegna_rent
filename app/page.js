'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({
    guestName: '',
    email: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    totalPrice: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch {
      // ignore
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Prenotazione aggiunta con successo!');
        setForm({ guestName: '', email: '', checkIn: '', checkOut: '', guests: 1, totalPrice: '', notes: '' });
        fetchBookings();
      } else {
        setMessage(data.error || 'Errore durante il salvataggio.');
      }
    } catch {
      setMessage('Errore di rete.');
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm('Eliminare questa prenotazione?')) return;
    await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
    fetchBookings();
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px' }}>
      <header style={{
        background: 'linear-gradient(135deg, #0077BE 0%, #00C4CC 100%)',
        color: 'white',
        padding: '30px',
        borderRadius: 12,
        marginBottom: 30,
        textAlign: 'center',
      }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Sardegna Rent</h1>
        <p style={{ margin: '8px 0 0', opacity: 0.9 }}>Gestionale Prenotazioni Appartamento</p>
      </header>

      {/* Form nuova prenotazione */}
      <section style={{ background: 'white', padding: 24, borderRadius: 12, marginBottom: 30, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <h2 style={{ marginTop: 0, color: '#0077BE' }}>Nuova Prenotazione</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Nome ospite</label>
              <input style={inputStyle} required value={form.guestName}
                onChange={e => setForm({ ...form, guestName: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} type="email" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Check-in</label>
              <input style={inputStyle} type="date" required value={form.checkIn}
                onChange={e => setForm({ ...form, checkIn: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Check-out</label>
              <input style={inputStyle} type="date" required value={form.checkOut}
                onChange={e => setForm({ ...form, checkOut: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Numero ospiti</label>
              <input style={inputStyle} type="number" min="1" max="10" required value={form.guests}
                onChange={e => setForm({ ...form, guests: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Prezzo totale (€)</label>
              <input style={inputStyle} type="number" min="0" required value={form.totalPrice}
                onChange={e => setForm({ ...form, totalPrice: e.target.value })} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Note</label>
              <textarea style={{ ...inputStyle, height: 80, resize: 'vertical' }} value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? 'Salvataggio...' : 'Aggiungi Prenotazione'}
          </button>
          {message && <p style={{ marginTop: 12, color: message.includes('successo') ? '#16a34a' : '#dc2626' }}>{message}</p>}
        </form>
      </section>

      {/* Lista prenotazioni */}
      <section style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <h2 style={{ marginTop: 0, color: '#0077BE' }}>Prenotazioni ({bookings.length})</h2>
        {bookings.length === 0 ? (
          <p style={{ color: '#888' }}>Nessuna prenotazione trovata.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  {['Ospite', 'Email', 'Check-in', 'Check-out', 'Ospiti', 'Totale', 'Azioni'].map(h => (
                    <th key={h} style={{ padding: '10px 8px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 13 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={cellStyle}>{b.guest_name}</td>
                    <td style={cellStyle}>{b.email}</td>
                    <td style={cellStyle}>{b.check_in}</td>
                    <td style={cellStyle}>{b.check_out}</td>
                    <td style={cellStyle}>{b.guests}</td>
                    <td style={cellStyle}>€{b.total_price}</td>
                    <td style={cellStyle}>
                      <button onClick={() => handleDelete(b.id)}
                        style={{ background: '#dc2626', color: 'white', border: 'none', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                        Elimina
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

const labelStyle = { display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#374151' };
const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' };
const btnStyle = { marginTop: 16, background: 'linear-gradient(135deg, #0077BE 0%, #00C4CC 100%)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontSize: 15, fontWeight: 600 };
const cellStyle = { padding: '10px 8px', fontSize: 14, color: '#374151' };
