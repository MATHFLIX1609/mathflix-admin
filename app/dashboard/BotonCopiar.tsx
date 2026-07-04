'use client'

export function BotonCopiar({ texto }: { texto: string }) {
  return (
    <button 
      onClick={() => {
        navigator.clipboard.writeText(texto)
        alert('Copiado!')
      }}
      style={{
        padding: '6px 12px',
        backgroundColor: '#22c55e',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Copiar
    </button>
  )
}