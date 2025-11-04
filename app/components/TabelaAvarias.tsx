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
    
    if (tipo === 'OK' || tipo === '') {
      // Se estiver OK ou vazio, remove o item
      delete newAvarias[item]
    } else {
      // Se não estiver OK, adiciona ou atualiza
      newAvarias[item] = {
        tipo,
        observacao: newAvarias[item]?.observacao || ''
      }
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
            <th>Tipo de Avaria</th>
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
                    value={avariaAtual?.tipo || 'OK'}
                    onChange={(e) => handleTipoChange(item, e.target.value)}
                    disabled={readOnly}
                    style={readOnly ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                  >
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
