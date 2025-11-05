'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import VerDetalhesChecklist from './VerDetalhesChecklist'

const CODIGOS_SPIN = ['1348', '1369', '1399']
const CODIGOS_S10 = ['1012', '1028']

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

// Função para formatar modelo
const formatarModelo = (prefixed: 'spin' | 's10'): string => {
  return prefixed === 'spin' ? 'SPIN' : 'S10'
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

interface FinalizarChecklistProps {
  onEdit?: (record: ChecklistRecord) => void
}

export default function FinalizarChecklist({ onEdit }: FinalizarChecklistProps) {
  const [records, setRecords] = useState<ChecklistRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [filtroData, setFiltroData] = useState('')
  const [filtroModelo, setFiltroModelo] = useState<'spin' | 's10' | ''>('')
  const [filtroPrefixo, setFiltroPrefixo] = useState('')
  const [filtroTurno, setFiltroTurno] = useState<'Primeiro' | 'Segundo' | ''>('')
  const [filtroServico, setFiltroServico] = useState<'Ordinario' | 'SEG' | ''>('')
  const [selectedRecord, setSelectedRecord] = useState<ChecklistRecord | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [finalizando, setFinalizando] = useState(false)

  // Limpar filtro de prefixo quando o modelo mudar
  useEffect(() => {
    if (filtroModelo && filtroPrefixo) {
      const codigosValidos = filtroModelo === 'spin' ? CODIGOS_SPIN : CODIGOS_S10
      if (!codigosValidos.includes(filtroPrefixo)) {
        setFiltroPrefixo('')
      }
    }
  }, [filtroModelo])

  const codigosDisponiveis = filtroModelo === 'spin' ? CODIGOS_SPIN : filtroModelo === 's10' ? CODIGOS_S10 : []

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
        // Mostrar apenas registros pendentes (não finalizados)
        // Verifica se finalizado é false ou null
        .or('finalizado.is.null,finalizado.eq.false')
        .order('codigo_viatura', { ascending: true })
        .order('created_at', { ascending: false })

      if (filtroData) {
        query = query.eq('data', filtroData)
      }

      if (filtroModelo) {
        query = query.eq('prefixed', filtroModelo)
      }

      if (filtroPrefixo) {
        query = query.eq('codigo_viatura', filtroPrefixo)
      }

      if (filtroTurno) {
        query = query.eq('turno', filtroTurno)
      }

      if (filtroServico) {
        query = query.eq('servico', filtroServico)
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
  }, [filtroData, filtroModelo, filtroPrefixo, filtroTurno, filtroServico])

  const handleToggleSelect = (id: string) => {
    const newSelectedIds = new Set(selectedIds)
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id)
    } else {
      newSelectedIds.add(id)
    }
    setSelectedIds(newSelectedIds)
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

  // Se um registro foi selecionado para edição, abrir automaticamente em modo de edição
  if (selectedRecord && onEdit) {
    onEdit(selectedRecord)
    setSelectedRecord(null) // Limpar após chamar onEdit
    return null
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
          <label>Filtrar por Modelo de Viatura:</label>
          <select
            value={filtroModelo}
            onChange={(e) => {
              setFiltroModelo(e.target.value as 'spin' | 's10' | '')
              setFiltroPrefixo('')
            }}
          >
            <option value="">Todos</option>
            <option value="spin">SPIN</option>
            <option value="s10">S10</option>
          </select>
        </div>
        <div className="form-group">
          <label>Filtrar por Prefixo:</label>
          <select
            value={filtroPrefixo}
            onChange={(e) => setFiltroPrefixo(e.target.value)}
            disabled={!filtroModelo}
          >
            <option value="">Todos</option>
            {codigosDisponiveis.map((codigo) => (
              <option key={codigo} value={codigo}>
                {codigo}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Filtrar por Turno:</label>
          <select
            value={filtroTurno}
            onChange={(e) => setFiltroTurno(e.target.value as 'Primeiro' | 'Segundo' | '')}
          >
            <option value="">Todos</option>
            <option value="Primeiro">Primeiro Turno</option>
            <option value="Segundo">Segundo Turno</option>
          </select>
        </div>
        <div className="form-group">
          <label>Filtrar por Serviço:</label>
          <select
            value={filtroServico}
            onChange={(e) => setFiltroServico(e.target.value as 'Ordinario' | 'SEG' | '')}
          >
            <option value="">Todos</option>
            <option value="Ordinario">Ordinário</option>
            <option value="SEG">SEG</option>
          </select>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">Checklists finalizados com sucesso! Não será mais possível editar esses registros.</div>}

      {records.length === 0 ? (
        <div className="loading">Nenhum registro pendente encontrado</div>
      ) : (
        <div>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
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

          {/* Agrupar registros por prefixo */}
          {(() => {
            const registrosPorPrefixo = records.reduce((acc, record) => {
              const prefixo = record.codigo_viatura
              if (!acc[prefixo]) {
                acc[prefixo] = []
              }
              acc[prefixo].push(record)
              return acc
            }, {} as Record<string, ChecklistRecord[]>)

            const prefixosOrdenados = Object.keys(registrosPorPrefixo).sort()

            return (
              <div style={{ overflowX: 'auto' }}>
                {prefixosOrdenados.map((prefixo) => {
                  const registrosDoPrefixo = registrosPorPrefixo[prefixo]
                  return (
                    <div key={prefixo} style={{ marginBottom: '30px' }}>
                      <h3 style={{ marginBottom: '10px', color: '#2c7700', fontSize: '1.2rem' }}>
                        Prefixo: {prefixo}
                      </h3>
                      <table className="records-table">
                        <thead>
                          <tr>
                            <th style={{ width: '50px' }}></th>
                            <th>Prefixo</th>
                            <th>Modelo</th>
                            <th>Data</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {registrosDoPrefixo.map((record) => {
                            const isSelected = selectedIds.has(record.id)
                            
                            return (
                              <tr key={record.id} style={{ backgroundColor: isSelected ? '#e3f2fd' : 'transparent' }}>
                                <td>
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleToggleSelect(record.id)}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                  />
                                </td>
                                <td>
                                  <span style={{ fontWeight: '600', fontSize: '1rem' }}>
                                    {record.codigo_viatura}
                                  </span>
                                </td>
                                <td>
                                  <span style={{ fontWeight: '600', fontSize: '1rem' }}>
                                    {formatarModelo(record.prefixed)}
                                  </span>
                                </td>
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
                                    {formatarData(record.data)}
                                  </span>
                                </td>
                                <td>
                                  <span style={{ color: '#ff9800', fontWeight: '600' }}>
                                    ⏳ Pendente
                                  </span>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )
                })}
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
