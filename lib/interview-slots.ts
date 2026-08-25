export type TimeSlot = {
  id: string;
  start: string;
  end: string;
};

export const INTERVIEW_START_MINUTES = 9 * 60;
export const INTERVIEW_END_MINUTES = 21 * 60;
export const INTERVIEW_SLOT_STEP = 30;

function formatClock(totalMinutes: number) {
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const suffix = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

export const TIME_SLOTS: TimeSlot[] = Array.from(
  { length: (INTERVIEW_END_MINUTES - INTERVIEW_START_MINUTES) / INTERVIEW_SLOT_STEP },
  (_, index) => {
    const startMinutes = INTERVIEW_START_MINUTES + index * INTERVIEW_SLOT_STEP;
    return {
      id: `${String(Math.floor(startMinutes / 60)).padStart(2, "0")}:${String(startMinutes % 60).padStart(2, "0")}`,
      start: formatClock(startMinutes),
      end: formatClock(startMinutes + INTERVIEW_SLOT_STEP),
    };
  }
);

export function parseClockTime(value: string) {
  const match = String(value || "").trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3].toUpperCase();

  if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return null;
  if (meridiem === "AM" && hours === 12) hours = 0;
  if (meridiem === "PM" && hours !== 12) hours += 12;

  return hours * 60 + minutes;
}

export function isValidInterviewSlot(start: string, end: string) {
  const startMinutes = parseClockTime(start);
  const endMinutes = parseClockTime(end);
  if (startMinutes === null || endMinutes === null) return false;
  return (
    startMinutes >= INTERVIEW_START_MINUTES &&
    startMinutes < INTERVIEW_END_MINUTES &&
    startMinutes % INTERVIEW_SLOT_STEP === 0 &&
    endMinutes === startMinutes + INTERVIEW_SLOT_STEP
  );
}
