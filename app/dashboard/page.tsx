import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Este componente corre en el servidor
export default async function DashboardPage() {
  // 1. Verificar si está logueado
  const cookieStore = await cookies()
  const auth = cookieStore.get('admin-auth')
  
  if (!auth || auth.value !== 'true') {
    redirect('/login')
  }

  // 2. Crear cliente de Supabase con service key
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)

  // 3. Traer todos los clientes
  const { data: clientes, error } = await supabase
    .from('clientes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
        <h1>Error cargando clientes</h1>
        <pre style={{ color: 'red', backgroundColor: '#fee', padding: '16px' }}>
          {error.message}
        </pre>
      </div>
    )
  }

  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'sans-serif', 
      backgroundColor: '#0f172a',
      minHeight: '100vh',
      color: 'white'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>
            Mathflix Admin - Clientes
          </h1>
          <a 
            href="/api/logout"
            style={{
              padding: '10px 20px',
              backgroundColor: '#ef4444',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px'
            }}
          >
            Cerrar Sesión
          </a>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px',
          overflow: 'hidden',
          color: '#0f172a'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f1f5f9' }}>
              <tr>
                <th style={thStyle}>Nombre</th>
                <th style={thStyle}>Usuario</th>
                <th style={thStyle}>URL</th>
                <th style={thStyle}>Conexiones</th>
                <th style={thStyle}>Vencimiento</th>
                <th style={thStyle}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {clientes && clientes.length > 0 ? (
                clientes.map((cliente) => (
                  <tr key={cliente.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                    <td style={tdStyle}>{cliente.nombre_cliente}</td>
                    <td style={tdStyle}>{cliente.username}</td>
                    <td style={tdStyle}>
                      <a href={cliente.url_completa} target="_blank" style={{ color: '#3b82f6' }}>
                        {cliente.url_completa}
                      </a>
                    </td>
                    <td style={tdStyle}>{cliente.numero_conexiones}</td>
                    <td style={tdStyle}>
                      {new Date(cliente.vencimiento).toLocaleDateString('es-CO')}
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        backgroundColor: cliente.activo ? '#dcfce7' : '#fee2e2',
                        color: cliente.activo ? '#166534' : '#991b1b'
                      }}>
                        {cliente.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ ...tdStyle, textAlign: 'center', padding: '40px' }}>
                    No hay clientes registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const thStyle = {
  padding: '12px 16px',
  textAlign: 'left' as const,
  fontWeight: '600',
  fontSize: '14px',
  color: '#475569'
}

const tdStyle = {
  padding: '12px 16px',
  fontSize: '14px'
}
