import { useRef } from 'react'

export function useParallaxTilt(maxTilt = 10) {
  const elementRef = useRef(null)

  const handleMouseMove = (event) => {
    const node = elementRef.current
    if (!node) return
    const { left, top, width, height } = node.getBoundingClientRect()
    const x = (event.clientX - left) / width - 0.5
    const y = (event.clientY - top) / height - 0.5
    const tiltX = Math.max(Math.min(-y * maxTilt, maxTilt), -maxTilt)
    const tiltY = Math.max(Math.min(x * maxTilt, maxTilt), -maxTilt)
    node.style.setProperty('--tilt-x', `${tiltX}deg`)
    node.style.setProperty('--tilt-y', `${tiltY}deg`)
  }

  const handleMouseLeave = () => {
    const node = elementRef.current
    if (!node) return
    node.style.setProperty('--tilt-x', '0deg')
    node.style.setProperty('--tilt-y', '0deg')
  }

  return {
    ref: elementRef,
    events: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
    },
  }
}
