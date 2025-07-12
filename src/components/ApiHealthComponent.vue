<template>
  <div class="space-y-8">
    <!-- Professional Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="title-gradient">
          API CONTROL STATION
        </h2>
        <div class="racing-line w-24 mt-2"></div>
        <p class="text-gray-400 font-racing mt-2">FastF1 API connectivity and diagnostics</p>
      </div>
      <div class="telemetry-display">
        <div class="text-xs uppercase tracking-wider">Status</div>
        <div class="text-lg font-bold">MONITOR</div>
      </div>
    </div>

    <!-- API Configuration -->
    <div class="f1-card">
      <div class="p-8">
        <h3 class="text-xl font-racing font-semibold text-gray-200 mb-6 flex items-center">
          <div class="w-1 h-6 bg-gradient-to-t from-f1-red to-electric-blue rounded mr-3"></div>
          API CONFIGURATION
        </h3>

        <div class="flex flex-wrap gap-6 items-end">
          <div class="flex-1 min-w-80">
            <label class="block text-sm font-racing font-medium text-gray-300 uppercase tracking-wider mb-3">
              API Endpoint URL
            </label>
            <input
              v-model="apiUrl"
              type="text"
              placeholder="http://localhost:8000"
              @change="updateApiUrl"
              class="f1-input"
            />
          </div>
          <button @click="updateApiUrl" class="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-racing font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105">
            UPDATE ENDPOINT
          </button>
        </div>
      </div>
    </div>

    <!-- API Health Check -->
    <div class="f1-card">
      <div class="p-8">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-racing font-semibold text-gray-200 flex items-center">
            <div class="w-1 h-6 bg-gradient-to-t from-green-500 to-neon-green rounded mr-3"></div>
            HEALTH DIAGNOSTICS
          </h3>
          <button @click="checkHealth" :disabled="loading" class="f1-button">
            {{ loading ? 'SCANNING...' : 'RUN DIAGNOSTICS' }}
          </button>
        </div>

        <!-- Health Status Display -->
        <div v-if="healthStatus" :class="[
          'p-6 rounded-xl mb-6 animate-fade-in',
          healthStatus.status === 'healthy' ? 'bg-gradient-to-r from-green-900/30 to-green-800/30 border border-green-500/30' : 'bg-gradient-to-r from-red-900/30 to-red-800/30 border border-red-500/30'
        ]">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="relative">
                <div :class="[
                  'w-12 h-12 rounded-full flex items-center justify-center text-2xl',
                  healthStatus.status === 'healthy' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                ]">
                  {{ healthStatusIcon }}
                </div>
                <div v-if="healthStatus.status === 'healthy'" class="absolute inset-0 w-12 h-12 bg-green-500 rounded-full animate-ping opacity-75"></div>
              </div>
              <div>
                <div :class="[
                  'text-2xl font-f1 font-bold uppercase tracking-wider',
                  healthStatus.status === 'healthy' ? 'text-green-400' : 'text-red-400'
                ]">
                  {{ healthStatus.status }}
                </div>
                <div class="text-gray-300 font-racing">{{ healthStatus.message }}</div>
              </div>
            </div>
            <div class="telemetry-display">
              <div class="text-xs">LAST CHECK</div>
              <div class="text-sm font-bold">{{ lastChecked || 'Never' }}</div>
            </div>
          </div>
        </div>

        <!-- Error Display with Diagnostics -->
        <div v-if="error" class="f1-error animate-fade-in mb-6">
          <div class="flex items-start space-x-4">
            <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-white text-lg">!</span>
            </div>
            <div class="flex-1">
              <div class="text-lg font-racing font-semibold mb-2">CONNECTION ERROR</div>
              <div class="text-base mb-4">{{ error }}</div>
              <div class="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4">
                <h4 class="font-racing font-semibold text-yellow-400 mb-3">TROUBLESHOOTING GUIDE</h4>
                <ul class="space-y-2 text-sm text-yellow-200">
                  <li class="flex items-center">
                    <span class="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                    Verify Python FastF1 server is running on: <code class="bg-gray-800 px-2 py-1 rounded ml-1">{{ apiUrl }}</code>
                  </li>
                  <li class="flex items-center">
                    <span class="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                    Check if port is blocked by firewall
                  </li>
                  <li class="flex items-center">
                    <span class="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                    Ensure CORS is configured for origin: <code class="bg-gray-800 px-2 py-1 rounded ml-1">localhost:5173</code>
                  </li>
                  <li class="flex items-center">
                    <span class="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                    Verify API endpoint responds to GET /health
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Connection Test -->
    <div class="f1-card">
      <div class="p-8">
        <h3 class="text-xl font-racing font-semibold text-gray-200 mb-6 flex items-center">
          <div class="w-1 h-6 bg-gradient-to-t from-electric-blue to-purple-500 rounded mr-3"></div>
          CONNECTIVITY TEST
        </h3>

        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button @click="testConnection" :disabled="testingConnection" class="f1-button">
              {{ testingConnection ? 'TESTING...' : 'TEST CONNECTION' }}
            </button>
            <div v-if="connectionResult !== null" class="flex items-center space-x-3">
              <div :class="[
                'w-4 h-4 rounded-full',
                connectionResult ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              ]"></div>
              <span :class="[
                'font-racing font-semibold',
                connectionResult ? 'text-green-400' : 'text-red-400'
              ]">
                {{ connectionResult ? 'CONNECTION SUCCESSFUL' : 'CONNECTION FAILED' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- API Information Dashboard -->
    <div class="f1-card">
      <div class="p-8">
        <h3 class="text-xl font-racing font-semibold text-gray-200 mb-6 flex items-center">
          <div class="w-1 h-6 bg-gradient-to-t from-purple-500 to-pink-500 rounded mr-3"></div>
          API INFORMATION
        </h3>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Current Configuration -->
          <div class="data-card" style="--accent-color: #00D4FF;">
            <div class="flex items-center justify-between mb-4">
              <h4 class="font-racing font-semibold text-gray-200 uppercase text-sm">Current Endpoint</h4>
              <div class="w-3 h-3 bg-electric-blue rounded-full animate-pulse"></div>
            </div>
            <div class="text-lg font-f1 font-bold text-white mb-2 break-all">
              {{ apiUrl }}
            </div>
            <div class="text-sm text-gray-400 font-racing">Base URL</div>
          </div>

          <!-- Timeout Configuration -->
          <div class="data-card" style="--accent-color: #F59E0B;">
            <div class="flex items-center justify-between mb-4">
              <h4 class="font-racing font-semibold text-gray-200 uppercase text-sm">Request Timeout</h4>
              <div class="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
            </div>
            <div class="text-3xl font-f1 font-bold text-yellow-500 mb-2">
              15
            </div>
            <div class="text-sm text-gray-400 font-racing">seconds</div>
          </div>
        </div>

        <!-- Available Endpoints -->
        <div class="mt-8">
          <h4 class="text-lg font-racing font-semibold text-gray-200 mb-4 flex items-center">
            <div class="w-1 h-6 bg-gradient-to-t from-neon-green to-electric-blue rounded mr-3"></div>
            AVAILABLE ENDPOINTS
          </h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-gradient-to-r from-gray-800 to-gray-900 p-4 rounded-xl border border-gray-600">
              <div class="flex items-center justify-between mb-2">
                <code class="text-green-400 font-mono text-sm">GET /health</code>
                <div class="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
              <div class="text-xs text-gray-400 font-racing">API health status</div>
            </div>

            <div class="bg-gradient-to-r from-gray-800 to-gray-900 p-4 rounded-xl border border-gray-600">
              <div class="flex items-center justify-between mb-2">
                <code class="text-blue-400 font-mono text-sm">GET /drivers/{code}/fastest-lap</code>
                <div class="w-2 h-2 bg-blue-400 rounded-full"></div>
              </div>
              <div class="text-xs text-gray-400 font-racing">Fastest lap telemetry</div>
            </div>

            <div class="bg-gradient-to-r from-gray-800 to-gray-900 p-4 rounded-xl border border-gray-600">
              <div class="flex items-center justify-between mb-2">
                <code class="text-purple-400 font-mono text-sm">GET /sessions/{year}/{circuit}/{session}/results</code>
                <div class="w-2 h-2 bg-purple-400 rounded-full"></div>
              </div>
              <div class="text-xs text-gray-400 font-racing">Session classification</div>
            </div>

            <div class="bg-gradient-to-r from-gray-800 to-gray-900 p-4 rounded-xl border border-gray-600">
              <div class="flex items-center justify-between mb-2">
                <code class="text-yellow-400 font-mono text-sm">GET /drivers/{code}/info</code>
                <div class="w-2 h-2 bg-yellow-400 rounded-full"></div>
              </div>
              <div class="text-xs text-gray-400 font-racing">Driver profile data</div>
            </div>

            <div class="bg-gradient-to-r from-gray-800 to-gray-900 p-4 rounded-xl border border-gray-600 md:col-span-2">
              <div class="flex items-center justify-between mb-2">
                <code class="text-orange-400 font-mono text-sm">GET /sessions/{year}/{circuit}/{session}/info</code>
                <div class="w-2 h-2 bg-orange-400 rounded-full"></div>
              </div>
              <div class="text-xs text-gray-400 font-racing">Complete session information</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Server Setup Instructions -->
    <div class="f1-card bg-gradient-to-r from-blue-900/20 to-indigo-800/20 border-blue-500/30">
      <div class="p-8">
        <h3 class="text-xl font-racing font-semibold text-blue-400 mb-6 flex items-center">
          <div class="w-1 h-6 bg-gradient-to-t from-blue-500 to-electric-blue rounded mr-3"></div>
          SERVER SETUP GUIDE
        </h3>

        <div class="space-y-4">
          <p class="text-gray-300 font-racing">Follow these steps to start your FastF1 API server:</p>

          <div class="bg-gray-900/50 rounded-xl p-6 border border-blue-500/20">
            <ol class="space-y-3 text-sm text-gray-300 font-racing">
              <li class="flex items-start">
                <span class="inline-flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full text-xs font-bold mr-3 mt-0.5">1</span>
                <div>
                  <div class="text-blue-400 font-semibold">Navigate to your Python project directory</div>
                  <code class="block mt-1 text-xs bg-gray-800 p-2 rounded">cd /path/to/your/fastf1-project</code>
                </div>
              </li>
              <li class="flex items-start">
                <span class="inline-flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full text-xs font-bold mr-3 mt-0.5">2</span>
                <div>
                  <div class="text-blue-400 font-semibold">Activate virtual environment (if applicable)</div>
                  <code class="block mt-1 text-xs bg-gray-800 p-2 rounded">source venv/bin/activate</code>
                </div>
              </li>
              <li class="flex items-start">
                <span class="inline-flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full text-xs font-bold mr-3 mt-0.5">3</span>
                <div>
                  <div class="text-blue-400 font-semibold">Install required dependencies</div>
                  <code class="block mt-1 text-xs bg-gray-800 p-2 rounded">pip install fastapi uvicorn fastf1</code>
                </div>
              </li>
              <li class="flex items-start">
                <span class="inline-flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full text-xs font-bold mr-3 mt-0.5">4</span>
                <div>
                  <div class="text-blue-400 font-semibold">Start the development server</div>
                  <code class="block mt-1 text-xs bg-gray-800 p-2 rounded">uvicorn main:app --reload --host 0.0.0.0 --port 8000</code>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import f1ApiService, { type HealthStatus } from '../services/f1ApiService'

const healthStatus = ref<HealthStatus | null>(null)
const loading = ref<boolean>(false)
const error = ref<string | null>(null)
const lastChecked = ref<string | null>(null)
const apiUrl = ref<string>(f1ApiService.getBaseURL())
const testingConnection = ref<boolean>(false)
const connectionResult = ref<boolean | null>(null)

const healthStatusClass = computed<string>(() => {
  if (!healthStatus.value) return ''
  return healthStatus.value.status === 'healthy' ? 'healthy' : 'unhealthy'
})

const healthStatusIcon = computed<string>(() => {
  if (!healthStatus.value) return ''
  return healthStatus.value.status === 'healthy' ? '✅' : '❌'
})

const updateApiUrl = (): void => {
  f1ApiService.setBaseURL(apiUrl.value)
  // Reset les résultats précédents
  healthStatus.value = null
  error.value = null
  connectionResult.value = null
}

const testConnection = async (): Promise<void> => {
  testingConnection.value = true
  connectionResult.value = null

  try {
    const isConnected = await f1ApiService.testConnection()
    connectionResult.value = isConnected
  } catch (err) {
    connectionResult.value = false
  } finally {
    testingConnection.value = false
  }
}

const checkHealth = async (): Promise<void> => {
  loading.value = true
  error.value = null
  healthStatus.value = null
  connectionResult.value = null

  try {
    const result = await f1ApiService.healthCheck()
    healthStatus.value = result
    lastChecked.value = new Date().toLocaleString('fr-FR')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erreur inconnue'
    healthStatus.value = {
      status: 'unhealthy',
      message: 'API non disponible'
    }
    lastChecked.value = new Date().toLocaleString('fr-FR')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // Vérifier l'état de l'API au chargement du composant
  checkHealth()
})
</script>

<style scoped>
</style>
