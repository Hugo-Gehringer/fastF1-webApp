<template>
  <div v-if="sessionData" class="f1-results-container">
    <!-- Session Header Card -->
    <div class="f1-header-card f1-header-card-petronas">
      <div class="f1-header-info">
        <div>
          <h3 class="f1-header-title value-petronas">
            {{ sessionData.session_name || 'SESSION' }} OVERVIEW
          </h3>
          <p class="f1-header-description">
            {{ sessionData.circuit_name || sessionData.location }} - {{ sessionData.country }} {{ sessionData.year }}
          </p>
        </div>
        <div class="telemetry-display">
          <div class="text-xs">DRIVERS</div>
          <div class="text-2xl font-bold">{{ sessionData.drivers?.length || 'N/A' }}</div>
        </div>
      </div>
    </div>

    <!-- Session Information -->
    <div class="f1-card">
      <div class="f1-card-content">
        <h4 class="f1-section-title">
          <div class="w-1 h-6 bg-gradient-to-t from-mercedes-petronas to-mercedes-cyan rounded mr-3"></div>
          SESSION DETAILS
        </h4>

        <div class="f1-data-grid-4">
          <div class="f1-metric-card" style="--accent-color: #00D2BE;">
            <div class="f1-metric-header">
              <h5 class="f1-metric-title">Session Type</h5>
              <div class="f1-metric-indicator indicator-petronas"></div>
            </div>
            <div class="f1-metric-value value-petronas">
              {{ sessionData.session_name || 'N/A' }}
            </div>
            <div class="f1-metric-subtitle">{{ sessionType }}</div>
          </div>

          <div class="f1-metric-card" style="--accent-color: #C0C0C0;">
            <div class="f1-metric-header">
              <h5 class="f1-metric-title">Circuit</h5>
              <div class="f1-metric-indicator indicator-silver"></div>
            </div>
            <div class="f1-metric-value value-silver">
              {{ sessionData.circuit_name || sessionData.location || 'N/A' }}
            </div>
            <div class="f1-metric-subtitle">{{ sessionData.country || 'Circuit' }}</div>
          </div>

          <div class="f1-metric-card" style="--accent-color: #00FF7F;">
            <div class="f1-metric-header">
              <h5 class="f1-metric-title">Date & Time</h5>
              <div class="f1-metric-indicator indicator-green"></div>
            </div>
            <div class="f1-metric-value value-green">
              {{ formatDate(sessionData.date) || 'N/A' }}
            </div>
            <div class="f1-metric-subtitle">{{ dateSubtitle }}</div>
          </div>

          <div class="f1-metric-card" style="--accent-color: #00F5FF;">
            <div class="f1-metric-header">
              <h5 class="f1-metric-title">Total Laps</h5>
              <div class="f1-metric-indicator indicator-cyan"></div>
            </div>
            <div class="f1-metric-value-large value-cyan">
              {{ sessionData.total_laps || 'N/A' }}
            </div>
            <div class="f1-metric-subtitle">{{ lapsSubtitle }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Podium Summary -->
    <div v-if="sessionData.drivers && sessionData.drivers.length >= 3" class="mt-8 p-6 bg-gradient-to-r from-mercedes-black/50 to-mercedes-charcoal/50 rounded-xl border border-mercedes-dark-silver/30">
      <h5 class="text-lg font-racing font-semibold text-mercedes-platinum mb-4 flex items-center">
        <div class="w-1 h-5 bg-gradient-to-t from-f1-gold to-mercedes-silver rounded mr-3"></div>
        PODIUM FINISHERS
      </h5>

      <div class="f1-data-grid">
        <div v-for="(driver, index) in sessionData.drivers.slice(0, 3)" :key="`podium-${driver.driver_code}`"
             class="text-center">
          <div class="text-4xl mb-2">{{ getPositionEmoji(index + 1) }}</div>
          <div class="text-lg font-f1 font-bold">
            P{{ index + 1 }}
          </div>
          <div class="text-sm font-racing text-mercedes-platinum">
            {{ driver.name }}
          </div>
          <div class="text-xs" :class="getTeamValueClass(driver.team)">
            {{ driver.team }}
          </div>
        </div>
      </div>
    </div>

    <!-- Fastest Lap Information -->
    <div v-if="sessionData.fastest_lap" class="f1-card">
      <div class="f1-card-content">
        <h4 class="f1-section-title">
          <div class="w-1 h-6 bg-gradient-to-t from-f1-gold to-mercedes-silver rounded mr-3"></div>
          FASTEST LAP
        </h4>

        <div class="f1-data-grid">
          <div class="f1-metric-card championship-gold" style="--accent-color: #FFD700;">
            <div class="f1-metric-header">
              <h5 class="f1-metric-title">Driver</h5>
              <div class="f1-metric-indicator indicator-gold"></div>
            </div>
            <div class="f1-metric-value-2xl value-gold">
              {{ sessionData.fastest_lap.driver }}
            </div>
            <div class="f1-metric-subtitle">{{ sessionData.fastest_lap.team }}</div>
          </div>

          <div class="f1-metric-card speed-indicator" style="--accent-color: #00D2BE;">
            <div class="f1-metric-header">
              <h5 class="f1-metric-title">Lap Time</h5>
              <div class="f1-metric-indicator indicator-petronas"></div>
            </div>
            <div class="f1-metric-value-2xl value-petronas font-mono">
              {{ formatLapTime(sessionData.fastest_lap.lap_time) }}
            </div>
            <div class="f1-metric-subtitle">Fastest Time</div>
          </div>

          <div class="f1-metric-card" style="--accent-color: #C0C0C0;">
            <div class="f1-metric-header">
              <h5 class="f1-metric-title">Lap Number</h5>
              <div class="f1-metric-indicator indicator-silver"></div>
            </div>
            <div class="f1-metric-value-large value-silver">
              {{ sessionData.fastest_lap.lap_number }}
            </div>
            <div class="f1-metric-subtitle">Race Lap</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Drivers List -->
    <div v-if="sessionData.drivers && sessionData.drivers.length > 0" class="f1-card">
      <div class="f1-card-content">
        <h4 class="f1-section-title">
          <div class="w-1 h-6 bg-gradient-to-t from-mercedes-platinum to-mercedes-dark-silver rounded mr-3"></div>
          {{ classificationType }} ({{ sessionData.drivers.length }})
        </h4>

        <div class="space-y-3">
          <div v-for="(driver, index) in sessionData.drivers" :key="driver.driver_code"
               class="f1-metric-card flex items-center"
               style="--accent-color: #2C2C2E;"
               :class="getPositionCardClass(index + 1) || getTeamCardClass(driver.team)">
            <!-- Position Number -->
            <div class="flex items-center justify-center w-16 h-16 rounded-xl mr-4"
                 :class="getPositionBadgeClass(index + 1)">
              <span class="text-2xl font-f1 font-bold">
                {{ index + 1 }}
              </span>
            </div>

            <!-- Driver Info -->
            <div class="flex-1">
              <div class="f1-metric-header">
                <div class="flex items-center space-x-3">
                  <h5 class="f1-metric-title text-lg">{{ driver.name }}</h5>
                  <span class="px-2 py-1 rounded text-xs font-racing font-semibold"
                        :class="getTeamBadgeClass(driver.team)">
                    {{ driver.team }}
                  </span>
                </div>
                <div class="f1-metric-indicator" :class="getTeamIndicatorClass(driver.team)"></div>
              </div>

              <div class="flex items-center space-x-4 mt-2">
                <div class="f1-metric-value-2xl" :class="getTeamValueClass(driver.team)">
                  {{ driver.driver_code }}
                </div>
                <div class="text-sm text-mercedes-dark-silver font-racing">
                  #{{ driver.number }}
                </div>
              </div>
            </div>

            <!-- Position Trophy/Icon -->
            <div class="ml-4" v-if="index < 3">
              <div class="text-3xl">
                {{ getPositionEmoji(index + 1) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SessionInfoData, LatestRaceData } from '../services/f1ApiService'

interface Props {
  sessionData: SessionInfoData | LatestRaceData | null
  mode?: 'session' | 'race'
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'session'
})

// Computed properties for dynamic content based on mode
const sessionType = computed(() => {
  return props.mode === 'race' ? 'Latest Session' : 'Current Session'
})

const dateSubtitle = computed(() => {
  return props.mode === 'race' ? 'Race Start' : 'Session Start'
})

const lapsSubtitle = computed(() => {
  return props.mode === 'race' ? 'Race Distance' : 'Session Laps'
})

const classificationType = computed(() => {
  return props.mode === 'race' ? 'RACE CLASSIFICATION' : 'SESSION CLASSIFICATION'
})

// Helper functions for data formatting
const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}

