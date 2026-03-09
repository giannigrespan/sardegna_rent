import { Resend } from 'resend';

export async function sendBookingConfirmation(booking) {
  const { guestName, email, checkIn, checkOut, guests, totalPrice } = booking;
  if (!process.env.RESEND_API_KEY) return; // Skip if not configured
  const resend = new Resend(process.env.RESEND_API_KEY);

  const html = `
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0077BE 0%, #00C4CC 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">🏝️ Conferma Prenotazione</h1>
  </div>
  <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; color: #333;">Gentile <strong>${guestName}</strong>,</p>
    <p style="color: #666;">La tua prenotazione è stata confermata! Ecco i dettagli del tuo soggiorno:</p>
    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 10px 0;"><strong>📅 Check-in:</strong> ${checkIn}</p>
      <p style="margin: 10px 0;"><strong>📅 Check-out:</strong> ${checkOut}</p>
      <p style="margin: 10px 0;"><strong>👥 Numero ospiti:</strong> ${guests}</p>
      <p style="margin: 10px 0;"><strong>💰 Totale:</strong> €${totalPrice}</p>
    </div>
    <p style="color: #666;">Ti contatteremo presto per fornirti tutte le informazioni necessarie per il check-in.</p>
    <p style="color: #666; margin-top: 30px;">A presto in Sardegna!<br><strong>Il Team</strong></p>
  </div>
  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p>Gestionale Affitto Sardegna</p>
  </div>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: 'Sardegna Rent <onboarding@resend.dev>',
      to: email,
      subject: 'Conferma Prenotazione - Appartamento Sardegna',
      html,
    });
  } catch (err) {
    // Non-blocking: log error but don't fail the booking creation
    console.error('Email sending failed:', err);
  }
}
