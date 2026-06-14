# RometouringbyCart - versione Netlify + Supabase

Questa versione è stata adattata per uscire da Replit e funzionare con:

- Netlify per hosting e funzioni backend
- Supabase come database gratuito
- Stripe/Brevo lasciati come integrazioni future

## 1. Crea Supabase

1. Vai su Supabase e crea un nuovo progetto.
2. Apri `SQL Editor`.
3. Incolla tutto il contenuto di `supabase/schema.sql`.
4. Clicca `Run`.

Questo crea:

- tours
- bookings
- newsletter_subscribers
- availability_slots
- tour demo già caricati

## 2. Recupera le chiavi Supabase

In Supabase vai su:

`Project Settings > API`

Ti servono:

- Project URL
- service_role key

Attenzione: la `service_role key` è segreta. Va messa solo nelle variabili ambiente Netlify.

## 3. Carica su Netlify

Metodo semplice:

1. Carica questa cartella su GitHub.
2. Da Netlify scegli `Add new site > Import from Git`.
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Functions directory: `netlify/functions`

## 4. Variabili ambiente su Netlify

In Netlify vai su:

`Site configuration > Environment variables`

Aggiungi:

```env
SUPABASE_URL=il_project_url_di_supabase
SUPABASE_SERVICE_ROLE_KEY=la_service_role_key_di_supabase
```

Poi fai `Deploy`.

## 5. URL utili

Sito pubblico:

`https://tuosito.netlify.app/`

Admin:

`https://tuosito.netlify.app/admin`

PIN admin attuale:

`admin123`

## 6. Cose importanti

Questa è una versione MVP gratuita.

Funziona per:

- sito vetrina
- form prenotazioni
- admin dashboard
- inserimento manuale prenotazioni da Airbnb/GetYourGuide/WhatsApp
- calendario disponibilità
- newsletter base

Da migliorare prima del lancio vero:

- cambiare PIN admin hardcoded
- aggiungere email automatiche
- inserire foto vere
- collegare dominio
- eventuale Stripe payment link

## 7. Test locale opzionale

Se vuoi provarlo in locale:

```bash
npm install
cp .env.example .env
# compila .env con SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
npm run dev
```

Serve Netlify CLI perché le API sono Netlify Functions.
