<template>
  <div class="f1-component-container">
    <!-- Professional Header with Racing Aesthetics -->
    <div class="f1-header">
      <div class="f1-header-content">
        <h2 class="title-gradient">
          FASTEST LAP ANALYSIS
        </h2>
        <div class="racing-line w-24 mt-2"></div>
        <p class="f1-header-subtitle">Performance telemetry and lap time analysis</p>
      </div>
      <div class="telemetry-display">
        <div class="text-xs uppercase tracking-wider">Live Data</div>
        <div class="text-lg font-bold">{{ new Date().toLocaleTimeString() }}</div>
      </div>
    </div>

    <!-- Enhanced Search Interface -->
    <div class="f1-card">
      <div class="f1-card-content">
        <h3 class="f1-section-title">
          <div class="f1-section-indicator"></div>
          SEARCH PARAMETERS
        </h3>

        <div class="f1-form-grid">
          <div class="f1-form-field">
            <label class="f1-label">
              Driver Code
            </label>
            <input
              v-model="searchParams.driverCode"
              type="text"
              placeholder="VER, HAM, LEC..."
              @input="clearResults"
              class="f1-input"
            />
          </div>

          <div class="f1-form-field">
            <label class="f1-label">
              Season
            </label>
            <input
              v-model="searchParams.year"
              type="number"
              min="2018"
              :max="new Date().getFullYear()"
              @input="clearResults"
              class="f1-input"
            />
          </div>

          <div class="f1-form-field">
            <label class="f1-label">
              Circuit
            </label>
            <input
              v-model="searchParams.circuit"
              type="text"
              placeholder="monza, silverstone..."
              @input="clearResults"
              class="f1-input"
            />
          </div>

          <div class="f1-form-field">
            <label class="f1-label">
              Session Type
            </label>
            <select v-model="searchParams.session" @change="clearResults" class="f1-select">
              <option value="">Select Session</option>
              <option value="practice1">Practice 1</option>
              <option value="practice2">Practice 2</option>
              <option value="practice3">Practice 3</option>
              <option value="qualifying">Qualifying</option>
              <option value="race">Race</option>
            </select>
          </div>
        </div>

        <div class="f1-button-container">
          <button @click="searchFastestLap" :disabled="loading || !canSearch" class="f1-button">
            <span v-if="loading" class="flex items-center">
              <div class="f1-spinner"></div>
              ANALYZING LAP DATA...
            </span>
            <span v-else>LOAD FASTEST LAP</span>
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
          <div class="f1-error-title">LAP DATA ERROR</div>
          <div class="f1-error-message">{{ error }}</div>
        </div>
      </div>
    </div>

    <!-- Fastest Lap Results -->
    <div v-if="lapData" class="f1-results-container">
      <!-- Lap Header Card -->
      <div class="f1-header-card f1-header-card-red">
        <div class="f1-header-info">
          <div>
            <h3 class="f1-header-title value-red">
              FASTEST LAP RECORD
            </h3>
            <p class="f1-header-description">
              {{ lapData.driver_name || searchParams.driverCode }} - {{ searchParams.circuit?.toUpperCase() }} {{ searchParams.year }}
            </p>
          </div>
          <div class="telemetry-display">
            <div class="text-xs">FASTEST</div>
            <div class="text-2xl font-bold">{{ lapData.lap_time || 'N/A' }}</div>
          </div>
        </div>
      </div>

      <!-- Lap Performance Metrics -->
      <div class="f1-card">
        <div class="f1-card-content">
          <h4 class="f1-section-title">
            <div class="w-1 h-6 bg-gradient-to-t from-f1-red to-racing-orange rounded mr-3"></div>
            LAP PERFORMANCE
          </h4>

          <div class="f1-data-grid">
            <div class="f1-metric-card championship-gold" style="--accent-color: #FFD700;">
              <div class="f1-metric-header">
                <h5 class="f1-metric-title">Lap Time</h5>
                <div class="f1-metric-indicator indicator-gold"></div>
              </div>
              <div class="f1-metric-value-2xl value-gold font-mono">
                {{ lapData.lap_time || 'N/A' }}
              </div>
              <div class="f1-metric-subtitle">Personal Best</div>
            </div>

            <div class="f1-metric-card speed-indicator" style="--accent-color: #E10600;">
              <div class="f1-metric-header">
                <h5 class="f1-metric-title">Top Speed</h5>
                <div class="f1-metric-indicator indicator-red"></div>
              </div>
              <div class="f1-metric-value-large value-red">
                {{ lapData.top_speed || 'N/A' }}
              </div>
              <div class="f1-metric-subtitle">km/h</div>
            </div>

            <div class="f1-metric-card" style="--accent-color: #39FF14;">
              <div class="f1-metric-header">
                <h5 class="f1-metric-title">Average Speed</h5>
                <div class="f1-metric-indicator indicator-green"></div>
              </div>
              <div class="f1-metric-value-large value-green">
                {{ lapData.average_speed || 'N/A' }}
              </div>
              <div class="f1-metric-subtitle">km/h</div>
            </div>

            <div class="f1-metric-card" style="--accent-color: #00D4FF;">
              <div class="f1-metric-header">
                <h5 class="f1-metric-title">Lap Number</h5>
                <div class="f1-metric-indicator indicator-blue"></div>
              </div>
              <div class="f1-metric-value-large value-blue">
                {{ lapData.lap_number || 'N/A' }}
              </div>
              <div class="f1-metric-subtitle">Race Lap</div>
            </div>

            <div class="f1-metric-card" style="--accent-color: #9932CC;">
              <div class="f1-metric-header">
                <h5 class="f1-metric-title">Position</h5>
                <div class="f1-metric-indicator indicator-purple"></div>
              </div>
              <div class="f1-metric-value-large value-purple">
                {{ lapData.position || 'N/A' }}
              </div>
              <div class="f1-metric-subtitle">Track Position</div>
            </div>

            <div class="f1-metric-card" style="--accent-color: #FF8C00;">
              <div class="f1-metric-header">
                <h5 class="f1-metric-title">Gap to Leader</h5>
                <div class="f1-metric-indicator indicator-orange"></div>
              </div>
              <div class="f1-metric-value">
                {{ lapData.gap_to_leader || 'N/A' }}
              </div>
              <div class="f1-metric-subtitle">Time Difference</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import f1ApiService, { type FastestLapData } from '../services/f1ApiService'

interface SearchParams {
  driverCode: string
  year: number
  circuit: string
  session: string
}

const searchParams = ref<SearchParams>({
  driverCode: '',
  year: new Date().getFullYear(),
  circuit: '',
  session: ''
})

const fastestLapData = ref<FastestLapData | null>(null)
const loading = ref<boolean>(false)
const error = ref<string | null>(null)

const canSearch = computed<boolean>(() => {
  return !!(searchParams.value.driverCode &&
           searchParams.value.year &&
           searchParams.value.circuit &&
           searchParams.value.session)
})

const searchFastestLap = async (): Promise<void> => {
  if (!canSearch.value) {
    error.value = 'Veuillez remplir tous les champs'
    return
  }

  loading.value = true
  error.value = null
  fastestLapData.value = null

  try {
    const result = await f1ApiService.getFastestLap(
      searchParams.value.driverCode,
      searchParams.value.year,
      searchParams.value.circuit,
      searchParams.value.session
    )
    fastestLapData.value = result
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
  } finally {
    loading.value = false
  }
}

const clearResults = (): void => {
  fastestLapData.value = null
  error.value = null
}
</script>

<style scoped>

</style>
