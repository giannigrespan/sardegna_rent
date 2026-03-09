import prisma from '../../../db.js';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get('year') || new Date().getFullYear());

  const startOfYear = new Date(`${year}-01-01`);
  const endOfYear = new Date(`${year}-12-31`);

  try {
    const [bookings, expenses] = await Promise.all([
      prisma.booking.findMany({
        where: { checkIn: { gte: startOfYear, lte: endOfYear } },
        select: { checkIn: true, totalPrice: true, platform: true },
      }),
      prisma.expense.findMany({
        where: { date: { gte: startOfYear, lte: endOfYear } },
        select: { date: true, category: true, amount: true },
      }),
    ]);

    // Totali annuali
    const totalRevenue = bookings.reduce((s, b) => s + parseFloat(b.totalPrice), 0);
    const totalExpenses = expenses.reduce((s, e) => s + parseFloat(e.amount), 0);
    const netProfit = totalRevenue - totalExpenses;

    // Riepilogo mensile (12 mesi)
    const monthly = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      revenue: 0,
      expenses: 0,
    }));

    bookings.forEach(b => {
      const m = new Date(b.checkIn).getMonth();
      monthly[m].revenue += parseFloat(b.totalPrice);
    });

    expenses.forEach(e => {
      const m = new Date(e.date).getMonth();
      monthly[m].expenses += parseFloat(e.amount);
    });

    monthly.forEach(m => {
      m.profit = m.revenue - m.expenses;
      m.revenue = parseFloat(m.revenue.toFixed(2));
      m.expenses = parseFloat(m.expenses.toFixed(2));
      m.profit = parseFloat(m.profit.toFixed(2));
    });

    // Spese per categoria
    const byCategory = {};
    expenses.forEach(e => {
      byCategory[e.category] = (byCategory[e.category] || 0) + parseFloat(e.amount);
    });

    // Ricavi per piattaforma
    const byPlatform = {};
    bookings.forEach(b => {
      byPlatform[b.platform] = (byPlatform[b.platform] || 0) + parseFloat(b.totalPrice);
    });

    return Response.json({
      year,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalExpenses: parseFloat(totalExpenses.toFixed(2)),
      netProfit: parseFloat(netProfit.toFixed(2)),
      totalBookings: bookings.length,
      monthly,
      byCategory,
      byPlatform,
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
