/**
 * MySQL-backed store — production path (delegates to pool).
 */
import { pool } from "./pool.js";
import { BUS46_ROWS, BUS46_TOTAL_SEATS } from "../utils/busLayout.js";
import { busOwnerScopeForUser, userCanAccessBusRow, assertBusAccessForBooking, mergeScopeParams } from "../utils/ownerScope.js";
import { addDaysYmd, isoDateKey } from "./serviceDay.js";

export async function findUserByEmail(email) {
  const [rows] = await pool.execute(
    `SELECT id, name, email, password, role, employer_user_id FROM users WHERE email = :email LIMIT 1`,
    { email },
  );
  return rows?.[0] ?? null;
}

export async function getServiceToday() {
  const [[row]] = await pool.execute(`SELECT DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS service_today`);
  return row?.service_today ? String(row.service_today) : "";
}

export async function isPublicServiceDayAllowed(ymd, maxOff) {
  const [[row]] = await pool.execute(
    `SELECT CASE WHEN :bus_day BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL :max_off DAY) THEN 1 ELSE 0 END AS ok`,
    { bus_day: ymd, max_off: maxOff },
  );
  return Number(row?.ok) === 1;
}

async function queryPublicBuses(busDay, maxOff) {
  if (busDay) {
    const [rows] = await pool.execute(
      `SELECT b.id, b.bus_number, b.total_seats, b.seats_booked,
              (b.total_seats - b.seats_booked) AS seats_remaining,
              b.departure_time, b.date, b.status, r.origin, r.destination, r.price
       FROM buses b JOIN routes r ON r.id = b.route_id
       WHERE b.date = :bus_day AND b.date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL :max_off DAY)
         AND b.status = 'scheduled' AND r.origin = 'Omdurman'
       ORDER BY r.destination ASC, b.id ASC`,
      { bus_day: busDay, max_off: maxOff },
    );
    return rows;
  }
  const [rows] = await pool.execute(
    `SELECT b.id, b.bus_number, b.total_seats, b.seats_booked,
            (b.total_seats - b.seats_booked) AS seats_remaining,
            b.departure_time, b.date, b.status, r.origin, r.destination, r.price
     FROM buses b JOIN routes r ON r.id = b.route_id
     WHERE b.date = CURDATE() AND b.status = 'scheduled' AND r.origin = 'Omdurman'
     ORDER BY r.destination ASC, b.id ASC`,
  );
  return rows;
}

export async function listPublicActiveBuses(busDay, maxOff) {
  if (busDay) {
    const ok = await isPublicServiceDayAllowed(busDay, maxOff);
    if (!ok) return null;
  }
  return queryPublicBuses(busDay, maxOff);
}

export async function getPublicBusSeatMap(busId, busDay, maxOff) {
  if (busDay) {
    const ok = await isPublicServiceDayAllowed(busDay, maxOff);
    if (!ok) return { error: "date" };
  }
  let busRows;
  if (busDay) {
    [busRows] = await pool.execute(
      `SELECT b.id, b.total_seats, b.status, b.date, b.departure_time, r.origin, r.destination, r.price
       FROM buses b JOIN routes r ON r.id = b.route_id
       WHERE b.id = :id AND b.date = :bus_day AND b.date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL :max_off DAY)
         AND b.status = 'scheduled' AND r.origin = 'Omdurman' LIMIT 1`,
      { id: busId, bus_day: busDay, max_off: maxOff },
    );
  } else {
    [busRows] = await pool.execute(
      `SELECT b.id, b.total_seats, b.status, b.date, b.departure_time, r.origin, r.destination, r.price
       FROM buses b JOIN routes r ON r.id = b.route_id
       WHERE b.id = :id AND b.date = CURDATE() AND b.status = 'scheduled' AND r.origin = 'Omdurman' LIMIT 1`,
      { id: busId },
    );
  }
  const bus = busRows?.[0];
  if (!bus) return null;
  const total = Number(bus.total_seats) || BUS46_TOTAL_SEATS;
  const [bookRows] = await pool.execute(`SELECT seat_number, lifecycle FROM bookings WHERE bus_id = :id`, { id: busId });
  const bySeat = {};
  for (const row of bookRows || []) bySeat[row.seat_number] = row.lifecycle === "reserved" ? "reserved" : "full";
  const seats = {};
  for (let n = 1; n <= total; n++) seats[n] = bySeat[n] || "empty";
  return {
    bus_id: busId,
    total_seats: total,
    origin: bus.origin,
    destination: bus.destination,
    price: bus.price,
    departure_time: bus.departure_time,
    date: bus.date,
    seats,
    layout_rows: BUS46_ROWS,
  };
}

