import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { DEFAULT_PREFERENCES, type UserPreferences } from '../types'

const STORAGE_KEY = 'kplay-finder-preferences'

function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_PREFERENCES
    return { ...DEFAULT_PREFERENCES, ...(JSON.parse(raw) as UserPreferences) }
  } catch {
    return DEFAULT_PREFERENCES
  }
}

interface PreferenceContextValue {
  preferences: UserPreferences
  setPreferences: (next: UserPreferences) => void
  updatePreferences: (partial: Partial<UserPreferences>) => void
  completeOnboarding: (prefs: UserPreferences) => void
  resetPreferences: () => void
}

const PreferenceContext = createContext<PreferenceContextValue | null>(null)

export function PreferenceProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferencesState] = useState<UserPreferences>(() =>
    loadPreferences(),
  )

  const setPreferences = useCallback((next: UserPreferences) => {
    setPreferencesState(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }, [])

  const updatePreferences = useCallback((partial: Partial<UserPreferences>) => {
    setPreferencesState((prev) => {
      const next = { ...prev, ...partial }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const completeOnboarding = useCallback((prefs: UserPreferences) => {
    const next = { ...prefs, onboarded: true }
    setPreferencesState(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }, [])

  const resetPreferences = useCallback(() => {
    setPreferencesState(DEFAULT_PREFERENCES)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const value = useMemo(
    () => ({
      preferences,
      setPreferences,
      updatePreferences,
      completeOnboarding,
      resetPreferences,
    }),
    [
      preferences,
      setPreferences,
      updatePreferences,
      completeOnboarding,
      resetPreferences,
    ],
  )

  return (
    <PreferenceContext.Provider value={value}>
      {children}
    </PreferenceContext.Provider>
  )
}

export function usePreferences() {
  const ctx = useContext(PreferenceContext)
  if (!ctx) throw new Error('usePreferences must be used within PreferenceProvider')
  return ctx
}
