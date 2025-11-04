'use client'

import { useState } from 'react'
import VerRegistros from './components/VerRegistros'
import FazerChecklist from './components/FazerChecklist'

export default function Home() {
  const [view, setView] = useState<'ver' | 'fazer'>('ver')

  return (
    <div className="container">
      <div className="header">
        <h1>Registro de Checklist de Viatura</h1>
        <div className="nav-menu">
          <button
            className={`nav-button ${view === 'ver' ? 'active' : ''}`}
            onClick={() => setView('ver')}
          >
            Ver Registros de Checklists
          </button>
          <button
            className={`nav-button ${view === 'fazer' ? 'active' : ''}`}
            onClick={() => setView('fazer')}
          >
            Fazer Checklist
          </button>
        </div>
      </div>

      {view === 'ver' && <VerRegistros />}
      {view === 'fazer' && <FazerChecklist />}
    </div>
  )
}
