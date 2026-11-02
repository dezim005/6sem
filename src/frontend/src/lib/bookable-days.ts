import type { AvailabilitySlot, ParkingSpot, Reservation } from "@/types";

const MAX_DAYS = 400;

/** Início do dia de calendário, no mesmo critério da API (meia-noite UTC). */
export function apiDayStart(day: Date): Date {
  return new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0));
}

/** Fim do dia de calendário, no mesmo critério da API (23:59:59.999 UTC). */
export function apiDayEnd(day: Date): Date {
  return new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999));
}

function utcBounds(value: Date | string): { start: Date; end: Date } {
  const date = new Date(value);
  return {
    start: new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0)),
    end: new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999)),
  };
}

function rangesOverlap(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
  return startA.getTime() <= endB.getTime() && endA.getTime() >= startB.getTime();
}

function dayFitsAvailability(day: Date, slots: AvailabilitySlot[]): boolean {
  const start = apiDayStart(day);
  const end = apiDayEnd(day);
  return slots.some((slot) => {
    const slotStart = utcBounds(slot.startTime).start;
    const slotEnd = utcBounds(slot.endTime).end;
    return start.getTime() >= slotStart.getTime() && end.getTime() <= slotEnd.getTime();
  });
}

function dayConflictsReservation(day: Date, reservations: Reservation[]): boolean {
  const start = apiDayStart(day);
  const end = apiDayEnd(day);
  return reservations.some((reservation) => {
    const resStart = utcBounds(reservation.startTime).start;
    const resEnd = utcBounds(reservation.endTime).end;
    return rangesOverlap(start, end, resStart, resEnd);
  });
}

export function isCalendarDayBookable(
  day: Date,
  slots: AvailabilitySlot[] | undefined,
  reservations: Reservation[],
  today: Date = new Date()
): boolean {
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  if (dayStart.getTime() < todayStart.getTime()) return false;
  if (!slots || slots.length === 0) return false;
  if (!dayFitsAvailability(day, slots)) return false;
  return !dayConflictsReservation(day, reservations);
}

export function rangeIsBookable(
  from: Date,
  to: Date,
  slots: AvailabilitySlot[] | undefined,
  reservations: Reservation[]
): boolean {
  if (!slots || slots.length === 0) return false;
  const start = apiDayStart(from);
  const end = apiDayEnd(to);
  if (end.getTime() < start.getTime()) return false;

  const fitsSlot = slots.some((slot) => {
    const slotStart = utcBounds(slot.startTime).start;
    const slotEnd = utcBounds(slot.endTime).end;
    return start.getTime() >= slotStart.getTime() && end.getTime() <= slotEnd.getTime();
  });
  if (!fitsSlot) return false;

  return !reservations.some((reservation) => {
    const resStart = utcBounds(reservation.startTime).start;
    const resEnd = utcBounds(reservation.endTime).end;
    return rangesOverlap(start, end, resStart, resEnd);
  });
}

function eachSlotCalendarDay(slot: AvailabilitySlot): Date[] {
  const start = utcBounds(slot.startTime).start;
  const end = utcBounds(slot.endTime).end;
  const days: Date[] = [];
  const cursor = new Date(start);
  let guard = 0;
  while (cursor.getTime() <= end.getTime() && guard < MAX_DAYS) {
    days.push(new Date(cursor.getUTCFullYear(), cursor.getUTCMonth(), cursor.getUTCDate()));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    guard += 1;
  }
  return days;
}

export function hasBookableDay(spot: ParkingSpot, reservations: Reservation[]): boolean {
  if (!spot.availability || spot.availability.length === 0) return false;
  const spotReservations = reservations.filter((reservation) => reservation.spotId === spot.id);
  return spot.availability.some((slot) =>
    eachSlotCalendarDay(slot).some((day) =>
      isCalendarDayBookable(day, spot.availability, spotReservations)
    )
  );
}
