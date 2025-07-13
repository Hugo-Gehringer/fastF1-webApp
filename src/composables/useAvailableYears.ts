import { ref, readonly } from 'vue'
import f1ApiService, { type AvailableYearsData } from '../services/f1ApiService'

// État global partagé
const availableYears = ref<number[]>([])
const yearsLoading = ref<boolean>(false)
const yearsError = ref<string | null>(null)
const isInitialized = ref<boolean>(false)

/**
 * Composable pour gérer les années disponibles de manière centralisée
 * Les données sont chargées une seule fois et partagées entre tous les composants
 */
export const useAvailableYears = () => {
  const loadAvailableYears = async (): Promise<void> => {
    // Si déjà initialisé, ne pas recharger
    if (isInitialized.value) {
      return
    }

    yearsLoading.value = true
    yearsError.value = null

    try {
      const yearsData: AvailableYearsData = await f1ApiService.getAvailableYears()
      availableYears.value = yearsData.available_years.sort((a, b) => b - a) // Trier par ordre décroissant
      isInitialized.value = true
    } catch (err) {
      console.error('Erreur lors du chargement des années:', err)
      yearsError.value = err instanceof Error ? err.message : 'Erreur lors du chargement des années'

      // Fallback sur les années par défaut en cas d'erreur
      availableYears.value = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018]
      isInitialized.value = true
    } finally {
      yearsLoading.value = false
    }
  }

  /**
   * Obtient l'année la plus récente disponible
   */
  const getLatestYear = (): number => {
    return availableYears.value.length > 0 ? availableYears.value[0] : new Date().getFullYear()
  }

  /**
   * Force le rechargement des années (utile pour les mises à jour)
   */
  const refreshYears = async (): Promise<void> => {
    isInitialized.value = false
    await loadAvailableYears()
  }

  return {
    // État en lecture seule
    availableYears: readonly(availableYears),
    yearsLoading: readonly(yearsLoading),
    yearsError: readonly(yearsError),
    isInitialized: readonly(isInitialized),

    // Méthodes
    loadAvailableYears,
    getLatestYear,
    refreshYears
  }
}
