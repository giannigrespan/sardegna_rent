import { sql } from '../../../db.js';
import { sendBookingConfirmation } from '../../../email.js';

export async function GET() {
  try {
    const { rows } = await sql`
      SELECT * FROM bookings ORDER BY check_in DESC
    `;
    return Response.json({ bookings: rows });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { guestName, email, checkIn, checkOut, guests, totalPrice, notes } = await request.json();

    if (!guestName || !email || !checkIn || !checkOut || !guests || !totalPrice) {
      return Response.json({ error: 'Tutti i campi obbligatori devono essere compilati.' }, { status: 400 });
    }

    const { rows } = await sql`
      INSERT INTO bookings (guest_name, email, check_in, check_out, guests, total_price, notes)
      VALUES (${guestName}, ${email}, ${checkIn}, ${checkOut}, ${guests}, ${totalPrice}, ${notes || ''})
      RETURNING *
    `;

    await sendBookingConfirmation({
      guestName,
      email,
      checkIn,
      checkOut,
      guests,
      totalPrice,
    });

    return Response.json({ booking: rows[0] }, { status: 201 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
