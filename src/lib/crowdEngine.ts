import { Spot, LiveSpotMetric, CrowdStatus } from '@/types';

/**
 * Computes deterministic yet lively real-time crowd metrics for a spot.
 * Factors in local time (UTC+9 for KR/JP), peak hour curves, weekend multipliers, and minute seeds.
 */
export function computeLiveSpotMetric(spot: Spot, targetDate: Date = new Date()): LiveSpotMetric {
  // All supported cities (Seoul, Jeju, Busan, Osaka, Kyoto) are in UTC+9 (KST/JST)
  const utc = targetDate.getTime() + targetDate.getTimezoneOffset() * 60000;
  const localTime = new Date(utc + 3600000 * 9);

  const hour = localTime.getHours();
  const minute = localTime.getMinutes();
  const day = localTime.getDay(); // 0 = Sun, 6 = Sat
  const isWeekend = day === 0 || day === 6;

  const isPeak = spot.peakHours.includes(hour);

  let rawScore = spot.baseScore;

  // Peak hour adjustment
  if (isPeak) {
    rawScore += 16;
  } else if (hour >= 0 && hour <= 6) {
    // Night/dawn lull
    rawScore -= 38;
  } else if (hour >= 7 && hour <= 9) {
    rawScore -= 18;
  } else if (hour >= 22) {
    rawScore -= 22;
  }

  // Weekend boost
  if (isWeekend) {
    rawScore += 9;
  }

  // Minute-based smooth micro-variation per spot
  const numId = typeof spot.id === 'number' ? spot.id : String(spot.id).charCodeAt(0) || 1;
  const seed = (numId * 17 + minute * 3) % 11 - 5;
  rawScore += seed;

  // Soft Capping (Non-linear decay above 75 to prevent 99 score saturation)
  let score: number;
  if (rawScore <= 75) {
    score = Math.max(12, rawScore);
  } else {
    // Diminishing returns: score smoothly asymptotes towards 97-98 without clamping identically
    const excess = rawScore - 75;
    const compressedExcess = Math.round(22 * (1 - Math.exp(-excess / 20)));
    score = Math.min(98, 75 + compressedExcess);
  }

  // 4-tier CrowdStatus (relaxed: 0-39, moderate: 40-69, crowded: 70-84, very_crowded: 85-100)
  let status: CrowdStatus = 'relaxed';
  if (score >= 85) {
    status = 'very_crowded';
  } else if (score >= 70) {
    status = 'crowded';
  } else if (score >= 40) {
    status = 'moderate';
  } else {
    status = 'relaxed';
  }

  // Wait time calculation based on category & score
  let waitTimeMinutes = 0;
  const isWaitHeavy = spot.category === 'food' || spot.category === 'shopping';
  const waitMultiplier = isWaitHeavy ? 1.2 : 0.7;

  if (status === 'very_crowded') {
    waitTimeMinutes = Math.round((35 + ((score - 85) / 13) * 35) * waitMultiplier);
  } else if (status === 'crowded') {
    waitTimeMinutes = Math.round((15 + ((score - 70) / 15) * 20) * waitMultiplier);
  } else if (status === 'moderate') {
    waitTimeMinutes = Math.round((5 + ((score - 40) / 30) * 10) * waitMultiplier);
  } else {
    waitTimeMinutes = Math.round(((score / 40) * 5) * waitMultiplier);
  }

  // Surge alert is only for spiking/very crowded locations
  const surgeAlert = score >= 90 || (isPeak && score >= 85);

  // Trend detection
  let trend: 'rising' | 'falling' | 'stable' = 'stable';
  const nextHour = (hour + 1) % 24;
  if (spot.peakHours.includes(nextHour) && !isPeak) {
    trend = 'rising';
  } else if (!spot.peakHours.includes(nextHour) && isPeak) {
    trend = 'falling';
  }

  return {
    ...spot,
    currentScore: score,
    status,
    waitTimeMinutes,
    surgeAlert,
    isPeak,
    trend,
  };
}

export function computeCityMetrics(spots: Spot[], cityId: string) {
  const citySpots = spots.filter((s) => s.city === cityId);
  const liveMetrics = citySpots.map((s) => computeLiveSpotMetric(s));

  const totalScore = liveMetrics.reduce((acc, curr) => acc + curr.currentScore, 0);
  const avgScore = liveMetrics.length > 0 ? Math.round(totalScore / liveMetrics.length) : 50;

  const packedCount = liveMetrics.filter((s) => s.status === 'packed').length;
  const relaxedCount = liveMetrics.filter((s) => s.status === 'relaxed').length;

  return {
    spots: liveMetrics,
    avgScore,
    packedCount,
    relaxedCount,
  };
}
