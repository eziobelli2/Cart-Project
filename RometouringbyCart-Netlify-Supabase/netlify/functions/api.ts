import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const DEFAULT_TIMES = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];
const DEFAULT_CAPACITY = 6;

function supabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}

function json(statusCode: number, body: unknown) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    },
    body: JSON.stringify(body),
  };
}

function parseBody(event: Parameters<Handler>[0]) {
  if (!event.body) return {};
  try { return JSON.parse(event.body); } catch { return {}; }
}

function cleanBooking(row: any) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    whatsapp: row.whatsapp,
    tourSlug: row.tour_slug,
    tourName: row.tour_name,
    tourDate: row.tour_date,
    tourTime: row.tour_time,
    guests: row.guests,
    pickupLocation: row.pickup_location,
    notes: row.notes,
    adminNotes: row.admin_notes,
    status: row.status,
    bookingSource: row.booking_source,
    paymentStatus: row.payment_status,
    stripeSessionId: row.stripe_session_id,
    totalAmount: row.total_amount == null ? null : Number(row.total_amount),
    createdAt: row.created_at,
  };
}

function cleanTour(row: any) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    duration: row.duration,
    startingPrice: Number(row.starting_price),
    category: row.category,
    highlights: row.highlights || [],
    maxGuests: row.max_guests,
    imageUrl: row.image_url,
  };
}

function toDbBooking(data: any, extra: any = {}) {
  return {
    full_name: data.fullName,
    email: data.email,
    phone: data.phone,
    whatsapp: data.whatsapp || null,
    tour_slug: data.tourSlug,
    tour_date: data.tourDate,
    tour_time: data.tourTime,
    guests: Number(data.guests || 1),
    pickup_location: data.pickupLocation || null,
    notes: data.notes || null,
    admin_notes: data.adminNotes || null,
    status: data.status || extra.status || "request",
    booking_source: data.bookingSource || extra.bookingSource || "direct_website",
    payment_status: data.paymentStatus || extra.paymentStatus || "not_required",
    total_amount: data.totalAmount === undefined || data.totalAmount === "" ? null : Number(data.totalAmount),
    ...extra,
  };
}

async function getTourName(client: ReturnType<typeof supabase>, slug: string) {
  const { data } = await client.from("tours").select("name").eq("slug", slug).single();
  return data?.name || null;
}

