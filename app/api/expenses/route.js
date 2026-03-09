import prisma from '../../../db.js';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year');

  try {
    const where = year
      ? { date: { gte: new Date(`${year}-01-01`), lte: new Date(`${year}-12-31`) } }
      : {};

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
    });
    return Response.json({ expenses });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { date, category, description, amount, notes } = await request.json();

    if (!date || !category || !description || !amount) {
      return Response.json({ error: 'Tutti i campi obbligatori devono essere compilati.' }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        date: new Date(date),
        category,
        description,
        amount: parseFloat(amount),
        notes: notes || '',
      },
    });

    return Response.json({ expense }, { status: 201 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
