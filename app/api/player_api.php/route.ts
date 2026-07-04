import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabase'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const username = body.username
  const password = body.password

  const { data: cliente } = await supabase
  .from('clientes')
  .select('*')
  .eq('username', username)
  .eq('password', password)
  .eq('activo', true)
  .single()

  if (!cliente) {
    return NextResponse.json({ user_info: { auth: 0 } })
  }

  const hoy = new Date()
  const vencimiento = new Date(cliente.vencimiento)
  if (vencimiento < hoy) {
    return NextResponse.json({ user_info: { auth: 0, status: 'Expired' } })
  }

  return NextResponse.json({
    user_info: {
      username: cliente.username,
      password: cliente.password,
      auth: 1,
      status: 'Active',
      exp_date: Math.floor(vencimiento.getTime() / 1000),
      max_connections: cliente.numero_conexiones.toString()
    },
    server_info: {
      url: cliente.url_completa,
      port: cliente.url_completa.split(':')[2]?.split('/')[0] || '80'
    }
  })
}