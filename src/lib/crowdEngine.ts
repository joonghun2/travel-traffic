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

  let score = spot.baseScore;

  // Peak hour adjustment
  if (isPeak) {
    score += 18;
  } else if (hour >= 0 && hour <= 6) {
    // Night/dawn lull
    score -= 40;
  } else if (hour >= 7 && hour <= 9) {
    score -= 15;
  } else if (hour >= 22) {
    score -= 20;
  }

  // Weekend boost
  if (isWeekend) {
    score += 10;
  }

  // Minute-based smooth micro-variation
  const numId = typeof spot.id === 'number' ? spot.id : String(spot.id).charCodeAt(0) || 1;
  const seed = (numId * 17 + minute * 3) % 11 - 5;
  score = Math.max(10, Math.min(99, score + seed));

  // Determine status level
  let status: CrowdStatus = 'relaxed';
  if (score > 70) {
    status = 'packed';
  } else if (score >= 40) {
    status = 'moderate';
  }

  // Wait time calculation based on category & score
  let waitTimeMinutes = 0;
  if (status === 'packed') {
    waitTimeMinutes = Math.round(25 + ((score - 70) / 30) * 55); // 25 - 80 mins
  } else if (status === 'moderate') {
    waitTimeMinutes = Math.round(5 + ((score - 40) / 30) * 15); // 5 - 20 mins
  } else {
    waitTimeMinutes = Math.round((score / 40) * 5); // 0 - 5 mins
  }

  // Surge alert if score is critically high or spiking
  const surgeAlert = score >= 82 || (isPeak && score >= 75);

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
