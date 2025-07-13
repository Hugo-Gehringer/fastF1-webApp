import axios, { AxiosInstance, AxiosError } from 'axios'

// Types pour les données OpenF1 API
interface OpenF1Session {
  country_code: string
  country_key: number
  country_name: string
  circuit_key: number
  circuit_short_name: string
  date_end: string
  date_start: string
  gmt_offset: string
  location: string
  meeting_key: number
  session_key: number
  session_name: string
  session_type: string
  year: number
}

interface OpenF1Driver {
  broadcast_name: string
  country_code: string
  driver_number: number
  first_name: string
  full_name: string
  headshot_url: string
  last_name: string
  meeting_key: number
  name_acronym: string
  session_key: number
  team_colour: string
  team_name: string
}

interface OpenF1Position {
  date: string
  driver_number: number
  meeting_key: number
  position: number
  session_key: number
}

interface OpenF1Lap {
  date_start: string
  driver_number: number
  duration_sector_1: number
  duration_sector_2: number
  duration_sector_3: number
  i1_speed: number
  i2_speed: number
  is_pit_out_lap: boolean
  lap_duration: number
  lap_number: number
  meeting_key: number
  segments_sector_1: number[]
  segments_sector_2: number[]
  segments_sector_3: number[]
  session_key: number
  st_speed: number
}

interface OpenF1Telemetry {
  brake: number
  date: string
  driver_number: number
  drs: number
  meeting_key: number
  n_gear: number
  rpm: number
  session_key: number
  speed: number
  throttle: number
}

interface OpenF1Location {
  date: string
  driver_number: number
  meeting_key: number
  session_key: number
  x: number
  y: number
  z: number
}

interface OpenF1Weather {
  air_temperature: number
  date: string
  humidity: number
  meeting_key: number
  pressure: number
  rainfall: number
  session_key: number
  track_temperature: number
  wind_direction: number
  wind_speed: number
}

interface OpenF1StintData {
  compound: string
  driver_number: number
  lap_end: number
  lap_start: number
  meeting_key: number
  session_key: number
  stint_number: number
  tyre_age_at_start: number
}

interface OpenF1PitData {
  date: string
  driver_number: number
  duration: number
  lap_number: number
  meeting_key: number
  pit_duration: number
  session_key: number
}

// Types transformés pour compatibilité avec l'interface existante
interface OpenF1SessionInfo {
  session_key: number
  session_name: string
  session_type: string
  circuit_name: string
  circuit_short_name: string
  country: string
  location: string
  date: string
  year: number
  drivers: OpenF1Driver[]
  weather?: OpenF1Weather[]
}

interface OpenF1FastestLap {
  driver_name: string
  driver_number: number
  lap_time: number
  lap_number: number
  sector1_time: number
  sector2_time: number
  sector3_time: number
  speed: number
  team_name: string
}

interface OpenF1TrackMap {
  session_key: number
  circuit_name: string
  year: number
  coordinates: {
    x: number[]
    y: number[]
    z: number[]
  }
  telemetry_data: {
    speed: number[]
    throttle: number[]
    brake: number[]
    rpm: number[]
    gear: number[]
  }
  data_points: number
}

interface OpenF1LatestRace {
  session_key: number
  session_name: string
  circuit_name: string
  country: string
  location: string
  date: string
  year: number
  drivers: Array<{
    driver_number: number
    driver_name: string
    team_name: string
    position: number
  }>
  fastest_lap: OpenF1FastestLap
}

interface OpenF1ApiError {
  error: string
  status: number
}

type OpenF1ApiResponse<T> = T | OpenF1ApiError

// Enum pour les types d'erreurs OpenF1
enum OpenF1ErrorType {
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  API = 'API',
  NOT_FOUND = 'NOT_FOUND',
  UNKNOWN = 'UNKNOWN'
}

interface OpenF1ErrorInfo {
  type: OpenF1ErrorType
  message: string
  originalError?: any
}

class OpenF1ApiService {
  private api: AxiosInstance
  private baseURL: string

