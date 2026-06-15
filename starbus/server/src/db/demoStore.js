/**
 * In-memory Starbus data for presentation demos (STARBUS_DEMO=1).
 * Resets on server restart. Seeded like database/seed.sql.
 */
import { BUS46_TOTAL_SEATS } from "../utils/busLayout.js";
import { busOwnerScopeForUser, userCanAccessBusRow, assertBusAccessForBooking } from "../utils/ownerScope.js";
import {
  serviceTodayYmd,
  addDaysYmd,
  isServiceDayInWindow,
  isoDateKey,
} from "./serviceDay.js";

const CHANGEME_HASH = "$2a$10$6wEWSZAgcNGFCZOIJfanQ.Fv8Q2uiEbL8trvTADEOdBXGNXo5SQC6";
const AWAB_HASH = "$2a$10$/Uw6.GvlMpZpvoTva0y4/eSCKRAhYLUIcEET6dO8tl1ukJAvaWGlW";

/** @type {{ users: any[], routes: any[], buses: any[], bookings: any[], nextUserId: number, nextRouteId: number, nextBusId: number, nextBookingId: number }} */
const db = {
  users: [],
  routes: [],
  buses: [],
  bookings: [],
  nextUserId: 1,
  nextRouteId: 1,
  nextBusId: 1,
  nextBookingId: 1,
};

function seedDemo() {
  const today = serviceTodayYmd();
  db.users = [
    { id: 1, name: "Super Admin", email: "superadmin@starbus.sd", password: CHANGEME_HASH, role: "superadmin", employer_user_id: null },
    { id: 2, name: "Booth Worker", email: "worker@starbus.sd", password: CHANGEME_HASH, role: "worker", employer_user_id: 1 },
    { id: 3, name: "Online Channel", email: "online@starbus.sd", password: CHANGEME_HASH, role: "worker", employer_user_id: 1 },
    { id: 4, name: "Awab", email: "monsterawab@gmail.com", password: AWAB_HASH, role: "superadmin", employer_user_id: null },
    { id: 5, name: "Qusai", email: "qusai@starbus.sd", password: CHANGEME_HASH, role: "superadmin", employer_user_id: null },
  ];
  db.routes = [
    { id: 1, origin: "Omdurman", destination: "Khartoum", price: 7500 },
    { id: 2, origin: "Omdurman", destination: "Port Sudan", price: 8500 },
    { id: 3, origin: "Omdurman", destination: "Kassala", price: 6500 },
  ];
  const maxOff = 6;
  db.buses = [];
  let busId = 1;
  for (let d = 0; d <= maxOff; d++) {
    const date = addDaysYmd(today, d);
    db.buses.push(
      { id: busId++, bus_owner_id: 1, bus_number: "1", total_seats: 46, seats_booked: 0, departure_time: "08:00:00", route_id: 3, date, status: "scheduled" },
      { id: busId++, bus_owner_id: 1, bus_number: "2", total_seats: 46, seats_booked: 0, departure_time: "08:00:00", route_id: 2, date, status: "scheduled" },
      { id: busId++, bus_owner_id: 1, bus_number: "3", total_seats: 46, seats_booked: 0, departure_time: "08:00:00", route_id: 1, date, status: "scheduled" },
    );
  }
  db.bookings = [];
  db.nextUserId = 6;
  db.nextRouteId = 4;
  db.nextBusId = busId;
  db.nextBookingId = 1;
}

seedDemo();

export function resetDemoData() {
  seedDemo();
}

function routeById(id) {
  return db.routes.find((r) => r.id === id) ?? null;
}

function busWithRoute(bus) {
  if (!bus) return null;
  const r = routeById(bus.route_id);
  return {
    ...bus,
    origin: r?.origin,
    destination: r?.destination,
    price: r?.price ?? 0,
  };
}

function busPassesScope(user, bus) {
  return userCanAccessBusRow(user, bus);
}

