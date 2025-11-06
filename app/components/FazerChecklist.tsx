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
  'Câmeras Internas', 'Monitor da Câmera', 'Impressora/Teclado',
  'Celular / Carregador', 'Farol de Busca Manual', 'Mecânica',
  'Maçanetas', 'Estofamento', 'Rodas', 'Tablet SISP',
  'Máq. Fotográfica'
]

const CODIGOS_SPIN = ['1348', '1369', '1399']
const CODIGOS_S10 = ['1012', '1028']

const OPCOES_COMBUSTIVEL = [
  { value: 'E', label: 'E (Reserva)' },
  { value: '1/4', label: '1/4' },
  { value: '1/2', label: '1/2' },
  { value: '3/4', label: '3/4' },
  { value: 'F', label: 'F (Cheio)' }
]

// Função para converter número para opção de combustível
const numeroParaOpcao = (numero: number): string => {
  if (numero === 0) return 'E'
  if (numero <= 25) return '1/4'
  if (numero <= 50) return '1/2'
  if (numero <= 75) return '3/4'
  return 'F'
}

// Função para converter opção de combustível para número
const opcaoParaNumero = (opcao: string): number => {
  switch (opcao) {
    case 'E': return 0
    case '1/4': return 25
    case '1/2': return 50
    case '3/4': return 75
    case 'F': return 100
    default: return 0
  }
}

// Função para normalizar o formato da data para YYYY-MM-DD
// IMPORTANTE: Quando o valor já está no formato YYYY-MM-DD, retorna diretamente
// sem fazer conversões para evitar problemas de timezone
const normalizarData = (data: string | Date | null | undefined): string => {
  if (!data) {
    return new Date().toISOString().split('T')[0]
  }

  // Se já está no formato YYYY-MM-DD, retorna diretamente SEM conversão
  // Isso evita problemas de timezone que podem mudar o dia
  if (typeof data === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return data
  }

  // Se é uma string no formato YYYY-MM-DD com tempo (ex: "2025-01-05T00:00:00")
  // Extrai apenas a parte da data
  if (typeof data === 'string' && /^\d{4}-\d{2}-\d{2}/.test(data)) {
    const partes = data.split('T')[0].split('-')
    if (partes.length === 3 && /^\d{4}-\d{2}-\d{2}$/.test(partes.join('-'))) {
      return partes.join('-')
    }
  }

  // Apenas converte para Date se realmente necessário (casos de formatação diferente do banco)
  try {
    let dataObj: Date
    
    if (typeof data === 'string') {
      // Tenta criar Date a partir da string
      dataObj = new Date(data)
    } else {
      dataObj = data
    }

    // Verifica se a data é válida
    if (isNaN(dataObj.getTime())) {
      return new Date().toISOString().split('T')[0]
    }

    // Ajusta para timezone local para evitar problemas de conversão
    const ano = dataObj.getFullYear()
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0')
    const dia = String(dataObj.getDate()).padStart(2, '0')
    return `${ano}-${mes}-${dia}`
  } catch (error) {
    // Se houver erro, retorna a data atual
    return new Date().toISOString().split('T')[0]
  }
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
  telefone?: string
  finalizado?: boolean
}

interface FazerChecklistProps {
  editRecord?: ChecklistRecord | null
  onCancel?: () => void
  onSuccess?: () => void
  isFinalizarMode?: boolean
  onFinalizar?: () => void
}

