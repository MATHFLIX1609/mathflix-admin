'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Cliente = {
  id: string
  nombre_cliente: string
  username: string
  password: string
  url_completa: string
  numero_conexiones: number
  vencimiento: string
  activo: boolean
  created_at: string
}

type InputProps = {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}

export default function Dashboard() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState<Cliente | null>(null)
  const router = useRouter()

  const cargarClientes = async () => {
    setLoading(true)
    const res = await fetch('/api/clientes')
    const data = await res.json()
    setClientes(data)
    setLoading(false)
  }

  useEffect(() => {
    cargarClientes()
  }, [])

  const cerrarSesion = async () => {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/login')
  }

  const guardarCliente = async () => {
    if (!editando) return

    await fetch(`/api/clientes/${editando.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editando)
    })

    setEditando(null)
    cargarClientes()
  }

  const generarUrlEspejo = (url: string) => {
    return url.replace('tv.zeuspro.xyz:2052', 'fivetv.org:25461')
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: 'white',
      fontFamily: 'sans-serif',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>
            Mathflix Admin - Clientes
          </h1>
          <button
            onClick={cerrarSesion}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Cerrar Sesión
          </button>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f8fafc' }}>
              <tr>
                <th style={thStyle}>Nombre</th>
                <th style={thStyle}>Usuario</th>
                <th style={thStyle}>URL Original</th>
                <th style={thStyle}>URL Espejo</th>
                <th style={thStyle}>Conexiones</th>
                <th style={thStyle}>Vencimiento</th>
                <th style={thStyle}>Estado</th>
                <th style={thStyle}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading? (
                <tr><td colSpan={8} style={tdStyle}>Cargando...</td></tr>
              ) : clientes.length === 0? (
                <tr><td colSpan={8} style={{...tdStyle, textAlign: 'center' }}>No hay clientes</td></tr>
              ) : clientes.map(cliente => (
                <tr key={cliente.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={tdStyle}>{cliente.nombre_cliente}</td>
                  <td style={tdStyle}>{cliente.username}</td>
                  <td style={{...tdStyle, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <a href={cliente.url_completa} target="_blank" style={{ color: '#3b82f6' }}>
                      {cliente.url_completa}
                    </a>
                  </td>
                  <td style={{...tdStyle, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <a href={generarUrlEspejo(cliente.url_completa)} target="_blank" style={{ color: '#8b5cf6' }}>
                      {generarUrlEspejo(cliente.url_completa)}
                    </a>
                  </td>
                  <td style={tdStyle}>{cliente.numero_conexiones}</td>
                  <td style={tdStyle}>
                    {new Date(cliente.vencimiento).toLocaleDateString('es-CO')}
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      backgroundColor: cliente.activo? '#dcfce7' : '#fee2e2',
                      color: cliente.activo? '#166534' : '#991b1b',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '14px'
                    }}>
                      {cliente.activo? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => setEditando(cliente)}
                      style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '6px 12px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editando && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#000' }}>
              Editar Cliente
            </h2>

            <Input label="Nombre" value={editando.nombre_cliente}
              onChange={(v: string) => setEditando({...editando, nombre_cliente: v})} />
            <Input label="Usuario" value={editando.username}
              onChange={(v: string) => setEditando({...editando, username: v})} />
            <Input label="Password" value={editando.password}
              onChange={(v: string) => setEditando({...editando, password: v})} />
            <Input label="URL Completa" value={editando.url_completa}
              onChange={(v: string) => setEditando({...editando, url_completa: v})} />
            <Input label="Conexiones" type="number" value={editando.numero_conexiones.toString()}
              onChange={(v: string) => setEditando({...editando, numero_conexiones: parseInt(v) || 0})} />
            <Input label="Vencimiento" type="date" value={editando.vencimiento.split('T')[0]}
              onChange={(v: string) => setEditando({...editando, vencimiento: v})} />

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={guardarCliente} style={btnPrimary}>Guardar</button>
              <button onClick={() => setEditando(null)} style={btnSecondary}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'left',
  color: '#475569',
  fontWeight: '600',
  fontSize: '14px'
}

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  color: '#1e293b',
  fontSize: '14px'
}

const modalOverlay: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 50
}

const modalContent: React.CSSProperties = {
  backgroundColor: 'white',
  padding: '30px',
  borderRadius: '12px',
  width: '500px',
  maxHeight: '90vh',
  overflowY: 'auto'
}

const btnPrimary: React.CSSProperties = {
  flex: 1,
  backgroundColor: '#3b82f6',
  color: 'white',
  padding: '10px',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold'
}

const btnSecondary: React.CSSProperties = {
  flex: 1,
  backgroundColor: '#e2e8f0',
  color: '#1e293b',
  padding: '10px',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold'
}

function Input({ label, value, onChange, type = 'text' }: InputProps) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', marginBottom: '6px', color: '#334155', fontSize: '14px', fontWeight: '500' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '10px',
          border: '1px solid #cbd5e1',
          borderRadius: '6px',
          fontSize: '14px',
          color: '#000'
        }}
      />
    </div>
  )
}
