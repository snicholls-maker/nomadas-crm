import { NextResponse } from 'next/server'
import { updateLead, deleteLead } from '../../../lib/airtable'

export async function PATCH(request, { params }) {
  try {
    const recordId = params.id
    const body = await request.json()
    const { estado, notas } = body

    await updateLead(recordId, { estado, notas })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating lead:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const recordId = params.id
    await deleteLead(recordId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting lead:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
