import { HealthBand, HealthBandConfig, MohAdvisory, Pm25Band, Pm25BandConfig, RegionInfo, RegionKey } from '../types/psi';

export const SINGAPORE_REGIONS: Record<RegionKey, RegionInfo> = {
  national: {
    key: 'national',
    name: 'Singapore Island-wide',
    latitude: 1.3521,
    longitude: 103.8198,
    prominentEstates: ['All Singapore Territories', 'Island-wide Average'],
    description: 'Overall composite air quality reading across all regional observation stations in the Republic of Singapore.',
  },
  south: {
    key: 'south',
    name: 'South Region',
    latitude: 1.2800,
    longitude: 103.8200,
    prominentEstates: ['Sentosa Island', 'HarbourFront', 'Marina Bay', 'Tanjong Pagar', 'Telok Blangah', 'Pasir Panjang'],
    description: 'Southern coast corridor and islands including Sentosa, Keppel Bay, CBD financial district, and southern maritime straits.',
  },
  central: {
    key: 'central',
    name: 'Central Region',
    latitude: 1.3572,
    longitude: 103.8250,
    prominentEstates: ['Bishan', 'Toa Payoh', 'Ang Mo Kio', 'Orchard', 'Novena', 'Bukit Timah'],
    description: 'Heart of Singapore island featuring high-density residential hubs, nature reserves, and retail thoroughfares.',
  },
  north: {
    key: 'north',
    name: 'North Region',
    latitude: 1.4180,
    longitude: 103.8200,
    prominentEstates: ['Woodlands', 'Yishun', 'Sembawang', 'Admiralty', 'Mandai'],
    description: 'Northern border zones along Johor Straits, industrial estates, and Woodlands international checkpoint corridor.',
  },
  east: {
    key: 'east',
    name: 'East Region',
    latitude: 1.3570,
    longitude: 103.9400,
    prominentEstates: ['Changi Airport', 'Tampines', 'Bedok', 'Pasir Ris', 'Marine Parade'],
    description: 'Eastern coastal plains, Changi International aviation hub, and maritime transport corridors facing the Singapore Strait.',
  },
  west: {
    key: 'west',
    name: 'West Region',
    latitude: 1.3508,
    longitude: 103.7000,
    prominentEstates: ['Jurong Industrial', 'Tuas Port', 'Clementi', 'Bukit Batok', 'Boon Lay'],
    description: 'Western industrial basin, Tuas mega-port, high-tech manufacturing parks, and offshore Jurong Island petrochemical hub.',
  },
};

export const HEALTH_BANDS: Record<HealthBand, HealthBandConfig> = {
  good: {
    band: 'good',
    label: 'Good',
    min: 0,
    max: 50,
    colorHex: '#10B981', // emerald-500
    bgClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-500',
    summary: 'Air quality is considered satisfactory, and air pollution poses little or no risk.',
  },
  moderate: {
    band: 'moderate',
    label: 'Moderate',
    min: 51,
    max: 100,
    colorHex: '#0284C7', // sky-600
    bgClass: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    textClass: 'text-sky-400',
    borderClass: 'border-sky-500',
    summary: 'Air quality is acceptable; normal outdoor activities can continue for all groups.',
  },
  unhealthy: {
    band: 'unhealthy',
    label: 'Unhealthy',
    min: 101,
    max: 200,
    colorHex: '#F59E0B', // amber-500
    bgClass: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    textClass: 'text-amber-400',
    borderClass: 'border-amber-500',
    summary: 'Air quality has entered unhealthy levels. Vulnerable populations should minimize prolonged outdoor exertion.',
  },
  very_unhealthy: {
    band: 'very_unhealthy',
    label: 'Very Unhealthy',
    min: 201,
    max: 300,
    colorHex: '#EF4444', // red-500
    bgClass: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
    textClass: 'text-rose-400',
    borderClass: 'border-rose-500',
    summary: 'Significant health hazard. Everyone should avoid prolonged outdoor physical exertion.',
  },
  hazardous: {
    band: 'hazardous',
    label: 'Hazardous',
    min: 301,
    max: 500,
    colorHex: '#881337', // rose-900 / maroon
    bgClass: 'bg-purple-900/30 text-purple-300 border-purple-500/50',
    textClass: 'text-purple-300',
    borderClass: 'border-purple-600',
    summary: 'Emergency conditions. Stay indoors, keep windows closed, and use HEPA air purifiers.',
  },
};

