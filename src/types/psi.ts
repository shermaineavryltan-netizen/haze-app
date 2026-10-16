/**
 * SG AirAlert - Types & Definitions for Singapore PSI & Air Quality Telemetry
 * Based on National Environment Agency (NEA) and Ministry of Health (MOH) standards.
 */

export type RegionKey = 'north' | 'south' | 'east' | 'west' | 'central' | 'national';

export interface RegionInfo {
  key: RegionKey;
  name: string;
  latitude: number;
  longitude: number;
  prominentEstates: string[];
  description: string;
}

export type HealthBand = 'good' | 'moderate' | 'unhealthy' | 'very_unhealthy' | 'hazardous';

export interface HealthBandConfig {
  band: HealthBand;
  label: string;
  min: number;
  max: number;
  colorHex: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  summary: string;
}

export type Pm25Band = 'normal' | 'elevated' | 'high' | 'very_high';

export interface Pm25BandConfig {
  band: Pm25Band;
  label: string;
  min: number;
  max: number;
  colorHex: string;
  textClass: string;
  bgClass: string;
  advice: string;
}

export interface MohAdvisory {
  category: 'healthy' | 'vulnerable' | 'chronic';
  groupLabel: string;
  shortAdvice: string;
  activityGuide: string;
  maskRecommendation: string;
}

export interface ReadingItem {
  timestamp: string;
  update_timestamp: string;
  readings: {
    psi_twenty_four_hourly: Record<RegionKey, number>;
    pm25_twenty_four_hourly: Record<RegionKey, number>;
    pm25_one_hourly: Record<RegionKey, number>;
    pm10_twenty_four_hourly: Record<RegionKey, number>;
    pm10_sub_index?: Record<RegionKey, number>;
    o3_eight_hour_max: Record<RegionKey, number>;
    no2_one_hour_max: Record<RegionKey, number>;
    so2_twenty_four_hourly: Record<RegionKey, number>;
    co_eight_hour_max: Record<RegionKey, number>;
  };
}

export interface NeaPsiResponse {
  region_metadata: Array<{
    name: string;
    label_location: {
      latitude: number;
      longitude: number;
    };
  }>;
  items: ReadingItem[];
  api_info?: {
    status: string;
  };
}

export interface HistoricalReadingPoint {
  timeStr: string;
  hour: number;
  psi: number;
  pm25: number;
}

export interface AlertRule {
  id: string;
  enabled: boolean;
  name: string;
  metric: 'psi' | 'pm25';
  threshold: number;
  region: RegionKey | 'all';
  soundEnabled: boolean;
  pushEnabled: boolean;
}

export interface AlertNotificationLog {
  id: string;
  timestamp: string;
  region: RegionKey;
  regionName: string;
  metric: 'psi' | 'pm25';
  value: number;
  threshold: number;
  healthBand: HealthBand;
  title: string;
  message: string;
  read: boolean;
}

export interface TransboundaryStatus {
  hotspotCountSumatra: number;
  hotspotCountKalimantan: number;
  windSpeedKmh: number;
  windDirectionDegrees: number;
  windDirectionText: string;
  hazeRiskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  monsoonSeason: string;
}
