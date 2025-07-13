<template>
  <div class="f1-component-container">
    <!-- Professional Header -->
    <div class="f1-header">
      <div class="f1-header-content">
        <h2 class="title-gradient">
          TELEMETRY TRACK MAP
        </h2>
        <div class="racing-line w-24 mt-2"></div>
        <p class="f1-header-subtitle">Advanced circuit analysis with real telemetry data</p>
      </div>
      <div class="telemetry-display">
        <div class="text-xs uppercase tracking-wider">Telemetry</div>
        <div class="text-lg font-bold">MAP</div>
      </div>
    </div>

    <!-- Track Selection Interface -->
    <div class="f1-card">
      <div class="f1-card-content">
        <h3 class="f1-section-title">
          <div class="f1-section-indicator"></div>
          TELEMETRY PARAMETERS
        </h3>

        <div class="f1-form-grid">
          <div class="f1-form-field">
            <label class="f1-label">Season</label>
            <select v-model="searchParams.year" @change="clearResults" class="f1-select" :disabled="yearsLoading">
              <option value="" disabled>
                {{ yearsLoading ? 'Loading years...' : 'Select Season' }}
              </option>
              <option v-for="year in availableYears" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>

          <div class="f1-form-field">
            <label class="f1-label">Circuit</label>
            <select v-model="searchParams.circuit" @change="clearResults" class="f1-select" :disabled="circuitsLoading || !searchParams.year">
              <option value="" disabled>
                {{ circuitsLoading ? 'Loading circuits...' : !searchParams.year ? 'Select a year first' : 'Select Circuit' }}
              </option>
              <option v-for="circuit in getCircuitOptions()" :key="circuit.value" :value="circuit.value">
                {{ circuit.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="f1-button-container">
          <button @click="loadTrackMap" :disabled="loading || !canSearch" class="f1-button">
            <span v-if="loading" class="flex items-center">
              <div class="f1-spinner"></div>
              LOADING TELEMETRY...
            </span>
            <span v-else>ANALYZE TELEMETRY</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Telemetry Controls -->
    <div v-if="trackData" class="f1-card">
      <div class="f1-card-content">
        <h3 class="f1-section-title">
          <div class="f1-section-indicator"></div>
          VISUALIZATION MODE
        </h3>

        <div class="telemetry-controls">
          <button
            v-for="mode in visualizationModes"
            :key="mode.id"
            @click="currentMode = mode.id"
            :class="['telemetry-mode-btn', { 'active': currentMode === mode.id }]"
          >
            <div class="mode-icon">{{ mode.icon }}</div>
            <div class="mode-label">{{ mode.label }}</div>
            <div class="mode-color" :style="{ backgroundColor: mode.color }"></div>
          </button>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="f1-error animate-fade-in">
      <div class="flex items-center">
        <div class="f1-error-icon">
          <span class="f1-error-icon-content">!</span>
        </div>
        <div class="f1-error-content">
          <div class="f1-error-title">TELEMETRY DATA ERROR</div>
          <div class="f1-error-message">{{ error }}</div>
        </div>
      </div>
    </div>

    <!-- Track Visualization -->
    <div v-if="trackData" class="f1-results-container">
      <!-- Track Statistics -->
      <div class="f1-card">
        <div class="f1-card-content">
          <h4 class="f1-section-title">
            <div class="w-1 h-6 bg-gradient-to-t from-red-500 to-racing-orange rounded mr-3"></div>
            TELEMETRY STATISTICS
          </h4>

          <div class="f1-data-grid-4">
            <div class="f1-metric-card" style="--accent-color: #E10600;">
              <div class="f1-metric-header">
                <h5 class="f1-metric-title">Max Speed</h5>
                <div class="f1-metric-indicator indicator-red"></div>
              </div>
              <div class="f1-metric-value-2xl value-red">
                {{ Math.max(...trackData.additional_data.speed) }}
              </div>
              <div class="f1-metric-subtitle">km/h</div>
            </div>

            <div class="f1-metric-card" style="--accent-color: #FFD700;">
              <div class="f1-metric-header">
                <h5 class="f1-metric-title">Avg Speed</h5>
                <div class="f1-metric-indicator indicator-gold"></div>
              </div>
              <div class="f1-metric-value-2xl value-gold">
                {{ Math.round(trackData.additional_data.speed.reduce((a, b) => a + b, 0) / trackData.additional_data.speed.length) }}
              </div>
              <div class="f1-metric-subtitle">km/h</div>
            </div>

            <div class="f1-metric-card" style="--accent-color: #00D2BE;">
              <div class="f1-metric-header">
                <h5 class="f1-metric-title">Track Length</h5>
                <div class="f1-metric-indicator indicator-petronas"></div>
              </div>
              <div class="f1-metric-value-large value-petronas">
                {{ (trackData.track_length / 1000).toFixed(3) }}
              </div>
              <div class="f1-metric-subtitle">Kilometers</div>
            </div>

            <div class="f1-metric-card" style="--accent-color: #00FF7F;">
              <div class="f1-metric-header">
                <h5 class="f1-metric-title">Data Points</h5>
                <div class="f1-metric-indicator indicator-green"></div>
              </div>
              <div class="f1-metric-value-large value-green">
                {{ trackData.data_points }}
              </div>
              <div class="f1-metric-subtitle">Telemetry Points</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Advanced Track Visualization -->
      <div class="f1-card">
        <div class="f1-card-content">
          <h4 class="f1-section-title">
            <div class="w-1 h-6 bg-gradient-to-t from-racing-orange to-f1-gold rounded mr-3"></div>
            {{ getCurrentModeLabel() }} VISUALIZATION
          </h4>

          <div class="advanced-track-container">
            <svg
              ref="trackSvg"
              :viewBox="svgViewBox"
              class="advanced-track-svg"
              preserveAspectRatio="xMidYMid meet"
            >
              <!-- Advanced Track Path with Telemetry -->
              <path
                v-for="(segment, index) in trackSegments"
                :key="`segment-${index}`"
                :d="segment.path"
                fill="none"
                :stroke="segment.color"
                :stroke-width="segment.width"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="telemetry-segment"
                :style="{ filter: `drop-shadow(0 0 ${segment.glow}px ${segment.color})` }"
              />

              <!-- Start/Finish Line -->
              <circle
                v-if="trackData.coordinates.x.length > 0"
                :cx="trackData.coordinates.x[0]"
                :cy="trackData.coordinates.y[0]"
                r="20"
                fill="#FFD700"
                stroke="#E10600"
                stroke-width="4"
                class="start-finish-line animate-pulse"
              />

              <!-- Speed/Throttle Indicators -->
              <circle
                v-for="(point, index) in getKeyPoints()"
                :key="`point-${index}`"
                :cx="point.x"
                :cy="point.y"
                :r="point.radius"
                :fill="point.color"
                :stroke="point.strokeColor"
                :stroke-width="point.strokeWidth"
                class="telemetry-point"
                opacity="0.8"
              />
            </svg>

            <!-- Advanced Controls -->
            <div class="advanced-controls">
              <div class="control-group">
                <button @click="zoomIn" class="advanced-control-btn">+</button>
                <button @click="zoomOut" class="advanced-control-btn">-</button>
                <button @click="resetView" class="advanced-control-btn">⌂</button>
              </div>
            </div>

            <!-- Telemetry Legend -->
            <div class="telemetry-legend">
              <div class="legend-title">{{ getCurrentModeLabel() }}</div>
              <div v-if="currentMode === 'speed'" class="legend-gradient">
                <div class="gradient-bar speed-gradient"></div>
                <div class="gradient-labels">
                  <span>0 km/h</span>
                  <span>{{ Math.max(...trackData.additional_data.speed) }} km/h</span>
                </div>
              </div>
              <div v-else-if="currentMode === 'throttle'" class="legend-gradient">
                <div class="gradient-bar throttle-gradient"></div>
                <div class="gradient-labels">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
              <div v-else-if="currentMode === 'elevation'" class="legend-gradient">
                <div class="gradient-bar elevation-gradient"></div>
                <div class="gradient-labels">
                  <span>{{ Math.min(...trackData.coordinates.z) }}m</span>
                  <span>{{ Math.max(...trackData.coordinates.z) }}m</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAvailableYears } from '../composables/useAvailableYears'
import { useAvailableCircuits } from '../composables/useAvailableCircuits'
import f1ApiService, { type TrackMapData } from '../services/f1ApiService'

interface SearchParams {
  year: number
  circuit: string
}

interface TrackSegment {
  path: string
  color: string
  width: number
  glow: number
}

interface TelemetryPoint {
  x: number
  y: number
  radius: number
  color: string
  strokeColor: string
  strokeWidth: number
}

// Composables
const { availableYears, yearsLoading, getLatestYear } = useAvailableYears()
const { availableCircuits, circuitsLoading, loadAvailableCircuits, getCircuitOptions } = useAvailableCircuits()

// State
const searchParams = ref<SearchParams>({
  year: getLatestYear(),
  circuit: ''
})

const trackData = ref<TrackMapData | null>(null)
const loading = ref<boolean>(false)
const error = ref<string | null>(null)
const currentMode = ref<string>('speed')
const zoomLevel = ref<number>(1)

// Visualization modes
const visualizationModes = [
  { id: 'speed', label: 'SPEED', icon: '🏎️', color: '#E10600' },
  { id: 'throttle', label: 'THROTTLE', icon: '⚡', color: '#FFD700' },
  { id: 'elevation', label: 'ELEVATION', icon: '⛰️', color: '#00D2BE' },
  { id: 'combined', label: 'COMBINED', icon: '🌈', color: '#00FF7F' }
]

// Watchers
watch(() => searchParams.value.year, async (newYear) => {
  if (newYear) {
    searchParams.value.circuit = ''
    clearResults()
    await loadAvailableCircuits(newYear)
  }
}, { immediate: true })

// Computed
const canSearch = computed<boolean>(() => {
  return !!(searchParams.value.year && searchParams.value.circuit)
})

const svgViewBox = computed<string>(() => {
  if (!trackData.value?.coordinates) return '0 0 800 600'

  const { x, y } = trackData.value.coordinates
  if (x.length === 0 || y.length === 0) return '0 0 800 600'

  const minX = Math.min(...x)
  const maxX = Math.max(...x)
  const minY = Math.min(...y)
  const maxY = Math.max(...y)

  const width = maxX - minX
  const height = maxY - minY
  const padding = Math.max(width, height) * 0.1

  return `${minX - padding} ${minY - padding} ${width + 2 * padding} ${height + 2 * padding}`
})

const trackSegments = computed<TrackSegment[]>(() => {
  if (!trackData.value?.coordinates) return []

  const { x, y } = trackData.value.coordinates
  const { speed, throttle } = trackData.value.additional_data
  const { z } = trackData.value.coordinates

  const segments: TrackSegment[] = []

  for (let i = 0; i < x.length - 1; i++) {
    let color = '#FFFFFF'
    let width = 8
    let glow = 2

    if (currentMode.value === 'speed') {
      const speedRatio = speed[i] / Math.max(...speed)
      color = getSpeedColor(speedRatio)
      width = 6 + speedRatio * 8
      glow = speedRatio * 6
    } else if (currentMode.value === 'throttle') {
      const throttleRatio = throttle[i] / 100
      color = getThrottleColor(throttleRatio)
      width = 6 + throttleRatio * 6
      glow = throttleRatio * 4
    } else if (currentMode.value === 'elevation') {
      const elevationRatio = (z[i] - Math.min(...z)) / (Math.max(...z) - Math.min(...z))
      color = getElevationColor(elevationRatio)
      width = 6 + elevationRatio * 4
      glow = elevationRatio * 3
    } else if (currentMode.value === 'combined') {
      const speedRatio = speed[i] / Math.max(...speed)
      const throttleRatio = throttle[i] / 100
      color = getCombinedColor(speedRatio, throttleRatio)
      width = 6 + (speedRatio + throttleRatio) / 2 * 6
      glow = (speedRatio + throttleRatio) / 2 * 4
    }

    const path = `M ${x[i]} ${y[i]} L ${x[i + 1]} ${y[i + 1]}`
    segments.push({ path, color, width, glow })
  }

  return segments
})

// Methods
const getCurrentModeLabel = (): string => {
  const mode = visualizationModes.find(m => m.id === currentMode.value)
  return mode?.label || 'TRACK'
}

const getSpeedColor = (ratio: number): string => {
  // Gradient from blue (slow) to red (fast) - matching the CSS gradient
  const r = Math.round(255 * ratio)
  const g = 0
  const b = Math.round(255 * (1 - ratio))
  return `rgb(${r}, ${g}, ${b})`
}

const getThrottleColor = (ratio: number): string => {
  // Gradient from dark gray (no throttle) to gold (full throttle) - matching CSS
  if (ratio === 0) {
    return 'rgb(128, 128, 128)' // Gray for 0% throttle
  }
  // Interpolate between gray and gold
  const r = Math.round(128 + (255 - 128) * ratio)
  const g = Math.round(128 + (215 - 128) * ratio)
  const b = Math.round(128 + (0 - 128) * ratio)
  return `rgb(${r}, ${g}, ${b})`
}

const getElevationColor = (ratio: number): string => {
  // Gradient from cyan (low) to white (high) - matching CSS
  const r = Math.round(0 + 255 * ratio)
  const g = Math.round(210 + (255 - 210) * ratio)
  const b = Math.round(190 + (255 - 190) * ratio)
  return `rgb(${r}, ${g}, ${b})`
}

const getCombinedColor = (speedRatio: number, throttleRatio: number): string => {
  const r = Math.round(255 * speedRatio)
  const g = Math.round(255 * throttleRatio)
  const b = Math.round(255 * (1 - Math.max(speedRatio, throttleRatio)))
  return `rgb(${r}, ${g}, ${b})`
}

const getKeyPoints = (): TelemetryPoint[] => {
  if (!trackData.value?.coordinates || currentMode.value === 'combined') return []

  const { x, y } = trackData.value.coordinates
  const { speed, throttle } = trackData.value.additional_data
  const points: TelemetryPoint[] = []

  // Show key points every 20 data points
  for (let i = 0; i < x.length; i += 20) {
    if (currentMode.value === 'speed') {
      const speedRatio = speed[i] / Math.max(...speed)
      if (speedRatio > 0.8) { // Only show high speed points
        points.push({
          x: x[i],
          y: y[i],
          radius: 3 + speedRatio * 5,
          color: getSpeedColor(speedRatio),
          strokeColor: '#FFFFFF',
          strokeWidth: 1
        })
      }
    } else if (currentMode.value === 'throttle') {
      const throttleRatio = throttle[i] / 100
      if (throttleRatio < 0.2 || throttleRatio > 0.8) { // Show braking and full throttle
        points.push({
          x: x[i],
          y: y[i],
          radius: 2 + Math.abs(throttleRatio - 0.5) * 6,
          color: getThrottleColor(throttleRatio),
          strokeColor: throttleRatio < 0.2 ? '#FF0000' : '#00FF00',
          strokeWidth: 2
        })
      }
    }
  }

  return points
}

const loadTrackMap = async (): Promise<void> => {
  if (!canSearch.value) {
    error.value = 'Veuillez sélectionner une année et un circuit'
    return
  }

  loading.value = true
  error.value = null
  trackData.value = null

  try {
    const result = await f1ApiService.getTrackMap(
      searchParams.value.year,
      searchParams.value.circuit
    )
    trackData.value = result
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erreur lors du chargement des données de télémétrie'
  } finally {
    loading.value = false
  }
}

const clearResults = (): void => {
  trackData.value = null
  error.value = null
}

const zoomIn = (): void => {
  zoomLevel.value = Math.min(zoomLevel.value * 1.2, 3)
}

const zoomOut = (): void => {
  zoomLevel.value = Math.max(zoomLevel.value / 1.2, 0.5)
}

const resetView = (): void => {
  zoomLevel.value = 1
}
</script>

<style scoped>
.telemetry-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.telemetry-mode-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.telemetry-mode-btn:hover {
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.telemetry-mode-btn.active {
  border-color: #00D2BE;
  background: rgba(0, 210, 190, 0.1);
  box-shadow: 0 0 20px rgba(0, 210, 190, 0.3);
}

.mode-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.mode-label {
  font-size: 12px;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
}

.mode-color {
  width: 100%;
  height: 4px;
  border-radius: 2px;
}

.advanced-track-container {
  position: relative;
  width: 100%;
  height: 700px;
  background: radial-gradient(circle at center, rgba(0, 0, 0, 0.8) 0%, rgba(20, 20, 20, 0.9) 100%);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.advanced-track-svg {
  width: 100%;
  height: 100%;
}

.telemetry-segment {
  transition: all 0.2s ease;
}

.telemetry-point {
  transition: all 0.2s ease;
}

.telemetry-point:hover {
  transform: scale(1.2);
}

.advanced-controls {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.advanced-control-btn {
  width: 44px;
  height: 44px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-weight: bold;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.advanced-control-btn:hover {
  background: rgba(0, 210, 190, 0.8);
  border-color: #00D2BE;
  transform: scale(1.05);
}

.telemetry-legend {
  position: absolute;
  bottom: 16px;
  left: 16px;
  background: rgba(0, 0, 0, 0.9);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 10;
  min-width: 200px;
}

.legend-title {
  font-size: 14px;
  font-weight: bold;
  color: #00D2BE;
  margin-bottom: 12px;
  text-align: center;
}

.legend-gradient {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.gradient-bar {
  height: 8px;
  border-radius: 4px;
}

.speed-gradient {
  background: linear-gradient(to right, rgb(0, 0, 255), rgb(255, 0, 0));
}

.throttle-gradient {
  background: linear-gradient(to right, rgb(128, 128, 128), rgb(255, 215, 0));
}

.elevation-gradient {
  background: linear-gradient(to right, rgb(0, 210, 190), rgb(255, 255, 255));
}

.gradient-labels {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.8);
}

.start-finish-line {
  filter: drop-shadow(0 0 15px #FFD700);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.animate-pulse {
  animation: pulse 2s ease-in-out infinite;
}
</style>
