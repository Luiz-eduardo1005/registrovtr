'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import TabelaAvarias from './TabelaAvarias'

const AVARIAS = [
  'Quebrado', 'Trincado', 'Riscado', 'Amassado', 'Batido', 'Não Possui',
  'Furado', 'Rasgado', 'Gasto', 'Baixo', 'Queimado', 'Barulho',
  'Com Defeito', 'Empenado', 'Vazando', 'Estourado', 'Descolando', 'Suja'
]

const ITENS_1_ESCALAO = [
  'Extintor', 'Triângulo', 'Chave de Roda', 'Tapetes', 'Macaco',
  'Óleo Motor', 'Óleo Hidráulico', 'Fluido Radiador', 'Fluido Freio', 'Água Esguicho'
]

const ITENS_PNEUS = [
  'Pneu Dian/Dir', 'Pneu Dian/Esq', 'Pneu Tras/Dir', 'Pneu Tras/Esq', 'Estepe'
]

const ITENS_GERAIS = [
  'Limpeza vtr', 'Limp. de pára-brisa d/t', 'Buzina/Sirene/Giroflex',
  'Sistema Comunicação', 'Funilaria/Pint./Adesiv', 'Part Elétrica/Eletrônica',
  'Retrovisores Dir/Erq/Int', 'Faróis/Lanternas/Piscas', 'Ar Condicionado',
  'Câmeras Internas', 'Impressora/Teclado',
  'Celular / Carregador', 'Mecânica',
  'Maçanetas', 'Estofamento', 'Rodas'
]

