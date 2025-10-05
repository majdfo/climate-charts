export type PollenRisk = { score: number; label: "Low" | "Medium" | "High"; color: string };
export type SeasonPhase = "Pre-season" | "In-season" | "Off-season";

export function computePollenRisk(args: {
  tMax: number | null;
  precipSum: number | null;
  windMax: number | null;
  humidityAvg: number | null;
}): PollenRisk {
  const { tMax, precipSum, windMax, humidityAvg } = args;
  let score = 0;

  if (tMax != null) {
    if (tMax >= 18 && tMax <= 30) score += 35;
    else if (tMax >= 10 && tMax < 18) score += 15;
    else if (tMax > 30) score += 10;
  }
  if (windMax != null) {
    if (windMax >= 25 && windMax <= 45) score += 25;
    else if (windMax > 45) score += 15;
    else if (windMax >= 10) score += 10;
  }
  if (humidityAvg != null) {
    if (humidityAvg >= 40 && humidityAvg <= 65) score += 20;
    else score += 8;
  }
  if (precipSum != null) {
    if (precipSum >= 3) score -= 25;
    else if (precipSum >= 1) score -= 10;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  if (score >= 70) return { score, label: "High", color: "#ef4444" };
  if (score >= 40) return { score, label: "Medium", color: "#f59e0b" };
  return { score, label: "Low", color: "#16a34a" };
}

export function computeSeasonPhase(
  date: Date,
  start = { m: 2, d: 15 },
  end = { m: 6, d: 15 }
): { phase: SeasonPhase; progressPct: number } {
  const y = date.getFullYear();
  const startDate = new Date(Date.UTC(y, start.m - 1, start.d));
  const endDate = new Date(Date.UTC(y, end.m - 1, end.d));
  const preWindow = new Date(startDate.getTime() - 21 * 86400000);

  let phase: SeasonPhase = "Off-season";
  let progressPct = 0;

  if (date < preWindow) {
    phase = "Off-season";
  } else if (date >= preWindow && date < startDate) {
    phase = "Pre-season";
    progressPct =
      ((date.getTime() - preWindow.getTime()) / (startDate.getTime() - preWindow.getTime())) * 100;
  } else if (date >= startDate && date <= endDate) {
    phase = "In-season";
    progressPct =
      ((date.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 100;
  } else {
    phase = "Off-season";
    progressPct = 100;
  }

  return { phase, progressPct: Math.max(0, Math.min(100, Math.round(progressPct))) };
}
