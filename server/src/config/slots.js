const SLOT_CAPACITY_BY_SIZE = {
  Small: 5,
  Medium: 4,
  Large: 3,
  XL: 2,
};

const buildDailySlots = () => {
  const slots = [];
  for (let hour = 8; hour <= 20; hour += 1) {
    const startHour = `${hour}`.padStart(2, "0");
    const endHour = `${hour + 1}`.padStart(2, "0");
    slots.push(`${startHour}:00-${endHour}:00`);
  }
  return slots;
};

const ALLOWED_SLOT_LABELS = new Set(buildDailySlots());

const isValidSlotLabel = (label) => ALLOWED_SLOT_LABELS.has(label);

module.exports = {
  SLOT_CAPACITY_BY_SIZE,
  buildDailySlots,
  isValidSlotLabel,
};
