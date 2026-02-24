import { useEffect, useState } from 'react'
import { getTraffic } from './api'

interface Props {
  onError: (msg: string) => void
}

export function Traffic({ onError }: Props) {
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTraffic()
      .then(setData)
      .catch((e) => onError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="muted">Loading…</p>
  if (!data) return null

  return (
    <section>
      <h2>Proxy Traffic</h2>
      <p className="muted">Remaining traffic for GoLogin high-quality proxies.</p>
      <pre className="traffic-json">{JSON.stringify(data, null, 2)}</pre>
    </section>
  )
}
