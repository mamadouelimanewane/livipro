import { useState, useEffect } from 'react'

/**
 * Hook responsive — remplace tous les window.innerWidth statiques.
 * Réagit aux redimensionnements en temps réel.
 *
 * Usage :
 *   const isMobile  = useMediaQuery('(max-width: 767px)')
 *   const isTablet  = useMediaQuery('(max-width: 1023px)')
 *   const isDesktop = useMediaQuery('(min-width: 1024px)')
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia(query)
    setMatches(mq.matches)
    const handler = (e) => setMatches(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [query])

  return matches
}

// Shortcuts prêts à l'emploi
export const useIsMobile  = () => useMediaQuery('(max-width: 767px)')
export const useIsTablet  = () => useMediaQuery('(max-width: 1023px)')
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)')