export default function FazerChecklist({ editRecord, onCancel, onSuccess, isFinalizarMode = false, onFinalizar }: FazerChecklistProps) {
  const [data, setData] = useState('')
  const [prefixed, setPrefixed] = useState<'spin' | 's10' | ''>('')
  const [codigoViatura, setCodigoViatura] = useState('')
  const [servico, setServico] = useState<'Ordinario' | 'SEG' | ''>('')
  const [turno, setTurno] = useState<'Primeiro' | 'Segundo' | ''>('')
  const [kmInicial, setKmInicial] = useState('')
  const [kmFinal, setKmFinal] = useState('')
  const [abastecimento, setAbastecimento] = useState('')
  const [combustivelInicial, setCombustivelInicial] = useState('')
  const [combustivelFinal, setCombustivelFinal] = useState('')
  const [avarias, setAvarias] = useState<Record<string, { tipo: string; observacao: string }>>({})
  const [observacoes, setObservacoes] = useState('')
  const [ci, setCi] = useState('')
  const [opm, setOpm] = useState('')
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [dataFinalizada, setDataFinalizada] = useState(false)

  // Verificar se o registro está finalizado
  const verificarRegistroFinalizado = async () => {
    if (!editRecord) {
      return false
    }

    try {
      const { data: registro, error } = await supabase
        .from('checklists')
        .select('finalizado')
        .eq('id', editRecord.id)
        .single()

      if (error) return false
      return registro?.finalizado === true
    } catch (error) {
      return false
    }
  }

  // Preencher formulário quando estiver editando
  useEffect(() => {
    if (editRecord) {
      // Se a data já está no formato YYYY-MM-DD, usar diretamente
      // Caso contrário, normalizar apenas para garantir o formato correto
      const dataDoBanco = editRecord.data
      if (/^\d{4}-\d{2}-\d{2}$/.test(dataDoBanco)) {
        setData(dataDoBanco)
      } else {
        setData(normalizarData(dataDoBanco))
      }
      
      // Verificar se o registro está finalizado
      verificarRegistroFinalizado().then(finalizado => {
        setDataFinalizada(finalizado)
      })
      
      setPrefixed(editRecord.prefixed as 'spin' | 's10')
      setCodigoViatura(editRecord.codigo_viatura)
      setServico(editRecord.servico as 'Ordinario' | 'SEG')
      setTurno(editRecord.turno as 'Primeiro' | 'Segundo')
      setKmInicial(editRecord.km_inicial.toString())
      setKmFinal(editRecord.km_final.toString())
      setAbastecimento(editRecord.abastecimento.toString())
      setCombustivelInicial(numeroParaOpcao(editRecord.combustivel_inicial))
      setCombustivelFinal(numeroParaOpcao(editRecord.combustivel_final))
      setAvarias(editRecord.avarias || {})
      setObservacoes(editRecord.observacoes || '')
      setCi(editRecord.ci)
      setOpm(editRecord.opm)
      setNome(editRecord.nome || '')
      setTelefone(editRecord.telefone || '')
    } else {
      // Quando não está editando, não há registro finalizado
      setDataFinalizada(false)
    }
    // Não resetar a data quando não há editRecord, para permitir que o usuário selecione a data desejada
  }, [editRecord])

  // Limpar código da viatura quando o prefixo mudar
  const handlePrefixedChange = (newPrefixed: 'spin' | 's10') => {
    const codigosValidos = newPrefixed === 'spin' ? CODIGOS_SPIN : CODIGOS_S10
    // Se o código atual não é válido para o novo prefixo, limpar
    if (codigoViatura && !codigosValidos.includes(codigoViatura)) {
      setCodigoViatura('')
    }
    setPrefixed(newPrefixed)
  }

  const codigosDisponiveis = prefixed === 'spin' ? CODIGOS_SPIN : prefixed === 's10' ? CODIGOS_S10 : []

  // Determina se os campos devem estar habilitados (quando turno está selecionado)
  const camposHabilitados = !!turno

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Validar que a data foi preenchida
      if (!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        throw new Error('Por favor, selecione uma data válida')
      }
      
      // Se estiver editando, verificar se o registro está finalizado
      if (editRecord) {
        const registroEstaFinalizado = await verificarRegistroFinalizado()
        if (registroEstaFinalizado) {
          throw new Error('Este checklist foi finalizado e não pode ser editado.')
        }
      }
      
      // Usar diretamente o valor do input (já está no formato YYYY-MM-DD)
      // Não fazer nenhuma normalização para evitar problemas de timezone
      const dataParaSalvar = data.trim()
      
      // Debug: verificar o valor antes de salvar (remover em produção)
      console.log('Data selecionada pelo usuário:', data)
      console.log('Data que será salva:', dataParaSalvar)
      
      const checklistData = {
        data: dataParaSalvar,
        prefixed,
        codigo_viatura: codigoViatura,
        servico,
        turno,
        km_inicial: parseInt(kmInicial) || 0,
        km_final: parseInt(kmFinal) || 0,
        abastecimento: parseFloat(abastecimento) || 0,
        combustivel_inicial: opcaoParaNumero(combustivelInicial),
        combustivel_final: opcaoParaNumero(combustivelFinal),
        avarias: avarias,
        observacoes,
        ci,
        opm,
        nome,
        telefone
      }

      if (editRecord) {
        // Atualizar registro existente
        const { error: updateError } = await supabase
          .from('checklists')
          .update(checklistData)
          .eq('id', editRecord.id)

        if (updateError) throw updateError

        // Se estiver em modo finalizar, recarregar o registro atualizado
        if (isFinalizarMode) {
          const { data: registroAtualizado, error: errorBusca } = await supabase
            .from('checklists')
            .select('*')
            .eq('id', editRecord.id)
            .single()

          if (!errorBusca && registroAtualizado) {
            // Atualizar os estados com os dados recarregados
            setData(registroAtualizado.data)
            setPrefixed(registroAtualizado.prefixed as 'spin' | 's10')
            setCodigoViatura(registroAtualizado.codigo_viatura)
            setServico(registroAtualizado.servico as 'Ordinario' | 'SEG')
            setTurno(registroAtualizado.turno as 'Primeiro' | 'Segundo')
            setKmInicial(registroAtualizado.km_inicial.toString())
            setKmFinal(registroAtualizado.km_final.toString())
            setAbastecimento(registroAtualizado.abastecimento.toString())
            setCombustivelInicial(numeroParaOpcao(registroAtualizado.combustivel_inicial))
            setCombustivelFinal(numeroParaOpcao(registroAtualizado.combustivel_final))
            setAvarias(registroAtualizado.avarias || {})
            setObservacoes(registroAtualizado.observacoes || '')
            setCi(registroAtualizado.ci)
            setOpm(registroAtualizado.opm)
            setNome(registroAtualizado.nome || '')
            setTelefone(registroAtualizado.telefone || '')
          }
        }
      } else {
        // Criar novo registro
        const { error: insertError } = await supabase
          .from('checklists')
          .insert(checklistData)

        if (insertError) throw insertError
      }

      setSuccess(true)
      setSuccessMessage('Checklist salvo com sucesso!')
      
      // Limpar formulário apenas se não estiver editando
      if (!editRecord) {
        setData('')
        setPrefixed('')
        setCodigoViatura('')
        setServico('')
        setTurno('')
        setKmInicial('')
        setKmFinal('')
        setAbastecimento('')
        setCombustivelInicial('')
        setCombustivelFinal('')
        setAvarias({})
        setObservacoes('')
        setCi('')
        setOpm('')
        setNome('')
        setTelefone('')
      }

      setTimeout(() => {
        setSuccess(false)
        setSuccessMessage('')
        // Se estiver em modo finalizar, não chamar onSuccess para manter o editRecord
        if (!isFinalizarMode && onSuccess) {
          onSuccess()
        }
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar checklist')
    } finally {
      setLoading(false)
    }
  }

  const handleFinalizar = async () => {
    if (!editRecord) return

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const registroEstaFinalizado = await verificarRegistroFinalizado()
      if (registroEstaFinalizado) {
        throw new Error('Este checklist foi finalizado e não pode ser editado.')
      }

      // Primeiro salvar as alterações
      const checklistData = {
        data: data.trim(),
        prefixed,
        codigo_viatura: codigoViatura,
        servico,
        turno,
        km_inicial: parseInt(kmInicial) || 0,
        km_final: parseInt(kmFinal) || 0,
        abastecimento: parseFloat(abastecimento) || 0,
        combustivel_inicial: opcaoParaNumero(combustivelInicial),
        combustivel_final: opcaoParaNumero(combustivelFinal),
        avarias: avarias,
        observacoes,
        ci,
        opm,
        nome,
        telefone,
        finalizado: true
      }

      const { error: updateError } = await supabase
        .from('checklists')
        .update(checklistData)
        .eq('id', editRecord.id)

      if (updateError) throw updateError

      setSuccess(true)
      setSuccessMessage('Checklist finalizado com sucesso!')
      
      setTimeout(() => {
        setSuccess(false)
        setSuccessMessage('')
        if (onFinalizar) onFinalizar()
        if (onSuccess) onSuccess()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Erro ao finalizar checklist')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletar = async () => {
    if (!editRecord) return

    // Confirmar antes de deletar
    const confirmar = window.confirm('Tem certeza que deseja apagar este checklist? Esta ação não pode ser desfeita.')
    if (!confirmar) return

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: deleteError } = await supabase
        .from('checklists')
        .delete()
        .eq('id', editRecord.id)

      if (deleteError) throw deleteError

      setSuccess(true)
      setSuccessMessage('Checklist apagado com sucesso!')
      
      setTimeout(() => {
        setSuccess(false)
        setSuccessMessage('')
        // Voltar para a lista de finalizar checklist
        if (onFinalizar) onFinalizar()
        if (onSuccess) onSuccess()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Erro ao apagar checklist')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Mensagem de sucesso no meio da tela */}
      {success && successMessage && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#2c7700',
          color: 'white',
          padding: '20px 40px',
          borderRadius: '8px',
          fontSize: '1.2rem',
          fontWeight: '600',
          zIndex: 9999,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          animation: 'fadeIn 0.3s ease-in'
        }}>
          {successMessage}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>{editRecord ? 'Editar Checklist' : 'Fazer Checklist'}</h2>
        {editRecord && onCancel && (
          <button
            type="button"
            className="nav-button"
            onClick={onCancel}
            style={{ padding: '8px 16px', fontSize: '0.9rem', background: '#666' }}
          >
            Cancelar
          </button>
        )}
      </div>

      {error && <div className="error">{error}</div>}
      {dataFinalizada && (
        <div className="error" style={{ backgroundColor: '#ffebee', color: '#c62828', border: '2px solid #c62828' }}>
          ⚠️ ATENÇÃO: Este checklist foi finalizado e não pode ser editado.
        </div>
      )}

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
            value={data || ''}
            onChange={(e) => {
              // Captura o valor diretamente do input
              // O input type="date" sempre retorna YYYY-MM-DD
              const valorSelecionado = e.target.value
              if (valorSelecionado) {
                setData(valorSelecionado)
              }
            }}
            onBlur={(e) => {
              // Garante que o valor seja mantido mesmo ao perder o foco
              const valor = e.target.value
              if (valor && valor !== data) {
                setData(valor)
              }
            }}
            required
            disabled={dataFinalizada}
          />
        </div>
      </div>

      {/* Prefixo */}
      <div className="form-section">
        <div className="form-group">
          <label>Modelo da Viatura:</label>
          <div className="radio-group">
            <div className={`radio-option ${prefixed === 'spin' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="prefixed"
                value="spin"
                checked={prefixed === 'spin'}
                onChange={(e) => handlePrefixedChange(e.target.value as 'spin')}
                required
              />
              <label>SPIN</label>
            </div>
            <div className={`radio-option ${prefixed === 's10' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="prefixed"
                value="s10"
                checked={prefixed === 's10'}
                onChange={(e) => handlePrefixedChange(e.target.value as 's10')}
                required
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
          <select
            value={codigoViatura}
            onChange={(e) => setCodigoViatura(e.target.value)}
            required
            disabled={!prefixed}
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

      {/* Serviço */}
      <div className="form-section">
        <div className="form-group">
          <label>Serviço:</label>
          <div className="radio-group">
            <div className={`radio-option ${servico === 'Ordinario' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="servico"
                value="Ordinario"
                checked={servico === 'Ordinario'}
                onChange={(e) => setServico(e.target.value as 'Ordinario')}
                required
              />
              <label>Ordinário</label>
            </div>
            <div className={`radio-option ${servico === 'SEG' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="servico"
                value="SEG"
                checked={servico === 'SEG'}
                onChange={(e) => setServico(e.target.value as 'SEG')}
                required
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
            <div className={`radio-option ${turno === 'Primeiro' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="turno"
                value="Primeiro"
                checked={turno === 'Primeiro'}
                onChange={(e) => setTurno(e.target.value as 'Primeiro')}
                required
              />
              <label>Primeiro Turno</label>
            </div>
            <div className={`radio-option ${turno === 'Segundo' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="turno"
                value="Segundo"
                checked={turno === 'Segundo'}
                onChange={(e) => setTurno(e.target.value as 'Segundo')}
                required
              />
              <label>Segundo Turno</label>
            </div>
          </div>
        </div>
      </div>

      {/* KM */}
      {camposHabilitados && (
        <div className="form-section">
          <h2>KM</h2>
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
              />
            </div>
          </div>
        </div>
      )}

      {/* Combustível e Abastecimento */}
      {camposHabilitados && (
        <div className="form-section">
          <h2>Combustível e Abastecimento</h2>
          <div className="form-group">
            <label>Combustível Inicial:</label>
            <div className="radio-group">
              {OPCOES_COMBUSTIVEL.map((opcao) => (
                <div key={opcao.value} className={`radio-option ${combustivelInicial === opcao.value ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="combustivelInicial"
                    value={opcao.value}
                    checked={combustivelInicial === opcao.value}
                    onChange={(e) => setCombustivelInicial(e.target.value)}
                    required
                  />
                  <label>{opcao.label}</label>
                </div>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Combustível Final:</label>
            <div className="radio-group">
              {OPCOES_COMBUSTIVEL.map((opcao) => (
                <div key={opcao.value} className={`radio-option ${combustivelFinal === opcao.value ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="combustivelFinal"
                    value={opcao.value}
                    checked={combustivelFinal === opcao.value}
                    onChange={(e) => setCombustivelFinal(e.target.value)}
                  
                  />
                  <label>{opcao.label}</label>
                </div>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Abastecimento (L):</label>
            <input
              type="number"
              step="0.01"
              value={abastecimento}
              onChange={(e) => setAbastecimento(e.target.value)}
              
            />
          </div>
        </div>
      )}

      {/* Tabela de Avarias */}
      {camposHabilitados && (
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
      {camposHabilitados && (
        <div className="form-section">
          <div className="form-group">
            <label>Observações:</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={5}
              placeholder="Digite observações adicionais..."
            />
          </div>
        </div>
      )}

      {/* Motorista, CI e OPM */}
      {camposHabilitados && (
        <div className="form-section">
          <div className="form-group">
            <label>Motorista que está fazendo o registro:</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              placeholder="Digite o nome completo"
            />
          </div>
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
              <label>OPM do Militar:</label>
              <input
                type="text"
                value={opm}
                onChange={(e) => setOpm(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Telefone de Contato:</label>
            <input
              type="text"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </div>
        </div>
      )}

      {/* Botão Submit */}
      {camposHabilitados && (
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
          {isFinalizarMode && editRecord ? (
            <>
              <button 
                type="button" 
                className="submit-button" 
                onClick={handleSubmit}
                disabled={loading || dataFinalizada}
                style={{ background: '#2c7700' }}
              >
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
              <button 
                type="button" 
                className="submit-button" 
                onClick={handleFinalizar}
                disabled={loading || dataFinalizada}
                style={{ background: '#d32f2f' }}
              >
                {loading ? 'Finalizando...' : 'Finalizar Checklist'}
              </button>
              <button 
                type="button" 
                className="submit-button" 
                onClick={handleDeletar}
                disabled={loading || dataFinalizada}
                style={{ background: '#ff5722' }}
              >
                {loading ? 'Apagando...' : 'Apagar Checklist'}
              </button>
              {onCancel && (
                <button
                  type="button"
                  className="nav-button"
                  onClick={onCancel}
                  style={{ padding: '8px 16px', fontSize: '0.9rem', background: '#666' }}
                >
                  Cancelar
                </button>
              )}
            </>
          ) : (
            <button type="submit" className="submit-button" disabled={loading || dataFinalizada}>
              {loading ? (editRecord ? 'Atualizando...' : 'Registrando...') : (editRecord ? 'Atualizar Checklist' : 'Registrar Checklist')}
            </button>
          )}
        </div>
      )}
    </form>
  )
}
