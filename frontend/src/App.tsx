import { useState } from 'react'
import { Profiles } from './Profiles'
import { CreateProfile } from './CreateProfile'
import { AddProxy } from './AddProxy'
import { QuickCreate } from './QuickCreate'
import { Traffic } from './Traffic'
import './App.css'

type Page = 'profiles' | 'create' | 'proxy' | 'quick' | 'traffic'

function App() {
  const [page, setPage] = useState<Page>('profiles')
  const [error, setError] = useState<string | null>(null)

  const nav = (p: Page) => () => {
    setError(null)
    setPage(p)
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h1 className="logo">GoLogin</h1>
        <p className="tagline">Control Center</p>
        <nav>
          <button
            className={page === 'profiles' ? 'active' : ''}
            onClick={nav('profiles')}
          >
            Profiles
          </button>
          <button
            className={page === 'create' ? 'active' : ''}
            onClick={nav('create')}
          >
            Create Profile
          </button>
          <button
            className={page === 'proxy' ? 'active' : ''}
            onClick={nav('proxy')}
          >
            Add Proxy
          </button>
          <button
            className={page === 'quick' ? 'active' : ''}
            onClick={nav('quick')}
          >
            Quick Create
          </button>
          <button
            className={page === 'traffic' ? 'active' : ''}
            onClick={nav('traffic')}
          >
            Traffic
          </button>
        </nav>
      </aside>
      <main className="main">
        {error && (
          <div className="toast error" role="alert">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}
        {page === 'profiles' && <Profiles onError={setError} />}
        {page === 'create' && <CreateProfile onError={setError} onSuccess={nav('profiles')} />}
        {page === 'proxy' && <AddProxy onError={setError} onSuccess={() => setError(null)} />}
        {page === 'quick' && <QuickCreate onError={setError} onSuccess={nav('profiles')} />}
        {page === 'traffic' && <Traffic onError={setError} />}
      </main>
    </div>
  )
}

export default App
