import prisma from '../../../db.js';
import { sendBookingConfirmation } from '../../../email.js';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year');

  try {
    const where = year
      ? { checkIn: { gte: new Date(`${year}-01-01`), lte: new Date(`${year}-12-31`) } }
      : {};

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { checkIn: 'desc' },
    });
    return Response.json({ bookings });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { guestName, email, checkIn, checkOut, guests, totalPrice, platform, notes } = await request.json();

    if (!guestName || !email || !checkIn || !checkOut || !guests || !totalPrice) {
      return Response.json({ error: 'Tutti i campi obbligatori devono essere compilati.' }, { status: 400 });
    }

    const booking = await prisma.booking.create({
      data: {
        guestName,
        email,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        guests: parseInt(guests),
        totalPrice: parseFloat(totalPrice),
        platform: platform || 'Diretto',
        notes: notes || '',
      },
    });

    await sendBookingConfirmation({ guestName, email, checkIn, checkOut, guests, totalPrice });

    return Response.json({ booking }, { status: 201 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
