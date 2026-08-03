import { MealSlot } from "@/generated/prisma/browser";

export const MEAL_SLOTS: MealSlot[] = [
  MealSlot.OVERNIGHT,
  MealSlot.BREAKFAST,
  MealSlot.LUNCH,
  MealSlot.DINNER,
  MealSlot.EVENING,
];

export const MEAL_SLOT_LABELS: Record<MealSlot, string> = {
  OVERNIGHT: "Overnight",
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
  EVENING: "Evening",
};

export function isMealSlot(value: unknown): value is MealSlot {
  return typeof value === "string" && (MEAL_SLOTS as string[]).includes(value);
}

export function getMealSlotForHour(hour: number): MealSlot {
  if (hour < 7) return MealSlot.OVERNIGHT;
  if (hour < 11) return MealSlot.BREAKFAST;
  if (hour < 16) return MealSlot.LUNCH;
  if (hour < 21) return MealSlot.DINNER;
  return MealSlot.EVENING;
}

export function getMealSlotForTime(date: Date): MealSlot {
  return getMealSlotForHour(date.getHours());
}
