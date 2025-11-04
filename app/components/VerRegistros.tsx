'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import VerDetalhesChecklist from './VerDetalhesChecklist'

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

interface VerRegistrosProps {
  onEdit?: (record: ChecklistRecord) => void
}

export default function VerRegistros({ onEdit }: VerRegistrosProps) {
  const [records, setRecords] = useState<ChecklistRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtroData, setFiltroData] = useState('')
  const [filtroPrefixo, setFiltroPrefixo] = useState('')
  const [selectedRecord, setSelectedRecord] = useState<ChecklistRecord | null>(null)

  useEffect(() => {
    carregarRegistros()
  }, [])

  const carregarRegistros = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('checklists')
        .select('*')
        .order('created_at', { ascending: false })

      if (filtroData) {
        query = query.eq('data', filtroData)
      }

      if (filtroPrefixo) {
        query = query.eq('prefixed', filtroPrefixo)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      setRecords(data || [])
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar registros')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarRegistros()
  }, [filtroData, filtroPrefixo])

  if (loading) {
    return <div className="loading">Carregando registros...</div>
  }

  if (selectedRecord) {
    return <VerDetalhesChecklist record={selectedRecord} onClose={() => setSelectedRecord(null)} onEdit={onEdit} />
  }

  return (
    <div>
      {/* Brazões */}
      <div className="form-section">
        <div className="brazoes-container">
          <div className="brazao-left">
            <img src="/img/brasao-am.png" alt="Brasão do Estado do Amazonas" className="brazao-img" />
          </div>
          <div className="brazoes-texto">
            <p className="texto-header">GOVERNO DO ESTADO</p>
            <p className="texto-header">POLICIA MILITAR DO AMAZONAS</p>
            <p className="texto-header">COMANDO DE POLICIAMENTO DA AREA SUL</p>
            <p className="texto-header">1ª COMPANHIA INTERATIVA COMUNITÁRIA</p>
          </div>
          <div className="brazao-right">
            <img src="/img/brasao-pmam.png" alt="Brasão da Polícia Militar do Amazonas" className="brazao-img brazao-pmam" />
          </div>
        </div>
      </div>

      <h2>Ver Registros de Checklists</h2>

      <div className="filters">
        <div className="form-group">
          <label>Filtrar por Data:</label>
          <input
            type="date"
            value={filtroData}
            onChange={(e) => setFiltroData(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Filtrar por Prefixo:</label>
          <select
            value={filtroPrefixo}
            onChange={(e) => setFiltroPrefixo(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="spin">SPIN</option>
            <option value="s10">S10</option>
          </select>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {records.length === 0 ? (
        <div className="loading">Nenhum registro encontrado</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="records-table">
            <thead>
              <tr>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>
                    <span
                      onClick={() => setSelectedRecord(record)}
                      style={{
                        cursor: 'pointer',
                        color: '#2c7700',
                        textDecoration: 'underline',
                        fontWeight: '600',
                        fontSize: '1.1rem'
                      }}
                    >
                      {format(new Date(record.data), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