export const PM25_BANDS: Record<Pm25Band, Pm25BandConfig> = {
  normal: {
    band: 'normal',
    label: 'Normal',
    min: 0,
    max: 12,
    colorHex: '#10B981',
    textClass: 'text-emerald-400',
    bgClass: 'bg-emerald-500/10 border-emerald-500/20',
    advice: 'Normal outdoor activities may be carried out.',
  },
  elevated: {
    band: 'elevated',
    label: 'Elevated',
    min: 13,
    max: 55,
    colorHex: '#0284C7',
    textClass: 'text-sky-400',
    bgClass: 'bg-sky-500/10 border-sky-500/20',
    advice: 'Normal outdoor activities can continue. Vulnerable individuals should monitor condition.',
  },
  high: {
    band: 'high',
    label: 'High',
    min: 56,
    max: 150,
    colorHex: '#F59E0B',
    textClass: 'text-amber-400',
    bgClass: 'bg-amber-500/10 border-amber-500/20',
    advice: 'Reduce strenuous outdoor exertion. Vulnerable persons stay indoors.',
  },
  very_high: {
    band: 'very_high',
    label: 'Very High',
    min: 151,
    max: 999,
    colorHex: '#EF4444',
    textClass: 'text-rose-400',
    bgClass: 'bg-rose-500/10 border-rose-500/20',
    advice: 'Avoid all outdoor activities. Wear N95 respirator if outdoor transit is essential.',
  },
};

export function getHealthBand(psi: number): HealthBandConfig {
  if (psi <= 50) return HEALTH_BANDS.good;
  if (psi <= 100) return HEALTH_BANDS.moderate;
  if (psi <= 200) return HEALTH_BANDS.unhealthy;
  if (psi <= 300) return HEALTH_BANDS.very_unhealthy;
  return HEALTH_BANDS.hazardous;
}

export function getPm25Band(pm25: number): Pm25BandConfig {
  if (pm25 <= 12) return PM25_BANDS.normal;
  if (pm25 <= 55) return PM25_BANDS.elevated;
  if (pm25 <= 150) return PM25_BANDS.high;
  return PM25_BANDS.very_high;
}

