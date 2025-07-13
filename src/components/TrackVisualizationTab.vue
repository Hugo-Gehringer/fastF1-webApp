<template>
  <div class="track-tab-container">
    <!-- Loading State -->
    <div v-if="loading" class="f1-card">
      <div class="f1-card-content">
        <div class="flex items-center justify-center py-12">
          <div class="f1-spinner mr-4"></div>
          <span class="text-lg font-racing">Loading telemetry data...</span>
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

    <!-- Use the advanced telemetry component -->
    <TelemetryTrackTab
      :year="props.year"
      :circuit="props.circuit"
      v-if="!loading"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import TelemetryTrackTab from './TelemetryTrackTab.vue'

interface Props {
  year: number
  circuit: string
}

const props = defineProps<Props>()

const loading = ref<boolean>(false)
const error = ref<string | null>(null)

// Simulate loading for consistency with other components
const loadTelemetryData = async (): Promise<void> => {
  if (!props.year || !props.circuit) return

  loading.value = true
  error.value = null

  try {
    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 500))
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement des données de télémétrie'
  } finally {
    loading.value = false
  }
}

// Load data on mount
onMounted(() => {
  loadTelemetryData()
})

// Reload data when props change
watch([() => props.year, () => props.circuit], () => {
  loadTelemetryData()
})
</script>

<style scoped>
.track-tab-container {
  min-height: 400px;
}
</style>
