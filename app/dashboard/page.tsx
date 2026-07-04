import { createSupabaseClient } from '../lib/supabase'  // ← Cambió
import { BotonCopiar } from './BotonCopiar'

export const dynamic = 'force-dynamic'

export default async function Dashboard({
  searchParams
}: {
  searchParams: Promise<{ edit?: string }>
}) {
  const { edit } = await searchParams
  const supabase = createSupabaseClient()  // ← Lo creas aquí adentro

  const { data: usuarios, error } = await supabase
    .from('usuarios')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return <div>Error cargando usuarios: {error.message}</div>
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Panel Mathflix</h1>
      
      <div className="grid gap-4">
        {usuarios?.map((user) => (
          <div key={user.id} className="bg-gray-800 p-6 rounded-lg flex justify-between items-center">
            <div>
              <p className="text-xl font-semibold">{user.username}</p>
              <p className="text-gray-400">Contraseña: {user.password}</p>
              <p className="text-sm text-gray-500">
                Expira: {new Date(user.exp_date).toLocaleDateString()}
              </p>
            </div>
            
            <BotonCopiar 
              texto={`Usuario: ${user.username}\nContraseña: ${user.password}`} 
            />
          </div>
        ))}
      </div>

      {edit && (
        <div className="mt-8">
          <p>Editando: {edit}</p>
        </div>
      )}
    </div>
  )
}