// Função para converter número para opção de combustível
const numeroParaOpcao = (numero: number): string => {
  if (numero === 0) return 'E (Reserva)'
  if (numero <= 25) return '1/4'
  if (numero <= 50) return '1/2'
  if (numero <= 75) return '3/4'
  return 'F (Cheio)'
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
  km_abastecimento?: number
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

interface VerDetalhesChecklistProps {
  record: ChecklistRecord
  onClose: () => void
  onEdit?: (record: ChecklistRecord) => void
}

export default function VerDetalhesChecklist({ record, onClose, onEdit }: VerDetalhesChecklistProps) {
  const [registroFinalizado, setRegistroFinalizado] = useState(false)

  useEffect(() => {
    const verificarRegistroFinalizado = async () => {
      try {
        const { data: registro, error } = await supabase
          .from('checklists')
          .select('finalizado')
          .eq('id', record.id)
          .single()

        setRegistroFinalizado(!error && registro?.finalizado === true)
      } catch (error) {
        setRegistroFinalizado(false)
      }
    }

    verificarRegistroFinalizado()
  }, [record.id])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Detalhes do Checklist</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          {onEdit && !registroFinalizado && (
            <button
              className="nav-button"
              onClick={() => {
                onEdit(record)
                onClose()
              }}
              style={{ padding: '8px 16px', fontSize: '0.9rem', background: '#2c7700' }}
            >
              Editar
            </button>
          )}
          {registroFinalizado && (
            <div style={{ padding: '8px 16px', fontSize: '0.9rem', background: '#ffebee', color: '#c62828', borderRadius: '4px', border: '1px solid #c62828' }}>
              ⚠️ Checklist finalizado - não pode ser editado
            </div>
          )}
          <button
            className="nav-button"
            onClick={onClose}
            style={{ padding: '8px 16px', fontSize: '0.9rem', background: '#666' }}
          >
            Fechar
          </button>
        </div>
      </div>

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

      {/* Data */}
      <div className="form-section">
        <div className="form-group">
          <label>Data:</label>
          <input
            type="date"
            value={record.data}
            readOnly
            style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
          />
        </div>
      </div>

      {/* Prefixo */}
      <div className="form-section">
        <div className="form-group">
          <label>Modelo da Viatura:</label>
          <div className="radio-group">
            <div className={`radio-option ${record.prefixed === 'spin' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="prefixed"
                value="spin"
                checked={record.prefixed === 'spin'}
                readOnly
                disabled
              />
              <label>SPIN</label>
            </div>
            <div className={`radio-option ${record.prefixed === 's10' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="prefixed"
                value="s10"
                checked={record.prefixed === 's10'}
                readOnly
                disabled
              />
              <label>S10</label>
            </div>
          </div>
        </div>
      </div>

      {/* Código Viatura */}
      <div className="form-section">
        <div className="form-group">
          <label>Prefixo:</label>
          <input
            type="text"
            value={record.codigo_viatura}
            readOnly
            style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
          />
        </div>
      </div>

      {/* Serviço */}
      <div className="form-section">
        <div className="form-group">
          <label>Serviço:</label>
          <div className="radio-group">
            <div className={`radio-option ${record.servico === 'Ordinario' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="servico"
                value="Ordinario"
                checked={record.servico === 'Ordinario'}
                readOnly
                disabled
              />
              <label>Ordinário</label>
            </div>
            <div className={`radio-option ${record.servico === 'SEG' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="servico"
                value="SEG"
                checked={record.servico === 'SEG'}
                readOnly
                disabled
              />
              <label>SEG</label>
            </div>
          </div>
        </div>
      </div>

      {/* Turno - Tipo de Turno (apenas para Ordinário) */}
      {record.servico === 'Ordinario' && (
        <div className="form-section">
          <div className="form-group">
            <label>Tipo de Turno:</label>
            <div className="radio-group">
              <div className={`radio-option ${record.turno.includes('12Hs') ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="tipoTurno"
                  value="12Hs"
                  checked={record.turno.includes('12Hs')}
                  readOnly
                  disabled
                />
                <label>12Hs</label>
              </div>
              <div className={`radio-option ${record.turno.includes('8Hs (2x2)') ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="tipoTurno"
                  value="8Hs (2x2)"
                  checked={record.turno.includes('8Hs (2x2)')}
                  readOnly
                  disabled
                />
                <label>8Hs (2x2)</label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Turno - Primeiro/Segundo */}
      <div className="form-section">
        <div className="form-group">
          <label>Turno:</label>
          <div className="radio-group">
            <div className={`radio-option ${record.turno.includes('Primeiro') ? 'selected' : ''}`}>
              <input
                type="radio"
                name="turno"
                value="Primeiro"
                checked={record.turno.includes('Primeiro')}
                readOnly
                disabled
              />
              <label>Primeiro Turno</label>
            </div>
            <div className={`radio-option ${record.turno.includes('Segundo') ? 'selected' : ''}`}>
              <input
                type="radio"
                name="turno"
                value="Segundo"
                checked={record.turno.includes('Segundo')}
                readOnly
                disabled
              />
              <label>Segundo Turno</label>
            </div>
          </div>
        </div>
      </div>

      {/* KM */}
      <div className="form-section">
        <h2>KM</h2>
        <div className="form-row">
          <div className="form-group">
            <label>KM Inicial:</label>
            <input
              type="number"
              value={record.km_inicial}
              readOnly
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />
          </div>
          <div className="form-group">
            <label>KM Final:</label>
            <input
              type="number"
              value={record.km_final}
              readOnly
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />
          </div>
        </div>
        {/* Cálculo de KM Rodados */}
        {record.km_final > 0 && record.km_inicial >= 0 && (
          <div style={{ marginTop: '15px', padding: '12px', backgroundColor: '#e8f5e9', borderRadius: '6px', border: '2px solid #2c7700' }}>
            <div style={{ color: '#2c7700', fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📊 KM Rodados: <span style={{ fontSize: '1.2rem' }}>{(record.km_final - record.km_inicial).toLocaleString('pt-BR')}</span> km
            </div>
          </div>
        )}
      </div>

      {/* Combustível e Abastecimento */}
      <div className="form-section">
        <h2>Combustível e Abastecimento</h2>
        <div className="form-row">
          <div className="form-group">
            <label>Combustível Inicial:</label>
            <input
              type="text"
              value={numeroParaOpcao(record.combustivel_inicial)}
              readOnly
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />
          </div>
          <div className="form-group">
            <label>Combustível Final:</label>
            <input
              type="text"
              value={record.combustivel_final !== undefined && record.combustivel_final !== null ? numeroParaOpcao(record.combustivel_final) : '-'}
              readOnly
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />
          </div>
        </div>
        <div className="form-row" style={{ marginTop: '15px' }}>
          <div className="form-group">
            <label>Abastecimento (L):</label>
            <input
              type="number"
              value={record.abastecimento || 0}
              readOnly
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />
          </div>
          <div className="form-group">
            <label>KM na Hora do Abastecimento:</label>
            <input
              type="number"
              value={record.km_abastecimento || 0}
              readOnly
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />
          </div>
        </div>
      </div>

      {/* Tabela de Avarias */}
      <div className="form-section">
        <h2>Tabela de Avarias</h2>
        <TabelaAvarias
          itens={[...ITENS_1_ESCALAO, ...ITENS_PNEUS, ...ITENS_GERAIS]}
          avarias={record.avarias || {}}
          setAvarias={() => {}}
          tiposAvarias={AVARIAS}
          readOnly={true}
        />
      </div>

      {/* Observações */}
      <div className="form-section">
        <div className="form-group">
          <label>Observações:</label>
          <textarea
            value={record.observacoes || ''}
            readOnly
            rows={5}
            style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
          />
        </div>
      </div>

      {/* CI, OPM, Nome e Telefone */}
      <div className="form-section">
        <div className="form-row">
          <div className="form-group">
            <label>CI:</label>
            <input
              type="text"
              value={record.ci}
              readOnly
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />
          </div>
          <div className="form-group">
            <label>OPM:</label>
            <input
              type="text"
              value={record.opm}
              readOnly
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />
          </div>
          <div className="form-group">
            <label>Motorista:</label>
            <input
              type="text"
              value={record.nome || ''}
              readOnly
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />
          </div>
          <div className="form-group">
            <label>Telefone de Contato:</label>
            <input
              type="text"
              value={record.telefone || ''}
              readOnly
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
