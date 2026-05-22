import { NextResponse } from 'next/server'
import { updateLead } from '../../../lib/airtable'

export async function PATCH(request, { params }) {
  try {
    const rowIndex = parseInt(params.id)
    const body = await request.json()
    const { estado, notas } = body

    await updateLead(rowIndex, { estado, notas })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating lead:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
