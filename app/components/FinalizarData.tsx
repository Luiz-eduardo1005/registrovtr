'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import VerDetalhesChecklist from './VerDetalhesChecklist'

// Função para formatar data YYYY-MM-DD para dd/MM/yyyy sem problemas de timezone
const formatarData = (dataString: string): string => {
  if (!dataString) return ''
  
  // Se já está no formato YYYY-MM-DD, extrai as partes diretamente
  if (/^\d{4}-\d{2}-\d{2}/.test(dataString)) {
    const partes = dataString.split('T')[0].split('-')
    if (partes.length === 3) {
      const [ano, mes, dia] = partes
      return `${dia}/${mes}/${ano}`
    }
  }
  
  // Se não estiver no formato esperado, tenta converter
  try {
    const data = new Date(dataString)
    if (!isNaN(data.getTime())) {
      const dia = String(data.getDate()).padStart(2, '0')
      const mes = String(data.getMonth() + 1).padStart(2, '0')
      const ano = data.getFullYear()
      return `${dia}/${mes}/${ano}`
    }
  } catch (error) {
    // Se houver erro, retorna a string original
  }
  
  return dataString
}

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
  finalizado?: boolean
}

export default function FinalizarChecklist() {
  const [records, setRecords] = useState<ChecklistRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [filtroData, setFiltroData] = useState('')
  const [filtroPrefixo, setFiltroPrefixo] = useState('')
  const [selectedRecord, setSelectedRecord] = useState<ChecklistRecord | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [finalizando, setFinalizando] = useState(false)

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
      // Limpar seleções ao recarregar
      setSelectedIds(new Set())
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar registros')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarRegistros()
  }, [filtroData, filtroPrefixo])

  const handleToggleSelect = (id: string) => {
    const newSelectedIds = new Set(selectedIds)
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id)
    } else {
      newSelectedIds.add(id)
    }
    setSelectedIds(newSelectedIds)
  }

  const handleSelectAll = () => {
    if (selectedIds.size === records.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(records.map(r => r.id)))
    }
  }

  const handleFinalizar = async () => {
    if (selectedIds.size === 0) {
      setError('Por favor, selecione pelo menos um registro para finalizar')
      return
    }

    setFinalizando(true)
    setError(null)
    setSuccess(false)

    try {
      // Verificar quais registros já estão finalizados
      const idsParaFinalizar = Array.from(selectedIds)
      
      // Atualizar os registros selecionados como finalizados
      const { error: updateError } = await supabase
        .from('checklists')
        .update({ finalizado: true })
        .in('id', idsParaFinalizar)

      if (updateError) throw updateError

      setSuccess(true)
      setSelectedIds(new Set())
      
      // Recarregar registros
      await carregarRegistros()
      
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'Erro ao finalizar checklists')
    } finally {
      setFinalizando(false)
    }
  }

  if (loading) {
    return <div className="loading">Carregando registros...</div>
  }

  if (selectedRecord) {
    return <VerDetalhesChecklist record={selectedRecord} onClose={() => setSelectedRecord(null)} />
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

      <h2>Finalizar Checklist</h2>

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
      {success && <div className="success">Checklists finalizados com sucesso! Não será mais possível editar esses registros.</div>}

      {records.length === 0 ? (
        <div className="loading">Nenhum registro encontrado</div>
      ) : (
        <div>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectedIds.size === records.length && records.length > 0}
                  onChange={handleSelectAll}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span>Selecionar todos ({selectedIds.size} selecionados)</span>
              </label>
            </div>
            <button
              type="button"
              className="submit-button"
              onClick={handleFinalizar}
              disabled={finalizando || selectedIds.size === 0}
              style={{ background: '#d32f2f' }}
            >
              {finalizando ? 'Finalizando...' : `Finalizar Checklist${selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}`}
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="records-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}></th>
                  <th>Data</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => {
                  const isSelected = selectedIds.has(record.id)
                  const isFinalizado = record.finalizado === true
                  
                  return (
                    <tr key={record.id} style={{ backgroundColor: isSelected ? '#e3f2fd' : isFinalizado ? '#fff3e0' : 'transparent' }}>
                      <td>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(record.id)}
                          disabled={isFinalizado}
                          style={{ width: '18px', height: '18px', cursor: isFinalizado ? 'not-allowed' : 'pointer' }}
                        />
                      </td>
                      <td>
                        <span
                          onClick={() => setSelectedRecord(record)}
                          style={{
                            cursor: 'pointer',
                            color: isFinalizado ? '#666' : '#2c7700',
                            textDecoration: 'underline',
                            fontWeight: '600',
                            fontSize: '1.1rem'
                          }}
                        >
                          {formatarData(record.data)}
                        </span>
                      </td>
                      <td>
                        {isFinalizado ? (
                          <span style={{ color: '#d32f2f', fontWeight: '600' }}>✓ Finalizado</span>
                        ) : (
                          <span style={{ color: '#666' }}>Pendente</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