export async function listActiveBuses(user, dateParam, maxOff) {
  if (dateParam) {
    const [[row]] = await pool.execute(
      `SELECT CASE WHEN :bus_day BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL :max_off DAY) THEN 1 ELSE 0 END AS ok`,
      { bus_day: dateParam, max_off: maxOff },
    );
    if (Number(row?.ok) !== 1) return { error: "date" };
  }
  const scope = busOwnerScopeForUser(user);
  const baseParams = dateParam ? { bus_day: dateParam } : {};
  const qParams = mergeScopeParams(baseParams, scope.params);
  const [rows] = await pool.execute(
    `SELECT b.id, b.bus_number, b.total_seats, b.seats_booked,
            (b.total_seats - b.seats_booked) AS seats_remaining,
            b.departure_time, b.route_id, b.date, b.status, r.origin, r.destination, r.price
     FROM buses b JOIN routes r ON r.id = b.route_id
     WHERE b.date = ${dateParam ? ":bus_day" : "CURDATE()"} AND b.status = 'scheduled' AND r.origin = 'Omdurman'
     ${scope.sql} ORDER BY r.destination ASC, b.id ASC`,
    qParams,
  );
  return rows;
}

export async function getBusSeatMap(user, busId) {
  const [busRows] = await pool.execute(
    `SELECT b.id, b.total_seats, b.bus_owner_id, r.origin, r.destination
     FROM buses b JOIN routes r ON r.id = b.route_id WHERE b.id = :id LIMIT 1`,
    { id: busId },
  );
  const bus = busRows?.[0];
  if (!bus) return null;
  if (!userCanAccessBusRow(user, bus)) return { forbidden: true };
  const total = Number(bus.total_seats) || BUS46_TOTAL_SEATS;
  const [bookRows] = await pool.execute(
    `SELECT seat_number, lifecycle, id AS booking_id FROM bookings WHERE bus_id = :id`,
    { id: busId },
  );
  const seats = {};
  for (let n = 1; n <= total; n++) seats[n] = "empty";
  for (const row of bookRows || []) {
    seats[row.seat_number] = row.lifecycle === "reserved" ? "reserved" : "full";
  }
  return { bus_id: busId, total_seats: total, origin: bus.origin, destination: bus.destination, seats, layout_rows: BUS46_ROWS };
}

export async function listAllBuses(user) {
  const scope = busOwnerScopeForUser(user);
  const [rows] = await pool.execute(
    `SELECT b.id, b.bus_owner_id, b.bus_number, b.total_seats, b.seats_booked,
            (b.total_seats - b.seats_booked) AS seats_remaining,
            b.departure_time, b.route_id, b.date, b.status, r.origin, r.destination, r.price
     FROM buses b JOIN routes r ON r.id = b.route_id WHERE 1=1 ${scope.sql}
     ORDER BY b.date DESC, b.departure_time ASC, b.id DESC`,
    scope.params,
  );
  return rows;
}

export async function getBus(user, id) {
  const [rows] = await pool.execute(
    `SELECT b.id, b.bus_owner_id, b.bus_number, b.total_seats, b.seats_booked,
            (b.total_seats - b.seats_booked) AS seats_remaining,
            b.departure_time, b.route_id, b.date, b.status, r.origin, r.destination, r.price
     FROM buses b JOIN routes r ON r.id = b.route_id WHERE b.id = :id LIMIT 1`,
    { id },
  );
  const bus = rows?.[0];
  if (!bus) return null;
  if (!userCanAccessBusRow(user, bus)) return { forbidden: true };
  return bus;
}

