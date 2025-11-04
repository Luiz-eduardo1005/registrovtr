'use client'

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
  'Câmeras Internas', 'Monitor da Câmera', 'Impressora/Teclado',
  'Celular / Carregador', 'Farol de Busca Manual', 'Mecânica',
  'Maçanetas', 'Estofamento', 'Rodas', 'Tablet SISP',
  'Máq. Fotográfica'
]

interface ChecklistRecord {
  id: string
  data: string
  prefixed: string
  codigo_viatura: string
  servico: string
  turno: string
  km_inicial: number
  km_final: number
  abastecimento: number
  motorista: string
  combustivel_inicial: number
  combustivel_final: number
  avarias: Record<string, { tipo: string; observacao: string }>
  observacoes: string
  ci: string
  opm: string
  nome: string
  created_at: string
}

interface VerDetalhesChecklistProps {
  record: ChecklistRecord
  onClose: () => void
}

export default function VerDetalhesChecklist({ record, onClose }: VerDetalhesChecklistProps) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Detalhes do Checklist</h2>
        <button
          className="nav-button"
          onClick={onClose}
          style={{ padding: '8px 16px', fontSize: '0.9rem' }}
        >
          Fechar
        </button>
      </div>

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
          <label>Prefixo:</label>
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
          <label>Código da Viatura:</label>
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

      {/* Turno */}
      <div className="form-section">
        <div className="form-group">
          <label>Turno:</label>
          <div className="radio-group">
            <div className={`radio-option ${record.turno === 'Primeiro' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="turno"
                value="Primeiro"
                checked={record.turno === 'Primeiro'}
                readOnly
                disabled
              />
              <label>Primeiro Turno</label>
            </div>
            <div className={`radio-option ${record.turno === 'Segundo' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="turno"
                value="Segundo"
                checked={record.turno === 'Segundo'}
                readOnly
                disabled
              />
              <label>Segundo Turno</label>
            </div>
          </div>
        </div>
      </div>

      {/* KM e Abastecimento */}
      <div className="form-section">
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
          <div className="form-group">
            <label>Abastecimento (L):</label>
            <input
              type="number"
              value={record.abastecimento}
              readOnly
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />
          </div>
        </div>
      </div>

      {/* Motorista */}
      <div className="form-section">
        <div className="form-group">
          <label>Motorista:</label>
          <div className="radio-group">
            <div className={`radio-option ${record.motorista === 'CMT' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="motorista"
                value="CMT"
                checked={record.motorista === 'CMT'}
                readOnly
                disabled
              />
              <label>CMT</label>
            </div>
            <div className={`radio-option ${record.motorista === 'PTR' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="motorista"
                value="PTR"
                checked={record.motorista === 'PTR'}
                readOnly
                disabled
              />
              <label>PTR</label>
            </div>
          </div>
        </div>
      </div>

      {/* Combustível */}
      <div className="form-section">
        <div className="form-row">
          <div className="form-group">
            <label>Combustível Inicial (%):</label>
            <input
              type="number"
              value={record.combustivel_inicial}
              readOnly
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />
          </div>
          <div className="form-group">
            <label>Combustível Final (%):</label>
            <input
              type="number"
              value={record.combustivel_final}
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

      {/* CI, OPM e Nome */}
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
            <label>Nome:</label>
            <input
              type="text"
              value={record.nome || ''}
              readOnly
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
