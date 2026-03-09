import prisma from '../../../../db.js';

export async function GET(request, { params }) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(params.id) },
    });
    if (!booking) {
      return Response.json({ error: 'Prenotazione non trovata.' }, { status: 404 });
    }
    return Response.json({ booking });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { guestName, email, checkIn, checkOut, guests, totalPrice, notes } = await request.json();

    const booking = await prisma.booking.update({
      where: { id: parseInt(params.id) },
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

    return Response.json({ booking });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await prisma.booking.delete({
      where: { id: parseInt(params.id) },
    });
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
