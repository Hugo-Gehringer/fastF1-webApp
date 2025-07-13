<template>
  <div class="f1-component-container">
    <!-- Professional Header -->
    <div class="f1-header">
      <div class="f1-header-content">
        <h2 class="title-gradient">
          SESSION CONTROL CENTER
        </h2>
        <div class="racing-line w-24 mt-2"></div>
        <p class="f1-header-subtitle">Complete session monitoring and analysis</p>
      </div>
      <div class="telemetry-display">
        <div class="text-xs uppercase tracking-wider">Control</div>
        <div class="text-lg font-bold">CENTER</div>
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

          <div class="f1-form-field">
            <label class="f1-label">
              Session Type
            </label>
            <select v-model="searchParams.session" @change="clearResults" class="f1-select">
              <option value="">Select Session</option>
              <option value="FP1">Practice 1</option>
              <option value="FP2">Practice 2</option>
              <option value="FP3">Practice 3</option>
              <option value="Q">Qualifying</option>
              <option value="R" selected>Race</option>
            </select>
          </div>
        </div>

        <div class="f1-button-container">
          <button @click="searchSession" :disabled="loading || !canSearch" class="f1-button">
            <span v-if="loading" class="flex items-center">
              <div class="f1-spinner"></div>
              LOADING SESSION...
            </span>
            <span v-else>ANALYZE SESSION</span>
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
          <div class="f1-error-title">SESSION DATA ERROR</div>
          <div class="f1-error-message">{{ error }}</div>
        </div>
      </div>
    </div>

    <!-- Session Results using shared component -->
    <RaceSessionDisplay
      :session-data="sessionData"
      mode="session"
      v-if="!loading"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAvailableYears } from '../composables/useAvailableYears'
import { useAvailableCircuits } from '../composables/useAvailableCircuits'
import f1ApiService, { type SessionInfoData } from '../services/f1ApiService'
import RaceSessionDisplay from './RaceSessionDisplay.vue'

interface SearchParams {
  year: number
  circuit: string
  session: string
}

// Utiliser les composables partagés
const { availableYears, yearsLoading, getLatestYear } = useAvailableYears()
const { availableCircuits, circuitsLoading, loadAvailableCircuits, getCircuitOptions, clearCircuits } = useAvailableCircuits()

const searchParams = ref<SearchParams>({
  year: getLatestYear(),
  circuit: '',
  session: ''
})

const sessionData = ref<SessionInfoData | null>(null)
const loading = ref<boolean>(false)
const error = ref<string | null>(null)

// Déclarer clearResults avant le watcher
const clearResults = (): void => {
  sessionData.value = null
  error.value = null
}

// Watcher pour charger les circuits quand l'année change
watch(() => searchParams.value.year, async (newYear) => {
  if (newYear) {
    searchParams.value.circuit = '' // Réinitialiser le circuit sélectionné
    clearResults()
    await loadAvailableCircuits(newYear)
  }
}, { immediate: true })

const canSearch = computed<boolean>(() => {
  return !!(searchParams.value.year &&
           searchParams.value.circuit &&
           searchParams.value.session)
})

const searchSession = async (): Promise<void> => {
  if (!canSearch.value) {
    error.value = 'Veuillez remplir tous les champs'
    return
  }

  loading.value = true
  error.value = null
  sessionData.value = null

  try {
    const result = await f1ApiService.getSessionInfo(
      searchParams.value.year,
      searchParams.value.circuit,
      searchParams.value.session
    )
    sessionData.value = result
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
</style>
