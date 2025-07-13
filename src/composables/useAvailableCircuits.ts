import { ref, readonly } from 'vue'
import f1ApiService, { type SeasonScheduleData, type SeasonEvent } from '../services/f1ApiService'

// Interface pour un circuit simplifié
interface Circuit {
  location: string
  eventName: string
  country: string
  roundNumber: string
}

// État global partagé pour les circuits
const availableCircuits = ref<Circuit[]>([])
const circuitsLoading = ref<boolean>(false)
const circuitsError = ref<string | null>(null)
const currentSeasonYear = ref<number | null>(null)

/**
 * Composable pour gérer les circuits disponibles pour une saison donnée
 * Les circuits sont rechargés automatiquement quand l'année change
 */
export const useAvailableCircuits = () => {
  const loadAvailableCircuits = async (year: number): Promise<void> => {
    // Si c'est la même année, ne pas recharger
    if (currentSeasonYear.value === year && availableCircuits.value.length > 0) {
      return
    }

    circuitsLoading.value = true
    circuitsError.value = null

    try {
      const scheduleData: SeasonScheduleData = await f1ApiService.getSeasonSchedule(year)
      const currentDate = new Date()

      // Transformer les événements en circuits simplifiés
      // Filtrer les événements selon plusieurs critères :
      // 1. Exclure les tests pré-saison (RoundNumber = "0")
      // 2. Exclure les événements futurs (EventDate > date actuelle)
      availableCircuits.value = scheduleData.events
        .filter((event: SeasonEvent) => {
          // Exclure les tests pré-saison
          if (event.RoundNumber === "0") return false

          // Vérifier si l'événement a déjà eu lieu
          if (event.EventDate) {
            const eventDate = new Date(event.EventDate)
            // Ajouter un jour de buffer pour s'assurer que l'événement est complètement terminé
            const eventEndDate = new Date(eventDate.getTime() + (24 * 60 * 60 * 1000))
            return eventEndDate <= currentDate
          }

          // Si pas de date, on l'exclut par sécurité
          return false
        })
        .map((event: SeasonEvent) => ({
          location: event.Location.toLowerCase(),
          eventName: event.EventName,
          country: event.Country,
          roundNumber: event.RoundNumber
        }))
        .sort((a: Circuit, b: Circuit) => parseInt(a.roundNumber) - parseInt(b.roundNumber))

      currentSeasonYear.value = year
    } catch (err) {
      console.error('Erreur lors du chargement des circuits:', err)
      circuitsError.value = err instanceof Error ? err.message : 'Erreur lors du chargement des circuits'

      // Pas de fallback pour les circuits car ils dépendent de l'année
      availableCircuits.value = []
    } finally {
      circuitsLoading.value = false
    }
  }

  /**
   * Obtient la liste des circuits formatés pour un dropdown
   */
  const getCircuitOptions = () => {
    return availableCircuits.value.map(circuit => ({
      value: circuit.location,
      label: `${circuit.eventName} (${circuit.country})`,
      roundNumber: circuit.roundNumber
    }))
  }

  /**
   * Trouve un circuit par sa localisation
   */
  const getCircuitByLocation = (location: string): Circuit | undefined => {
    return availableCircuits.value.find(circuit => circuit.location === location)
  }

  /**
   * Réinitialise les circuits (utile quand on change d'année)
   */
  const clearCircuits = (): void => {
    availableCircuits.value = []
    currentSeasonYear.value = null
    circuitsError.value = null
  }

  return {
    // État en lecture seule
    availableCircuits: readonly(availableCircuits),
    circuitsLoading: readonly(circuitsLoading),
    circuitsError: readonly(circuitsError),
    currentSeasonYear: readonly(currentSeasonYear),

    // Méthodes
    loadAvailableCircuits,
    getCircuitOptions,
    getCircuitByLocation,
    clearCircuits
  }
}
