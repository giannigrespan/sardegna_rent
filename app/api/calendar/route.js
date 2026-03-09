import { sql } from '../../../db.js';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year') || new Date().getFullYear();
  const month = searchParams.get('month'); // optional filter

  try {
    let rows;
    if (month) {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
      ({ rows } = await sql`
        SELECT id, guest_name, check_in, check_out, guests, total_price
        FROM bookings
        WHERE check_in <= ${endDate} AND check_out >= ${startDate}
        ORDER BY check_in
      `);
    } else {
      ({ rows } = await sql`
        SELECT id, guest_name, check_in, check_out, guests, total_price
        FROM bookings
        WHERE EXTRACT(YEAR FROM check_in::date) = ${year}
           OR EXTRACT(YEAR FROM check_out::date) = ${year}
        ORDER BY check_in
      `);
    }

    return Response.json({ bookings: rows });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
