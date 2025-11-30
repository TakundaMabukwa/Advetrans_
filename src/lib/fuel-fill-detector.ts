/**
 * Utility functions for detecting fuel fills from activity report data
 */

export interface FuelFill {
  time: string;
  amount: number; // in liters
  previousLevel: number; // percentage before fill
  newLevel: number; // percentage after fill
  siteId: string;
  siteName: string;
}

export interface Snapshot {
  time: string;
  fuel_level: number;
  engine_status: string;
  snapshot_type: string;
}

/**
 * Detects fuel fills from snapshots by looking for significant fuel level increases
 * A fuel fill is detected when fuel level increases by more than 10% within a reasonable time window
 */
export function detectFuelFills(snapshots: Snapshot[], siteId: string, siteName: string): FuelFill[] {
  if (!snapshots || snapshots.length < 2) {
    return [];
  }

  const fills: FuelFill[] = [];
  const sortedSnapshots = [...snapshots].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  
  for (let i = 1; i < sortedSnapshots.length; i++) {
    const current = sortedSnapshots[i];
    const previous = sortedSnapshots[i - 1];
    
    const fuelIncrease = current.fuel_level - previous.fuel_level;
    const timeDiff = new Date(current.time).getTime() - new Date(previous.time).getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    // Detect fuel fill: significant increase (>10%) within reasonable time window (<6 hours)
    if (fuelIncrease > 10 && hoursDiff < 6) {
      // Estimate fill amount based on tank capacity and percentage increase
      // This is an approximation - actual fill amount would need tank capacity data
      const estimatedFillAmount = fuelIncrease * 2.6; // Assuming average tank capacity of 260L
      
      fills.push({
        time: current.time,
        amount: estimatedFillAmount,
        previousLevel: previous.fuel_level,
        newLevel: current.fuel_level,
        siteId,
        siteName
      });
    }
  }
  
  return fills;
}

/**
 * Gets the most recent fuel fill for a site
 */
export function getLastFuelFill(snapshots: Snapshot[], siteId: string, siteName: string): FuelFill | null {
  const fills = detectFuelFills(snapshots, siteId, siteName);
  return fills.length > 0 ? fills[fills.length - 1] : null;
}

/**
 * Calculates fuel fill amount based on tank capacity and percentage increase
 */
export function calculateFillAmount(previousLevel: number, newLevel: number, tankCapacity: number): number {
  const percentageIncrease = newLevel - previousLevel;
  return (percentageIncrease / 100) * tankCapacity;
}

/**
 * Formats fuel fill information for display
 */
export function formatFuelFill(fill: FuelFill): {
  amount: string;
  time: string;
  levelChange: string;
} {
  return {
    amount: `${fill.amount.toFixed(1)}L`,
    time: new Date(fill.time).toLocaleString(),
    levelChange: `${fill.previousLevel.toFixed(1)}% → ${fill.newLevel.toFixed(1)}%`
  };
}
