/**
 * Utility functions for formatting dates and timestamps
 */

/**
 * Converts ISO 8601 timestamp to a readable format
 * @param timestamp - ISO 8601 timestamp string (e.g., "2025-09-20T11:28:38.827Z")
 * @param options - Formatting options
 * @returns Formatted date string
 */
export function formatTimestamp(
  timestamp: string, 
  options: {
    includeTime?: boolean;
    includeSeconds?: boolean;
    includeMilliseconds?: boolean;
    format?: 'short' | 'long' | 'relative';
  } = {}
): string {
  const {
    includeTime = true,
    includeSeconds = true,
    includeMilliseconds = false,
    format = 'short'
  } = options;

  try {
    const date = new Date(timestamp);
    
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    switch (format) {
      case 'relative':
        return getRelativeTime(date);
      
      case 'long':
        return formatLongDate(date, includeTime, includeSeconds, includeMilliseconds);
      
      case 'short':
      default:
        return formatShortDate(date, includeTime, includeSeconds, includeMilliseconds);
    }
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Invalid Date';
  }
}

/**
 * Formats date in short format (e.g., "Sep 20, 2025 11:28 AM")
 */
function formatShortDate(
  date: Date, 
  includeTime: boolean, 
  includeSeconds: boolean, 
  includeMilliseconds: boolean
): string {
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  if (!includeTime) {
    return dateStr;
  }

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };

  if (includeSeconds) {
    timeOptions.second = '2-digit';
  }

  if (includeMilliseconds) {
    timeOptions.fractionalSecondDigits = 3;
  }

  const timeStr = date.toLocaleTimeString('en-US', timeOptions);
  return `${dateStr} ${timeStr}`;
}

/**
 * Formats date in long format (e.g., "September 20, 2025 at 11:28:38 AM")
 */
function formatLongDate(
  date: Date, 
  includeTime: boolean, 
  includeSeconds: boolean, 
  includeMilliseconds: boolean
): string {
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (!includeTime) {
    return dateStr;
  }

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };

  if (includeSeconds) {
    timeOptions.second = '2-digit';
  }

  if (includeMilliseconds) {
    timeOptions.fractionalSecondDigits = 3;
  }

  const timeStr = date.toLocaleTimeString('en-US', timeOptions);
  return `${dateStr} at ${timeStr}`;
}

/**
 * Gets relative time (e.g., "2 minutes ago", "Just now")
 */
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return diffInSeconds <= 5 ? 'Just now' : `${diffInSeconds} seconds ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }

  // For older dates, fall back to short format
  return formatShortDate(date, true, false, false);
}

/**
 * Formats a timestamp for display in UI components
 * @param timestamp - ISO 8601 timestamp string
 * @returns Formatted string suitable for UI display
 */
export function formatForDisplay(timestamp: string): string {
  return formatTimestamp(timestamp, {
    includeTime: true,
    includeSeconds: false,
    includeMilliseconds: false,
    format: 'short'
  });
}

/**
 * Formats a timestamp for detailed logs or debugging
 * @param timestamp - ISO 8601 timestamp string
 * @returns Formatted string with full precision
 */
export function formatForLogs(timestamp: string): string {
  return formatTimestamp(timestamp, {
    includeTime: true,
    includeSeconds: true,
    includeMilliseconds: true,
    format: 'long'
  });
}

/**
 * Formats a timestamp as relative time (e.g., "2 minutes ago")
 * @param timestamp - ISO 8601 timestamp string
 * @returns Relative time string
 */
export function formatAsRelative(timestamp: string): string {
  return formatTimestamp(timestamp, {
    format: 'relative'
  });
}

/**
 * Formats a timestamp for date-only display
 * @param timestamp - ISO 8601 timestamp string
 * @returns Date string without time
 */
export function formatDateOnly(timestamp: string): string {
  return formatTimestamp(timestamp, {
    includeTime: false,
    format: 'short'
  });
}
