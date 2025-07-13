import axios, { AxiosInstance, AxiosError } from 'axios'

// Types pour les données FastF1
interface AvailableYearsData {
  available_years: number[]
  total_years: number
  earliest_year: number
  latest_year: number
}

interface FastestLapData {
  driver_name?: string
  lap_time?: string
  lap_number?: number
  speed?: number
  sector1_time?: string
  sector2_time?: string
  sector3_time?: string
}

interface SessionResult {
  position?: number
  driver_name?: string
  driver_code?: string
  team?: string
  time?: string
  gap?: string
  points?: number
}

interface SessionResultsData {
  session_info?: {
    circuit_name?: string
    date?: string
    weather?: string
  }
  results?: SessionResult[]
}

interface DriverPerformance {
  position?: number
  best_lap_time?: string
  gap_to_leader?: string
  laps_completed?: number
  top_speed?: number
  points?: number
}

interface DriverTelemetry {
  average_speed?: number
  average_rpm?: number
  engine_temp?: number
  tire_pressure?: string
}

interface TrackVisualizationData {
  circuit: string
  year: number
  track_outline: {
    x: number[]
    y: number[]
  }
  track_length: number
  data_points: number
}

interface TrackMapData {
  circuit: string
  year: number
  session: string
  coordinates: {
    x: number[]
    y: number[]
    z: number[]
  }
  additional_data: {
    distance: number[]
    speed: number[]
    throttle: number[]
  }
  track_length: number
  data_points: number
}

interface DriverInfoData {
  full_name?: string
  driver_code?: string
  team?: string
  driver_number?: number
  nationality?: string
  age?: number
  performance?: DriverPerformance
  telemetry?: DriverTelemetry
}

interface SessionWeather {
  air_temp?: number
  track_temp?: number
  humidity?: number
  pressure?: number
  wind_speed?: number
  conditions?: string
}

interface SessionCircuit {
  length?: number
  laps?: number
  turns?: number
  drs_zones?: number
  lap_record?: string
  country?: string
}

interface SessionStatistics {
  total_laps?: number
  total_drivers?: number
  yellow_flags?: number
  red_flags?: number
  safety_car?: number
  virtual_safety_car?: number
}

interface SessionInfoData {
  grand_prix?: string
  circuit_name?: string
  date?: string
  time?: string
  session_type?: string
  duration?: string
  weather?: SessionWeather
  circuit?: SessionCircuit
  statistics?: SessionStatistics
}

interface LatestRaceData {
  year: number
  circuit: string
  session: string
  session_name: string
  circuit_name: string
  country: string
  location: string
  date: string
  total_laps: number
  drivers: Array<{
    driver_code: string
    name: string
    team: string
    number: string
  }>
  fastest_lap: {
    driver: string
    lap_time: string
    lap_number: number
    team: string
  }
  is_latest_session: boolean
  session_type: string
  event_date: string
  session_dates: {
    fp1: string
    fp2: string
    fp3: string
    qualifying: string
    race: string
  }
}

interface HealthStatus {
  status: string
  message: string
}

interface ApiError {
  error: string
}

type ApiResponse<T> = T | ApiError

// Enum pour les types d'erreurs
enum ErrorType {
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  API = 'API',
  UNKNOWN = 'UNKNOWN'
}

interface ErrorInfo {
  type: ErrorType
  message: string
  originalError?: any
}

class F1ApiService {
  private api: AxiosInstance
  private baseURL: string

