<template>
  <div class="f1-component-container">
    <!-- Professional Header -->
    <div class="f1-header">
      <div class="f1-header-content">
        <h2 class="title-gradient">
          TRACK VISUALIZATION
        </h2>
        <div class="racing-line w-24 mt-2"></div>
        <p class="f1-header-subtitle">Circuit layout and track analysis</p>
      </div>
      <div class="telemetry-display">
        <div class="text-xs uppercase tracking-wider">Circuit</div>
        <div class="text-lg font-bold">MAP</div>
      </div>
    </div>

    <!-- Track Selection Interface -->
    <div class="f1-card">
      <div class="f1-card-content">
        <h3 class="f1-section-title">
          <div class="f1-section-indicator"></div>
          TRACK PARAMETERS
        </h3>

        <div class="f1-form-grid">
          <div class="f1-form-field">
            <label class="f1-label">
              Season
            </label>
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
            <label class="f1-label">
              Circuit
            </label>
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
          <button @click="loadTrackVisualization" :disabled="loading || !canSearch" class="f1-button">
            <span v-if="loading" class="flex items-center">
              <div class="f1-spinner"></div>
              LOADING TRACK...
            </span>
            <span v-else>VISUALIZE TRACK</span>
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
          <div class="f1-error-title">TRACK DATA ERROR</div>
          <div class="f1-error-message">{{ error }}</div>
        </div>
      </div>
    </div>

    <!-- Track Visualization -->
    <div v-if="trackData" class="f1-results-container">
      <!-- Track Information Card -->
      <div class="f1-header-card f1-header-card-red">
        <div class="f1-header-info">
          <div>
            <h3 class="f1-header-title value-red">
              {{ trackData.circuit?.toUpperCase() || 'CIRCUIT' }} {{ trackData.year }}
            </h3>
            <p class="f1-header-description">
              Track Length: {{ formatTrackLength(trackData.track_length) }} km
            </p>
          </div>
          <div class="telemetry-display">
            <div class="text-xs">DATA POINTS</div>
            <div class="text-2xl font-bold">{{ trackData.data_points }}</div>
          </div>
        </div>
      </div>

      <!-- Track Statistics -->
      <div class="f1-card">
        <div class="f1-card-content">
          <h4 class="f1-section-title">
            <div class="w-1 h-6 bg-gradient-to-t from-red-500 to-racing-orange rounded mr-3"></div>
            TRACK STATISTICS
          </h4>

          <div class="f1-data-grid-3">
            <div class="f1-metric-card" style="--accent-color: #E10600;">
              <div class="f1-metric-header">
                <h5 class="f1-metric-title">Circuit</h5>
                <div class="f1-metric-indicator indicator-red"></div>
              </div>
              <div class="f1-metric-value value-red">
                {{ trackData.circuit || 'N/A' }}
              </div>
              <div class="f1-metric-subtitle">{{ trackData.year }}</div>
            </div>

            <div class="f1-metric-card" style="--accent-color: #FFD700;">
              <div class="f1-metric-header">
                <h5 class="f1-metric-title">Track Length</h5>
                <div class="f1-metric-indicator indicator-gold"></div>
              </div>
              <div class="f1-metric-value-2xl value-gold">
                {{ formatTrackLength(trackData.track_length) }}
              </div>
              <div class="f1-metric-subtitle">Kilometers</div>
            </div>

            <div class="f1-metric-card" style="--accent-color: #00D2BE;">
              <div class="f1-metric-header">
                <h5 class="f1-metric-title">Data Points</h5>
                <div class="f1-metric-indicator indicator-petronas"></div>
              </div>
              <div class="f1-metric-value-large value-petronas">
                {{ trackData.data_points }}
              </div>
              <div class="f1-metric-subtitle">Track Outline</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Track Visualization -->
      <div class="f1-card">
        <div class="f1-card-content">
          <h4 class="f1-section-title">
            <div class="w-1 h-6 bg-gradient-to-t from-racing-orange to-f1-gold rounded mr-3"></div>
            CIRCUIT LAYOUT
          </h4>

          <div class="track-visualization-container">
            <svg
              ref="trackSvg"
              :viewBox="svgViewBox"
              class="track-svg"
              preserveAspectRatio="xMidYMid meet"
            >
              <!-- Track Background -->
              <defs>
                <linearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#E10600;stop-opacity:0.8" />
                  <stop offset="50%" style="stop-color:#FFD700;stop-opacity:0.6" />
                  <stop offset="100%" style="stop-color:#00D2BE;stop-opacity:0.8" />
                </linearGradient>

                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              <!-- Track Outline -->
              <path
                :d="trackPath"
                fill="none"
                stroke="url(#trackGradient)"
                stroke-width="8"
                stroke-linecap="round"
                stroke-linejoin="round"
                filter="url(#glow)"
                class="track-path"
              />

              <!-- Start/Finish Line -->
              <circle
                v-if="trackData.track_outline.x.length > 0"
                :cx="trackData.track_outline.x[0]"
                :cy="trackData.track_outline.y[0]"
                r="15"
                fill="#FFD700"
                stroke="#E10600"
                stroke-width="3"
                class="start-finish-line animate-pulse"
              />

              <!-- Track Direction Arrow -->
              <circle
                v-if="trackData.track_outline.x.length > 10"
                :cx="trackData.track_outline.x[10]"
                :cy="trackData.track_outline.y[10]"
                r="8"
                fill="#00D2BE"
                class="direction-indicator animate-bounce"
              />
            </svg>

            <!-- Track Controls -->
            <div class="track-controls">
              <div class="track-control-group">
                <button @click="zoomIn" class="track-control-btn">
                  <span class="text-lg">+</span>
                </button>
                <button @click="zoomOut" class="track-control-btn">
                  <span class="text-lg">-</span>
                </button>
                <button @click="resetZoom" class="track-control-btn">
                  <span class="text-sm">Reset</span>
                </button>
              </div>
            </div>

            <!-- Track Legend -->
            <div class="track-legend">
              <div class="legend-item">
                <div class="legend-color bg-yellow-400"></div>
                <span>Start/Finish</span>
              </div>
              <div class="legend-item">
                <div class="legend-color bg-gradient-to-r from-red-600 via-yellow-400 to-cyan-400"></div>
                <span>Track Layout</span>
              </div>
              <div class="legend-item">
                <div class="legend-color bg-cyan-400"></div>
                <span>Direction</span>
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
import f1ApiService from '../services/f1ApiService'

