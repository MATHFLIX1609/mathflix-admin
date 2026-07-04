import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { revalidatePath } from 'next/cache'

async function crearCliente(formData: FormData) {
  'use server'
  const nombre = formData.get('nombre') as string
  const username = formData.get('username') as string
  const password = formData.get('password') as string
  const url = formData.get('url') as string
  const vencimiento = formData.get('vencimiento') as string
  const conexiones = formData.get('conexiones') as string

  await supabase.from('clientes').insert({
    nombre_cliente: nombre,
    username: username,
    password: password,
    url_completa: url,
    vencimiento: vencimiento,
    numero_conexiones: parseInt(conexiones) || 1
  })
  
  revalidatePath('/dashboard')
}

async function editarCliente(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const nombre = formData.get('nombre') as string
  const username = formData.get('username') as string
  const password = formData.get('password') as string
  const url = formData.get('url') as string
  const vencimiento = formData.get('vencimiento') as string
  const conexiones = formData.get('conexiones') as string
  const activo = formData.get('activo') === 'on'

  await supabase.from('clientes').update({
    nombre_cliente: nombre,
    username: username,
    password: password,
    url_completa: url,
    vencimiento: vencimiento,
    numero_conexiones: parseInt(conexiones) || 1,
    activo: activo
  }).eq('id', id)
  
  revalidatePath('/dashboard')
}

async function eliminarCliente(id: string) {
  'use server'
  await supabase.from('clientes').delete().eq('id', id)
  revalidatePath('/dashboard')
}

function generarUrlEspejo() {
  const dominio = typeof window !== 'undefined' ? window.location.origin : 'https://tu-panel.vercel.app'
  return dominio
}

export default async function DashboardPage({ searchParams }: { searchParams: { edit?: string } }) {
  const cookieStore = await cookies()
  const auth = cookieStore.get('admin-auth')

  if (!auth) {
    redirect('/login')
  }

  const { data: clientes } = await supabase
    .from('clientes')
    .select('*')
    .order('created_at', { ascending: false })

  const clienteEditando = searchParams.edit 
    ? clientes?.find(c => c.id === searchParams.edit) 
    : null

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#f1f5f9', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '32px' }}>
          Panel Mathflix - Clientes
        </h1>

        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
            {clienteEditando ? 'Editar Cliente' : 'Crear Nuevo Cliente'}
          </h2>
          <form action={clienteEditando ? editarCliente : crearCliente} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {clienteEditando && <input type="hidden" name="id" value={clienteEditando.id} />}
            <input name="nombre" placeholder="Nombre del cliente" defaultValue={clienteEditando?.nombre_cliente} required style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
            <input name="username" placeholder="Username" defaultValue={clienteEditando?.username} required style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
            <input name="password" placeholder="Contraseña" defaultValue={clienteEditando?.password} required style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
            <input name="url" placeholder="URL del servidor ej: http://demo.com:8080" defaultValue={clienteEditando?.url_completa} required style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
            <input name="vencimiento" type="date" defaultValue={clienteEditando?.vencimiento} required style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
            <input name="conexiones" type="number" placeholder="Conexiones" defaultValue={clienteEditando?.numero_conexiones || 1} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
            {clienteEditando && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', gridColumn: '1 / -1' }}>
                <input type="checkbox" name="activo" defaultChecked={clienteEditando.activo} />
                Cliente Activo
              </label>
            )}
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px' }}>
              <button type="submit" style={{ flex: 1, padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                {clienteEditando ? 'Guardar Cambios' : 'Crear Cliente'}
              </button>
              {clienteEditando && (
                <a href="/dashboard" style={{ padding: '10px 20px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', textDecoration: 'none', textAlign: 'center' }}>
                  Cancelar
                </a>
              )}
            </div>
          </form>
        </div>

        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
            Clientes Registrados
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                <th style={{ padding: '8px' }}>Nombre</th>
                <th style={{ padding: '8px' }}>Usuario</th>
                <th style={{ padding: '8px' }}>Contraseña</th>
                <th style={{ padding: '8px' }}>URL Original</th>
                <th style={{ padding: '8px' }}>Datos IPTV Smarters</th>
                <th style={{ padding: '8px' }}>Vence</th>
                <th style={{ padding: '8px' }}>Conex.</th>
                <th style={{ padding: '8px' }}>Estado</th>
                <th style={{ padding: '8px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes?.map((cliente) => {
                const urlEspejo = generarUrlEspejo()
                return (
                  <tr key={cliente.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '8px' }}>{cliente.nombre_cliente}</td>
                    <td style={{ padding: '8px', fontFamily: 'monospace' }}>{cliente.username}</td>
                    <td style={{ padding: '8px', fontFamily: 'monospace' }}>{cliente.password}</td>
                    <td style={{ padding: '8px', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <span style={{ fontSize: '10px', color: '#ef4444' }}>{cliente.url_completa}</span>
                    </td>
                    <td style={{ padding: '8px', maxWidth: '250px' }}>
                      <div style={{ backgroundColor: '#dcfce7', padding: '8px', borderRadius: '4px', fontSize: '11px', lineHeight: '1.6' }}>
                        <div><strong>URL:</strong> {urlEspejo}</div>
                        <div><strong>User:</strong> {cliente.username}</div>
                        <div><strong>Pass:</strong> {cliente.password}</div>
                      </div>
                    </td>
                    <td style={{ padding: '8px' }}>{cliente.vencimiento}</td>
                    <td style={{ padding: '8px' }}>{cliente.numero_conexiones}</td>
                    <td style={{ padding: '8px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: cliente.activo ? '#22c55e' : '#ef4444', color: 'white', fontSize: '11px' }}>
                        {cliente.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ padding: '8px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <a href={`?edit=${cliente.id}`} style={{ padding: '4px 8px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', textDecoration: 'none', fontSize: '11px' }}>
                          Editar
                        </a>
                        <form action={eliminarCliente.bind(null, cliente.id)}>
                          <button type="submit" style={{ padding: '4px 8px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>
                            Eliminar
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!clientes?.length && <p style={{ padding: '20px', textAlign: 'center' }}>No hay clientes todavía.</p>}
        </div>
      </div>
    </div>
  )
}