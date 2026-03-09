export const metadata = {
  title: 'Sardegna Rent - Gestionale Prenotazioni',
  description: 'Gestionale per affitti brevi in Sardegna',
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body style={{ margin: 0, fontFamily: 'Arial, sans-serif', background: '#f0f4f8' }}>
        {children}
      </body>
    </html>
  );
}