function filterBusesByScope(user, buses) {
  return buses.filter((b) => busPassesScope(user, b));
}

function syncSeatsBooked(busId) {
  const bus = db.buses.find((b) => b.id === busId);
  if (!bus) return;
  bus.seats_booked = db.bookings.filter((bk) => bk.bus_id === busId).length;
}

function busRowDto(bus) {
  const br = busWithRoute(bus);
  return {
    id: br.id,
    bus_owner_id: br.bus_owner_id,
    bus_number: br.bus_number,
    total_seats: br.total_seats,
    seats_booked: br.seats_booked,
    seats_remaining: br.total_seats - br.seats_booked,
    departure_time: br.departure_time,
    route_id: br.route_id,
    date: br.date,
    status: br.status,
    origin: br.origin,
    destination: br.destination,
    price: br.price,
  };
}

// ---- Auth ----
export function findUserByEmail(email) {
  return db.users.find((u) => u.email === email) ?? null;
}

// ---- Public ----
export function getServiceToday() {
  return serviceTodayYmd();
}

export function isPublicServiceDayAllowed(ymd, maxOff) {
  return isServiceDayInWindow(ymd, maxOff);
}

export function listPublicActiveBuses(busDay, maxOff) {
  const day = busDay || serviceTodayYmd();
  if (busDay && !isServiceDayInWindow(busDay, maxOff)) return null;
  return db.buses
    .filter((b) => b.date === day && b.status === "scheduled")
    .map((b) => {
      const r = routeById(b.route_id);
      if (r?.origin !== "Omdurman") return null;
      return busRowDto(b);
    })
    .filter(Boolean)
    .sort((a, b) => a.destination.localeCompare(b.destination) || a.id - b.id);
}

export function getPublicBusSeatMap(busId, busDay, maxOff) {
  const day = busDay || serviceTodayYmd();
  if (busDay && !isServiceDayInWindow(busDay, maxOff)) return { error: "date" };
  const bus = db.buses.find((b) => b.id === busId && b.date === day && b.status === "scheduled");
  if (!bus) return null;
  const r = routeById(bus.route_id);
  if (r?.origin !== "Omdurman") return null;

  const total = bus.total_seats || BUS46_TOTAL_SEATS;
  const bySeat = {};
  for (const bk of db.bookings.filter((x) => x.bus_id === busId)) {
    bySeat[bk.seat_number] = bk.lifecycle === "reserved" ? "reserved" : "full";
  }
  const seats = {};
  for (let n = 1; n <= total; n++) seats[n] = bySeat[n] || "empty";

  return {
    bus_id: busId,
    total_seats: total,
    origin: r.origin,
    destination: r.destination,
    price: r.price,
    departure_time: bus.departure_time,
    date: bus.date,
    seats,
  };
}

// ---- Buses (auth) ----
export function listActiveBuses(user, dateParam, maxOff) {
  if (dateParam && !isServiceDayInWindow(dateParam, maxOff)) return { error: "date" };
  const day = dateParam || serviceTodayYmd();
  let rows = db.buses.filter((b) => b.date === day && b.status === "scheduled");
  rows = filterBusesByScope(user, rows);
  return rows
    .map((b) => {
      const r = routeById(b.route_id);
      if (r?.origin !== "Omdurman") return null;
      return busRowDto(b);
    })
    .filter(Boolean)
    .sort((a, b) => a.destination.localeCompare(b.destination) || a.id - b.id);
}

export function getBusSeatMap(user, busId) {
  const bus = db.buses.find((b) => b.id === busId);
  if (!bus) return null;
  if (!busPassesScope(user, bus)) return { forbidden: true };

  const r = routeById(bus.route_id);
  const total = bus.total_seats || BUS46_TOTAL_SEATS;
  const bySeat = {};
  for (const bk of db.bookings.filter((x) => x.bus_id === busId)) {
    bySeat[bk.seat_number] = {
      state: bk.lifecycle === "reserved" ? "reserved" : "full",
      booking_id: bk.id,
    };
  }
  const seats = {};
  for (let n = 1; n <= total; n++) {
    const b = bySeat[n];
    seats[n] = b ? b.state : "empty";
  }
  return {
    bus_id: busId,
    total_seats: total,
    origin: r?.origin,
    destination: r?.destination,
    seats,
    bookingMeta: bySeat,
  };
}

