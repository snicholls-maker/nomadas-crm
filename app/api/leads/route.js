import { NextResponse } from 'next/server'
import { getLeads, addLead } from '../../lib/airtable'

export async function GET() {
  try {
    const leads = await getLeads()
    return NextResponse.json({ leads })
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { nombre, telefono, mensaje, campana } = body

    if (!telefono) {
      return NextResponse.json({ error: 'Teléfono requerido' }, { status: 400 })
    }

    await addLead({ nombre, telefono, mensaje, campana })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error adding lead:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