const formatLapTime = (timeString: string): string => {
  if (!timeString) return 'N/A'
  // Extract time from format like "0 days 00:01:14.165000"
  const match = timeString.match(/(\d{2}):(\d{2}):(\d{2})\.(\d{3})/)
  if (match) {
    const [, hours, minutes, seconds, milliseconds] = match
    if (hours === '00') {
      return `${minutes}:${seconds}.${milliseconds}`
    }
    return `${hours}:${minutes}:${seconds}.${milliseconds}`
  }
  return timeString
}

// Team color helper functions
const getTeamSlug = (teamName: string): string => {
  const teamMap: { [key: string]: string } = {
    'Ferrari': 'ferrari',
    'McLaren': 'mclaren',
    'Mercedes': 'mercedes',
    'Red Bull Racing': 'red-bull',
    'Williams': 'williams',
    'Alpine': 'alpine',
    'RB': 'rb',
    'Racing Bulls': 'rb',
    'Aston Martin': 'aston-martin',
    'Kick Sauber': 'kick-sauber',
    'Haas F1 Team': 'haas'
  }
  return teamMap[teamName] || 'default'
}

const getTeamCardClass = (teamName: string): string => {
  const teamSlug = getTeamSlug(teamName)
  return `team-card-${teamSlug}`
}