export function listAllBuses(user) {
  let rows = [...db.buses];
  rows = filterBusesByScope(user, rows);
  return rows
    .map(busRowDto)
    .sort((a, b) => {
      const dc = String(b.date).localeCompare(String(a.date));
      if (dc !== 0) return dc;
      return String(a.departure_time).localeCompare(String(b.departure_time)) || b.id - a.id;
    });
}

export function getBus(user, id) {
  const bus = db.buses.find((b) => b.id === id);
  if (!bus) return null;
  if (!busPassesScope(user, bus)) return { forbidden: true };
  return busRowDto(bus);
}

export function createBus(user, body) {
  let bus_owner_id = body.bus_owner_id;
  if (user.role === "admin") bus_owner_id = Number(user.id);

  const dup = db.buses.find(
    (b) =>
      b.route_id === body.route_id &&
      b.date === body.date &&
      b.departure_time === body.departure_time &&
      b.bus_number === body.bus_number,
  );
  if (dup) return { dup: true };

  const id = db.nextBusId++;
  const row = {
    id,
    bus_owner_id,
    bus_number: body.bus_number,
    total_seats: body.total_seats,
    seats_booked: 0,
    departure_time: body.departure_time,
    route_id: body.route_id,
    date: body.date,
    status: body.status ?? "scheduled",
  };
  db.buses.push(row);
  return { id };
}

// ---- Bookings ----
function getBusForBooking(busId) {
  return busWithRoute(db.buses.find((b) => b.id === busId));
}

function insertBooking(row) {
  const id = db.nextBookingId++;
  const bk = {
    id,
    created_at: new Date().toISOString(),
    booking_type: "booth",
    payment_status: "unpaid",
    lifecycle: "reserved",
    ...row,
  };
  db.bookings.push(bk);
  syncSeatsBooked(row.bus_id);
  return bk;
}

export function reserveBooking(user, body) {
  const bus = getBusForBooking(body.bus_id);
  if (!bus) return { notFound: true };
  const gate = assertBusAccessForBooking(user, bus);
  if (!gate.ok) return { status: gate.status, message: gate.message };
  if (bus.status !== "scheduled") return { conflict: "Bus not open" };
  if (body.seat_number > bus.total_seats) return { badRequest: "Invalid seat" };

  const taken = db.bookings.find((b) => b.bus_id === body.bus_id && b.seat_number === body.seat_number);
  if (taken) return { conflict: "Seat not available" };
  if (db.bookings.filter((b) => b.bus_id === body.bus_id).length >= bus.total_seats) {
    return { conflict: "Bus is full" };
  }

  const phoneClean = String(body.passenger_phone || "").replace(/[^\d+]/g, "").trim() || null;
  const emailClean = String(body.passenger_email || "").trim() || null;

  const bk = insertBooking({
    bus_id: body.bus_id,
    worker_id: Number(user.id),
    passenger_name: body.passenger_name,
    passenger_phone: phoneClean,
    passenger_email: emailClean,
    from_location: bus.origin,
    to_location: bus.destination,
    seat_number: body.seat_number,
    lifecycle: "reserved",
  });
  return { id: bk.id, lifecycle: "reserved" };
}

