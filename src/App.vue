<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAvailableYears } from './composables/useAvailableYears'
import ApiHealthComponent from './components/ApiHealthComponent.vue'
import FastestLapComponent from './components/FastestLapComponent.vue'
import SessionResultsComponent from './components/SessionResultsComponent.vue'
import DriverInfoComponent from './components/DriverInfoComponent.vue'
import SessionInfoComponent from './components/SessionInfoComponent.vue'
import LatestRaceComponent from './components/LatestRaceComponent.vue'

interface Tab {
  id: string
  label: string
  component: string
}

const activeTab = ref<string>('latest-race')

const tabs: Tab[] = [
  { id: 'latest-race', label: 'Dernière Course', component: 'LatestRaceComponent' },
  { id: 'health', label: 'État API', component: 'ApiHealthComponent' },
  // { id: 'fastest-lap', label: 'Tour le plus rapide', component: 'FastestLapComponent' },
  // { id: 'session-results', label: 'Résultats de session', component: 'SessionResultsComponent' },
  // { id: 'driver-info', label: 'Info pilote', component: 'DriverInfoComponent' },
  { id: 'session-info', label: 'Info session', component: 'SessionInfoComponent' }
]

const setActiveTab = (tabId: string): void => {
  activeTab.value = tabId
}

// Initialiser le chargement des années disponibles au démarrage de l'application
const { loadAvailableYears } = useAvailableYears()

onMounted(async () => {
  await loadAvailableYears()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-f1-black via-gray-900 to-f1-carbon">
    <!-- F1 Professional Header with Racing Effects -->
    <header class="relative overflow-hidden">
      <!-- Racing Grid Background -->
      <div class="absolute inset-0 racing-grid opacity-30"></div>

      <!-- Speed Lines Animation -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-1/2 w-full h-0.5 bg-gradient-to-r from-transparent via-electric-blue to-transparent animate-speed-lines"></div>
        <div class="absolute top-1/3 w-full h-0.5 bg-gradient-to-r from-transparent via-neon-green to-transparent animate-speed-lines" style="animation-delay: 1s;"></div>
        <div class="absolute top-2/3 w-full h-0.5 bg-gradient-to-r from-transparent via-racing-orange to-transparent animate-speed-lines" style="animation-delay: 2s;"></div>
      </div>

      <div class="relative z-10 container mx-auto px-6 py-12">
        <div class="text-center">
          <!-- Racing Logo/Title -->
          <div class="mb-6">
            <h1 class="text-6xl md:text-8xl font-f1 font-black text-white drop-shadow-2xl">
              F1 TELEMETRY
            </h1>
            <div class="racing-line w-32 mx-auto mt-4"></div>
          </div>

          <!-- Professional Subtitle -->
          <div class="space-y-4">
            <p class="text-xl md:text-2xl font-racing font-light text-gray-300 tracking-wider">
              PROFESSIONAL RACING DATA ANALYTICS
            </p>
            <div class="flex justify-center items-center space-x-8 text-sm font-racing text-gray-400">
              <div class="flex items-center space-x-2">
                <div class="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                <span>REAL-TIME TELEMETRY</span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-2 h-2 bg-electric-blue rounded-full animate-pulse"></div>
                <span>FASTF1 API</span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-2 h-2 bg-f1-gold rounded-full animate-pulse"></div>
                <span>PERFORMANCE METRICS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Gradient Fade -->
      <div class="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-f1-black to-transparent"></div>
    </header>

    <!-- Professional Racing Navigation -->
    <nav class="bg-gradient-to-r from-f1-black via-f1-carbon to-f1-black border-y border-gray-700 shadow-dashboard sticky top-0 z-50 backdrop-blur-md">
      <div class="container mx-auto px-6">
        <div class="flex flex-wrap justify-center items-center gap-2 py-4">
          <button v-for="tab in tabs" :key="tab.id" @click="setActiveTab(tab.id)"
            :class="[
              'group relative px-8 py-4 font-racing font-semibold text-sm uppercase tracking-wider transition-all duration-300 rounded-xl border',
              activeTab === tab.id
                ? 'bg-gradient-to-r from-mercedes-petronas to-mercedes-dark-cyan text-mercedes-black border-mercedes-petronas shadow-mercedes-glow'
                : 'bg-gradient-to-r from-mercedes-charcoal to-mercedes-gunmetal text-mercedes-dark-silver border-mercedes-dark-silver/50 hover:border-mercedes-petronas hover:text-mercedes-petronas hover:shadow-mercedes-glow'
            ]"
          >
            <!-- Tab Icon Based on Type -->
            <div class="flex items-center space-x-3">
              <div class="relative">
                <div :class="[
                  'w-3 h-3 rounded-full transition-all duration-300',
                  activeTab === tab.id ? 'bg-mercedes-black shadow-mercedes-neon' : 'bg-mercedes-dark-silver group-hover:bg-mercedes-petronas'
                ]"></div>
                <div v-if="activeTab === tab.id" class="absolute inset-0 w-3 h-3 bg-mercedes-petronas rounded-full animate-ping opacity-75"></div>
              </div>
              <span>{{ tab.label }}</span>
            </div>

            <!-- Hover Effect -->
            <div class="absolute inset-0 bg-gradient-to-r from-mercedes-petronas/20 to-mercedes-cyan/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
          </button>
        </div>
      </div>
    </nav>

    <!-- Main Dashboard Content -->
    <main class="container mx-auto px-6 py-12">
      <div class="f1-card animate-fade-in">
        <!-- Component Display with Professional Styling -->
        <div class="p-8">
          <ApiHealthComponent v-if="activeTab === 'health'" />
          <FastestLapComponent v-if="activeTab === 'fastest-lap'" />
          <SessionResultsComponent v-if="activeTab === 'session-results'" />
          <DriverInfoComponent v-if="activeTab === 'driver-info'" />
          <SessionInfoComponent v-if="activeTab === 'session-info'" />
          <LatestRaceComponent v-if="activeTab === 'latest-race'" />
        </div>
      </div>
    </main>

    <!-- Professional Footer -->
    <footer class="bg-gradient-to-r from-f1-black via-f1-carbon to-f1-black border-t border-gray-700 mt-24">
      <div class="container mx-auto px-6 py-8">
        <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div class="flex items-center space-x-4">
            <div class="w-8 h-8 bg-gradient-to-br from-f1-red to-f1-dark-red rounded-lg flex items-center justify-center">
              <span class="text-white font-f1 font-bold text-sm">F1</span>
            </div>
            <div>
              <p class="text-gray-300 font-racing font-medium">FastF1 Telemetry Dashboard</p>
              <p class="text-gray-500 text-sm">Professional Racing Data Analytics</p>
            </div>
          </div>

          <div class="flex items-center space-x-6 text-sm text-gray-400 font-racing">
            <span>© 2025 Hugo Gehringer</span>
            <div class="flex items-center space-x-2">
              <div class="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
              <span>Portfolio Project</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Component-specific racing effects */
.animate-speed-lines {
  animation: speedLines 3s ease-in-out infinite;
}

@keyframes speedLines {
  0% {
    transform: translateX(-100vw);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateX(100vw);
    opacity: 0;
  }
}

</style>
