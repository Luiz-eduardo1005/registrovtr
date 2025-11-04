'use client'

import { useState } from 'react'
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
  'Câmeras Internas', 'Monitor da Câmera', 'Impressora/Teclado',
  'Celular / Carregador', 'Farol de Busca Manual', 'Mecânica',
  'Maçanetas', 'Estofamento', 'Rodas', 'Tablet SISP',
  'Máq. Fotográfica'
]

const CODIGOS_SPIN = ['1348', '1369', '1399']
const CODIGOS_S10 = ['1012', '1028']

export default function FazerChecklist() {
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [prefixed, setPrefixed] = useState<'spin' | 's10' | ''>('')
  const [codigoViatura, setCodigoViatura] = useState('')
  const [servico, setServico] = useState<'Ordinario' | 'SEG' | ''>('')
  const [turno, setTurno] = useState<'Primeiro' | 'Segundo' | ''>('')
  const [kmInicial, setKmInicial] = useState('')
  const [kmFinal, setKmFinal] = useState('')
  const [abastecimento, setAbastecimento] = useState('')
  const [motorista, setMotorista] = useState<'CMT' | 'PTR' | ''>('')
  const [combustivelInicial, setCombustivelInicial] = useState('')
  const [combustivelFinal, setCombustivelFinal] = useState('')
  const [avarias, setAvarias] = useState<Record<string, { tipo: string; observacao: string }>>({})
  const [observacoes, setObservacoes] = useState('')
  const [ci, setCi] = useState('')
  const [opm, setOpm] = useState('')
  const [nome, setNome] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const codigosDisponiveis = prefixed === 'spin' ? CODIGOS_SPIN : prefixed === 's10' ? CODIGOS_S10 : []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { data: insertData, error: insertError } = await supabase
        .from('checklists')
        .insert({
          data,
          prefixed,
          codigo_viatura: codigoViatura,
          servico,
          turno,
          km_inicial: parseInt(kmInicial) || 0,
          km_final: parseInt(kmFinal) || 0,
          abastecimento: parseFloat(abastecimento) || 0,
          motorista,
          combustivel_inicial: parseFloat(combustivelInicial) || 0,
          combustivel_final: parseFloat(combustivelFinal) || 0,
          avarias: avarias,
          observacoes,
          ci,
          opm,
          nome
        })

      if (insertError) throw insertError

      setSuccess(true)
      
      // Limpar formulário
      setData(new Date().toISOString().split('T')[0])
      setPrefixed('')
      setCodigoViatura('')
      setServico('')
      setTurno('')
      setKmInicial('')
      setKmFinal('')
      setAbastecimento('')
      setMotorista('')
      setCombustivelInicial('')
      setCombustivelFinal('')
      setAvarias({})
      setObservacoes('')
      setCi('')
      setOpm('')
      setNome('')

      setTimeout(() => setSuccess(false), 5000)
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar checklist')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Fazer Checklist</h2>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">Checklist registrado com sucesso!</div>}

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
            value={data}
            onChange={(e) => setData(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Prefixo */}
      <div className="form-section">
        <div className="form-group">
          <label>Prefixo:</label>
          <div className="radio-group">
            <div
              className={`radio-option ${prefixed === 'spin' ? 'selected' : ''}`}
              onClick={() => {
                setPrefixed('spin')
                setCodigoViatura('')
              }}
            >
              <input
                type="radio"
                name="prefixed"
                value="spin"
                checked={prefixed === 'spin'}
                onChange={() => {
                  setPrefixed('spin')
                  setCodigoViatura('')
                }}
              />
              <label>SPIN</label>
            </div>
            <div
              className={`radio-option ${prefixed === 's10' ? 'selected' : ''}`}
              onClick={() => {
                setPrefixed('s10')
                setCodigoViatura('')
              }}
            >
              <input
                type="radio"
                name="prefixed"
                value="s10"
                checked={prefixed === 's10'}
                onChange={() => {
                  setPrefixed('s10')
                  setCodigoViatura('')
                }}
              />
              <label>S10</label>
            </div>
          </div>
        </div>
      </div>

      {/* Código Viatura */}
      {prefixed && (
        <div className="form-section">
          <div className="form-group">
            <label>Código da Viatura:</label>
            <select
              value={codigoViatura}
              onChange={(e) => setCodigoViatura(e.target.value)}
              required
            >
              <option value="">Selecione o código</option>
              {codigosDisponiveis.map((codigo) => (
                <option key={codigo} value={codigo}>
                  {codigo}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Serviço */}
      {codigoViatura && (
        <div className="form-section">
          <div className="form-group">
            <label>Serviço:</label>
            <div className="radio-group">
              <div
                className={`radio-option ${servico === 'Ordinario' ? 'selected' : ''}`}
                onClick={() => setServico('Ordinario')}
              >
                <input
                  type="radio"
                  name="servico"
                  value="Ordinario"
                  checked={servico === 'Ordinario'}
                  onChange={() => setServico('Ordinario')}
                />
                <label>Ordinário</label>
              </div>
              <div
                className={`radio-option ${servico === 'SEG' ? 'selected' : ''}`}
                onClick={() => setServico('SEG')}
              >
                <input
                  type="radio"
                  name="servico"
                  value="SEG"
                  checked={servico === 'SEG'}
                  onChange={() => setServico('SEG')}
                />
                <label>SEG</label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Turno */}
      {servico && (
        <div className="form-section">
          <div className="form-group">
            <label>Turno:</label>
            <div className="radio-group">
              <div
                className={`radio-option ${turno === 'Primeiro' ? 'selected' : ''}`}
                onClick={() => setTurno('Primeiro')}
              >
                <input
                  type="radio"
                  name="turno"
                  value="Primeiro"
                  checked={turno === 'Primeiro'}
                  onChange={() => setTurno('Primeiro')}
                />
                <label>Primeiro Turno</label>
              </div>
              <div
                className={`radio-option ${turno === 'Segundo' ? 'selected' : ''}`}
                onClick={() => setTurno('Segundo')}
              >
                <input
                  type="radio"
                  name="turno"
                  value="Segundo"
                  checked={turno === 'Segundo'}
                  onChange={() => setTurno('Segundo')}
                />
                <label>Segundo Turno</label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KM e Abastecimento */}
      {turno && (
        <div className="form-section">
          <div className="form-row">
            <div className="form-group">
              <label>KM Inicial:</label>
              <input
                type="number"
                value={kmInicial}
                onChange={(e) => setKmInicial(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>KM Final:</label>
              <input
                type="number"
                value={kmFinal}
                onChange={(e) => setKmFinal(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Abastecimento (L):</label>
              <input
                type="number"
                step="0.01"
                value={abastecimento}
                onChange={(e) => setAbastecimento(e.target.value)}
                required
              />
            </div>
          </div>
        </div>
      )}

      {/* Motorista */}
      {abastecimento && (
        <div className="form-section">
          <div className="form-group">
            <label>Motorista:</label>
            <div className="radio-group">
              <div
                className={`radio-option ${motorista === 'CMT' ? 'selected' : ''}`}
                onClick={() => setMotorista('CMT')}
              >
                <input
                  type="radio"
                  name="motorista"
                  value="CMT"
                  checked={motorista === 'CMT'}
                  onChange={() => setMotorista('CMT')}
                />
                <label>CMT</label>
              </div>
              <div
                className={`radio-option ${motorista === 'PTR' ? 'selected' : ''}`}
                onClick={() => setMotorista('PTR')}
              >
                <input
                  type="radio"
                  name="motorista"
                  value="PTR"
                  checked={motorista === 'PTR'}
                  onChange={() => setMotorista('PTR')}
                />
                <label>PTR</label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Combustível */}
      {motorista && (
        <div className="form-section">
          <div className="form-row">
            <div className="form-group">
              <label>Combustível Inicial (%):</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={combustivelInicial}
                onChange={(e) => setCombustivelInicial(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Combustível Final (%):</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={combustivelFinal}
                onChange={(e) => setCombustivelFinal(e.target.value)}
                required
              />
            </div>
          </div>
        </div>
      )}

      {/* Tabela de Avarias */}
      {combustivelFinal && (
        <div className="form-section">
          <h2>Tabela de Avarias</h2>
          <TabelaAvarias
            itens={[...ITENS_1_ESCALAO, ...ITENS_PNEUS, ...ITENS_GERAIS]}
            avarias={avarias}
            setAvarias={setAvarias}
            tiposAvarias={AVARIAS}
          />
        </div>
      )}

      {/* Observações */}
      {combustivelFinal && (
        <div className="form-section">
          <div className="form-group">
            <label>Observações:</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={5}
              placeholder="Digite suas observações..."
            />
          </div>
        </div>
      )}

      {/* CI e OPM */}
      {combustivelFinal && (
        <div className="form-section">
          <div className="form-row">
            <div className="form-group">
              <label>CI:</label>
              <input
                type="text"
                value={ci}
                onChange={(e) => setCi(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>OPM:</label>
              <input
                type="text"
                value={opm}
                onChange={(e) => setOpm(e.target.value)}
                required
              />
            </div>
          </div>
        </div>
      )}

      {/* Nome */}
      {ci && opm && (
        <div className="form-section">
          <div className="form-group">
            <label>Nome da Pessoa que está fazendo o registro:</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              placeholder="Digite o nome completo"
            />
          </div>
        </div>
      )}

      {/* Botão Submit */}
      {ci && opm && nome && (
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrar Checklist'}
        </button>
      )}
    </form>
  )
}
