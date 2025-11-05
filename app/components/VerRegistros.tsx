'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import VerDetalhesChecklist from './VerDetalhesChecklist'

const CODIGOS_SPIN = ['1348', '1369', '1399']
const CODIGOS_S10 = ['1012', '1028']

const AVARIAS = [
  'Quebrado', 'Trincado', 'Riscado', 'Amassado', 'Batido', 'Não Possui',
  'Furado', 'Rasgado', 'Gasto', 'Baixo', 'Queimado', 'Barulho',
  'Com Defeito', 'Empenado', 'Vazando', 'Estourado', 'Descolando', 'Suja'
]

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

// Função para formatar modelo
const formatarModelo = (prefixed: 'spin' | 's10'): string => {
  return prefixed === 'spin' ? 'SPIN' : 'S10'
}

// Função para verificar se um registro tem uma avaria específica
const temAvaria = (record: ChecklistRecord, tipoAvaria: string): boolean => {
  if (!record.avarias || !tipoAvaria) return false
  
  // Verifica se alguma avaria tem o tipo especificado
  return Object.values(record.avarias).some(avaria => avaria.tipo === tipoAvaria)
}

interface VerRegistrosProps {
  onEdit?: (record: ChecklistRecord) => void
}

export default function VerRegistros({ onEdit }: VerRegistrosProps) {
  const [records, setRecords] = useState<ChecklistRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtroData, setFiltroData] = useState('')
  const [filtroModelo, setFiltroModelo] = useState<'spin' | 's10' | ''>('')
  const [filtroPrefixo, setFiltroPrefixo] = useState('')
  const [filtroAvaria, setFiltroAvaria] = useState('')
  const [filtroTurno, setFiltroTurno] = useState<'Primeiro' | 'Segundo' | ''>('')
  const [filtroServico, setFiltroServico] = useState<'Ordinario' | 'SEG' | ''>('')
  const [selectedRecord, setSelectedRecord] = useState<ChecklistRecord | null>(null)

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
        // Mostrar apenas registros finalizados
        .eq('finalizado', true)
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

      // Filtrar por avaria no lado do cliente (já que avarias é JSONB)
      let registrosFiltrados = data || []
      
      if (filtroAvaria) {
        registrosFiltrados = registrosFiltrados.filter(record => 
          temAvaria(record, filtroAvaria)
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
  }, [filtroData, filtroModelo, filtroPrefixo, filtroAvaria, filtroTurno, filtroServico])

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
          <label>Filtrar por Avaria:</label>
          <select
            value={filtroAvaria}
            onChange={(e) => setFiltroAvaria(e.target.value)}
          >
            <option value="">Todas</option>
            {AVARIAS.map((avaria) => (
              <option key={avaria} value={avaria}>
                {avaria}
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

      {records.length === 0 ? (
        <div className="loading">Nenhum registro encontrado</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="records-table">
            <thead>
              <tr>
                <th>Prefixo</th>
                <th>Modelo</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
