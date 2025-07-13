<template>
  <div class="f1-component-container">
    <!-- Professional Header -->
    <div class="f1-header">
      <div class="f1-header-content">
        <h2 class="title-gradient">
          LATEST RACE RESULTS
        </h2>
        <div class="racing-line w-24 mt-2"></div>
        <p class="f1-header-subtitle">Most recent Formula 1 race analysis and results</p>
      </div>
      <div class="telemetry-display">
        <div class="text-xs uppercase tracking-wider">Latest</div>
        <div class="text-lg font-bold">RACE</div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="f1-card">
      <div class="f1-card-content">
        <div class="flex items-center justify-center py-12">
          <div class="f1-spinner mr-4"></div>
          <span class="text-lg font-racing">Loading latest race data...</span>
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
          <div class="f1-error-title">LATEST RACE DATA ERROR</div>
          <div class="f1-error-message">{{ error }}</div>
        </div>
      </div>
    </div>

    <!-- Latest Race Results using shared component -->
    <RaceSessionDisplay
      :session-data="raceData"
      mode="race"
      v-if="!loading"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import f1ApiService, { type LatestRaceData } from '../services/f1ApiService'
import RaceSessionDisplay from './RaceSessionDisplay.vue'

const raceData = ref<LatestRaceData | null>(null)
const loading = ref<boolean>(false)
const error = ref<string | null>(null)

// Charger les données de la dernière course au montage du composant
onMounted(async () => {
  await loadLatestRace()
})

const loadLatestRace = async (): Promise<void> => {
  loading.value = true
  error.value = null

  try {
    const result = await f1ApiService.getLatestRace('Race')
    raceData.value = result
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement de la dernière course'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
</style>
