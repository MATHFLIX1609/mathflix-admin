import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  const username = params.username

  // Busca el cliente en Supabase
  const { data: cliente } = await supabase
    .from('clientes')
    .select('*')
    .eq('username', username)
    .eq('activo', true)
    .single()

  if (!cliente) {
    return new NextResponse('Usuario no encontrado', { status: 404 })
  }

  // Revisa si está vencido
  const hoy = new Date()
  const vencimiento = new Date(cliente.vencimiento)
  if (vencimiento < hoy) {
    return new NextResponse('Cuenta vencida', { status: 403 })
  }

  // Construye la URL real y redirige
  const urlReal = `${cliente.url_completa}/get.php?username=${cliente.username}&password=${cliente.password}&type=m3u_plus&output=ts`
  
  return NextResponse.redirect(urlReal)
}