  constructor(baseURL: string = 'http://localhost:8000/api/v1/f1') {
    this.baseURL = baseURL
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 15000, // Augmenté à 15 secondes
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Intercepteur pour gérer les erreurs de manière plus détaillée
    this.api.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        const errorInfo = this.categorizeError(error)
        console.error('Erreur API détaillée:', errorInfo)
        return Promise.reject(errorInfo)
      }
    )
  }

  private categorizeError(error: AxiosError): ErrorInfo {
    if (error.code === 'ERR_NETWORK') {
      return {
        type: ErrorType.NETWORK,
        message: `Impossible de se connecter à l'API FastF1 sur ${this.baseURL}. Vérifiez que votre serveur Python est démarré.`,
        originalError: error
      }
    }

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return {
        type: ErrorType.TIMEOUT,
        message: 'Timeout de la requête. Le serveur met trop de temps à répondre.',
        originalError: error
      }
    }

    if (error.response?.status) {
      return {
        type: ErrorType.API,
        message: `Erreur API ${error.response.status}: ${error.response.statusText}`,
        originalError: error
      }
    }

    return {
      type: ErrorType.UNKNOWN,
      message: `Erreur inconnue: ${error.message}`,
      originalError: error
    }
  }

  /**
   * Teste la connectivité avec l'API
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.api.get('/health')
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Récupère les données du tour le plus rapide d'un pilote
   */
  async getFastestLap(
    driverCode: string,
    year: number,
    circuit: string,
    session: string
  ): Promise<FastestLapData> {
    try {
      const response = await this.api.get<ApiResponse<FastestLapData>>(`/drivers/${driverCode}/fastest-lap`, {
        params: { year, circuit, session }
      })

      if ('error' in response.data) {
        throw new Error(response.data.error)
      }

      return response.data
    } catch (error) {
      // Gestion spécifique des erreurs categorisées
      if (error && typeof error === 'object' && 'type' in error) {
        const errorInfo = error as ErrorInfo
        throw new Error(errorInfo.message)
      }

      // Autres erreurs
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      throw new Error(`Erreur lors de la récupération du tour le plus rapide: ${errorMessage}`)
    }
  }

  /**
   * Récupère les résultats d'une session
   */
  async getSessionResults(
    year: number,
    circuit: string,
    session: string
  ): Promise<SessionResultsData> {
    try {
      console.log(year, circuit, session)
      const response = await this.api.get<ApiResponse<SessionResultsData>>(`/sessions/${year}/${circuit}/${session}/results`)

      if ('error' in response.data) {
        throw new Error(response.data.error)
      }

      return response.data
    } catch (error) {
      // Gestion spécifique des erreurs categorisées
      if (error && typeof error === 'object' && 'type' in error) {
        const errorInfo = error as ErrorInfo
        throw new Error(errorInfo.message)
      }

      // Autres erreurs
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      throw new Error(`Erreur lors de la récupération des résultats: ${errorMessage}`)
    }
  }

  /**
   * Récupère les informations d'un pilote
   */
  async getDriverInfo(
    driverCode: string,
    year: number,
    circuit: string,
    session: string
  ): Promise<DriverInfoData> {
    try {
      const response = await this.api.get<ApiResponse<DriverInfoData>>(`/drivers/${driverCode}/info`, {
        params: { year, circuit, session }
      })

      if ('error' in response.data) {
        throw new Error(response.data.error)
      }

      return response.data
    } catch (error) {
      // Gestion spécifique des erreurs categorisées
      if (error && typeof error === 'object' && 'type' in error) {
        const errorInfo = error as ErrorInfo
        throw new Error(errorInfo.message)
      }

      // Autres erreurs
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      throw new Error(`Erreur lors de la récupération des informations du pilote: ${errorMessage}`)
    }
  }

  /**
   * Récupère les informations complètes d'une session
   */
  async getSessionInfo(
    year: number,
    circuit: string,
    session: string
  ): Promise<SessionInfoData> {
    try {
      const response = await this.api.get<ApiResponse<SessionInfoData>>(`/sessions/${year}/${circuit}/${session}/info`)

      if ('error' in response.data) {
        throw new Error(response.data.error)
      }

      return response.data
    } catch (error) {
      // Gestion spécifique des erreurs categorisées
      if (error && typeof error === 'object' && 'type' in error) {
        const errorInfo = error as ErrorInfo
        throw new Error(errorInfo.message)
      }

      // Autres erreurs
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      throw new Error(`Erreur lors de la récupération des informations de session: ${errorMessage}`)
    }
  }

  /**
   * Récupère la liste des années de données disponibles
   */
  async getAvailableYears(): Promise<AvailableYearsData> {
    try {
      const response = await this.api.get<ApiResponse<AvailableYearsData>>('/years')

      if ('error' in response.data) {
        throw new Error(response.data.error)
      }

      return response.data
    } catch (error) {
      // Gestion spécifique des erreurs categorisées
      if (error && typeof error === 'object' && 'type' in error) {
        const errorInfo = error as ErrorInfo
        throw new Error(errorInfo.message)
      }

      // Autres erreurs
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      throw new Error(`Erreur lors de la récupération des années disponibles: ${errorMessage}`)
    }
  }

  /**
   * Récupère le calendrier complet d'une saison
   */
  async getSeasonSchedule(year: number): Promise<SeasonScheduleData> {
    try {
      const response = await this.api.get<ApiResponse<SeasonScheduleData>>(`/seasons/${year}/schedule`)

      if ('error' in response.data) {
        throw new Error(response.data.error)
      }

      return response.data
    } catch (error) {
      // Gestion spécifique des erreurs categorisées
      if (error && typeof error === 'object' && 'type' in error) {
        const errorInfo = error as ErrorInfo
        throw new Error(errorInfo.message)
      }

      // Autres erreurs
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      throw new Error(`Erreur lors de la récupération du calendrier de la saison: ${errorMessage}`)
    }
  }

  /**
   * Récupère les informations de la dernière course disponible
   */
  async getLatestRace(sessionType: string = 'Race'): Promise<LatestRaceData> {
    try {
      const response = await this.api.get<ApiResponse<LatestRaceData>>('/latest-race', {
        params: { session_type: sessionType }
      })

      if ('error' in response.data) {
        throw new Error(response.data.error)
      }

      return response.data
    } catch (error) {
      // Gestion spécifique des erreurs categorisées
      if (error && typeof error === 'object' && 'type' in error) {
        const errorInfo = error as ErrorInfo
        throw new Error(errorInfo.message)
      }

      // Autres erreurs
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      throw new Error(`Erreur lors de la récupération de la dernière course: ${errorMessage}`)
    }
  }

  /**
   * Récupère les données de visualisation du tracé d'un circuit
   */
  async getTrackVisualization(
    year: number,
    circuit: string
  ): Promise<TrackVisualizationData> {
    try {
      const response = await this.api.get<ApiResponse<TrackVisualizationData>>(`/track-visualization/${year}/${circuit}`)

      if ('error' in response.data) {
        throw new Error(response.data.error)
      }

      return response.data
    } catch (error) {
      // Gestion spécifique des erreurs categorisées
      if (error && typeof error === 'object' && 'type' in error) {
        const errorInfo = error as ErrorInfo
        throw new Error(errorInfo.message)
      }

      // Autres erreurs
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      throw new Error(`Erreur lors de la récupération de la visualisation du tracé: ${errorMessage}`)
    }
  }

  /**
   * Récupère les données de carte du tracé avec télémétrie
   */
  async getTrackMap(
    year: number,
    circuit: string
  ): Promise<TrackMapData> {
    try {
      const response = await this.api.get<ApiResponse<TrackMapData>>(`/track-map/${year}/${circuit}`)

      if ('error' in response.data) {
        throw new Error(response.data.error)
      }

      return response.data
    } catch (error) {
      // Gestion spécifique des erreurs categorisées
      if (error && typeof error === 'object' && 'type' in error) {
        const errorInfo = error as ErrorInfo
        throw new Error(errorInfo.message)
      }

      // Autres erreurs
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      throw new Error(`Erreur lors de la récupération de la carte du tracé: ${errorMessage}`)
    }
  }

  /**
   * Vérification de l'état de santé de l'API
   */
  async healthCheck(): Promise<HealthStatus> {
    try {
      const response = await this.api.get<ApiResponse<HealthStatus>>('/health')

      if ('error' in response.data) {
        throw new Error(response.data.error)
      }

      return response.data
    } catch (error) {
      // Gestion spécifique des erreurs categorisées
      if (error && typeof error === 'object' && 'type' in error) {
        const errorInfo = error as ErrorInfo
        throw new Error(errorInfo.message)
      }

      // Autres erreurs
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      throw new Error(`Erreur lors de la vérification de l'état de l'API: ${errorMessage}`)
    }
  }

  /**
   * Change l'URL de base de l'API
   */
  setBaseURL(newBaseURL: string): void {
    this.baseURL = newBaseURL
    this.api.defaults.baseURL = newBaseURL
  }

  /**
   * Récupère l'URL de base actuelle
   */
  getBaseURL(): string {
    return this.baseURL
  }
}

// Créer une instance avec la possibilité de configurer l'URL
const f1ApiService = new F1ApiService()

export default f1ApiService

// Export de la classe pour créer des instances personnalisées
export { F1ApiService }

// Export des types pour utilisation dans les composants
export type {
  FastestLapData,
  SessionResultsData,
  DriverInfoData,
  SessionInfoData,
  LatestRaceData,
  HealthStatus,
  ErrorInfo,
  ErrorType,
  AvailableYearsData,
  TrackVisualizationData,
  TrackMapData,
  SeasonEvent,
  SeasonScheduleData
}
