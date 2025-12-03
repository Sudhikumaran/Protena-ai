import { useEffect, useRef } from 'react'

export function useScrollReveal({ once = true, threshold = 0.15 } = {}) {
  const elementRef = useRef(null)

  useEffect(() => {
    const node = elementRef.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      node?.classList.add('is-visible')
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            if (once) observer.unobserve(entry.target)
          } else if (!once) {
            entry.target.classList.remove('is-visible')
          }
        })
      },
      { threshold },
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [once, threshold])

  return elementRef
}
