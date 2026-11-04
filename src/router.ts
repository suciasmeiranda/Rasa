import { useCallback, useEffect, useState } from 'react'

export type Route =
  | { name: 'menu' }
  | { name: 'orders' }
  | { name: 'admin' }
  | { name: 'success'; orderId: string }

function parseHash(): Route {
  const path = window.location.hash.replace(/^#\/?/, '')
  const [segment, param] = path.split('/')
  if (segment === 'pesanan') return { name: 'orders' }
  if (segment === 'admin') return { name: 'admin' }
  if (segment === 'sukses' && param) return { name: 'success', orderId: param }
  return { name: 'menu' }
}

export function navigate(path: string) {
  window.location.hash = path.startsWith('#') ? path : `#${path}`
}

export function useRoute() {
  const [route, setRoute] = useState<Route>(parseHash)

  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash())
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const go = useCallback((path: string) => {
    navigate(path)
  }, [])

  return { route, navigate: go }
}