interface TrackVisualizationData {
  circuit: string
  year: number
  track_outline: { x: number[]; y: number[] }
  track_length: number
  data_points: number
  telemetry?: {
    x: number[]
    y: number[]
    speed: number[]
    throttle: number[]
  }
}

interface SearchParams {
  year: number
  circuit: string
}

// Utiliser les composables partagés
const { availableYears, yearsLoading, getLatestYear } = useAvailableYears()
const { availableCircuits, circuitsLoading, loadAvailableCircuits, getCircuitOptions } = useAvailableCircuits()

const searchParams = ref<SearchParams>({
  year: getLatestYear(),
  circuit: ''
})

const trackData = ref<TrackVisualizationData | null>(null)
const loading = ref<boolean>(false)
const error = ref<string | null>(null)
const zoomLevel = ref<number>(1)
const trackSvg = ref<SVGElement | null>(null)

// Watcher pour charger les circuits quand l'année change
watch(() => searchParams.value.year, async (newYear) => {
  if (newYear) {
    searchParams.value.circuit = ''
    clearResults()
    await loadAvailableCircuits(newYear)
  }
}, { immediate: true })

const canSearch = computed<boolean>(() => {
  return !!(searchParams.value.year && searchParams.value.circuit)
})

// Calculer le viewBox SVG basé sur les coordonnées du tracé
const svgViewBox = computed<string>(() => {
  if (!trackData.value?.track_outline) return '0 0 800 600'

  const { x, y } = trackData.value.track_outline
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

// Générer le chemin SVG du tracé
const trackPath = computed<string>(() => {
  if (!trackData.value?.track_outline) return ''

  const { x, y } = trackData.value.track_outline
  if (x.length === 0 || y.length === 0) return ''

  let path = `M ${x[0]} ${y[0]}`

  for (let i = 1; i < x.length; i++) {
    path += ` L ${x[i]} ${y[i]}`
  }

  // Fermer le tracé
  path += ' Z'

  return path
})

const loadTrackVisualization = async (): Promise<void> => {
  if (!canSearch.value) {
    error.value = 'Veuillez sélectionner une année et un circuit'
    return
  }

  loading.value = true
  error.value = null
  trackData.value = null

  try {
    const result = await f1ApiService.getTrackVisualization(
      searchParams.value.year,
      searchParams.value.circuit
    )
    trackData.value = result
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement du tracé'
  } finally {
    loading.value = false
  }
}

const clearResults = (): void => {
  trackData.value = null
  error.value = null
}

const formatTrackLength = (length: number): string => {
  return (length / 1000).toFixed(3)
}

// Contrôles de zoom
const zoomIn = (): void => {
  zoomLevel.value = Math.min(zoomLevel.value * 1.2, 3)
}

const zoomOut = (): void => {
  zoomLevel.value = Math.max(zoomLevel.value / 1.2, 0.5)
}

const resetZoom = (): void => {
  zoomLevel.value = 1
}
</script>

<style scoped>
.track-visualization-container {
  position: relative;
  width: 100%;
  height: 600px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.track-svg {
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, rgba(225, 6, 0, 0.1) 0%, transparent 70%);
}

.track-path {
  transition: all 0.3s ease;
}

.track-path:hover {
  stroke-width: 10;
}

.start-finish-line {
  filter: drop-shadow(0 0 10px #FFD700);
}

.direction-indicator {
  filter: drop-shadow(0 0 5px #00D2BE);
}

.track-controls {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
}

.track-control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.track-control-btn {
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.track-control-btn:hover {
  background: rgba(225, 6, 0, 0.8);
  border-color: #E10600;
  transform: scale(1.05);
}

.track-legend {
  position: absolute;
  bottom: 16px;
  left: 16px;
  background: rgba(0, 0, 0, 0.8);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 10;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
}

.legend-item:last-child {
  margin-bottom: 0;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  flex-shrink: 0;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.animate-pulse {
  animation: pulse 2s ease-in-out infinite;
}

.animate-bounce {
  animation: bounce 1s ease-in-out infinite;
}
</style>
