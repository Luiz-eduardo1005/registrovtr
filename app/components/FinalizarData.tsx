'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

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
  turno: string // Pode ser 'Primeiro', 'Segundo', '12Hs - Primeiro', '12Hs - Segundo', '8Hs (2x2) - Primeiro', '8Hs (2x2) - Segundo'
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
  telefone?: string
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
  const [filtroData, setFiltroData] = useState('')
  const [filtroModelo, setFiltroModelo] = useState<'spin' | 's10' | ''>('')
  const [filtroPrefixo, setFiltroPrefixo] = useState('')
  const [filtroTurno, setFiltroTurno] = useState<'Primeiro' | 'Segundo' | '12Hs' | '8Hs (2x2)' | ''>('')
  const [filtroServico, setFiltroServico] = useState<'Ordinario' | 'SEG' | ''>('')

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

      // Primeiro, verificar e finalizar automaticamente registros com mais de 16 horas
      const agora = new Date()
      const limite16Horas = new Date(agora.getTime() - 16 * 60 * 60 * 1000) // 16 horas atrás

      // Buscar todos os registros não finalizados criados há mais de 16 horas
      const { data: registrosParaFinalizar, error: errorBusca } = await supabase
        .from('checklists')
        .select('id')
        .or('finalizado.is.null,finalizado.eq.false')
        .lt('created_at', limite16Horas.toISOString())

      if (!errorBusca && registrosParaFinalizar && registrosParaFinalizar.length > 0) {
        const idsParaFinalizar = registrosParaFinalizar.map(r => r.id)
        await supabase
          .from('checklists')
          .update({ finalizado: true })
          .in('id', idsParaFinalizar)
      }

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

      if (filtroServico) {
        query = query.eq('servico', filtroServico)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      // Filtrar por turno no lado do cliente (porque turno pode ser combinado)
      let registrosFiltrados = data || []
      
      if (filtroTurno) {
        registrosFiltrados = registrosFiltrados.filter(record => 
          record.turno && record.turno.includes(filtroTurno)
        )
      }

      setRecords(registrosFiltrados)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar registros')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarRegistros()
  }, [filtroData, filtroModelo, filtroPrefixo, filtroTurno, filtroServico])

  const handleRowClick = (record: ChecklistRecord) => {
    if (onEdit) {
      onEdit(record)
    }
  }

  if (loading) {
    return <div className="loading">Carregando registros...</div>
  }

  return (
    <div>
      {/* Brazões */}
      <div className="form-section">
        <div className="brazoes-container">
          <div className="brazao-left">
            <img src="/img/brasao-pmam.png" alt="Brasão da Polícia Militar do Amazonas" className="brazao-img brazao-pmam" />
          </div>
          <div className="brazoes-texto">
            <p className="texto-header">GOVERNO DO ESTADO</p>
            <p className="texto-header">POLICIA MILITAR DO AMAZONAS</p>
            <p className="texto-header">COMANDO DE POLICIAMENTO DA AREA SUL</p>
            <p className="texto-header">1ª COMPANHIA INTERATIVA COMUNITÁRIA</p>
          </div>
          <div className="brazao-right">
            <img src="/img/brasao-am.png" alt="Brasão do Estado do Amazonas" className="brazao-img" />
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
            onChange={(e) => setFiltroTurno(e.target.value as 'Primeiro' | 'Segundo' | '12Hs' | '8Hs (2x2)' | '')}
          >
            <option value="">Todos</option>
            <option value="Primeiro">Primeiro Turno</option>
            <option value="Segundo">Segundo Turno</option>
            <option value="12Hs">12Hs</option>
            <option value="8Hs (2x2)">8Hs (2x2)</option>
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

      {records.length === 0 ? (
        <div className="loading">Nenhum registro pendente encontrado</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="records-table">
            <thead>
              <tr>
                <th>Modelo</th>
                <th>Prefixo</th>
                <th>Data</th>
                <th>Motorista</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => {
                return (
                  <tr 
                    key={record.id} 
                    onClick={() => handleRowClick(record)}
                    style={{ 
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e3f2fd'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <td>
                      <span style={{ fontWeight: '600', fontSize: '1rem' }}>
                        {formatarModelo(record.prefixed)}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: '600', fontSize: '1rem' }}>
                        {record.codigo_viatura}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                        {formatarData(record.data)}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.95rem' }}>
                        {record.nome || '-'}
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
      )}
    </div>
  )
}