export function reserveBulk(user, body) {
  const seats = [...new Set(body.seat_numbers)].sort((a, b) => a - b);
  if (seats.length !== body.seat_numbers.length) return { badRequest: "مقعد مكرر في الطلب" };

  const bus = getBusForBooking(body.bus_id);
  if (!bus) return { notFound: true };
  const gate = assertBusAccessForBooking(user, bus);
  if (!gate.ok) return { status: gate.status, message: gate.message };
  if (bus.status !== "scheduled") return { conflict: "Bus not open" };

  for (const s of seats) {
    if (s > bus.total_seats) return { badRequest: `Invalid seat ${s}` };
    if (db.bookings.find((b) => b.bus_id === body.bus_id && b.seat_number === s)) {
      return { conflict: `Seats #${s} not available` };
    }
  }
  if (db.bookings.filter((b) => b.bus_id === body.bus_id).length + seats.length > bus.total_seats) {
    return { conflict: "Not enough seats" };
  }

  const phoneClean = String(body.passenger_phone || "").replace(/[^\d+]/g, "").trim() || null;
  const emailClean = String(body.passenger_email || "").trim() || null;
  const bookingIds = [];
  for (const seat of seats) {
    const bk = insertBooking({
      bus_id: body.bus_id,
      worker_id: Number(user.id),
      passenger_name: body.passenger_name,
      passenger_phone: phoneClean,
      passenger_email: emailClean,
      from_location: bus.origin,
      to_location: bus.destination,
      seat_number: seat,
      lifecycle: "reserved",
    });
    bookingIds.push(bk.id);
  }
  return { ok: true, booking_ids: bookingIds, seat_numbers: seats, lifecycle: "reserved" };
}

export function fullBooking(user, body) {
  const bus = getBusForBooking(body.bus_id);
  if (!bus) return { notFound: true };
  const gate = assertBusAccessForBooking(user, bus);
  if (!gate.ok) return { status: gate.status, message: gate.message };
  if (bus.status !== "scheduled") return { conflict: "Bus not open" };
  if (body.seat_number > bus.total_seats) return { badRequest: "Invalid seat" };

  const paymentStatus = body.payment_status ?? "unpaid";
  const existing = db.bookings.find((b) => b.bus_id === body.bus_id && b.seat_number === body.seat_number);

  if (existing?.lifecycle === "full") return { conflict: "Seat already booked" };

  if (existing?.lifecycle === "reserved") {
    Object.assign(existing, {
      worker_id: Number(user.id),
      passenger_name: body.passenger_name,
      passenger_phone: body.passenger_phone || null,
      passenger_email: body.passenger_email || null,
      from_location: body.from_location,
      to_location: body.to_location,
      booking_type: body.booking_type,
      payment_status: paymentStatus,
      lifecycle: "full",
    });
    syncSeatsBooked(body.bus_id);
    return { id: existing.id, lifecycle: "full" };
  }

  if (db.bookings.filter((b) => b.bus_id === body.bus_id).length >= bus.total_seats) {
    return { conflict: "Bus is full" };
  }

  const bk = insertBooking({
    bus_id: body.bus_id,
    worker_id: Number(user.id),
    passenger_name: body.passenger_name,
    passenger_phone: body.passenger_phone || null,
    passenger_email: body.passenger_email || null,
    from_location: body.from_location,
    to_location: body.to_location,
    seat_number: body.seat_number,
    booking_type: body.booking_type,
    payment_status: paymentStatus,
    lifecycle: "full",
  });
  return { id: bk.id, lifecycle: "full", created: true };
}

