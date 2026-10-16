import React, { useEffect, useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { ActiveAlertBanner } from './components/ActiveAlertBanner';
import { AirQualityTrendChart } from './components/AirQualityTrendChart';
import { AlertSettingsModal } from './components/AlertSettingsModal';
import { InteractiveSingaporeMap } from './components/InteractiveSingaporeMap';
import { MohHealthAdvisories } from './components/MohHealthAdvisories';
import { PollutantBreakdown } from './components/PollutantBreakdown';
import { RegionalGrid } from './components/RegionalGrid';
import { SimulationControls } from './components/SimulationControls';
import { TopBar } from './components/TopBar';
import {
  FormattedPsiData,
  fetchLiveNeaPsi,
  generate24HourHistory,
  getTransboundaryStatus,
} from './services/neaPsiService';
import { notificationService } from './services/notificationService';
import { AlertNotificationLog, AlertRule, RegionKey } from './types/psi';
import {
  SINGAPORE_REGIONS,
  getHealthBand,
  getPm25Band,
} from './utils/constants';

const DEFAULT_ALERT_RULES: AlertRule[] = [
  {
    id: 'rule-unhealthy-psi',
    enabled: true,
    name: 'Unhealthy PSI Threshold (≥ 100)',
    metric: 'psi',
    threshold: 100,
    region: 'all',
    soundEnabled: true,
    pushEnabled: true,
  },
  {
    id: 'rule-very-unhealthy-psi',
    enabled: true,
    name: 'Very Unhealthy Hazardous PSI (≥ 200)',
    metric: 'psi',
    threshold: 200,
    region: 'all',
    soundEnabled: true,
    pushEnabled: true,
  },
  {
    id: 'rule-high-pm25',
    enabled: true,
    name: 'Elevated 1-hr PM2.5 (≥ 55 µg/m³)',
    metric: 'pm25',
    threshold: 55,
    region: 'all',
    soundEnabled: true,
    pushEnabled: true,
  },
];

export default function App() {
  const [data, setData] = useState<FormattedPsiData | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<RegionKey>('south');
  const [rules, setRules] = useState<AlertRule[]>(() => {
    try {
      const saved = localStorage.getItem('sg_psi_alert_rules');
      return saved ? JSON.parse(saved) : DEFAULT_ALERT_RULES;
    } catch {
      return DEFAULT_ALERT_RULES;
    }
  });
  const [alertLogs, setAlertLogs] = useState<AlertNotificationLog[]>([]);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationPreset, setSimulationPreset] = useState<string | null>(null);
  const [isLoadingLive, setIsLoadingLive] = useState<boolean>(false);

  // Load initial live readings from NEA API
  const loadLiveReadings = useCallback(async () => {
    setIsLoadingLive(true);
    try {
      const liveData = await fetchLiveNeaPsi();
      setData(liveData);
      setIsSimulating(false);
      setSimulationPreset(null);

      // Evaluate alert rules against live readings
      const newAlerts = notificationService.evaluateRules(
        { psi: liveData.psi, pm25: liveData.pm25OneHourly },
        rules
      );
      if (newAlerts.length > 0) {
        setAlertLogs(prev => [...newAlerts, ...prev].slice(0, 20));
      }
    } finally {
      setIsLoadingLive(false);
    }
  }, [rules]);

  useEffect(() => {
    loadLiveReadings();
    // Auto-refresh live data every 3 minutes
    const interval = setInterval(() => {
      if (!isSimulating) {
        loadLiveReadings();
      }
    }, 180000);
    return () => clearInterval(interval);
  }, [loadLiveReadings, isSimulating]);

  // Save rules to localStorage
  const handleSaveRules = (newRules: AlertRule[]) => {
    setRules(newRules);
    try {
      localStorage.setItem('sg_psi_alert_rules', JSON.stringify(newRules));
    } catch {
      // Storage unavailable
    }
  };

  // Simulation handler for testing threshold alerts
  const handleApplySimulation = (
    presetName: string,
    simPsi: Record<RegionKey, number>,
    simPm25: Record<RegionKey, number>
  ) => {
    if (!data) return;
    setIsSimulating(true);
    setSimulationPreset(presetName);

    const transboundary = getTransboundaryStatus(simPsi.south || 70);
    const history = generate24HourHistory(simPsi, simPm25);

    const updatedData: FormattedPsiData = {
      ...data,
      source: 'fallback_cache',
      psi: simPsi,
      pm25OneHourly: simPm25,
      transboundary,
      history24h: history,
      updateTimestamp: new Date().toISOString(),
    };
    setData(updatedData);

    // Evaluate rules immediately under simulated state
    const firedAlerts = notificationService.evaluateRules(
      { psi: simPsi, pm25: simPm25 },
      rules,
      { forceTrigger: true }
    );
    if (firedAlerts.length > 0) {
      setAlertLogs(prev => [...firedAlerts, ...prev].slice(0, 20));
    }
  };

  const handleTriggerTestAlert = () => {
    notificationService.playAlertSound('test');
    notificationService.sendBrowserNotification(
      '🚨 Test Alert: Singapore South (PSI 138)',
      'Air quality has crossed into the UNHEALTHY threshold (138 PSI). Vulnerable individuals should reduce prolonged outdoor physical exertion.'
    );

    const testLog: AlertNotificationLog = {
      id: `test-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-SG', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      region: 'south',
      regionName: 'South Region (Sentosa)',
      metric: 'psi',
      value: 138,
      threshold: 100,
      healthBand: 'unhealthy',
      title: '🚨 Test Alert: South Region (Sentosa)',
      message:
        '24-hr PSI has breached test threshold (138 ≥ 100). Ministry of Health advisory advises vulnerable persons to minimize prolonged outdoor exertion.',
      read: false,
    };
    setAlertLogs(prev => [testLog, ...prev]);
  };

  const handleDismissAlert = (id: string) => {
    setAlertLogs(prev => prev.filter(a => a.id !== id));
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center gap-3 shadow-xl">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
          <div className="text-base font-semibold text-slate-100">
            Connecting to Singapore NEA Telemetry Network...
          </div>
          <div className="text-xs text-slate-400 font-mono">
            GET https://api.data.gov.sg/v1/environment/psi
          </div>
        </div>
      </div>
    );
  }

  const activePsi = data.psi[selectedRegion] || data.psi.national || 55;
  const activePm25 = data.pm25OneHourly[selectedRegion] || data.pm25OneHourly.national || 18;
  const currentHealthBand = getHealthBand(activePsi);
  const currentPm25Band = getPm25Band(activePm25);
  const hasUnhealthyBreach = Object.values(data.psi).some(val => val >= 101);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Bar strictly adhering to 3-zone contract */}
      <TopBar
        onOpenAlerts={() => setIsAlertModalOpen(true)}
        activeAlertCount={alertLogs.length}
        hasUnhealthyBreach={hasUnhealthyBreach}
      />

      {/* Prominent Active Alert Banner if any region is in Unhealthy / Warning condition */}
      <ActiveAlertBanner
        alerts={alertLogs}
        onDismiss={handleDismissAlert}
        onOpenSettings={() => setIsAlertModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Hero KPI Summary Strip */}
        <section className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Republic of Singapore</span>
                <span aria-hidden="true">•</span>
                <span>NEA Atmospheric Monitoring</span>
                <span aria-hidden="true">•</span>
                <span className="font-mono text-cyan-300">Sentosa & Maritime Focus</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
                Live PSI Radar & Air Quality Alert Monitor
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                Continuous real-time tracking of 24-hr Pollutant Standards Index (PSI) and 1-hr PM2.5 particulate concentrations with proactive push warnings for unhealthy thresholds.
              </p>
            </div>

            {/* Quick Hero Indicator Lockup */}
            <div className="flex flex-wrap items-center gap-4 shrink-0">
              {/* 24-hr PSI Primary KPI */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-4 min-w-[190px]">
                <div
                  className="w-3.5 h-12 rounded-full"
                  style={{ backgroundColor: currentHealthBand.colorHex }}
                />
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                    {SINGAPORE_REGIONS[selectedRegion].name} PSI
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-mono font-extrabold tabular-nums text-slate-100">
                      {activePsi}
                    </span>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded border"
                      style={{
                        backgroundColor: `${currentHealthBand.colorHex}18`,
                        borderColor: `${currentHealthBand.colorHex}44`,
                        color: currentHealthBand.colorHex,
                      }}
                    >
                      {currentHealthBand.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* 1-hr PM2.5 Secondary KPI */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-4 min-w-[170px]">
                <div
                  className="w-3.5 h-12 rounded-full"
                  style={{ backgroundColor: currentPm25Band.colorHex }}
                />
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                    1-hr PM2.5
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-mono font-extrabold tabular-nums text-slate-100">
                      {activePm25}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">µg/m³</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Simulation Toolbar for Testing Unhealthy Threshold Breaches */}
        <SimulationControls
          isSimulating={isSimulating}
          simulationPreset={simulationPreset}
          onApplyPreset={handleApplySimulation}
          onResetToLive={loadLiveReadings}
          onRefreshLive={loadLiveReadings}
          isLoadingLive={isLoadingLive}
          lastUpdated={data.updateTimestamp}
        />

        {/* Interactive Singapore Map Radar View */}
        <section id="map-section" className="space-y-3">
          <InteractiveSingaporeMap
            psiReadings={data.psi}
            pm25Readings={data.pm25OneHourly}
            selectedRegion={selectedRegion}
            onSelectRegion={setSelectedRegion}
            windSpeedKmh={data.transboundary.windSpeedKmh}
            windDirectionText={data.transboundary.windDirectionText}
          />
        </section>

        {/* 5-Region Observation Cards Grid */}
        <section>
          <RegionalGrid
            data={data}
            selectedRegion={selectedRegion}
            onSelectRegion={setSelectedRegion}
          />
        </section>

        {/* 24-Hour Historical Trend Chart */}
        <section id="trends-section">
          <AirQualityTrendChart
            history={data.history24h}
            selectedRegion={selectedRegion}
            onSelectRegion={setSelectedRegion}
          />
        </section>

        {/* Official MOH Health Advisory Matrix */}
        <section>
          <MohHealthAdvisories currentPsi={activePsi} />
        </section>

        {/* Criteria Pollutants Telemetry Matrix & Satellite Hotspots */}
        <section>
          <PollutantBreakdown
            data={data}
            selectedRegion={selectedRegion}
            onSelectRegion={setSelectedRegion}
          />
        </section>
      </main>

      {/* Alert Rules & Push Notification Modal */}
      <AlertSettingsModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        rules={rules}
        onSaveRules={handleSaveRules}
        onTriggerTestAlert={handleTriggerTestAlert}
      />

      {/* Clean Domain Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 sm:px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">SG AirAlert</span>
            <span aria-hidden="true">•</span>
            <span>Singapore Open Data Integration</span>
            <span aria-hidden="true">•</span>
            <span>NEA & MOH Standards</span>
          </div>
          <div>
            Data refreshes hourly according to National Environment Agency publications.
          </div>
        </div>
      </footer>
    </div>
  );
}
