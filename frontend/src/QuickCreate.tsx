import { useState } from 'react'
import { quickCreate } from './api'

interface Props {
  onError: (msg: string) => void
  onSuccess: () => void
}

export function QuickCreate({ onError, onSuccess }: Props) {
  const [name, setName] = useState('offers')
  const [os, setOs] = useState('mac')
  const [countryCode, setCountryCode] = useState('us')
  const [city, setCity] = useState('New York')
  const [loading, setLoading] = useState(false)

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await quickCreate({
        name,
        os,
        countryCode: countryCode.toLowerCase(),
        city: city || undefined,
        isMobile: true,
      })
      onSuccess()
    } catch (e) {
      onError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Quick Create</h2>
      <p className="muted">
        Creates a profile and attaches a mobile proxy in one step. Same flow as the CLI script.
      </p>
      <form onSubmit={handle}>
        <label>
          Profile name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="offers" />
        </label>
        <label>
          OS
          <select value={os} onChange={(e) => setOs(e.target.value)}>
            <option value="mac">mac</option>
            <option value="win">win</option>
            <option value="lin">lin</option>
          </select>
        </label>
        <label>
          Country
          <input
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            placeholder="us"
            maxLength={2}
          />
        </label>
        <label>
          City
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="New York" />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating…' : 'Create profile + proxy'}
        </button>
      </form>
    </section>
  )
}