export function fullBulk(user, body) {
  const seats = [...new Set(body.seat_numbers)].sort((a, b) => a - b);
  if (seats.length !== body.seat_numbers.length) return { badRequest: "مقعد مكرر في الطلب" };

  const bus = getBusForBooking(body.bus_id);
  if (!bus) return { notFound: true };
  const gate = assertBusAccessForBooking(user, bus);
  if (!gate.ok) return { status: gate.status, message: gate.message };
  if (bus.status !== "scheduled") return { conflict: "Bus not open" };

  const paymentStatus = body.payment_status ?? "unpaid";
  const existingBySeat = new Map();
  for (const s of seats) {
    if (s > bus.total_seats) return { badRequest: `Invalid seat ${s}` };
    const ex = db.bookings.find((b) => b.bus_id === body.bus_id && b.seat_number === s);
    if (ex) {
      if (ex.lifecycle === "full") return { conflict: `Seat #${s} already booked` };
      existingBySeat.set(s, ex);
    }
  }

  const newSeats = seats.filter((s) => !existingBySeat.has(s));
  if (db.bookings.filter((b) => b.bus_id === body.bus_id).length + newSeats.length > bus.total_seats) {
    return { conflict: "Not enough seats" };
  }

  const bookingIds = [];
  for (const seat of seats) {
    const existing = existingBySeat.get(seat);
    if (existing) {
      Object.assign(existing, {
        worker_id: Number(user.id),
        passenger_name: body.passenger_name,
        passenger_phone: body.passenger_phone || null,
        passenger_email: body.passenger_email || null,
        from_location: body.from_location,
        to_location: body.to_location,
        booking_type: body.booking_type,
        payment_status: paymentStatus,
        lifecycle: "full",
      });
      bookingIds.push(existing.id);
    } else {
      const bk = insertBooking({
        bus_id: body.bus_id,
        worker_id: Number(user.id),
        passenger_name: body.passenger_name,
        passenger_phone: body.passenger_phone || null,
        passenger_email: body.passenger_email || null,
        from_location: body.from_location,
        to_location: body.to_location,
        seat_number: seat,
        booking_type: body.booking_type,
        payment_status: paymentStatus,
        lifecycle: "full",
      });
      bookingIds.push(bk.id);
    }
  }
  syncSeatsBooked(body.bus_id);
  return { ok: true, booking_ids: bookingIds, seat_numbers: seats, lifecycle: "full" };
}

export function deleteBooking(id) {
  const idx = db.bookings.findIndex((b) => b.id === id);
  if (idx < 0) return null;
  const busId = db.bookings[idx].bus_id;
  db.bookings.splice(idx, 1);
  syncSeatsBooked(busId);
  return { ok: true };
}

function bookingDto(bk) {
  const bus = db.buses.find((b) => b.id === bk.bus_id);
  const r = bus ? routeById(bus.route_id) : null;
  return {
    id: bk.id,
    bus_id: bk.bus_id,
    worker_id: bk.worker_id,
    passenger_name: bk.passenger_name,
    passenger_phone: bk.passenger_phone,
    passenger_email: bk.passenger_email,
    from_location: bk.from_location,
    to_location: bk.to_location,
    seat_number: bk.seat_number,
    booking_type: bk.booking_type,
    payment_status: bk.payment_status,
    lifecycle: bk.lifecycle,
    created_at: bk.created_at,
    bus_date: bus?.date,
    departure_time: bus?.departure_time,
    origin: r?.origin,
    destination: r?.destination,
    route_origin: r?.origin,
    route_destination: r?.destination,
    bus_departure_time: bus?.departure_time,
  };
}

export function listBookingsByBus(user, busId) {
  const bus = db.buses.find((b) => b.id === busId);
  if (!bus) return null;
  if (!busPassesScope(user, bus)) return { forbidden: true };
  return db.bookings
    .filter((b) => b.bus_id === busId)
    .map(bookingDto)
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)) || b.id - a.id);
}

function bookingsInScope(user) {
  const scopeOwner = busOwnerScopeForUser(user).params._scope_owner;
  return db.bookings.filter((bk) => {
    const bus = db.buses.find((b) => b.id === bk.bus_id);
    if (!bus) return false;
    if (user.role === "superadmin") return true;
    if (scopeOwner == null) return false;
    return bus.bus_owner_id === scopeOwner;
  });
}

