export const CAL_PER_ML_MIN = 1;
export const CAL_PER_ML_MAX = 1.5;

export function calorieRange(totalMl: number): { min: number; max: number } {
  return { min: totalMl * CAL_PER_ML_MIN, max: totalMl * CAL_PER_ML_MAX };
}