export async function createBus(user, body) {
  let bus_owner_id = body.bus_owner_id;
  if (user.role === "admin") bus_owner_id = Number(user.id);
  try {
    const [result] = await pool.execute(
      `INSERT INTO buses (bus_owner_id, bus_number, total_seats, seats_booked, departure_time, route_id, date, status)
       VALUES (:bus_owner_id, :bus_number, :total_seats, 0, :departure_time, :route_id, :date, :status)`,
      { ...body, bus_owner_id, status: body.status ?? "scheduled" },
    );
    return { id: result.insertId };
  } catch (err) {
    if (err?.code === "ER_DUP_ENTRY") return { dup: true };
    throw err;
  }
}

async function syncSeatsBooked(conn, busId) {
  const [rows] = await conn.execute(`SELECT COUNT(*) AS c FROM bookings WHERE bus_id = :busId`, { busId });
  const c = Number(rows?.[0]?.c ?? 0);
  await conn.execute(`UPDATE buses SET seats_booked = :c WHERE id = :busId`, { c, busId });
}

export async function reserveBooking(user, body) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [busRows] = await conn.execute(
      `SELECT b.id, b.bus_owner_id, b.total_seats, b.status, r.origin, r.destination
       FROM buses b JOIN routes r ON r.id = b.route_id WHERE b.id = :bus_id FOR UPDATE`,
      { bus_id: body.bus_id },
    );
    const bus = busRows?.[0];
    if (!bus) { await conn.rollback(); return { notFound: true }; }
    const gate = assertBusAccessForBooking(user, bus);
    if (!gate.ok) { await conn.rollback(); return { status: gate.status, message: gate.message }; }
    if (bus.status !== "scheduled") { await conn.rollback(); return { conflict: "Bus not open" }; }
    if (body.seat_number > bus.total_seats) { await conn.rollback(); return { badRequest: "Invalid seat" }; }
    const [taken] = await conn.execute(
      `SELECT id FROM bookings WHERE bus_id = :bus_id AND seat_number = :seat_number FOR UPDATE`,
      { bus_id: body.bus_id, seat_number: body.seat_number },
    );
    if (taken?.length) { await conn.rollback(); return { conflict: "Seat not available" }; }
    const phoneClean = String(body.passenger_phone || "").replace(/[^\d+]/g, "").trim() || null;
    const emailClean = String(body.passenger_email || "").trim() || null;
    const [result] = await conn.execute(
      `INSERT INTO bookings (bus_id, worker_id, passenger_name, passenger_phone, passenger_email,
        from_location, to_location, seat_number, booking_type, payment_status, lifecycle)
       VALUES (:bus_id, :worker_id, :passenger_name, :passenger_phone, :passenger_email,
        :from_location, :to_location, :seat_number, 'booth', 'unpaid', 'reserved')`,
      {
        bus_id: body.bus_id,
        worker_id: Number(user.id),
        passenger_name: body.passenger_name,
        passenger_phone: phoneClean,
        passenger_email: emailClean,
        from_location: bus.origin,
        to_location: bus.destination,
        seat_number: body.seat_number,
      },
    );
    await syncSeatsBooked(conn, body.bus_id);
    await conn.commit();
    return { id: result.insertId, lifecycle: "reserved" };
  } catch (err) {
    await conn.rollback();
    if (err?.code === "ER_DUP_ENTRY") return { conflict: "Seat not available" };
    throw err;
  } finally {
    conn.release();
  }
}