// ---- Reports ----
export function getOverview(user, endDay, spanDays) {
  const interval = spanDays - 1;
  let buses = db.buses.filter((b) => b.date === endDay && b.status === "scheduled");
  buses = filterBusesByScope(user, buses).filter((b) => routeById(b.route_id)?.origin === "Omdurman");

  const fleet = buses.map((b) => {
    const r = routeById(b.route_id);
    const dto = busRowDto(b);
    return {
      id: dto.id,
      bus_number: dto.bus_number,
      total_seats: dto.total_seats,
      seats_booked: dto.seats_booked,
      seats_remaining: dto.seats_remaining,
      origin: r.origin,
      destination: r.destination,
      departure_hm: String(b.departure_time).slice(0, 5),
    };
  });

  let seat_capacity_total = 0;
  let seats_booked_aggregate = 0;
  for (const b of fleet) {
    seat_capacity_total += b.total_seats;
    seats_booked_aggregate += Math.min(b.seats_booked, b.total_seats);
  }
  const fill_ratio_pct =
    seat_capacity_total > 0
      ? Math.round(((seats_booked_aggregate / seat_capacity_total) * 100 + Number.EPSILON) * 10) / 10
      : null;

  const dayBookings = bookingsInScope(user).filter((bk) => isoDateKey(bk.created_at) === endDay);
  const day_totals = {
    bookings_count: dayBookings.length,
    reserved_count: dayBookings.filter((b) => b.lifecycle === "reserved").length,
    full_count: dayBookings.filter((b) => b.lifecycle === "full").length,
    paid_count: dayBookings.filter((b) => b.payment_status === "paid").length,
    unpaid_count: dayBookings.filter((b) => b.payment_status === "unpaid").length,
    half_count: dayBookings.filter((b) => b.payment_status === "half").length,
    online_count: dayBookings.filter((b) => b.booking_type === "online").length,
    booth_count: dayBookings.filter((b) => b.booking_type === "booth").length,
  };

  const destMap = new Map();
  for (const bk of dayBookings) {
    const bus = db.buses.find((b) => b.id === bk.bus_id);
    const dest = routeById(bus?.route_id)?.destination ?? "?";
    destMap.set(dest, (destMap.get(dest) ?? 0) + 1);
  }
  const by_destination = [...destMap.entries()]
    .map(([destination, bookings_count]) => ({ destination, bookings_count }))
    .sort((a, b) => b.bookings_count - a.bookings_count);

  const startTrend = addDaysYmd(endDay, -interval);
  const trend = [];
  let cur = startTrend;
  while (true) {
    const count = bookingsInScope(user).filter((bk) => isoDateKey(bk.created_at) === cur).length;
    trend.push({ date: cur, bookings: count });
    if (cur === endDay) break;
    cur = addDaysYmd(cur, 1);
    if (trend.length > spanDays + 5) break;
  }

  return {
    date: endDay,
    days: spanDays,
    fleet_day: {
      date: endDay,
      buses_on_network: fleet.length,
      seat_capacity_total,
      seats_booked_aggregate,
      fill_ratio_pct,
      buses: fleet,
    },
    day_totals,
    by_destination,
    trend,
  };
}

export function getDaily(user, day, bus_id, limit, offset) {
  let list = bookingsInScope(user).filter((bk) => {
    const bus = db.buses.find((b) => b.id === bk.bus_id);
    return bus && bus.date === day;
  });
  if (bus_id) list = list.filter((bk) => bk.bus_id === bus_id);

  const summary = {
    bookings_count: list.length,
    reserved_count: list.filter((b) => b.lifecycle === "reserved").length,
    full_count: list.filter((b) => b.lifecycle === "full").length,
    paid_count: list.filter((b) => b.payment_status === "paid").length,
    unpaid_count: list.filter((b) => b.payment_status === "unpaid").length,
    half_count: list.filter((b) => b.payment_status === "half").length,
  };

  const sorted = list
    .map(bookingDto)
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)) || b.id - a.id);
  const rows = sorted.slice(offset, offset + limit);

  return {
    date: day,
    summary,
    bookings: rows,
    page: { limit, offset, returned: rows.length },
  };
}
