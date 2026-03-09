import prisma from '../../../../db.js';

export async function PUT(request, { params }) {
  try {
    const { date, category, description, amount, notes } = await request.json();

    const expense = await prisma.expense.update({
      where: { id: parseInt(params.id) },
      data: {
        date: new Date(date),
        category,
        description,
        amount: parseFloat(amount),
        notes: notes || '',
      },
    });

    return Response.json({ expense });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await prisma.expense.delete({ where: { id: parseInt(params.id) } });
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