export async function reserveBulk(user, body) {
  const conn = await pool.getConnection();
  try {
    const seats = [...new Set(body.seat_numbers)].sort((a, b) => a - b);
    if (seats.length !== body.seat_numbers.length) return { badRequest: "مقعد مكرر في الطلب" };
    await conn.beginTransaction();
    const [busRows] = await conn.execute(
      `SELECT b.id, b.bus_owner_id, b.total_seats, b.status, r.origin, r.destination
       FROM buses b JOIN routes r ON r.id = b.route_id WHERE b.id = :bus_id FOR UPDATE`,
      { bus_id: body.bus_id },
    );
    const bus = busRows?.[0];
    if (!bus) { await conn.rollback(); return { notFound: true }; }
    const gate = assertBusAccessForBooking(user, bus);
    if (!gate.ok) { await conn.rollback(); return { status: gate.status, message: gate.message }; }
    if (bus.status !== "scheduled") { await conn.rollback(); return { conflict: "Bus not open" }; }
    for (const s of seats) {
      if (s > Number(bus.total_seats)) { await conn.rollback(); return { badRequest: `Invalid seat ${s}` }; }
    }
    const placeholders = seats.map(() => "?").join(",");
    const [existing] = await conn.query(
      `SELECT seat_number FROM bookings WHERE bus_id = ? AND seat_number IN (${placeholders}) FOR UPDATE`,
      [body.bus_id, ...seats],
    );
    if (existing?.length) {
      await conn.rollback();
      return { conflict: `Seats ${existing.map((r) => `#${r.seat_number}`).join(", ")} not available` };
    }
    const phoneClean = String(body.passenger_phone || "").replace(/[^\d+]/g, "").trim() || null;
    const emailClean = String(body.passenger_email || "").trim() || null;
    const bookingIds = [];
    for (const seat of seats) {
      const [result] = await conn.execute(
        `INSERT INTO bookings (bus_id, worker_id, passenger_name, passenger_phone, passenger_email,
          from_location, to_location, seat_number, booking_type, payment_status, lifecycle)
         VALUES (:bus_id, :worker_id, :passenger_name, :passenger_phone, :passenger_email,
          :from_location, :to_location, :seat_number, 'booth', 'unpaid', 'reserved')`,
        {
          bus_id: body.bus_id,
          worker_id: Number(user.id),
          passenger_name: body.passenger_name,
          passenger_phone: phoneClean,
          passenger_email: emailClean,
          from_location: bus.origin,
          to_location: bus.destination,
          seat_number: seat,
        },
      );
      bookingIds.push(result.insertId);
    }
    await syncSeatsBooked(conn, body.bus_id);
    await conn.commit();
    return { ok: true, booking_ids: bookingIds, seat_numbers: seats, lifecycle: "reserved" };
  } catch (err) {
    try { await conn.rollback(); } catch {}
    if (err?.code === "ER_DUP_ENTRY") return { conflict: "Seat already taken, try again" };
    throw err;
  } finally {
    conn.release();
  }
}

export async function fullBooking(user, body) {
  const conn = await pool.getConnection();
  try {
    const paymentStatus = body.payment_status ?? "unpaid";
    await conn.beginTransaction();
    const [busRows] = await conn.execute(`SELECT b.id, b.bus_owner_id, b.total_seats, b.status FROM buses b WHERE b.id = :bus_id FOR UPDATE`, { bus_id: body.bus_id });
    const bus = busRows?.[0];
    if (!bus) { await conn.rollback(); return { notFound: true }; }
    const gate = assertBusAccessForBooking(user, bus);
    if (!gate.ok) { await conn.rollback(); return { status: gate.status, message: gate.message }; }
    if (bus.status !== "scheduled") { await conn.rollback(); return { conflict: "Bus not open" }; }
    const [existingRows] = await conn.execute(
      `SELECT id, lifecycle FROM bookings WHERE bus_id = :bus_id AND seat_number = :seat_number FOR UPDATE`,
      { bus_id: body.bus_id, seat_number: body.seat_number },
    );
    const existing = existingRows?.[0];
    if (existing?.lifecycle === "full") { await conn.rollback(); return { conflict: "Seat already booked" }; }
    if (existing?.lifecycle === "reserved") {
      await conn.execute(
        `UPDATE bookings SET worker_id=:worker_id, passenger_name=:passenger_name, passenger_phone=:passenger_phone,
         passenger_email=:passenger_email, from_location=:from_location, to_location=:to_location,
         booking_type=:booking_type, payment_status=:payment_status, lifecycle='full' WHERE id=:id`,
        { id: existing.id, worker_id: Number(user.id), ...body, payment_status: paymentStatus },
      );
      await syncSeatsBooked(conn, body.bus_id);
      await conn.commit();
      return { id: existing.id, lifecycle: "full" };
    }
    const [result] = await conn.execute(
      `INSERT INTO bookings (bus_id, worker_id, passenger_name, passenger_phone, passenger_email,
        from_location, to_location, seat_number, booking_type, payment_status, lifecycle)
       VALUES (:bus_id, :worker_id, :passenger_name, :passenger_phone, :passenger_email,
        :from_location, :to_location, :seat_number, :booking_type, :payment_status, 'full')`,
      { bus_id: body.bus_id, worker_id: Number(user.id), ...body, payment_status: paymentStatus },
    );
    await syncSeatsBooked(conn, body.bus_id);
    await conn.commit();
    return { id: result.insertId, lifecycle: "full", created: true };
  } catch (err) {
    await conn.rollback();
    if (err?.code === "ER_DUP_ENTRY") return { conflict: "Seat not available" };
    throw err;
  } finally {
    conn.release();
  }
}

export async function fullBulk(user, body) {
  const conn = await pool.getConnection();
  try {
    const seats = [...new Set(body.seat_numbers)].sort((a, b) => a - b);
    if (seats.length !== body.seat_numbers.length) return { badRequest: "مقعد مكرر في الطلب" };
    const paymentStatus = body.payment_status ?? "unpaid";
    await conn.beginTransaction();
    const [busRows] = await conn.execute(`SELECT b.id, b.bus_owner_id, b.total_seats, b.status FROM buses b WHERE b.id = :bus_id FOR UPDATE`, { bus_id: body.bus_id });
    const bus = busRows?.[0];
    if (!bus) { await conn.rollback(); return { notFound: true }; }
    const gate = assertBusAccessForBooking(user, bus);
    if (!gate.ok) { await conn.rollback(); return { status: gate.status, message: gate.message }; }
    const bookingIds = [];
    for (const seat of seats) {
      const [existingRows] = await conn.execute(
        `SELECT id, lifecycle FROM bookings WHERE bus_id = :bus_id AND seat_number = :seat_number FOR UPDATE`,
        { bus_id: body.bus_id, seat_number: seat },
      );
      const existing = existingRows?.[0];
      if (existing?.lifecycle === "full") { await conn.rollback(); return { conflict: `Seat #${seat} already booked` }; }
      if (existing) {
        await conn.execute(
          `UPDATE bookings SET worker_id=:worker_id, passenger_name=:passenger_name, passenger_phone=:passenger_phone,
           passenger_email=:passenger_email, from_location=:from_location, to_location=:to_location,
           booking_type=:booking_type, payment_status=:payment_status, lifecycle='full' WHERE id=:id`,
          { id: existing.id, worker_id: Number(user.id), ...body, payment_status: paymentStatus },
        );
        bookingIds.push(existing.id);
      } else {
        const [result] = await conn.execute(
          `INSERT INTO bookings (bus_id, worker_id, passenger_name, passenger_phone, passenger_email,
            from_location, to_location, seat_number, booking_type, payment_status, lifecycle)
           VALUES (:bus_id, :worker_id, :passenger_name, :passenger_phone, :passenger_email,
            :from_location, :to_location, :seat_number, :booking_type, :payment_status, 'full')`,
          { bus_id: body.bus_id, worker_id: Number(user.id), seat_number: seat, ...body, payment_status: paymentStatus },
        );
        bookingIds.push(result.insertId);
      }
    }
    await syncSeatsBooked(conn, body.bus_id);
    await conn.commit();
    return { ok: true, booking_ids: bookingIds, seat_numbers: seats, lifecycle: "full" };
  } catch (err) {
    try { await conn.rollback(); } catch {}
    if (err?.code === "ER_DUP_ENTRY") return { conflict: "Seat already taken, try again" };
    throw err;
  } finally {
    conn.release();
  }
}

export async function deleteBooking(id) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute(`SELECT id, bus_id FROM bookings WHERE id = :id FOR UPDATE`, { id });
    const row = rows?.[0];
    if (!row) { await conn.rollback(); return null; }
    await conn.execute(`DELETE FROM bookings WHERE id = :id`, { id });
    await syncSeatsBooked(conn, row.bus_id);
    await conn.commit();
    return { ok: true };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function listBookingsByBus(user, busId) {
  const [busOwnerRows] = await pool.execute(`SELECT bus_owner_id FROM buses WHERE id = :id LIMIT 1`, { id: busId });
  const ownerRow = busOwnerRows?.[0];
  if (!ownerRow) return null;
  if (!userCanAccessBusRow(user, ownerRow)) return { forbidden: true };
  const [rows] = await pool.execute(
    `SELECT bk.id, bk.bus_id, bk.worker_id, bk.passenger_name, bk.passenger_phone, bk.passenger_email,
            bk.from_location, bk.to_location, bk.seat_number, bk.booking_type, bk.payment_status, bk.lifecycle,
            bk.created_at, b.date AS bus_date, b.departure_time, r.origin, r.destination
     FROM bookings bk JOIN buses b ON b.id = bk.bus_id JOIN routes r ON r.id = b.route_id
     WHERE bk.bus_id = :busId ORDER BY bk.created_at DESC, bk.id DESC`,
    { busId },
  );
  return rows;
}

function num(v) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

export async function getOverview(user, endDay, spanDays) {
  const interval = spanDays - 1;
  const scope = busOwnerScopeForUser(user);
  const fleetParams = mergeScopeParams({ endDay }, scope.params);
  const [fleetRows] = await pool.execute(
    `SELECT b.id, b.bus_number, b.total_seats, b.seats_booked, (b.total_seats - b.seats_booked) AS seats_remaining,
            r.origin, r.destination, TIME_FORMAT(b.departure_time, '%H:%i') AS departure_hm
     FROM buses b JOIN routes r ON r.id = b.route_id
     WHERE b.date = :endDay AND b.status = 'scheduled' AND r.origin = 'Omdurman' ${scope.sql}
     ORDER BY r.destination ASC, b.id ASC`,
    fleetParams,
  );
  const buses = (fleetRows || []).map((b) => ({
    id: num(b.id),
    bus_number: b.bus_number,
    total_seats: num(b.total_seats),
    seats_booked: num(b.seats_booked),
    seats_remaining: num(b.seats_remaining),
    origin: b.origin,
    destination: b.destination,
    departure_hm: b.departure_hm || null,
  }));
  let seat_capacity_total = 0;
  let seats_booked_aggregate = 0;
  for (const b of buses) {
    seat_capacity_total += b.total_seats;
    seats_booked_aggregate += Math.min(b.seats_booked, b.total_seats);
  }
  const fill_ratio_pct = seat_capacity_total > 0 ? Math.round(((seats_booked_aggregate / seat_capacity_total) * 100 + Number.EPSILON) * 10) / 10 : null;
  const sumParams = mergeScopeParams({ endDay }, scope.params);
  const [sumRows] = await pool.execute(
    `SELECT COUNT(*) AS bookings_count,
            SUM(CASE WHEN bk.lifecycle = 'reserved' THEN 1 ELSE 0 END) AS reserved_count,
            SUM(CASE WHEN bk.lifecycle = 'full' THEN 1 ELSE 0 END) AS full_count,
            SUM(CASE WHEN bk.payment_status = 'paid' THEN 1 ELSE 0 END) AS paid_count,
            SUM(CASE WHEN bk.payment_status = 'unpaid' THEN 1 ELSE 0 END) AS unpaid_count,
            SUM(CASE WHEN bk.payment_status = 'half' THEN 1 ELSE 0 END) AS half_count,
            SUM(CASE WHEN bk.booking_type = 'online' THEN 1 ELSE 0 END) AS online_count,
            SUM(CASE WHEN bk.booking_type = 'booth' THEN 1 ELSE 0 END) AS booth_count
     FROM bookings bk JOIN buses b ON b.id = bk.bus_id
     WHERE DATE(bk.created_at) = :endDay ${scope.sql}`,
    sumParams,
  );
  const s0 = sumRows?.[0] || {};
  const day_totals = {
    bookings_count: num(s0.bookings_count),
    reserved_count: num(s0.reserved_count),
    full_count: num(s0.full_count),
    paid_count: num(s0.paid_count),
    unpaid_count: num(s0.unpaid_count),
    half_count: num(s0.half_count),
    online_count: num(s0.online_count),
    booth_count: num(s0.booth_count),
  };
  const [routeRows] = await pool.execute(
    `SELECT r.destination AS destination, COUNT(*) AS bookings_count
     FROM bookings bk JOIN buses b ON b.id = bk.bus_id JOIN routes r ON r.id = b.route_id
     WHERE DATE(bk.created_at) = :endDay ${scope.sql}
     GROUP BY r.id, r.destination ORDER BY bookings_count DESC`,
    sumParams,
  );
  const [trendRows] = await pool.execute(
    `SELECT DATE(bk.created_at) AS d, COUNT(*) AS bookings_count
     FROM bookings bk JOIN buses b ON b.id = bk.bus_id
     WHERE DATE(bk.created_at) BETWEEN DATE_SUB(:endDay, INTERVAL ${interval} DAY) AND :endDay ${scope.sql}
     GROUP BY DATE(bk.created_at) ORDER BY d ASC`,
    sumParams,
  );
  const byTrend = {};
  for (const row of trendRows || []) {
    const k = isoDateKey(row.d);
    if (k) byTrend[k] = num(row.bookings_count);
  }
  const startTrend = addDaysYmd(endDay, -interval);
  const trend = [];
  let cur = startTrend;
  while (true) {
    trend.push({ date: cur, bookings: num(byTrend[cur]) });
    if (cur === endDay) break;
    cur = addDaysYmd(cur, 1);
    if (trend.length > spanDays + 5) break;
  }
  return {
    date: endDay,
    days: spanDays,
    fleet_day: { date: endDay, buses_on_network: buses.length, seat_capacity_total, seats_booked_aggregate, fill_ratio_pct, buses },
    day_totals,
    by_destination: (routeRows || []).map((r) => ({ destination: r.destination, bookings_count: num(r.bookings_count) })),
    trend,
  };
}

export async function getDaily(user, day, bus_id, limit, offset) {
  const scope = busOwnerScopeForUser(user);
  const where = ["b.date = :day"];
  const whereParams = mergeScopeParams({ day }, scope.params);
  if (scope.sql.trim()) {
    const cond = scope.sql.trim().replace(/^\s*AND\s+/i, "");
    if (cond) where.push(cond);
  }
  if (bus_id) {
    where.push("bk.bus_id = :bus_id");
    whereParams.bus_id = bus_id;
  }
  const [summaryRows] = await pool.execute(
    `SELECT COUNT(*) AS bookings_count,
            SUM(CASE WHEN bk.lifecycle = 'reserved' THEN 1 ELSE 0 END) AS reserved_count,
            SUM(CASE WHEN bk.lifecycle = 'full' THEN 1 ELSE 0 END) AS full_count,
            SUM(CASE WHEN bk.payment_status = 'paid' THEN 1 ELSE 0 END) AS paid_count,
            SUM(CASE WHEN bk.payment_status = 'unpaid' THEN 1 ELSE 0 END) AS unpaid_count,
            SUM(CASE WHEN bk.payment_status = 'half' THEN 1 ELSE 0 END) AS half_count
     FROM bookings bk JOIN buses b ON b.id = bk.bus_id WHERE ${where.join(" AND ")}`,
    whereParams,
  );
  const sRaw = summaryRows?.[0] || {};
  const summary = {
    bookings_count: num(sRaw.bookings_count),
    reserved_count: num(sRaw.reserved_count),
    full_count: num(sRaw.full_count),
    paid_count: num(sRaw.paid_count),
    unpaid_count: num(sRaw.unpaid_count),
    half_count: num(sRaw.half_count),
  };
  const [rows] = await pool.execute(
    `SELECT bk.id, bk.bus_id, bk.worker_id, bk.passenger_name, bk.passenger_phone, bk.passenger_email,
            bk.from_location, bk.to_location, rt.origin AS route_origin, rt.destination AS route_destination,
            bk.seat_number, bk.booking_type, bk.payment_status, bk.lifecycle, bk.created_at,
            b.date AS bus_date, b.departure_time AS bus_departure_time
     FROM bookings bk JOIN buses b ON b.id = bk.bus_id JOIN routes rt ON rt.id = b.route_id
     WHERE ${where.join(" AND ")} ORDER BY bk.created_at DESC, bk.id DESC LIMIT ${limit} OFFSET ${offset}`,
    whereParams,
  );
  return { date: day, summary, bookings: rows, page: { limit, offset, returned: rows.length } };
}
