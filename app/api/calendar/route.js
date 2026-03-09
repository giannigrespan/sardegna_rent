import prisma from '../../../db.js';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get('year') || new Date().getFullYear());
  const month = searchParams.get('month') ? parseInt(searchParams.get('month')) : null;

  try {
    let where = {};

    if (month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0); // ultimo giorno del mese
      where = {
        checkIn: { lte: endDate },
        checkOut: { gte: startDate },
      };
    } else {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31);
      where = {
        OR: [
          { checkIn: { gte: startOfYear, lte: endOfYear } },
          { checkOut: { gte: startOfYear, lte: endOfYear } },
        ],
      };
    }

    const bookings = await prisma.booking.findMany({
      where,
      select: { id: true, guestName: true, checkIn: true, checkOut: true, guests: true, totalPrice: true },
      orderBy: { checkIn: 'asc' },
    });

    return Response.json({ bookings });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
