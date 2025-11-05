'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function FinalizarData() {
  const [dataFinalizar, setDataFinalizar] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleFinalizar = async () => {
    if (!dataFinalizar) {
      setError('Por favor, selecione uma data')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Verificar se já existe uma data finalizada para essa data
      const { data: existingData, error: checkError } = await supabase
        .from('datas_finalizadas')
        .select('data')
        .eq('data', dataFinalizar)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existingData) {
        setError('Esta data já foi finalizada anteriormente')
        setLoading(false)
        return
      }

      // Inserir a data finalizada
      const { error: insertError } = await supabase
        .from('datas_finalizadas')
        .insert({ data: dataFinalizar })

      if (insertError) throw insertError

      setSuccess(true)
      setDataFinalizar('')
      
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'Erro ao finalizar data')
    } finally {
      setLoading(false)
    }
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

      <h2>Finalizar Data</h2>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">Data finalizada com sucesso! Não será mais possível editar registros desta data.</div>}

      <div className="form-section">
        <div className="form-group">
          <label>Selecione a data que deseja finalizar:</label>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '10px' }}>
            Ao finalizar uma data, não será mais possível editar ou criar novos registros para essa data.
          </p>
          <input
            type="date"
            value={dataFinalizar}
            onChange={(e) => setDataFinalizar(e.target.value)}
            required
          />
        </div>
      </div>

      <button
        type="button"
        className="submit-button"
        onClick={handleFinalizar}
        disabled={loading || !dataFinalizar}
        style={{ background: '#d32f2f', marginTop: '20px' }}
      >
        {loading ? 'Finalizando...' : 'Finalizar Data'}
      </button>
    </div>
  )
}