const getTeamIndicatorClass = (teamName: string): string => {
  const teamSlug = getTeamSlug(teamName)
  return `indicator-${teamSlug}`
}

const getTeamValueClass = (teamName: string): string => {
  const teamSlug = getTeamSlug(teamName)
  return `team-${teamSlug}`
}

// Helper functions for race classification styling
const getPositionBadgeClass = (position: number): string => {
  if (position === 1) return 'bg-gradient-to-br from-f1-gold to-yellow-400'
  if (position === 2) return 'bg-gradient-to-br from-mercedes-silver to-gray-300'
  if (position === 3) return 'bg-gradient-to-br from-racing-orange to-orange-400'
  return 'bg-gradient-to-br from-mercedes-charcoal to-mercedes-gunmetal border border-mercedes-dark-silver/50'
}

const getPositionCardClass = (position: number): string => {
  if (position === 1) return 'ring-2 ring-f1-gold/50 shadow-lg shadow-f1-gold/20'
  if (position === 2) return 'ring-2 ring-f1-silver/50 shadow-lg shadow-f1-silver/20'
  if (position === 3) return 'ring-2 ring-f1-bronze/50 shadow-lg shadow-f1-bronze/20'
  return ''
}

const getPositionEmoji = (position: number): string => {
  if (position === 1) return '🥇'
  if (position === 2) return '🥈'
  if (position === 3) return '🥉'
  return ''
}

const getTeamBadgeClass = (teamName: string): string => {
  const teamSlug = getTeamSlug(teamName)
  const badgeClasses: { [key: string]: string } = {
    'ferrari': 'bg-red-600/20 text-red-400 border border-red-600/30',
    'mclaren': 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    'mercedes': 'bg-mercedes-petronas/20 text-mercedes-petronas border border-mercedes-petronas/30',
    'red-bull': 'bg-blue-600/20 text-blue-400 border border-blue-600/30',
    'williams': 'bg-blue-400/20 text-blue-300 border border-blue-400/30',
    'alpine': 'bg-pink-500/20 text-pink-400 border border-pink-500/30',
    'rb': 'bg-blue-700/20 text-blue-300 border border-blue-700/30',
    'aston-martin': 'bg-green-500/20 text-green-400 border border-green-500/30',
    'kick-sauber': 'bg-green-400/20 text-green-300 border border-green-400/30',
    'haas': 'bg-gray-300/20 text-gray-300 border border-gray-300/30',
    'default': 'bg-mercedes-dark-silver/20 text-mercedes-dark-silver border border-mercedes-dark-silver/30'
  }
  return badgeClasses[teamSlug] || badgeClasses['default']
}
</script>

<style scoped>
</style>
