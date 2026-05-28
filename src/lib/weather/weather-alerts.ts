/**
 * Weather Alerts
 * Weather alert generation and management for astronomical observations
 */

export type AlertSeverity = 'info' | 'watch' | 'warning' | 'emergency';

export type AlertCategory =
  | 'visibility'
  | 'temperature'
  | 'precipitation'
  | 'wind'
  | 'cloud_cover'
  | 'astronomical';

export interface WeatherAlert {
  id: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  description: string;
  active: boolean;
  timestamp: number;
  expiresAt?: number;
}

export interface AlertCriteria {
  cloudCoverThreshold?: number;
  temperatureMin?: number;
  temperatureMax?: number;
  windSpeedMax?: number;
  minVisibility?: number;
}

let generatedAlerts: WeatherAlert[] = [];

const ALERT_MESSAGES: Record<AlertCategory, { title: string; description: string }> = {
  visibility: {
    title: 'Low Visibility Advisory',
    description: 'Reduced visibility conditions may affect astronomical observations.',
  },
  temperature: {
    title: 'Temperature Alert',
    description: 'Extreme temperatures may impact equipment performance.',
  },
  precipitation: {
    title: 'Precipitation Warning',
    description: 'Precipitation expected. Amateur astronomy sessions may be affected.',
  },
  wind: {
    title: 'Wind Advisory',
    description: 'High wind speeds may cause image distortion and equipment instability.',
  },
  cloud_cover: {
    title: 'Cloud Cover Alert',
    description: 'Significant cloud cover expected. Observation conditions poor.',
  },
  astronomical: {
    title: 'Astronomical Event Alert',
    description: 'An astronomical event is occurring. Weather conditions may impact viewing.',
  },
};

/**
 * Generate a unique alert ID
 */
function createAlertId(): string {
  return `alert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create a weather alert for a specific category
 */
export function createAlert(
  category: AlertCategory,
  severity: AlertSeverity = 'info',
  expiresAt?: number
): WeatherAlert {
  const messages = ALERT_MESSAGES[category];
  return {
    id: createAlertId(),
    category,
    severity,
    title: messages.title,
    description: messages.description,
    active: true,
    timestamp: Date.now(),
    expiresAt,
  };
}

/**
 * Generate weather alerts based on criteria
 */
export function generateAlerts(criteria?: AlertCriteria): WeatherAlert[] {
  const now = Date.now();
  const alerts: WeatherAlert[] = [];

  // Generate alerts based on provided criteria
  if (criteria?.cloudCoverThreshold !== undefined) {
    alerts.push({
      id: createAlertId(),
      category: 'cloud_cover',
      severity: criteria.cloudCoverThreshold > 70 ? 'warning' : 'info',
      title: 'Cloud Cover Alert',
      description: `Cloud cover at ${criteria.cloudCoverThreshold}%. Observation conditions ${
        criteria.cloudCoverThreshold > 50 ? 'suboptimal' : 'acceptable'
      }.`,
      active: true,
      timestamp: now,
      expiresAt: now + 3600000, // 1 hour
    });
  }

  if (criteria?.temperatureMin !== undefined || criteria?.temperatureMax !== undefined) {
    alerts.push({
      id: createAlertId(),
      category: 'temperature',
      severity: 'info',
      title: 'Temperature Alert',
      description: `Temperature range: ${criteria.temperatureMin ?? 'N/A'}°C to ${criteria.temperatureMax ?? 'N/A'}°C.`,
      active: true,
      timestamp: now,
    });
  }

  if (criteria?.windSpeedMax !== undefined) {
    const severity = criteria.windSpeedMax > 30 ? 'warning' : criteria.windSpeedMax > 15 ? 'watch' : 'info';
    alerts.push({
      id: createAlertId(),
      category: 'wind',
      severity,
      title: 'Wind Advisory',
      description: `Wind speeds up to ${criteria.windSpeedMax} km/h expected. Telescope stability may be affected.`,
      active: true,
      timestamp: now,
    });
  }

  generatedAlerts = alerts;
  return alerts;
}

/**
 * Get weather alerts
 * Returns generated alerts if available, otherwise creates default alerts
 */
export function getAlerts(): WeatherAlert[] {
  if (generatedAlerts.length > 0) {
    return generatedAlerts;
  }

  // Generate default set of alerts
  const now = Date.now();
  return [
    {
      id: createAlertId(),
      category: 'astronomical',
      severity: 'info',
      title: 'Astronomical Conditions Summary',
      description: 'Weather alerts are currently being generated. Check back for updates.',
      active: true,
      timestamp: now,
      expiresAt: now + 1800000, // 30 minutes
    },
  ];
}

/**
 * Get alerts by severity level
 */
export function getAlertsBySeverity(severity: AlertSeverity): WeatherAlert[] {
  return getAlerts().filter((alert) => alert.severity === severity);
}

/**
 * Get active alerts only
 */
export function getActiveAlerts(): WeatherAlert[] {
  const now = Date.now();
  return getAlerts().filter((alert) => alert.active && (!alert.expiresAt || alert.expiresAt > now));
}

/**
 * Dismiss an alert by ID
 */
export function dismissAlert(alertId: string): boolean {
  const index = generatedAlerts.findIndex((alert) => alert.id === alertId);
  if (index !== -1) {
    generatedAlerts[index].active = false;
    return true;
  }
  return false;
}

/**
 * Clear all generated alerts
 */
export function clearAlerts(): void {
  generatedAlerts = [];
}

/**
 * Check if there are any active alerts
 */
export function hasActiveAlerts(): boolean {
  return getActiveAlerts().length > 0;
}

/**
 * Get alert statistics
 */
export function getAlertStats(): {
  total: number;
  active: number;
  bySeverity: Record<AlertSeverity, number>;
} {
  const alerts = getAlerts();
  const active = alerts.filter((a) => a.active).length;
  const bySeverity: Record<AlertSeverity, number> = {
    info: 0,
    watch: 0,
    warning: 0,
    emergency: 0,
  };

  for (const alert of alerts) {
    bySeverity[alert.severity]++;
  }

  return {
    total: alerts.length,
    active,
    bySeverity,
  };
}
