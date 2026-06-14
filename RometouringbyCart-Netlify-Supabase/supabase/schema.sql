-- RometouringbyCart - Supabase schema
-- Incolla questo file in Supabase SQL Editor e clicca RUN.

create table if not exists tours (
  id serial primary key,
  name text not null,
  slug text not null unique,
  description text not null,
  duration text not null,
  starting_price numeric(10,2) not null,
  category text not null,
  highlights text[] not null default '{}',
  max_guests integer not null default 6,
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists bookings (
  id serial primary key,
  full_name text not null,
  email text not null,
  phone text not null,
  whatsapp text,
  tour_slug text not null,
  tour_name text,
  tour_date text not null,
  tour_time text not null,
  guests integer not null,
  pickup_location text,
  notes text,
  admin_notes text,
  status text not null default 'request',
  booking_source text not null default 'direct_website',
  payment_status text not null default 'not_required',
  stripe_session_id text,
  total_amount numeric(10,2),
  created_at timestamptz not null default now()
);

create table if not exists newsletter_subscribers (
  id serial primary key,
  name text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists availability_slots (
  id serial primary key,
  tour_slug text not null,
  slot_date text not null,
  slot_time text not null,
  max_capacity integer not null default 6,
  booked_count integer not null default 0,
  is_blocked boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_bookings_date_time on bookings(tour_date, tour_time);
create index if not exists idx_bookings_source on bookings(booking_source);
create index if not exists idx_bookings_status on bookings(status);
create index if not exists idx_availability_date_time on availability_slots(slot_date, slot_time);

insert into tours (name, slug, description, duration, starting_price, category, highlights, max_guests, image_url)
values
('Classic Rome Tour', 'classic-rome-tour', 'Experience the heart of ancient Rome on this iconic journey through celebrated landmarks and timeless streets.', '3 hours', 149, 'Classic', array['Colosseum','Roman Forum','Palatine Hill','Piazza Venezia','Trevi Fountain','Spanish Steps'], 6, null),
('Hidden Gems Tour', 'hidden-gems-tour', 'Escape the tourist trails and discover the Rome that locals love, from charming neighbourhoods to lesser-known piazzas.', '2.5 hours', 169, 'Discovery', array['Trastevere district','Campo de Fiori','Jewish Quarter','Piazza Farnese','Sant’Ivo alla Sapienza','Piazza Mattei'], 6, null),
('Sunset Rome Tour', 'sunset-rome-tour', 'Rome is most magical at golden hour. Enjoy panoramic viewpoints and atmospheric scenery as the sun sets over the city.', '2 hours', 179, 'Panoramic', array['Janiculum Hill','Pincian Hill','Piazza del Popolo at dusk','Borghese gardens terrace','Aventine Keyhole view','Orange Garden viewpoint'], 6, null),
('Custom Private Tour', 'custom-private-tour', 'Your Rome, your way. Tell us where you’ve always wanted to go and we’ll create a completely bespoke journey.', 'Flexible', 199, 'Bespoke', array['Fully tailored itinerary','Your choice of sights','Flexible departure time','Personal local guide','Up to 6 guests','Anniversary & special occasion ready'], 6, null)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  duration = excluded.duration,
  starting_price = excluded.starting_price,
  category = excluded.category,
  highlights = excluded.highlights,
  max_guests = excluded.max_guests,
  image_url = excluded.image_url;

-- Nota sicurezza:
-- Le Netlify Functions usano SUPABASE_SERVICE_ROLE_KEY lato server.
-- Non inserire mai la service role key nel frontend o in GitHub.
