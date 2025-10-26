/**
 * Formats time remaining in a human-readable format
 * @param deadline - Unix timestamp in seconds
 * @returns Formatted string like "2 days 5 hours" or "3 hours 45 minutes"
 */
export function formatTimeRemaining(deadline: bigint): string {
  const now = Math.floor(Date.now() / 1000);
  const deadlineSeconds = Number(deadline);
  const diff = deadlineSeconds - now;

  if (diff <= 0) {
    return "Campaign ended";
  }

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);

  if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""} ${hours} hour${
      hours !== 1 ? "s" : ""
    }`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} ${minutes} minute${
      minutes !== 1 ? "s" : ""
    }`;
  } else {
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  }
}

/**
 * Gets short time display for compact views
 * @param deadline - Unix timestamp in seconds
 * @returns Formatted string like "2d" or "5h"
 */
export function formatTimeRemainingShort(deadline: bigint): string {
  const now = Math.floor(Date.now() / 1000);
  const deadlineSeconds = Number(deadline);
  const diff = deadlineSeconds - now;

  if (diff <= 0) {
    return "Ended";
  }

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);

  if (days > 0) {
    return `${days}d`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * Checks if campaign has ended
 * @param deadline - Unix timestamp in seconds
 * @returns true if campaign has ended
 */
export function hasEnded(deadline: bigint): boolean {
  const now = Math.floor(Date.now() / 1000);
  const deadlineSeconds = Number(deadline);
  return deadlineSeconds <= now;
}



