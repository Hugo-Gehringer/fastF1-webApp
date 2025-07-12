<template>
  <div class="f1-component-container">
    <!-- Professional Header -->
    <div class="f1-header">
      <div class="f1-header-content">
        <h2 class="title-gradient">
          SESSION RESULTS
        </h2>
        <div class="racing-line w-24 mt-2"></div>
        <p class="f1-header-subtitle">Championship standings and race results</p>
      </div>
      <div class="telemetry-display">
        <div class="text-xs uppercase tracking-wider">Classification</div>
        <div class="text-lg font-bold">OFFICIAL</div>
      </div>
    </div>

    <!-- Enhanced Search Interface -->
    <div class="f1-card">
      <div class="f1-card-content">
        <h3 class="f1-section-title">
          <div class="f1-section-indicator"></div>
          SESSION PARAMETERS
        </h3>

        <div class="f1-form-grid-3">
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
          <button @click="searchResults" :disabled="loading || !canSearch" class="f1-button">
            <span v-if="loading" class="flex items-center">
              <div class="f1-spinner"></div>
              LOADING RESULTS...
            </span>
            <span v-else>GET RESULTS</span>
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
          <div class="f1-error-title">RESULTS DATA ERROR</div>
          <div class="f1-error-message">{{ error }}</div>
        </div>
      </div>
    </div>

    <!-- Session Results -->
    <div v-if="sessionResults" class="f1-results-container">
      <!-- Results Header Card -->
      <div class="f1-header-card f1-header-card-green">
        <div class="f1-header-info">
          <div>
            <h3 class="f1-header-title value-green">
              SESSION RESULTS
            </h3>
            <p class="f1-header-description">
              {{ sessionResults.session_name }} - {{ searchParams.circuit?.toUpperCase() }} {{ searchParams.year }}
            </p>
          </div>
          <div class="telemetry-display">
            <div class="text-xs">CLASSIFIED</div>
            <div class="text-2xl font-bold">{{ sessionResults.total_drivers || 'N/A' }}</div>
          </div>
        </div>
      </div>

      <!-- Results Table -->
      <div class="f1-card">
        <div class="f1-card-content">
          <h4 class="f1-section-title">
            <div class="w-1 h-6 bg-gradient-to-t from-green-500 to-neon-green rounded mr-3"></div>
            CLASSIFICATION
          </h4>

          <div class="f1-data-grid-4">
            <div v-for="(result, index) in sessionResults.drivers" :key="index" class="f1-metric-card" :style="`--accent-color: ${getPositionColor(result.position)};`">
              <div class="f1-metric-header">
                <h5 class="f1-metric-title">{{ result.driver_name }}</h5>
                <div class="f1-metric-indicator" :class="getIndicatorClass(result.position)"></div>
              </div>
              <div class="f1-metric-value-large" :class="getValueClass(result.position)">
                P{{ result.position }}
              </div>
              <div class="f1-metric-subtitle">{{ result.team }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import f1ApiService, { type SessionResultsData } from '../services/f1ApiService'

interface SearchParams {
  year: number
  circuit: string
  session: string
}

const searchParams = ref<SearchParams>({
  year: new Date().getFullYear(),
  circuit: '',
  session: ''
})

const sessionResults = ref<SessionResultsData | null>(null)
const loading = ref<boolean>(false)
const error = ref<string | null>(null)

const canSearch = computed<boolean>(() => {
  return !!(searchParams.value.year &&
           searchParams.value.circuit &&
           searchParams.value.session)
})

const searchResults = async (): Promise<void> => {
  if (!canSearch.value) {
    error.value = 'Veuillez remplir tous les champs'
    return
  }

  loading.value = true
  error.value = null
  sessionResults.value = null

  try {
    const result = await f1ApiService.getSessionResults(
      searchParams.value.year,
      searchParams.value.circuit,
      searchParams.value.session
    )
    sessionResults.value = result
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
  } finally {
    loading.value = false
  }
}

const clearResults = (): void => {
  sessionResults.value = null
  error.value = null
}

// Helper functions for position styling
const getPositionColor = (position: number): string => {
  if (position === 1) return '#FFD700'
  if (position === 2) return '#C0C0C0'
  if (position === 3) return '#CD7F32'
  return '#00D2BE'
}

const getIndicatorClass = (position: number): string => {
  if (position === 1) return 'indicator-gold'
  if (position === 2) return 'indicator-silver'
  if (position === 3) return 'indicator-orange'
  return 'indicator-petronas'
}

const getValueClass = (position: number): string => {
  if (position === 1) return 'value-gold'
  if (position === 2) return 'value-silver'
  if (position === 3) return 'value-orange'
  return 'value-petronas'
}
</script>

<style scoped>
</style>
