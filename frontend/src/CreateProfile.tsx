import { useState } from 'react'
import { createProfile } from './api'

interface Props {
  onError: (msg: string) => void
  onSuccess: () => void
}

export function CreateProfile({ onError, onSuccess }: Props) {
  const [name, setName] = useState('New Profile')
  const [os, setOs] = useState('mac')
  const [osSpec, setOsSpec] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await createProfile({ name, os, osSpec: osSpec || undefined })
      onSuccess()
    } catch (e) {
      onError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Create Profile</h2>
      <p className="muted">Creates a quick profile with random fingerprint.</p>
      <form onSubmit={handle}>
        <label>
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Profile name"
          />
        </label>
        <label>
          OS
          <select value={os} onChange={(e) => setOs(e.target.value)}>
            <option value="mac">mac</option>
            <option value="win">win</option>
            <option value="lin">lin</option>
            <option value="android">android</option>
            <option value="android-cloud">android-cloud</option>
          </select>
        </label>
        <label>
          OS spec (optional)
          <select value={osSpec} onChange={(e) => setOsSpec(e.target.value)}>
            <option value="">—</option>
            <option value="win11">win11</option>
            <option value="M1">M1</option>
            <option value="M2">M2</option>
            <option value="M3">M3</option>
            <option value="M4">M4</option>
          </select>
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating…' : 'Create'}
        </button>
      </form>
    </section>
  )
}
