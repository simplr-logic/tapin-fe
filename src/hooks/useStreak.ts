function getPrevWorkingDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() - 1);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() - 1);
  return d.toLocaleDateString("en-CA");
}

// Walk back `lookback` working days; seal any with zero logs so retroactive
// entries can't heal a gap that already passed.
export function buildSealedBreaks(
  allLogs: Record<string, number>,
  existing: Set<string>,
  lookback = 120
): Set<string> {
  const today = new Date().toLocaleDateString("en-CA");
  const breaks = new Set(existing);
  let d = getPrevWorkingDay(today);
  for (let i = 0; i < lookback; i++) {
    if ((allLogs[d] ?? 0) === 0) breaks.add(d);
    d = getPrevWorkingDay(d);
  }
  return breaks;
}

// Consecutive working days with non-zero logged hours, ending at today.
// If today has no logs yet, starts from the previous working day (grace period).
// sealedBreaks: dates permanently treated as zero regardless of retroactive logs.
export function computeStreak(allLogs: Record<string, number>, sealedBreaks: Set<string>): number {
  const today = new Date().toLocaleDateString("en-CA");
  let d = (allLogs[today] ?? 0) > 0 && !sealedBreaks.has(today) ? today : getPrevWorkingDay(today);
  if ((allLogs[d] ?? 0) === 0 || sealedBreaks.has(d)) return 0;
  let count = 0;
  while ((allLogs[d] ?? 0) > 0 && !sealedBreaks.has(d)) {
    count++;
    d = getPrevWorkingDay(d);
  }
  return count;
}
