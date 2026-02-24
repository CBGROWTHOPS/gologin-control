import { useEffect, useState } from 'react'
import { listProfiles, addProxy, type Profile } from './api'

interface Props {
  onError: (msg: string) => void
  onSuccess: () => void
}

export function AddProxy({ onError, onSuccess }: Props) {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [profileId, setProfileId] = useState('')
  const [countryCode, setCountryCode] = useState('us')
  const [city, setCity] = useState('')
  const [isMobile, setIsMobile] = useState(true)
  const [isDC, setIsDC] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingProfiles, setLoadingProfiles] = useState(true)

  useEffect(() => {
    listProfiles({ page: 1 })
      .then((r) => {
        setProfiles(r.profiles)
        if (r.profiles[0] && !profileId) setProfileId(r.profiles[0].id)
      })
      .catch(() => setProfiles([]))
      .finally(() => setLoadingProfiles(false))
  }, [])

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await addProxy({
        countryCode: countryCode.toLowerCase(),
        profileIdToLink: profileId || undefined,
        city: city || undefined,
        isMobile,
        isDC,
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
      <h2>Add GoLogin Proxy</h2>
      <p className="muted">
        Creates a GoLogin mobile/residential/DC proxy and optionally links it to a profile.
      </p>
      <form onSubmit={handle}>
        <label>
          Link to profile (optional)
          <select
            value={profileId}
            onChange={(e) => setProfileId(e.target.value)}
            disabled={loadingProfiles}
          >
            <option value="">— Create only (no link) —</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Country code
          <input
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            placeholder="us"
            maxLength={2}
          />
        </label>
        <label>
          City (optional)
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="New York"
          />
        </label>
        <label className="row">
          <input
            type="checkbox"
            checked={isMobile}
            onChange={(e) => setIsMobile(e.target.checked)}
          />
          Mobile
        </label>
        <label className="row">
          <input
            type="checkbox"
            checked={isDC}
            onChange={(e) => setIsDC(e.target.checked)}
          />
          Datacenter
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Adding…' : 'Add Proxy'}
        </button>
      </form>
    </section>
  )
}