export function getMohAdvisoriesForPsi(psi: number): MohAdvisory[] {
  if (psi <= 50) {
    return [
      {
        category: 'healthy',
        groupLabel: 'Healthy Individuals',
        shortAdvice: 'Normal Activities',
        activityGuide: 'No activity restrictions. Ideal conditions for outdoor running, cycling, swimming, and sports.',
        maskRecommendation: 'No mask required.',
      },
      {
        category: 'vulnerable',
        groupLabel: 'Elderly, Pregnant Women & Children',
        shortAdvice: 'Normal Activities',
        activityGuide: 'Safe for all recreational park visits, outdoor walks, and school sports.',
        maskRecommendation: 'No mask required.',
      },
      {
        category: 'chronic',
        groupLabel: 'Chronic Lung & Heart Disease Patients',
        shortAdvice: 'Normal Activities',
        activityGuide: 'Safe to pursue daily routines. Ensure prescription inhalers/medications are accessible as customary.',
        maskRecommendation: 'No mask required.',
      },
    ];
  }
  if (psi <= 100) {
    return [
      {
        category: 'healthy',
        groupLabel: 'Healthy Individuals',
        shortAdvice: 'Normal Activities',
        activityGuide: 'Normal outdoor activities can continue. Air quality is acceptable for public recreation.',
        maskRecommendation: 'No mask required.',
      },
      {
        category: 'vulnerable',
        groupLabel: 'Elderly, Pregnant Women & Children',
        shortAdvice: 'Normal Activities',
        activityGuide: 'Normal activities can continue. Those exceptionally sensitive to airborne particulate should listen to their bodies.',
        maskRecommendation: 'Not required for general public.',
      },
      {
        category: 'chronic',
        groupLabel: 'Chronic Lung & Heart Disease Patients',
        shortAdvice: 'Normal Activities',
        activityGuide: 'Normal activities can continue. Keep personal quick-relief inhaler available.',
        maskRecommendation: 'Consider mask only if unusually irritated.',
      },
    ];
  }
  if (psi <= 200) {
    return [
      {
        category: 'healthy',
        groupLabel: 'Healthy Individuals',
        shortAdvice: 'Reduce Prolonged Outdoor Exertion',
        activityGuide: 'Reduce prolonged or strenuous outdoor physical exertion (e.g. intense marathon training, outdoor sports).',
        maskRecommendation: 'N95 respirator recommended only if prolonged outdoor strenuous work is unavoidable.',
      },
      {
        category: 'vulnerable',
        groupLabel: 'Elderly, Pregnant Women & Children',
        shortAdvice: 'Minimize Outdoor Exertion',
        activityGuide: 'Minimize outdoor activities. Move family recreational activities indoors or to air-conditioned facilities.',
        maskRecommendation: 'N95 mask recommended if going outdoors for extended periods.',
      },
      {
        category: 'chronic',
        groupLabel: 'Chronic Lung & Heart Disease Patients',
        shortAdvice: 'Avoid Outdoor Exertion',
        activityGuide: 'Avoid outdoor physical exertion. Stay indoors with windows closed and air purifiers operating.',
        maskRecommendation: 'Consult doctor before using N95 masks, as increased breathing effort may stress pulmonary function.',
      },
    ];
  }
  if (psi <= 300) {
    return [
      {
        category: 'healthy',
        groupLabel: 'Healthy Individuals',
        shortAdvice: 'Avoid Strenuous Outdoor Exertion',
        activityGuide: 'Avoid prolonged or strenuous outdoor physical exertion. Substitute with indoor gyms or light exercises.',
        maskRecommendation: 'Wear N95 respirator if spending several hours outdoors.',
      },
      {
        category: 'vulnerable',
        groupLabel: 'Elderly, Pregnant Women & Children',
        shortAdvice: 'Avoid Outdoor Activities',
        activityGuide: 'Avoid outdoor activities. Stay in well-ventilated or air-filtered indoor spaces.',
        maskRecommendation: 'N95 respirator recommended for any unavoidable outdoor movement.',
      },
      {
        category: 'chronic',
        groupLabel: 'Chronic Lung & Heart Disease Patients',
        shortAdvice: 'Stay Indoors',
        activityGuide: 'Stay indoors and minimize physical exertion. Seek immediate medical attention if experiencing chest tightness or wheezing.',
        maskRecommendation: 'Stay in air-conditioned room with air purifier running; consult physician.',
      },
    ];
  }
  // Hazardous (> 300)
  return [
    {
      category: 'healthy',
      groupLabel: 'Healthy Individuals',
      shortAdvice: 'Minimize Outdoor Activities',
      activityGuide: 'Minimize all outdoor activity. Non-essential outdoor operations should be halted or postponed.',
      maskRecommendation: 'N95 mask is strictly necessary for any outdoor transit.',
    },
    {
      category: 'vulnerable',
      groupLabel: 'Elderly, Pregnant Women & Children',
      shortAdvice: 'Stay Indoors at All Times',
      activityGuide: 'Stay indoors with doors and windows shut. Run air purifiers equipped with True HEPA filters.',
      maskRecommendation: 'N95 mask if outdoors.',
    },
    {
      category: 'chronic',
      groupLabel: 'Chronic Lung & Heart Disease Patients',
      shortAdvice: 'Strict Indoor Quarantine',
      activityGuide: 'Remain strictly indoors. Keep medication and oxygen standby if prescribed.',
      maskRecommendation: 'Remain indoors in air-purified room; consult medical professional.',
    },
  ];
}
