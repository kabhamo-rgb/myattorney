import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Backoffice from './Backoffice.tsx'

const isStaffRoute = () => {
  const hash = window.location.hash.replace('#', '')
  const params = new URLSearchParams(window.location.search)
  return hash === 'staff' || params.get('view') === 'staff'
}

function Root() {
  const [staff, setStaff] = useState(isStaffRoute)

  useEffect(() => {
    const onChange = () => setStaff(isStaffRoute())
    window.addEventListener('hashchange', onChange)
    window.addEventListener('popstate', onChange)
    return () => {
      window.removeEventListener('hashchange', onChange)
      window.removeEventListener('popstate', onChange)
    }
  }, [])

  return staff ? <Backoffice /> : <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
