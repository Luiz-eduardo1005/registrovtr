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
  const [tipoTurno, setTipoTurno] = useState<'12Hs' | '8Hs (2x2)' | ''>('')
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
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showFinalizarModal, setShowFinalizarModal] = useState(false)
  const [kmRodados, setKmRodados] = useState<number | null>(null)
  const [kmError, setKmError] = useState<string | null>(null)

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
      
      // Parsear o turno do banco de dados
      const turnoDoBanco = editRecord.turno as string
      if (turnoDoBanco.includes('12Hs')) {
        setTipoTurno('12Hs')
        if (turnoDoBanco.includes('Primeiro')) {
          setTurno('Primeiro')
        } else if (turnoDoBanco.includes('Segundo')) {
          setTurno('Segundo')
        }
      } else if (turnoDoBanco.includes('8Hs (2x2)')) {
        setTipoTurno('8Hs (2x2)')
        if (turnoDoBanco.includes('Primeiro')) {
          setTurno('Primeiro')
        } else if (turnoDoBanco.includes('Segundo')) {
          setTurno('Segundo')
        }
      } else if (turnoDoBanco === 'Primeiro' || turnoDoBanco === 'Segundo') {
        setTipoTurno('')
        setTurno(turnoDoBanco as 'Primeiro' | 'Segundo')
      } else {
        // Para compatibilidade com registros antigos
        if (turnoDoBanco === '12Hs') {
          setTipoTurno('12Hs')
          setTurno('')
        } else if (turnoDoBanco === '8Hs (2x2)') {
          setTipoTurno('8Hs (2x2)')
          setTurno('')
        } else {
          setTipoTurno('')
          setTurno('')
        }
      }
      setKmInicial(editRecord.km_inicial.toString())
      setKmFinal(editRecord.km_final.toString())
      setAbastecimento(editRecord.abastecimento.toString())
      setCombustivelInicial(numeroParaOpcao(editRecord.combustivel_inicial))
      setCombustivelFinal(numeroParaOpcao(editRecord.combustivel_final))
      
      // Garantir que todos os itens tenham tipo definido (inicializar faltantes como "OK")
      const todosItens = [...ITENS_1_ESCALAO, ...ITENS_PNEUS, ...ITENS_GERAIS]
      const avariasCompletas = { ...(editRecord.avarias || {}) }
      todosItens.forEach(item => {
        if (!avariasCompletas[item] || !avariasCompletas[item].tipo) {
          avariasCompletas[item] = { tipo: 'OK', observacao: '' }
        }
      })
      setAvarias(avariasCompletas)
      
      setObservacoes(editRecord.observacoes || '')
      setCi(editRecord.ci)
      setOpm(editRecord.opm)
      setNome(editRecord.nome || '')
      setTelefone(editRecord.telefone || '')
    } else {
      // Quando não está editando, não há registro finalizado
      setDataFinalizada(false)
      // Inicializar avarias com todos os itens como "OK"
      const todosItens = [...ITENS_1_ESCALAO, ...ITENS_PNEUS, ...ITENS_GERAIS]
      const avariasIniciais: Record<string, { tipo: string; observacao: string }> = {}
      todosItens.forEach(item => {
        avariasIniciais[item] = { tipo: 'OK', observacao: '' }
      })
      setAvarias(avariasIniciais)
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

  // Limpar turno quando o serviço mudar, se necessário
  const handleServicoChange = (newServico: 'Ordinario' | 'SEG') => {
    setServico(newServico)
    // Limpar tipoTurno quando mudar de serviço
    if (newServico === 'SEG') {
      setTipoTurno('')
    }
  }

  const codigosDisponiveis = prefixed === 'spin' ? CODIGOS_SPIN : prefixed === 's10' ? CODIGOS_S10 : []

  // Determina se os campos devem estar habilitados (quando turno está selecionado)
  const camposHabilitados = servico === 'Ordinario' ? (!!tipoTurno && !!turno) : !!turno

  // Função para combinar tipoTurno e turno em uma string para salvar no banco
  const combinarTurno = (): string => {
    if (servico === 'Ordinario' && tipoTurno && turno) {
      return `${tipoTurno} - ${turno}`
    } else if (turno) {
      return turno
    }
    return ''
  }

  // Calcular progresso do formulário
  const calcularProgresso = (): number => {
    // Se não há campos habilitados, só conta os campos básicos
    if (!camposHabilitados) {
      // Se servico está vazio, não conta nada (progresso 0%)
      if (!servico) {
        return 0
      }
      
      // Construir array de campos básicos de forma dinâmica
      const camposBasicos: (string | boolean)[] = [
        data,
        prefixed,
        codigoViatura,
        servico
      ]
      
      // Adicionar tipoTurno ou marcador baseado no serviço
      if (servico === 'Ordinario') {
        camposBasicos.push(tipoTurno)
      } else if (servico === 'SEG') {
        camposBasicos.push(true) // SEG não precisa de tipoTurno
      } else {
        camposBasicos.push(false) // Serviço não selecionado
      }
      
      camposBasicos.push(turno)
      
      const basicosPreenchidos = camposBasicos.filter(campo => {
        if (campo === true) return true
        if (campo === false) return false
        if (typeof campo === 'string') return campo.trim() !== ''
        return false
      }).length
      
      const total = camposBasicos.length
      
      if (total === 0) return 0
      return Math.round((basicosPreenchidos / total) * 100)
    }
    
    // Campos obrigatórios básicos (sempre visíveis)
    const camposBasicos = [
      data,
      prefixed,
      codigoViatura,
      servico,
      servico === 'Ordinario' ? tipoTurno : true,
      turno
    ]
    
    // Campos obrigatórios que só aparecem quando turno está selecionado
    const camposCondicionais = [
      kmInicial,
      combustivelInicial,
      nome,
      ci,
      opm,
      telefone
    ]
    
    // Contar campos básicos preenchidos
    const basicosPreenchidos = camposBasicos.filter(campo => {
      if (campo === true) return true
      if (typeof campo === 'string') return campo.trim() !== ''
      return false
    }).length
    
    // Contar campos condicionais preenchidos
    const condicionaisPreenchidos = camposCondicionais.filter(campo => typeof campo === 'string' && campo.trim() !== '').length
    
    // Total de campos obrigatórios (básicos + condicionais)
    const total = camposBasicos.length + camposCondicionais.length
    
    // Total preenchidos
    const preenchidos = basicosPreenchidos + condicionaisPreenchidos
    
    if (total === 0) return 0
    return Math.round((preenchidos / total) * 100)
  }

  // Calcular KM rodados e validar
  useEffect(() => {
    if (kmInicial && kmFinal) {
      const inicial = parseInt(kmInicial)
      const final = parseInt(kmFinal)
      
      if (!isNaN(inicial) && !isNaN(final)) {
        if (final < inicial) {
          setKmError('KM Final não pode ser menor que KM Inicial')
          setKmRodados(null)
        } else {
          setKmError(null)
          setKmRodados(final - inicial)
        }
      } else {
        setKmError(null)
        setKmRodados(null)
      }
    } else {
      setKmError(null)
      setKmRodados(null)
    }
  }, [kmInicial, kmFinal])

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

      // Validar KM antes de salvar
      if (kmInicial && kmFinal) {
        const inicial = parseInt(kmInicial)
        const final = parseInt(kmFinal)
        if (!isNaN(inicial) && !isNaN(final) && final < inicial) {
          throw new Error('KM Final não pode ser menor que KM Inicial')
        }
      }

      // Validar telefone obrigatório
      if (!telefone || telefone.trim() === '') {
        throw new Error('Por favor, preencha o telefone de contato')
      }

      // Validar que todos os itens da tabela de avarias tenham tipo selecionado
      // Nota: "OK" é um tipo válido, então todos os itens devem ter um tipo (pode ser "OK" ou um tipo de avaria)
      const todosItens = [...ITENS_1_ESCALAO, ...ITENS_PNEUS, ...ITENS_GERAIS]
      const itensSemTipo = todosItens.filter(item => {
        const avaria = avarias[item]
        // Verifica se não tem avaria ou se o tipo está vazio/null
        // "OK" é válido, então só rejeita se não tiver tipo ou estiver vazio
        return !avaria || !avaria.tipo || avaria.tipo.trim() === ''
      })
      
      if (itensSemTipo.length > 0) {
        throw new Error('Por favor, selecione o tipo de avaria para todos os itens da tabela de avarias')
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
        turno: combinarTurno(),
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
            
            // Parsear o turno do banco de dados
            const turnoAtualizado = registroAtualizado.turno as string
            if (turnoAtualizado.includes('12Hs')) {
              setTipoTurno('12Hs')
              if (turnoAtualizado.includes('Primeiro')) {
                setTurno('Primeiro')
              } else if (turnoAtualizado.includes('Segundo')) {
                setTurno('Segundo')
              }
            } else if (turnoAtualizado.includes('8Hs (2x2)')) {
              setTipoTurno('8Hs (2x2)')
              if (turnoAtualizado.includes('Primeiro')) {
                setTurno('Primeiro')
              } else if (turnoAtualizado.includes('Segundo')) {
                setTurno('Segundo')
              }
            } else if (turnoAtualizado === 'Primeiro' || turnoAtualizado === 'Segundo') {
              setTipoTurno('')
              setTurno(turnoAtualizado as 'Primeiro' | 'Segundo')
            } else {
              setTipoTurno('')
              setTurno('')
            }
            setKmInicial(registroAtualizado.km_inicial.toString())
            setKmFinal(registroAtualizado.km_final.toString())
            setAbastecimento(registroAtualizado.abastecimento.toString())
            setCombustivelInicial(numeroParaOpcao(registroAtualizado.combustivel_inicial))
            setCombustivelFinal(numeroParaOpcao(registroAtualizado.combustivel_final))
            
            // Garantir que todos os itens tenham tipo definido (inicializar faltantes como "OK")
            const todosItensAtualizado = [...ITENS_1_ESCALAO, ...ITENS_PNEUS, ...ITENS_GERAIS]
            const avariasCompletasAtualizado = { ...(registroAtualizado.avarias || {}) }
            todosItensAtualizado.forEach(item => {
              if (!avariasCompletasAtualizado[item] || !avariasCompletasAtualizado[item].tipo) {
                avariasCompletasAtualizado[item] = { tipo: 'OK', observacao: '' }
              }
            })
            setAvarias(avariasCompletasAtualizado)
            
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
        setTipoTurno('')
        setTurno('')
        setKmInicial('')
        setKmFinal('')
        setAbastecimento('')
        setCombustivelInicial('')
        setCombustivelFinal('')
        // Reinicializar avarias com todos os itens como "OK"
        const todosItens = [...ITENS_1_ESCALAO, ...ITENS_PNEUS, ...ITENS_GERAIS]
        const avariasIniciais: Record<string, { tipo: string; observacao: string }> = {}
        todosItens.forEach(item => {
          avariasIniciais[item] = { tipo: 'OK', observacao: '' }
        })
        setAvarias(avariasIniciais)
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
        turno: combinarTurno(),
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
      setShowFinalizarModal(false)
      
      setTimeout(() => {
        setSuccess(false)
        setSuccessMessage('')
        if (onFinalizar) onFinalizar()
        if (onSuccess) onSuccess()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Erro ao finalizar checklist')
      setShowFinalizarModal(false)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletarConfirmado = async () => {
    if (!editRecord) return

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
      setShowDeleteModal(false)
      
      setTimeout(() => {
        setSuccess(false)
        setSuccessMessage('')
        // Voltar para a lista de finalizar checklist
        if (onFinalizar) onFinalizar()
        if (onSuccess) onSuccess()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Erro ao apagar checklist')
      setShowDeleteModal(false)
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

      {/* Barra de Progresso */}
      {!editRecord && (
        <div className="form-section" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ margin: 0, fontWeight: '600' }}>Progresso do Formulário:</label>
            <span style={{ fontWeight: '600', color: '#2c7700' }}>{calcularProgresso()}%</span>
          </div>
          <div style={{ 
            width: '100%', 
            height: '24px', 
            backgroundColor: '#e0e0e0', 
            borderRadius: '12px', 
            overflow: 'hidden',
            border: '2px solid #ddd'
          }}>
            <div style={{ 
              width: `${calcularProgresso()}%`, 
              height: '100%', 
              backgroundColor: '#2c7700', 
              transition: 'width 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              {calcularProgresso() > 15 && `${calcularProgresso()}%`}
            </div>
          </div>
        </div>
      )}

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
          <label>Data: <span className="required-field">*</span></label>
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
          <label>Modelo da Viatura: <span className="required-field">*</span></label>
          <div className="radio-group">
            <label className={`radio-option ${prefixed === 'spin' ? 'selected' : ''}`} htmlFor="prefixed-spin">
              <input
                type="radio"
                id="prefixed-spin"
                name="prefixed"
                value="spin"
                checked={prefixed === 'spin'}
                onChange={(e) => handlePrefixedChange(e.target.value as 'spin')}
                required
              />
              <span>SPIN</span>
            </label>
            <label className={`radio-option ${prefixed === 's10' ? 'selected' : ''}`} htmlFor="prefixed-s10">
              <input
                type="radio"
                id="prefixed-s10"
                name="prefixed"
                value="s10"
                checked={prefixed === 's10'}
                onChange={(e) => handlePrefixedChange(e.target.value as 's10')}
                required
              />
              <span>S10</span>
            </label>
          </div>
        </div>
      </div>

      {/* Código Viatura */}
      <div className="form-section">
        <div className="form-group">
          <label>Prefixo: <span className="required-field">*</span></label>
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
          <label>Serviço: <span className="required-field">*</span></label>
          <div className="radio-group">
            <label className={`radio-option ${servico === 'Ordinario' ? 'selected' : ''}`} htmlFor="servico-ordinario">
              <input
                type="radio"
                id="servico-ordinario"
                name="servico"
                value="Ordinario"
                checked={servico === 'Ordinario'}
                onChange={(e) => handleServicoChange(e.target.value as 'Ordinario')}
                required
                disabled={dataFinalizada}
              />
              <span>Ordinário</span>
            </label>
            <label className={`radio-option ${servico === 'SEG' ? 'selected' : ''}`} htmlFor="servico-seg">
              <input
                type="radio"
                id="servico-seg"
                name="servico"
                value="SEG"
                checked={servico === 'SEG'}
                onChange={(e) => handleServicoChange(e.target.value as 'SEG')}
                required
                disabled={dataFinalizada}
              />
              <span>SEG</span>
            </label>
          </div>
        </div>
      </div>

      {/* Turno - Tipo de Turno (apenas para Ordinário) */}
      {servico === 'Ordinario' && (
        <div className="form-section">
          <div className="form-group">
            <label>Tipo de Turno: <span className="required-field">*</span></label>
            <div className="radio-group">
              <label className={`radio-option ${tipoTurno === '12Hs' ? 'selected' : ''}`} htmlFor="tipo-turno-12hs">
                <input
                  type="radio"
                  id="tipo-turno-12hs"
                  name="tipoTurno"
                  value="12Hs"
                  checked={tipoTurno === '12Hs'}
                  onChange={(e) => setTipoTurno(e.target.value as '12Hs')}
                  required
                  disabled={dataFinalizada}
                />
                <span>12Hs</span>
              </label>
              <label className={`radio-option ${tipoTurno === '8Hs (2x2)' ? 'selected' : ''}`} htmlFor="tipo-turno-8hs">
                <input
                  type="radio"
                  id="tipo-turno-8hs"
                  name="tipoTurno"
                  value="8Hs (2x2)"
                  checked={tipoTurno === '8Hs (2x2)'}
                  onChange={(e) => setTipoTurno(e.target.value as '8Hs (2x2)')}
                  required
                  disabled={dataFinalizada}
                />
                <span>8Hs (2x2)</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Turno - Primeiro/Segundo (sempre aparece) */}
      {servico && (
        <div className="form-section">
          <div className="form-group">
            <label>Turno: <span className="required-field">*</span></label>
            <div className="radio-group">
              <label className={`radio-option ${turno === 'Primeiro' ? 'selected' : ''}`} htmlFor="turno-primeiro">
                <input
                  type="radio"
                  id="turno-primeiro"
                  name="turno"
                  value="Primeiro"
                  checked={turno === 'Primeiro'}
                  onChange={(e) => setTurno(e.target.value as 'Primeiro')}
                  required
                  disabled={dataFinalizada}
                />
                <span>Primeiro Turno</span>
              </label>
              <label className={`radio-option ${turno === 'Segundo' ? 'selected' : ''}`} htmlFor="turno-segundo">
                <input
                  type="radio"
                  id="turno-segundo"
                  name="turno"
                  value="Segundo"
                  checked={turno === 'Segundo'}
                  onChange={(e) => setTurno(e.target.value as 'Segundo')}
                  required
                  disabled={dataFinalizada}
                />
                <span>Segundo Turno</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* KM */}
      {camposHabilitados && (
        <div className="form-section">
          <h2>KM</h2>
          <div className="form-row">
            <div className="form-group">
              <label>KM Inicial: <span className="required-field">*</span></label>
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
                style={{ borderColor: kmError ? '#c33' : undefined }}
              />
            </div>
          </div>
          {/* Cálculo de KM Rodados */}
          {(kmRodados !== null || kmError) && (
            <div style={{ marginTop: '15px', padding: '12px', backgroundColor: kmError ? '#ffebee' : '#e8f5e9', borderRadius: '6px', border: `2px solid ${kmError ? '#c33' : '#2c7700'}` }}>
              {kmError ? (
                <div style={{ color: '#c33', fontSize: '0.95rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  ⚠️ {kmError}
                </div>
              ) : (
                <div style={{ color: '#2c7700', fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📊 KM Rodados: <span style={{ fontSize: '1.2rem' }}>{kmRodados?.toLocaleString('pt-BR')}</span> km
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Combustível e Abastecimento */}
      {camposHabilitados && (
        <div className="form-section">
          <h2>Combustível e Abastecimento</h2>
          <div className="form-group">
            <label>Combustível Inicial: <span className="required-field">*</span></label>
            <div className="radio-group">
              {OPCOES_COMBUSTIVEL.map((opcao) => (
                <label key={opcao.value} className={`radio-option ${combustivelInicial === opcao.value ? 'selected' : ''}`} htmlFor={`combustivel-inicial-${opcao.value}`}>
                  <input
                    type="radio"
                    id={`combustivel-inicial-${opcao.value}`}
                    name="combustivelInicial"
                    value={opcao.value}
                    checked={combustivelInicial === opcao.value}
                    onChange={(e) => setCombustivelInicial(e.target.value)}
                    required
                  />
                  <span>{opcao.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Combustível Final:</label>
            <div className="radio-group">
              {OPCOES_COMBUSTIVEL.map((opcao) => (
                <label key={opcao.value} className={`radio-option ${combustivelFinal === opcao.value ? 'selected' : ''}`} htmlFor={`combustivel-final-${opcao.value}`}>
                  <input
                    type="radio"
                    id={`combustivel-final-${opcao.value}`}
                    name="combustivelFinal"
                    value={opcao.value}
                    checked={combustivelFinal === opcao.value}
                    onChange={(e) => setCombustivelFinal(e.target.value)}
                  />
                  <span>{opcao.label}</span>
                </label>
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
            <label>Motorista que está fazendo o registro: <span className="required-field">*</span></label>
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
              <label>CI: <span className="required-field">*</span></label>
              <input
                type="text"
                value={ci}
                onChange={(e) => setCi(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>OPM do Militar: <span className="required-field">*</span></label>
              <input
                type="text"
                value={opm}
                onChange={(e) => setOpm(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Telefone de Contato: <span className="required-field">*</span></label>
            <input
              type="text"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(00) 00000-0000"
              required
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
                onClick={() => setShowFinalizarModal(true)}
                disabled={loading || dataFinalizada}
                style={{ background: '#d32f2f' }}
              >
                {loading ? 'Finalizando...' : 'Finalizar Checklist'}
              </button>
              <button 
                type="button" 
                className="submit-button" 
                onClick={() => setShowDeleteModal(true)}
                disabled={loading || dataFinalizada}
                style={{ background: '#ff5722' }}
              >
                {loading ? 'Apagando...' : 'Apagar Checklist'}
              </button>
            </>
          ) : (
            <button type="submit" className="submit-button" disabled={loading || dataFinalizada}>
              {loading ? (editRecord ? 'Atualizando...' : 'Registrando...') : (editRecord ? 'Atualizar Checklist' : 'Registrar Checklist')}
            </button>
          )}
        </div>
      )}

      {/* Modal de Confirmação - Deletar */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }} onClick={() => setShowDeleteModal(false)}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '15px', color: '#333' }}>Confirmar Exclusão</h3>
            <p style={{ marginBottom: '25px', color: '#666', lineHeight: '1.6' }}>
              Tem certeza que deseja apagar este checklist? Esta ação não pode ser desfeita.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                style={{
                  padding: '10px 20px',
                  border: '2px solid #ddd',
                  borderRadius: '6px',
                  background: 'white',
                  color: '#333',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeletarConfirmado}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  background: '#ff5722',
                  color: 'white',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Apagando...' : 'Sim, Apagar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação - Finalizar */}
      {showFinalizarModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }} onClick={() => setShowFinalizarModal(false)}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '15px', color: '#333' }}>Confirmar Finalização</h3>
            <p style={{ marginBottom: '25px', color: '#666', lineHeight: '1.6' }}>
              Tem certeza que deseja finalizar este checklist? Após finalizado, ele não poderá mais ser editado.
            </p>
            {kmError && (
              <div style={{ 
                backgroundColor: '#ffebee', 
                color: '#c62828', 
                padding: '12px', 
                borderRadius: '6px', 
                marginBottom: '20px',
                border: '1px solid #c62828'
              }}>
                ⚠️ {kmError}
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowFinalizarModal(false)}
                style={{
                  padding: '10px 20px',
                  border: '2px solid #ddd',
                  borderRadius: '6px',
                  background: 'white',
                  color: '#333',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowFinalizarModal(false)
                  handleFinalizar()
                }}
                disabled={loading || !!kmError}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  background: kmError ? '#ccc' : '#d32f2f',
                  color: 'white',
                  cursor: (loading || kmError) ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  opacity: (loading || kmError) ? 0.6 : 1
                }}
              >
                {loading ? 'Finalizando...' : 'Sim, Finalizar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
