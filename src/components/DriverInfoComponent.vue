<template>
  <div class="f1-component-container">
    <!-- Professional Header -->
    <div class="f1-header">
      <div class="f1-header-content">
        <h2 class="title-gradient">
          DRIVER PROFILE
        </h2>
        <div class="racing-line w-24 mt-2"></div>
        <p class="f1-header-subtitle">Complete driver performance analysis</p>
      </div>
      <div class="telemetry-display">
        <div class="text-xs uppercase tracking-wider">Profile</div>
        <div class="text-lg font-bold">ACTIVE</div>
      </div>
    </div>

    <!-- Enhanced Search Interface -->
    <div class="f1-card">
      <div class="f1-card-content">
        <h3 class="f1-section-title">
          <div class="f1-section-indicator"></div>
          DRIVER SEARCH PARAMETERS
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
          <button @click="searchDriverInfo" :disabled="loading || !canSearch" class="f1-button">
            <span v-if="loading" class="flex items-center">
              <div class="f1-spinner"></div>
              ANALYZING DRIVER...
            </span>
            <span v-else>LOAD DRIVER PROFILE</span>
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
          <div class="f1-error-title">DRIVER DATA ERROR</div>
          <div class="f1-error-message">{{ error }}</div>
        </div>
      </div>
    </div>

    <!-- Driver Profile Display -->
    <div v-if="driverInfo" class="f1-results-container">
      <!-- Driver Header Card -->
      <div class="f1-header-card f1-header-card-purple">
        <div class="f1-header-info">
          <div>
            <h3 class="f1-header-title value-purple">
              DRIVER PROFILE
            </h3>
            <p class="f1-header-description">
              {{ driverInfo.driver_name || searchParams.driverCode }} - {{ searchParams.circuit?.toUpperCase() }} {{ searchParams.year }}
            </p>
          </div>
          <div class="telemetry-display">
            <div class="text-xs">DRIVER</div>
            <div class="text-2xl font-bold">{{ driverInfo.driver_code || searchParams.driverCode }}</div>
          </div>
        </div>
      </div>

      <!-- General Information -->
      <div class="f1-card">
        <div class="f1-card-content">
          <h4 class="f1-section-title">
            <div class="w-1 h-6 bg-gradient-to-t from-blue-500 to-electric-blue rounded mr-3"></div>
            GENERAL INFORMATION
          </h4>

          <div class="f1-data-grid">
            <div class="f1-metric-card" style="--accent-color: #E10600;">
              <div class="f1-metric-header">
                <h5 class="f1-metric-title">Full Name</h5>
                <div class="f1-metric-indicator indicator-red"></div>
              </div>
              <div class="f1-metric-value">
                {{ driverInfo.driver_name || 'N/A' }}
              </div>
              <div class="f1-metric-subtitle">Racing Driver</div>
            </div>

            <div class="f1-metric-card" style="--accent-color: #00D4FF;">
              <div class="f1-metric-header">
                <h5 class="f1-metric-title">Driver Code</h5>
                <div class="f1-metric-indicator indicator-blue"></div>
              </div>
              <div class="f1-metric-value-2xl value-blue">
                {{ driverInfo.driver_code || searchParams.driverCode }}
              </div>
              <div class="f1-metric-subtitle">FIA Code</div>
            </div>

            <div class="f1-metric-card" style="--accent-color: #39FF14;">
              <div class="f1-metric-header">
                <h5 class="f1-metric-title">Team</h5>
                <div class="f1-metric-indicator indicator-green"></div>
              </div>
              <div class="f1-metric-value">
                {{ driverInfo.team || 'N/A' }}
              </div>
              <div class="f1-metric-subtitle">Constructor</div>
            </div>

            <div class="f1-metric-card" style="--accent-color: #FFD700;">
              <div class="f1-metric-header">
                <h5 class="f1-metric-title">Car Number</h5>
                <div class="f1-metric-indicator indicator-gold"></div>
              </div>
              <div class="f1-metric-value-large value-gold">
                {{ driverInfo.driver_number || 'N/A' }}
              </div>
              <div class="f1-metric-subtitle">Race Number</div>
            </div>

            <div class="f1-metric-card" style="--accent-color: #FF8C00;">
              <div class="f1-metric-header">
                <h5 class="f1-metric-title">Nationality</h5>
                <div class="f1-metric-indicator indicator-orange"></div>
              </div>
              <div class="f1-metric-value">
                {{ driverInfo.nationality || 'N/A' }}
              </div>
              <div class="f1-metric-subtitle">Country</div>
            </div>

            <div class="f1-metric-card" style="--accent-color: #C0C0C0;">
              <div class="f1-metric-header">
                <h5 class="f1-metric-title">Age</h5>
                <div class="f1-metric-indicator indicator-silver"></div>
              </div>
              <div class="f1-metric-value-large value-silver">
                {{ driverInfo.age || 'N/A' }}
              </div>
              <div class="f1-metric-subtitle">Years</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Metrics -->
      <div v-if="driverInfo.performance" class="f1-card">
        <div class="f1-card-content">
          <h4 class="f1-section-title">
            <div class="w-1 h-6 bg-gradient-to-t from-green-500 to-neon-green rounded mr-3"></div>
            SESSION PERFORMANCE
          </h4>

          <div class="f1-data-grid">
            <div class="f1-metric-card championship-gold" style="--accent-color: #FFD700;">
              <div class="f1-metric-header">
                <h5 class="f1-metric-title">Position</h5>
                <div class="f1-metric-indicator indicator-gold"></div>
              </div>
              <div class="f1-metric-value">
                {{ driverInfo.performance.position || 'N/A' }}
              </div>
              <div class="f1-metric-subtitle">Final Classification</div>
            </div>

            <div class="f1-metric-card speed-indicator" style="--accent-color: #E10600;">
              <div class="f1-metric-header">
                <h5 class="f1-metric-title">Best Lap Time</h5>
                <div class="f1-metric-indicator indicator-red"></div>
              </div>
              <div class="f1-metric-value-2xl value-red font-mono">
                {{ driverInfo.performance.best_lap_time || 'N/A' }}
              </div>
              <div class="f1-metric-subtitle">Personal Best</div>
            </div>

            <div class="f1-metric-card" style="--accent-color: #39FF14;">
              <div class="f1-metric-header">
                <h5 class="f1-metric-title">Gap to Leader</h5>
                <div class="f1-metric-indicator indicator-green"></div>
              </div>
              <div class="f1-metric-value">
                {{ driverInfo.performance.gap_to_leader || 'N/A' }}
              </div>
              <div class="f1-metric-subtitle">Time Difference</div>
            </div>

            <div class="f1-metric-card" style="--accent-color: #00D4FF;">
              <div class="f1-metric-header">
                <h5 class="f1-metric-title">Laps Completed</h5>
                <div class="f1-metric-indicator indicator-blue"></div>
              </div>
              <div class="f1-metric-value-3xl value-blue">
                {{ driverInfo.performance.laps_completed || 'N/A' }}
              </div>
              <div class="f1-metric-subtitle">Total Laps</div>
            </div>

            <div class="f1-metric-card" style="--accent-color: #9932CC;">
              <div class="f1-metric-header">
                <h5 class="f1-metric-title">Top Speed</h5>
                <div class="f1-metric-indicator indicator-purple"></div>
              </div>
              <div class="f1-metric-value">
                {{ driverInfo.performance.top_speed || 'N/A' }}
              </div>
              <div class="f1-metric-subtitle">km/h</div>
            </div>

            <div class="f1-metric-card" style="--accent-color: #FFD700;">
              <div class="f1-metric-header">
                <h5 class="f1-metric-title">Championship Points</h5>
                <div class="f1-metric-indicator indicator-gold"></div>
              </div>
              <div class="f1-metric-value-3xl value-gold">
                {{ driverInfo.performance.points || 'N/A' }}
              </div>
              <div class="f1-metric-subtitle">Points Earned</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Telemetry Data -->
      <div v-if="driverInfo.telemetry" class="f1-card">
        <div class="f1-card-content">
          <h4 class="f1-section-title">
            <div class="w-1 h-6 bg-gradient-to-t from-purple-500 to-electric-blue rounded mr-3"></div>
            TELEMETRY DATA
          </h4>

          <div class="f1-data-grid">
            <div class="telemetry-display">
              <div class="text-xs uppercase tracking-wider mb-2">Average Speed</div>
              <div class="text-2xl font-f1 font-bold">{{ driverInfo.telemetry.average_speed || 'N/A' }}</div>
              <div class="text-xs mt-1 opacity-80">km/h</div>
            </div>

            <div class="telemetry-display">
              <div class="text-xs uppercase tracking-wider mb-2">Average RPM</div>
              <div class="text-2xl font-f1 font-bold">{{ driverInfo.telemetry.average_rpm || 'N/A' }}</div>
              <div class="text-xs mt-1 opacity-80">RPM</div>
            </div>

            <div class="data-card bg-gradient-to-br from-red-900 to-red-800 border-red-500/30" style="--accent-color: #DC2626;">
              <div class="flex items-center justify-between mb-3">
                <h5 class="font-racing font-semibold text-red-200 uppercase text-sm">Engine Temp</h5>
                <div class="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
              </div>
              <div class="text-2xl font-f1 font-bold text-red-400 mb-2">
                {{ driverInfo.telemetry.engine_temp || 'N/A' }}°C
              </div>
              <div class="text-sm text-red-300 font-racing">Temperature</div>
            </div>

            <div class="data-card" style="--accent-color: #6B7280;">
              <div class="flex items-center justify-between mb-3">
                <h5 class="font-racing font-semibold text-gray-200 uppercase text-sm">Tire Pressure</h5>
                <div class="w-3 h-3 bg-gray-400 rounded-full animate-pulse"></div>
              </div>
              <div class="text-xl font-f1 font-bold text-white mb-2">
                {{ driverInfo.telemetry.tire_pressure || 'N/A' }}
              </div>
              <div class="text-sm text-gray-400 font-racing">PSI</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import f1ApiService, { type DriverInfoData } from '../services/f1ApiService'

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

const driverInfo = ref<DriverInfoData | null>(null)
const loading = ref<boolean>(false)
const error = ref<string | null>(null)

const canSearch = computed<boolean>(() => {
  return !!(searchParams.value.driverCode &&
           searchParams.value.year &&
           searchParams.value.circuit &&
           searchParams.value.session)
})

const searchDriverInfo = async (): Promise<void> => {
  if (!canSearch.value) {
    error.value = 'Veuillez remplir tous les champs'
    return
  }

  loading.value = true
  error.value = null
  driverInfo.value = null

  try {
    const result = await f1ApiService.getDriverInfo(
      searchParams.value.driverCode,
      searchParams.value.year,
      searchParams.value.circuit,
      searchParams.value.session
    )
    driverInfo.value = result
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
  } finally {
    loading.value = false
  }
}

const clearResults = (): void => {
  driverInfo.value = null
  error.value = null
}
</script>

<style scoped>

</style>
