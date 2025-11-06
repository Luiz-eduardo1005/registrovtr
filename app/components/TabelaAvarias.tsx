'use client'

interface TabelaAvariasProps {
  itens: string[]
  avarias: Record<string, { tipo: string; observacao: string }>
  setAvarias: (avarias: Record<string, { tipo: string; observacao: string }>) => void
  tiposAvarias: string[]
  readOnly?: boolean
}

export default function TabelaAvarias({
  itens,
  avarias,
  setAvarias,
  tiposAvarias,
  readOnly = false
}: TabelaAvariasProps) {
  const handleTipoChange = (item: string, tipo: string) => {
    const newAvarias = { ...avarias }
    
    // Se selecionar um tipo (incluindo OK), adiciona ou atualiza
    if (tipo && tipo.trim() !== '') {
      if (tipo === 'OK') {
        // Se selecionar OK, mantém o item mas com tipo OK e sem observação
        newAvarias[item] = {
          tipo: 'OK',
          observacao: ''
        }
      } else {
        // Se selecionar um tipo de avaria, adiciona ou atualiza
        newAvarias[item] = {
          tipo,
          observacao: newAvarias[item]?.observacao || ''
        }
      }
    } else {
      // Se tentar deixar vazio, remove o item (não tem tipo selecionado)
      delete newAvarias[item]
    }
    
    setAvarias(newAvarias)
  }

  const handleObservacaoChange = (item: string, observacao: string) => {
    const newAvarias = { ...avarias }
    if (newAvarias[item]) {
      newAvarias[item] = {
        ...newAvarias[item],
        observacao
      }
      setAvarias(newAvarias)
    }
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="avarias-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Tipo de Avaria <span className="required-field">*</span></th>
            <th>Observação</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((item) => {
            const avariaAtual = avarias[item]
            const temAvaria = avariaAtual && avariaAtual.tipo && avariaAtual.tipo !== 'OK'
            
            return (
              <tr key={item}>
                <td>{item}</td>
                <td>
                  <select
                    value={avariaAtual?.tipo || ''}
                    onChange={(e) => handleTipoChange(item, e.target.value)}
                    disabled={readOnly}
                    required
                    title="Preencha este campo"
                    onInvalid={(e) => {
                      const target = e.target as HTMLSelectElement
                      target.setCustomValidity('Preencha este campo')
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLSelectElement
                      target.setCustomValidity('')
                    }}
                    style={readOnly ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                  >
                    <option value="">Selecione...</option>
                    <option value="OK">OK</option>
                    {tiposAvarias.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  {temAvaria ? (
                    <input
                      type="text"
                      value={avariaAtual.observacao || ''}
                      onChange={(e) => handleObservacaoChange(item, e.target.value)}
                      placeholder="Digite a observação..."
                      readOnly={readOnly}
                      disabled={readOnly}
                      style={readOnly ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                    />
                  ) : (
                    <span style={{ color: '#999' }}>—</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
