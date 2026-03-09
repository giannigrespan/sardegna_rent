import { sql } from '../../../../db.js';

export async function GET(request, { params }) {
  try {
    const { rows } = await sql`
      SELECT * FROM bookings WHERE id = ${params.id}
    `;
    if (rows.length === 0) {
      return Response.json({ error: 'Prenotazione non trovata.' }, { status: 404 });
    }
    return Response.json({ booking: rows[0] });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { guestName, email, checkIn, checkOut, guests, totalPrice, notes } = await request.json();

    const { rows } = await sql`
      UPDATE bookings
      SET guest_name = ${guestName},
          email = ${email},
          check_in = ${checkIn},
          check_out = ${checkOut},
          guests = ${guests},
          total_price = ${totalPrice},
          notes = ${notes || ''}
      WHERE id = ${params.id}
      RETURNING *
    `;

    if (rows.length === 0) {
      return Response.json({ error: 'Prenotazione non trovata.' }, { status: 404 });
    }
    return Response.json({ booking: rows[0] });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await sql`DELETE FROM bookings WHERE id = ${params.id}`;
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