  constructor(baseURL: string = 'https://api.openf1.org/v1') {
    this.baseURL = baseURL
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    // Intercepteur pour gérer les erreurs
    this.api.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        const errorInfo = this.categorizeError(error)
        console.error('Erreur OpenF1 API:', errorInfo)
        return Promise.reject(errorInfo)
      }
    )
  }

  private categorizeError(error: AxiosError): OpenF1ErrorInfo {
    if (error.code === 'ERR_NETWORK') {
      return {
        type: OpenF1ErrorType.NETWORK,
        message: `Impossible de se connecter à l'API OpenF1. Vérifiez votre connexion internet.`,
        originalError: error
      }
    }

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return {
        type: OpenF1ErrorType.TIMEOUT,
        message: 'Timeout de la requête OpenF1. L\'API met trop de temps à répondre.',
        originalError: error
      }
    }

    if (error.response?.status === 404) {
      return {
        type: OpenF1ErrorType.NOT_FOUND,
        message: 'Données non trouvées dans l\'API OpenF1.',
        originalError: error
      }
    }

    if (error.response?.status) {
      return {
        type: OpenF1ErrorType.API,
        message: `Erreur API OpenF1 ${error.response.status}: ${error.response.statusText}`,
        originalError: error
      }
    }

    return {
      type: OpenF1ErrorType.UNKNOWN,
      message: `Erreur inconnue OpenF1: ${error.message}`,
      originalError: error
    }
  }

  /**
   * Teste la connectivité avec l'API OpenF1
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.api.get('/sessions?limit=1')
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Récupère toutes les sessions disponibles
   */
  async getSessions(year?: number, limit: number = 50): Promise<OpenF1Session[]> {
    try {
      const params: any = { limit }
      if (year) params.year = year

      const response = await this.api.get<OpenF1Session[]>('/sessions', { params })
      return response.data
    } catch (error) {
      if (error && typeof error === 'object' && 'type' in error) {
        const errorInfo = error as OpenF1ErrorInfo
        throw new Error(errorInfo.message)
      }
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      throw new Error(`Erreur lors de la récupération des sessions: ${errorMessage}`)
    }
  }

  /**
   * Récupère les pilotes d'une session
   */
  async getDrivers(sessionKey: number): Promise<OpenF1Driver[]> {
    try {
      const response = await this.api.get<OpenF1Driver[]>('/drivers', {
        params: { session_key: sessionKey }
      })
      return response.data
    } catch (error) {
      if (error && typeof error === 'object' && 'type' in error) {
        const errorInfo = error as OpenF1ErrorInfo
        throw new Error(errorInfo.message)
      }
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      throw new Error(`Erreur lors de la récupération des pilotes: ${errorMessage}`)
    }
  }

  /**
   * Récupère les tours d'une session
   */
  async getLaps(sessionKey: number, driverNumber?: number): Promise<OpenF1Lap[]> {
    try {
      const params: any = { session_key: sessionKey }
      if (driverNumber) params.driver_number = driverNumber

      const response = await this.api.get<OpenF1Lap[]>('/laps', { params })
      return response.data
    } catch (error) {
      if (error && typeof error === 'object' && 'type' in error) {
        const errorInfo = error as OpenF1ErrorInfo
        throw new Error(errorInfo.message)
      }
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      throw new Error(`Erreur lors de la récupération des tours: ${errorMessage}`)
    }
  }

  /**
   * Récupère la télémétrie d'une session
   */
  async getTelemetry(sessionKey: number, driverNumber?: number, limit: number = 1000): Promise<OpenF1Telemetry[]> {
    try {
      const params: any = { session_key: sessionKey, limit }
      if (driverNumber) params.driver_number = driverNumber

      const response = await this.api.get<OpenF1Telemetry[]>('/car_data', { params })
      return response.data
    } catch (error) {
      if (error && typeof error === 'object' && 'type' in error) {
        const errorInfo = error as OpenF1ErrorInfo
        throw new Error(errorInfo.message)
      }
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      throw new Error(`Erreur lors de la récupération de la télémétrie: ${errorMessage}`)
    }
  }

  /**
   * Récupère les positions géographiques des voitures
   */
  async getLocations(sessionKey: number, driverNumber?: number, limit: number = 1000): Promise<OpenF1Location[]> {
    try {
      const params: any = { session_key: sessionKey, limit }
      if (driverNumber) params.driver_number = driverNumber

      const response = await this.api.get<OpenF1Location[]>('/location', { params })
      return response.data
    } catch (error) {
      if (error && typeof error === 'object' && 'type' in error) {
        const errorInfo = error as OpenF1ErrorInfo
        throw new Error(errorInfo.message)
      }
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      throw new Error(`Erreur lors de la récupération des positions: ${errorMessage}`)
    }
  }

  /**
   * Récupère les données météo d'une session
   */
  async getWeather(sessionKey: number): Promise<OpenF1Weather[]> {
    try {
      const response = await this.api.get<OpenF1Weather[]>('/weather', {
        params: { session_key: sessionKey }
      })
      return response.data
    } catch (error) {
      if (error && typeof error === 'object' && 'type' in error) {
        const errorInfo = error as OpenF1ErrorInfo
        throw new Error(errorInfo.message)
      }
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      throw new Error(`Erreur lors de la récupération des données météo: ${errorMessage}`)
    }
  }

  /**
   * Récupère les arrêts aux stands
   */
  async getPitStops(sessionKey: number): Promise<OpenF1PitData[]> {
    try {
      const response = await this.api.get<OpenF1PitData[]>('/pit', {
        params: { session_key: sessionKey }
      })
      return response.data
    } catch (error) {
      if (error && typeof error === 'object' && 'type' in error) {
        const errorInfo = error as OpenF1ErrorInfo
        throw new Error(errorInfo.message)
      }
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      throw new Error(`Erreur lors de la récupération des arrêts aux stands: ${errorMessage}`)
    }
  }

  /**
   * Récupère les informations complètes d'une session (équivalent à getSessionInfo)
   */
  async getSessionInfo(sessionKey: number): Promise<OpenF1SessionInfo> {
    try {
      // Récupérer les informations de base de la session
      const sessionsResponse = await this.api.get<OpenF1Session[]>('/sessions', {
        params: { session_key: sessionKey }
      })

      if (!sessionsResponse.data || sessionsResponse.data.length === 0) {
        throw new Error('Session non trouvée')
      }

      const session = sessionsResponse.data[0]

      // Récupérer les pilotes
      const drivers = await this.getDrivers(sessionKey)

      // Récupérer les données météo (optionnel)
      let weather: OpenF1Weather[] = []
      try {
        weather = await this.getWeather(sessionKey)
      } catch (e) {
        // Les données météo peuvent ne pas être disponibles
      }

      return {
        session_key: session.session_key,
        session_name: session.session_name,
        session_type: session.session_type,
        circuit_name: session.location,
        circuit_short_name: session.circuit_short_name,
        country: session.country_name,
        location: session.location,
        date: session.date_start,
        year: session.year,
        drivers,
        weather: weather.length > 0 ? weather : undefined
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'type' in error) {
        const errorInfo = error as OpenF1ErrorInfo
        throw new Error(errorInfo.message)
      }
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      throw new Error(`Erreur lors de la récupération des informations de session: ${errorMessage}`)
    }
  }

  /**
   * Récupère le tour le plus rapide d'une session (équivalent à getFastestLap)
   */
  async getFastestLap(sessionKey: number, driverNumber?: number): Promise<OpenF1FastestLap | null> {
    try {
      const laps = await this.getLaps(sessionKey, driverNumber)

      if (laps.length === 0) {
        return null
      }

      // Trouver le tour le plus rapide (en excluant les tours non valides)
      const validLaps = laps.filter(lap => lap.lap_duration && !lap.is_pit_out_lap)

      if (validLaps.length === 0) {
        return null
      }

      const fastestLap = validLaps.reduce((fastest, current) =>
        current.lap_duration < fastest.lap_duration ? current : fastest
      )

      // Récupérer les informations du pilote
      const drivers = await this.getDrivers(sessionKey)
      const driver = drivers.find(d => d.driver_number === fastestLap.driver_number)

      return {
        driver_name: driver?.full_name || `Driver ${fastestLap.driver_number}`,
        driver_number: fastestLap.driver_number,
        lap_time: fastestLap.lap_duration,
        lap_number: fastestLap.lap_number,
        sector1_time: fastestLap.duration_sector_1 || 0,
        sector2_time: fastestLap.duration_sector_2 || 0,
        sector3_time: fastestLap.duration_sector_3 || 0,
        speed: fastestLap.st_speed || 0,
        team_name: driver?.team_name || 'Unknown Team'
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'type' in error) {
        const errorInfo = error as OpenF1ErrorInfo
        throw new Error(errorInfo.message)
      }
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      throw new Error(`Erreur lors de la récupération du tour le plus rapide: ${errorMessage}`)
    }
  }

  /**
   * Récupère la carte du tracé avec télémétrie (équivalent à getTrackMap)
   */
  async getTrackMap(sessionKey: number): Promise<OpenF1TrackMap> {
    try {
      // Récupérer les positions géographiques
      const locations = await this.getLocations(sessionKey, undefined, 2000)

      // Récupérer la télémétrie
      const telemetry = await this.getTelemetry(sessionKey, undefined, 2000)

      // Récupérer les informations de session
      const sessionInfo = await this.getSessionInfo(sessionKey)

      if (locations.length === 0) {
        throw new Error('Aucune donnée de position disponible pour cette session')
      }

      // Organiser les données par timestamp pour synchroniser position et télémétrie
      const coordinates = {
        x: locations.map(loc => loc.x),
        y: locations.map(loc => loc.y),
        z: locations.map(loc => loc.z)
      }

      // Synchroniser les données de télémétrie avec les positions
      const telemetryData = {
        speed: telemetry.map(t => t.speed || 0),
        throttle: telemetry.map(t => t.throttle || 0),
        brake: telemetry.map(t => t.brake || 0),
        rpm: telemetry.map(t => t.rpm || 0),
        gear: telemetry.map(t => t.n_gear || 0)
      }

      return {
        session_key: sessionKey,
        circuit_name: sessionInfo.circuit_name,
        year: sessionInfo.year,
        coordinates,
        telemetry_data: telemetryData,
        data_points: locations.length
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'type' in error) {
        const errorInfo = error as OpenF1ErrorInfo
        throw new Error(errorInfo.message)
      }
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      throw new Error(`Erreur lors de la récupération de la carte du tracé: ${errorMessage}`)
    }
  }

  /**
   * Récupère la dernière course disponible (équivalent à getLatestRace)
   */
  async getLatestRace(): Promise<OpenF1LatestRace> {
    try {
      // Récupérer les sessions récentes
      const sessions = await this.getSessions(new Date().getFullYear(), 10)

      // Filtrer pour trouver la dernière course (session de type "Race")
      const raceSessions = sessions.filter(s => s.session_type === 'Race')

      if (raceSessions.length === 0) {
        throw new Error('Aucune course trouvée')
      }

      // Prendre la session la plus récente
      const latestRace = raceSessions.sort((a, b) =>
        new Date(b.date_start).getTime() - new Date(a.date_start).getTime()
      )[0]

      // Récupérer les pilotes et leurs positions
      const drivers = await this.getDrivers(latestRace.session_key)
      const positions = await this.api.get<OpenF1Position[]>('/position', {
        params: { session_key: latestRace.session_key }
      })

      // Organiser les pilotes par position finale
      const driversWithPositions = drivers.map(driver => {
        const driverPositions = positions.data.filter(p => p.driver_number === driver.driver_number)
        const finalPosition = driverPositions.length > 0
          ? driverPositions[driverPositions.length - 1].position
          : 999

        return {
          driver_number: driver.driver_number,
          driver_name: driver.full_name,
          team_name: driver.team_name,
          position: finalPosition
        }
      }).sort((a, b) => a.position - b.position)

      // Récupérer le tour le plus rapide
      const fastestLap = await this.getFastestLap(latestRace.session_key)

      return {
        session_key: latestRace.session_key,
        session_name: latestRace.session_name,
        circuit_name: latestRace.location,
        country: latestRace.country_name,
        location: latestRace.location,
        date: latestRace.date_start,
        year: latestRace.year,
        drivers: driversWithPositions,
        fastest_lap: fastestLap || {
          driver_name: 'N/A',
          driver_number: 0,
          lap_time: 0,
          lap_number: 0,
          sector1_time: 0,
          sector2_time: 0,
          sector3_time: 0,
          speed: 0,
          team_name: 'N/A'
        }
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'type' in error) {
        const errorInfo = error as OpenF1ErrorInfo
        throw new Error(errorInfo.message)
      }
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      throw new Error(`Erreur lors de la récupération de la dernière course: ${errorMessage}`)
    }
  }

  /**
   * Récupère les années disponibles
   */
  async getAvailableYears(): Promise<{ available_years: number[], total_years: number, earliest_year: number, latest_year: number }> {
    try {
      // Récupérer un échantillon de sessions pour déterminer les années disponibles
      const sessions = await this.getSessions(undefined, 100)
      const years = [...new Set(sessions.map(s => s.year))].sort((a, b) => b - a)

      return {
        available_years: years,
        total_years: years.length,
        earliest_year: Math.min(...years),
        latest_year: Math.max(...years)
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'type' in error) {
        const errorInfo = error as OpenF1ErrorInfo
        throw new Error(errorInfo.message)
      }
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      throw new Error(`Erreur lors de la récupération des années disponibles: ${errorMessage}`)
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

// Créer une instance du service OpenF1
const openF1ApiService = new OpenF1ApiService()

export default openF1ApiService

// Export de la classe pour créer des instances personnalisées
export { OpenF1ApiService }

// Export des types pour utilisation dans les composants
export type {
  OpenF1Session,
  OpenF1Driver,
  OpenF1Position,
  OpenF1Lap,
  OpenF1Telemetry,
  OpenF1Location,
  OpenF1Weather,
  OpenF1SessionInfo,
  OpenF1FastestLap,
  OpenF1TrackMap,
  OpenF1LatestRace,
  OpenF1ErrorInfo,
  OpenF1ErrorType
}
