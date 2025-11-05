'use client'

import { useState } from 'react'
import VerRegistros from './components/VerRegistros'
import FazerChecklist from './components/FazerChecklist'
import FinalizarData from './components/FinalizarData'

interface ChecklistRecord {
  id: string
  data: string
  prefixed: 'spin' | 's10'
  codigo_viatura: string
  servico: 'Ordinario' | 'SEG'
  turno: 'Primeiro' | 'Segundo'
  km_inicial: number
  km_final: number
  abastecimento: number
  combustivel_inicial: number
  combustivel_final: number
  avarias: Record<string, { tipo: string; observacao: string }>
  observacoes: string
  ci: string
  opm: string
  nome: string
  created_at: string
}

export default function Home() {
  const [view, setView] = useState<'fazer' | 'finalizar' | 'ver'>('fazer')
  const [editRecord, setEditRecord] = useState<ChecklistRecord | null>(null)

  const handleEdit = (record: ChecklistRecord) => {
    setEditRecord(record)
    setView('fazer')
  }

  const handleCancelEdit = () => {
    setEditRecord(null)
    setView('ver')
  }

  const handleSuccess = () => {
    setEditRecord(null)
    // Opcional: voltar para ver registros após salvar
    // setView('ver')
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Registro de Checklist de Viatura</h1>
        <div className="nav-menu">
          <button
            className={`nav-button ${view === 'fazer' ? 'active' : ''}`}
            onClick={() => {
              setView('fazer')
              setEditRecord(null)
            }}
          >
            Fazer Checklist
          </button>
          <button
            className={`nav-button ${view === 'finalizar' ? 'active' : ''}`}
            onClick={() => {
              setView('finalizar')
              setEditRecord(null)
            }}
          >
            Finalizar Data
          </button>
          <button
            className={`nav-button ${view === 'ver' ? 'active' : ''}`}
            onClick={() => {
              setView('ver')
              setEditRecord(null)
            }}
          >
            Ver Registros de Checklists
          </button>
        </div>
      </div>

      {view === 'fazer' && (
        <FazerChecklist
          editRecord={editRecord}
          onCancel={editRecord ? handleCancelEdit : undefined}
          onSuccess={handleSuccess}
        />
      )}
      {view === 'finalizar' && <FinalizarData />}
      {view === 'ver' && <VerRegistros onEdit={handleEdit} />}
    </div>
  )
}
