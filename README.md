# Sardegna Rent

Gestionale per prenotazioni di affitti brevi in Sardegna. Sviluppato con Next.js 14, Vercel Postgres e Resend.

## Funzionalità

- Aggiunta, visualizzazione ed eliminazione prenotazioni
- Invio automatico email di conferma all'ospite
- API REST per gestione prenotazioni e calendario
- Interfaccia web semplice e responsiva

## Tecnologie

- **Next.js 14** (App Router)
- **Vercel Postgres** – database prenotazioni
- **Resend** – invio email transazionali

## Prerequisiti

- Node.js 18+
- Account Vercel con database Postgres attivo
- Account Resend (opzionale, per le email)

## Installazione

```bash
# Clona il repository
git clone https://github.com/giannigrespan/sardegna_rent.git
cd sardegna_rent

# Installa le dipendenze
npm install

# Configura le variabili d'ambiente
cp .env.local.example .env.local
# Modifica .env.local con i tuoi valori

# Inizializza il database
node scripts/init-db.js

# Avvia il server in sviluppo
npm run dev
```

L'app sarà disponibile su [http://localhost:3000](http://localhost:3000).

## Variabili d'ambiente

Copia `.env.local.example` in `.env.local` e compila i seguenti valori:

| Variabile | Descrizione |
|---|---|
| `POSTGRES_URL` | URL connessione Vercel Postgres |
| `POSTGRES_USER` | Utente database |
| `POSTGRES_HOST` | Host database |
| `POSTGRES_PASSWORD` | Password database |
| `POSTGRES_DATABASE` | Nome database |
| `RESEND_API_KEY` | API key Resend (opzionale) |

## Struttura del progetto

```
sardegna_rent/
├── app/
│   ├── layout.js                  # Layout root
│   ├── page.js                    # Pagina principale
│   └── api/
│       ├── bookings/
│       │   ├── route.js           # GET lista, POST crea
│       │   └── [id]/route.js      # GET, PUT, DELETE per ID
│       └── calendar/route.js      # Prenotazioni per mese/anno
├── scripts/
│   └── init-db.js                 # Creazione tabella bookings
├── db.js                          # Connessione database
├── email.js                       # Invio email conferma
└── package.json
```

## API

### Prenotazioni

| Metodo | Endpoint | Descrizione |
|---|---|---|
| `GET` | `/api/bookings` | Lista tutte le prenotazioni |
| `POST` | `/api/bookings` | Crea una nuova prenotazione |
| `GET` | `/api/bookings/:id` | Dettaglio singola prenotazione |
| `PUT` | `/api/bookings/:id` | Aggiorna prenotazione |
| `DELETE` | `/api/bookings/:id` | Elimina prenotazione |
| `GET` | `/api/calendar?year=2025&month=7` | Prenotazioni per periodo |

### Esempio POST /api/bookings

```json
{
  "guestName": "Mario Rossi",
  "email": "mario@example.com",
  "checkIn": "2025-07-10",
  "checkOut": "2025-07-17",
  "guests": 3,
  "totalPrice": 850,
  "notes": "Arrivo in tarda serata"
}
```

## Deploy su Vercel

```bash
npm install -g vercel
vercel
```

Configura le variabili d'ambiente direttamente nella dashboard Vercel prima del deploy.
