import prisma from '../../../db.js';
import { sendBookingConfirmation } from '../../../email.js';

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { checkIn: 'desc' },
    });
    return Response.json({ bookings });
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

    const booking = await prisma.booking.create({
      data: {
        guestName,
        email,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        guests: parseInt(guests),
        totalPrice: parseFloat(totalPrice),
        notes: notes || '',
      },
    });

    await sendBookingConfirmation({ guestName, email, checkIn, checkOut, guests, totalPrice });

    return Response.json({ booking }, { status: 201 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
