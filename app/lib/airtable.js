const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_TABLE = process.env.AIRTABLE_TABLE || 'Leads'

function getBaseUrl() {
  return `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE)}`
}

function getHeaders() {
  return {
    'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
    'Content-Type': 'application/json',
  }
}

export async function getLeads() {
  let allRecords = []
  let offset = null

  do {
    const url = new URL(getBaseUrl())
    if (offset) url.searchParams.set('offset', offset)

    const res = await fetch(url.toString(), { headers: getHeaders() })
    const data = await res.json()

    if (!res.ok) throw new Error(data.error?.message || 'Airtable API error')

    allRecords.push(...data.records)
    offset = data.offset || null
  } while (offset)

  // Sort by createdTime descending (newest first)
  allRecords.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime))

  return allRecords.map(record => ({
    id: record.id,
    nombre: record.fields.Nombre || '',
    telefono: record.fields.Telefono || '',
    mensaje: record.fields.Mensaje || '',
    estado: record.fields.Estado || 'Nuevo',
    notas: record.fields.Notas || '',
    timestamp: record.createdTime || record.fields.Timestamp || '',
    actualizado: record.fields.Actualizado || '',
    campana: record.fields.Campana || '',
    origen: record.fields.Origen || '',
  }))
}

export async function updateLead(recordId, { estado, notas }) {
  const url = `${getBaseUrl()}/${recordId}`
  const res = await fetch(url, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({
      fields: { Estado: estado, Notas: notas, Actualizado: new Date().toISOString() }
    })
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error?.message || 'Update failed')
  }
  return res.json()
}

export async function addLead({ nombre, telefono, mensaje, campana = '' }) {
  const res = await fetch(getBaseUrl(), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      fields: { Nombre: nombre, Telefono: telefono, Mensaje: mensaje, Campana: campana, Estado: 'Nuevo', Timestamp: new Date().toISOString() }
    })
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error?.message || 'Add lead failed')
  }
  return res.json()
}

export async function deleteLead(recordId) {
  const res = await fetch(`${getBaseUrl()}/${recordId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'Error eliminando lead')

  return { success: true }
}