function getDaysInMonth(yearMonth: string): string[] {
  const [year, month] = yearMonth.split("-").map(Number);
  const days: string[] = [];
  const date = new Date(Date.UTC(year, month - 1, 1));
  while (date.getUTCMonth() === month - 1) {
    days.push(date.toISOString().split("T")[0]);
    date.setUTCDate(date.getUTCDate() + 1);
  }
  return days;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(204, {});

  try {
    const client = supabase();
    const path = event.path.replace(/^\/\.netlify\/functions\/api/, "").replace(/^\/api/, "") || "/";
    const method = event.httpMethod;
    const body = parseBody(event);

    if (method === "GET" && path === "/health") return json(200, { status: "ok" });

    if (method === "GET" && path === "/tours") {
      const { data, error } = await client.from("tours").select("*").order("id");
      if (error) throw error;
      return json(200, (data || []).map(cleanTour));
    }

    if (method === "POST" && path === "/bookings") {
      if (!body.privacyConsent) return json(400, { error: "Privacy consent is required" });
      const tourName = await getTourName(client, body.tourSlug);
      const payload = toDbBooking(body, { tour_name: tourName, status: "request", booking_source: "direct_website", payment_status: "not_required" });
      const { data, error } = await client.from("bookings").insert(payload).select("*").single();
      if (error) throw error;
      return json(201, cleanBooking(data));
    }

    if (method === "GET" && path === "/bookings/summary") {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await client.from("bookings").select("status,tour_date");
      if (error) throw error;
      const rows = data || [];
      return json(200, {
        total: rows.length,
        request: rows.filter((r) => r.status === "request").length,
        pending_payment: rows.filter((r) => r.status === "pending_payment").length,
        paid: rows.filter((r) => r.status === "paid").length,
        confirmed: rows.filter((r) => r.status === "confirmed").length,
        cancelled: rows.filter((r) => r.status === "cancelled").length,
        todayBookings: rows.filter((r) => r.tour_date === today).length,
        upcomingBookings: rows.filter((r) => r.tour_date >= today && r.status !== "cancelled").length,
      });
    }

    if (method === "GET" && path === "/admin/bookings") {
      let query = client.from("bookings").select("*");
      const qs = event.queryStringParameters || {};
      if (qs.status) query = query.eq("status", qs.status);
      if (qs.date) query = query.eq("tour_date", qs.date);
      if (qs.tour) query = query.eq("tour_slug", qs.tour);
      if (qs.source) query = query.eq("booking_source", qs.source);
      const { data, error } = await query.order("tour_date").order("tour_time");
      if (error) throw error;
      return json(200, (data || []).map(cleanBooking));
    }

    if (method === "POST" && path === "/admin/bookings") {
      const tourName = await getTourName(client, body.tourSlug);
      const payload = toDbBooking(body, { tour_name: tourName });
      const { data, error } = await client.from("bookings").insert(payload).select("*").single();
      if (error) throw error;
      return json(201, cleanBooking(data));
    }

    const bookingMatch = path.match(/^\/admin\/bookings\/(\d+)$/);
    if (bookingMatch && method === "PATCH") {
      const id = Number(bookingMatch[1]);
      const update: Record<string, unknown> = {};
      if (body.status != null) update.status = body.status;
      if (body.paymentStatus != null) update.payment_status = body.paymentStatus;
      if (body.adminNotes != null) update.admin_notes = body.adminNotes;
      if (body.totalAmount != null) update.total_amount = Number(body.totalAmount);
      if (body.tourDate != null) update.tour_date = body.tourDate;
      if (body.tourTime != null) update.tour_time = body.tourTime;
      if (body.guests != null) update.guests = Number(body.guests);
      if (body.pickupLocation != null) update.pickup_location = body.pickupLocation;
      const { data, error } = await client.from("bookings").update(update).eq("id", id).select("*").single();
      if (error) throw error;
      return json(200, cleanBooking(data));
    }

    if (method === "GET" && path === "/admin/availability") {
      const month = event.queryStringParameters?.month;
      if (!month) return json(400, { error: "month is required" });
      const days = getDaysInMonth(month);
      const firstDay = days[0];
      const lastDay = days[days.length - 1];
      const [{ data: tours, error: toursError }, { data: bookings, error: bookingsError }, { data: slots, error: slotsError }] = await Promise.all([
        client.from("tours").select("*").order("id"),
        client.from("bookings").select("*").gte("tour_date", firstDay).lte("tour_date", lastDay),
        client.from("availability_slots").select("*").gte("slot_date", firstDay).lte("slot_date", lastDay),
      ]);
      if (toursError) throw toursError;
      if (bookingsError) throw bookingsError;
      if (slotsError) throw slotsError;

      const calendar = days.map((date) => {
        const dayBookings = (bookings || []).filter((b) => b.tour_date === date && b.status !== "cancelled");
        const daySlots = (slots || []).filter((s) => s.slot_date === date);
        const slotRows = (tours || []).flatMap((tour: any) => DEFAULT_TIMES.map((time) => {
          const override = daySlots.find((s: any) => s.tour_slug === tour.slug && s.slot_time === time);
          const slotBookings = dayBookings.filter((b: any) => b.tour_slug === tour.slug && b.tour_time === time);
          const bookedCount = slotBookings.reduce((sum: number, b: any) => sum + Number(b.guests || 0), 0);
          return {
            tourSlug: tour.slug,
            tourName: tour.name,
            time,
            maxCapacity: override?.max_capacity ?? DEFAULT_CAPACITY,
            bookedCount,
            isBlocked: override?.is_blocked ?? false,
            slotId: override?.id ?? null,
            bookings: slotBookings.map((b: any) => ({ id: b.id, fullName: b.full_name, guests: b.guests, status: b.status, bookingSource: b.booking_source })),
          };
        }));
        return { date, slots: slotRows };
      });
      return json(200, calendar);
    }

    if (method === "POST" && path === "/admin/slots") {
      const payload = {
        tour_slug: body.tourSlug,
        slot_date: body.slotDate,
        slot_time: body.slotTime,
        max_capacity: body.maxCapacity || DEFAULT_CAPACITY,
        is_blocked: body.isBlocked ?? true,
        notes: body.notes || null,
      };
      const { data, error } = await client.from("availability_slots").insert(payload).select("*").single();
      if (error) throw error;
      return json(201, data);
    }

    const slotMatch = path.match(/^\/admin\/slots\/(\d+)$/);
    if (slotMatch && method === "DELETE") {
      const { error } = await client.from("availability_slots").delete().eq("id", Number(slotMatch[1]));
      if (error) throw error;
      return json(204, {});
    }

    if (method === "POST" && path === "/newsletter") {
      if (!body.consent) return json(400, { error: "Consent is required" });
      const { data, error } = await client.from("newsletter_subscribers").insert({ name: body.name, email: body.email }).select("*").single();
      if (error) {
        if ((error as any).code === "23505") return json(400, { error: "This email is already subscribed" });
        throw error;
      }
      return json(201, { id: data.id, name: data.name, email: data.email, createdAt: data.created_at });
    }

    return json(404, { error: `Route not found: ${method} ${path}` });
  } catch (error: any) {
    return json(500, { error: error?.message || "Internal server error" });
  }
};
