import { useEffect, useState } from 'react'
import { listProfiles, deleteProfiles, renameProfile, type Profile } from './api'

interface Props {
  onError: (msg: string) => void
}

export function Profiles({ onError }: Props) {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [renaming, setRenaming] = useState<string | null>(null)
  const [newName, setNewName] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const r = await listProfiles({ page, search: search || undefined })
      setProfiles(r.profiles)
      setTotal(r.allProfilesCount)
    } catch (e) {
      onError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [page, search])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this profile?')) return
    try {
      await deleteProfiles([id])
      load()
    } catch (e) {
      onError(e instanceof Error ? e.message : String(e))
    }
  }

  const handleRename = async (id: string, name: string) => {
    try {
      await renameProfile(id, name)
      setRenaming(null)
      setNewName('')
      load()
    } catch (e) {
      onError(e instanceof Error ? e.message : String(e))
    }
  }

  const osLabel = (p: Profile): string => {
    if (typeof p.os === 'object' && p.os?.id) return String(p.os.id)
    if (typeof p.os === 'string') return p.os
    return '—'
  }
  const dateStr = (s?: string) => (s ? new Date(s).toLocaleDateString() : '—')

  return (
    <section>
      <h2>Profiles</h2>
      <div className="toolbar">
        <input
          type="search"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
      </div>
      {loading ? (
        <p className="muted">Loading…</p>
      ) : profiles.length === 0 ? (
        <p className="muted">No profiles found.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>OS</th>
              <th>Proxy</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => (
              <tr key={p.id}>
                <td>
                  {renaming === p.id ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleRename(p.id, newName || p.name)
                      }}
                    >
                      <input
                        autoFocus
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onBlur={() => {
                          if (newName && newName !== p.name) handleRename(p.id, newName)
                          setRenaming(null)
                          setNewName('')
                        }}
                      />
                    </form>
                  ) : (
                    <button
                      className="link"
                      onClick={() => {
                        setRenaming(p.id)
                        setNewName(p.name)
                      }}
                    >
                      {p.name}
                    </button>
                  )}
                </td>
                <td>{osLabel(p)}</td>
                <td>
                  {p.proxyType ? `${p.proxyType}${p.proxyRegion ? ` (${p.proxyRegion})` : ''}` : '—'}
                </td>
                <td>{dateStr(p.createdAt)}</td>
                <td>
                  <button className="btn-sm danger" onClick={() => handleDelete(p.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {total > 30 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span>
            Page {page} of {Math.ceil(total / 30)}
          </span>
          <button
            disabled={page >= Math.ceil(total / 30)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </section>
  )
}
