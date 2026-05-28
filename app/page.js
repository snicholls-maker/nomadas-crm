'use client'

import { useState, useEffect, useCallback } from 'react'

const ESTADOS = ['Todos', 'Nuevo', 'Contactado', 'Agendado', 'Compró', 'Perdido']

const STATUS_CONFIG = {
  'Nuevo': { label: 'Nuevo', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', dot: 'bg-red-500', card: 'border-l-red-400' },
  'Contactado': { label: 'Contactado', bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', dot: 'bg-yellow-500', card: 'border-l-yellow-400' },
  'Agendado': { label: 'Agendado / Visitó', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', dot: 'bg-blue-500', card: 'border-l-blue-400' },
  'Compró': { label: 'Compró ✓', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', dot: 'bg-green-500', card: 'border-l-green-500' },
  'Perdido': { label: 'Perdido', bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-300', dot: 'bg-gray-400', card: 'border-l-gray-300' },
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor(diffMs / (1000 * 60))
    if (diffDays > 0) return `hace ${diffDays}d`
    if (diffHours > 0) return `hace ${diffHours}h`
    if (diffMins > 0) return `hace ${diffMins}m`
    return 'ahora'
  } catch { return dateStr }
}

function formatDate(dateStr) {
if (!dateStr) return ''
try {
const d = new Date(dateStr)
return d.toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
} catch { return dateStr }
}

function LeadModal({ lead, onClose, onUpdate }) {
  const [estado, setEstado] = useState(lead.estado || 'Nuevo')
  const [notas, setNotas] = useState(lead.notas || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await onUpdate(lead.id, { estado, notas })
    setSaving(false)
    onClose()
  }

  const whatsappLink = lead.telefono
    ? `https://wa.me/${lead.telefono.replace(/\D/g, '')}?text=Hola ${lead.nombre}, te escribimos de Nómadas Design 🐪`
    : null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{lead.nombre}</h2>
              <p className="text-sm text-gray-500">{lead.telefono}</p>
              {lead.campana && <p className="text-xs text-nomadas-brown mt-1">📣 {lead.campana}</p>}
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
          </div>

          {/* Mensaje */}
          {lead.mensaje && (() => {
            let msgs = null
            try {
              const parsed = JSON.parse(lead.mensaje)
              if (Array.isArray(parsed) && parsed.length > 0) msgs = parsed
            } catch(e) {}

            if (msgs) {
              return (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2 font-medium">💬 Conversación WhatsApp ({msgs.length} mensajes)</p>
                  <div className="bg-[#e5ddd5] rounded-xl p-3 max-h-96 overflow-y-auto space-y-1">
                    {msgs.map((m, i) => (
                      <div key={i}>
                        {m.ts && <p className="text-center text-xs text-gray-500 my-1">{(() => { try { return new Date(m.ts).toLocaleString('es-EC', {timeZone:'America/Guayaquil', day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'}) } catch(e) { return '' } })()}</p>}
                        {m.user && (
                          <div className="flex justify-end mb-1">
                            <div className="bg-[#dcf8c6] text-gray-800 text-xs rounded-2xl rounded-tr-sm px-3 py-2 max-w-[80%] shadow-sm whitespace-pre-wrap break-words">
                              {m.user}
                            </div>
                          </div>
                        )}
                        {m.bot && (() => {
                          const rawBot = m.bot || ''
                          // Handle [FU1]/[FU2] follow-up markers
                          const fuMatch = rawBot.match(/^\[FU\d+\]\s*/)
                          const botLabel = fuMatch ? '↩ Follow-up' : null
                          const botText = fuMatch ? rawBot.slice(fuMatch[0].length) : rawBot
                          // If it's an image placeholder with no real URL (e.g. "Imagen: - $")
                          const isImgPlaceholder = /^Imagen:\s*[^h]/i.test(botText.trim()) || botText.trim() === '- $' || botText.trim().startsWith('- $')
                          const hasMedia = botText.includes('<<=>>>') || /\|\|\|https?:\/\//.test(botText)
                          if (hasMedia) {
                            const rawParts = botText.split('|||').filter(Boolean)
                            const elements = []
                            for (const part of rawParts) {
                              const trimmed = part.trim()
                              if (/^https?:\/\//.test(trimmed)) {
                                elements.push({ type: 'image', src: trimmed })
                              } else if (trimmed.includes('<<=>>>')) {
                                const [txt, imgUrl] = trimmed.split('<<=>>>')
                                if (txt.trim()) elements.push({ type: 'text', content: txt.replace(/\*/g, '').trim() })
                                if (imgUrl?.trim()) elements.push({ type: 'image', src: imgUrl.trim() })
                              } else if (trimmed) {
                                elements.push({ type: 'text', content: trimmed.replace(/\*/g, '') })
                              }
                            }
                            return (
                              <div className="flex justify-start mb-1">
                                <div className="bg-white text-gray-800 text-xs rounded-2xl rounded-tl-sm px-3 py-2 max-w-[85%] shadow-sm space-y-2">
                                  {elements.map((el, ei) => el.type === 'image'
                                    ? <img key={ei} src={el.src} alt="" className="rounded-lg w-full mt-1" loading="lazy" onError={(e) => e.target.style.display='none'} />
                                    : <p key={ei} className="whitespace-pre-wrap break-words border-t border-gray-100 pt-1 first:border-0 first:pt-0">{el.content}</p>
                                  )}
                                </div>
                              </div>
                            )
                          }
                          return (
                            <div className="flex justify-start mb-1">
                              <div className="bg-white text-gray-800 text-xs rounded-2xl rounded-tl-sm px-3 py-2 max-w-[80%] shadow-sm whitespace-pre-wrap break-words">
                                {botLabel && <span className="text-xs text-gray-400 block mb-1">{botLabel}</span>}
                                {isImgPlaceholder
                                  ? <span className="text-gray-400 italic">📷 Imagen enviada</span>
                                  : botText.replace(/\*/g, '')}
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    ))}
                  </div>
                </div>
              )
            }

            return (
              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <p className="text-xs text-gray-500 mb-1">Primer mensaje</p>
                <p className="text-sm text-gray-700 italic">"{lead.mensaje}"</p>
              </div>
            )
          })()}

          {/* Fecha */}
          <p className="text-xs text-gray-400 mb-4">
            Contacto: {formatDate(lead.timestamp)} · {timeAgo(lead.timestamp)}
          </p>

          {/* Estado */}
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Estado</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setEstado(key)}
                  className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all ${
                    estado === key
                      ? `${config.bg} ${config.text} ${config.border} ring-2 ring-offset-1 ring-current`
                      : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${config.dot}`} />
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-2">Notas</p>
            <textarea
              value={notas}
              onChange={e => setNotas(e.target.value)}
              placeholder="Qué quiere, cuándo puede venir, qué alfombra le interesa..."
              className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-700 resize-none h-24 focus:outline-none focus:ring-2 focus:ring-nomadas-brown/30"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white rounded-xl py-3 font-semibold text-sm hover:bg-green-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.552 4.116 1.518 5.847L.057 23.996l6.304-1.654A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.896 0-3.67-.52-5.184-1.427l-.371-.22-3.85 1.01 1.03-3.748-.242-.385A9.937 9.937 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
                WhatsApp
              </a>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-nomadas-brown text-white rounded-xl py-3 font-semibold text-sm hover:bg-nomadas-dark transition-colors disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatsBar({ leads }) {
  const counts = leads.reduce((acc, l) => {
    acc[l.estado] = (acc[l.estado] || 0) + 1
    return acc
  }, {})

  const sinContactar = counts['Nuevo'] || 0
  const total = leads.length
  const comprados = counts['Compró'] || 0

  return (
    <div className="grid grid-cols-3 gap-2 mb-4">
      <div className="bg-white rounded-xl p-3 text-center shadow-sm">
        <p className="text-2xl font-bold text-red-500">{sinContactar}</p>
        <p className="text-xs text-gray-500">Sin contactar</p>
      </div>
      <div className="bg-white rounded-xl p-3 text-center shadow-sm">
        <p className="text-2xl font-bold text-gray-700">{total}</p>
        <p className="text-xs text-gray-500">Total leads</p>
      </div>
      <div className="bg-white rounded-xl p-3 text-center shadow-sm">
        <p className="text-2xl font-bold text-green-600">{comprados}</p>
        <p className="text-xs text-gray-500">Compraron</p>
      </div>
    </div>
  )
}

export default function Home() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtro, setFiltro] = useState('Todos')
  const [busqueda, setBusqueda] = useState('')
  const [selectedLead, setSelectedLead] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const fetchLeads = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const res = await fetch('/api/leads')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setLeads(data.leads || [])
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchLeads()
    // Auto-refresh every 2 minutes
    const interval = setInterval(() => fetchLeads(true), 120000)
    return () => clearInterval(interval)
  }, [fetchLeads])

  const handleUpdate = async (id, data) => {
    await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...data } : l))
  }

  const filteredLeads = leads
    .filter(l => filtro === 'Todos' || l.estado === filtro)
    .filter(l => {
      if (!busqueda) return true
      const q = busqueda.toLowerCase()
      return l.nombre.toLowerCase().includes(q) || l.telefono.includes(q) || l.mensaje.toLowerCase().includes(q)
    })
    .sort((a, b) => {
      // Nuevos primero
      if (a.estado === 'Nuevo' && b.estado !== 'Nuevo') return -1
      if (b.estado === 'Nuevo' && a.estado !== 'Nuevo') return 1
      return 0
    })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-nomadas-brown border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-nomadas-brown font-medium">Cargando leads...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto min-h-screen">
      {/* Header */}
      <div className="bg-nomadas-brown text-white px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-2xl font-bold">Nómadas CRM</h1>
            <p className="text-white/70 text-sm">Leads de WhatsApp</p>
          </div>
          <button
            onClick={() => fetchLeads(true)}
            className={`w-10 h-10 bg-white/20 rounded-full flex items-center justify-center ${refreshing ? 'animate-spin' : ''}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-4 -mt-2">
        {/* Search */}
        <div className="bg-white rounded-2xl shadow-sm mb-3 flex items-center px-4 py-3 gap-2">
          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="flex-1 text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
          />
          {busqueda && (
            <button onClick={() => setBusqueda('')} className="text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Stats */}
        <StatsBar leads={leads} />

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
          {ESTADOS.map(estado => {
            const count = estado === 'Todos' ? leads.length : leads.filter(l => l.estado === estado).length
            const config = STATUS_CONFIG[estado]
            return (
              <button
                key={estado}
                onClick={() => setFiltro(estado)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  filtro === estado
                    ? config ? `${config.bg} ${config.text} ${config.border} border` : 'bg-nomadas-brown text-white'
                    : 'bg-white text-gray-500 border border-gray-200'
                }`}
              >
                {estado} {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
              </button>
            )
          })}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3 text-sm text-red-600">
            Error: {error}
          </div>
        )}

        {/* Leads list */}
        <div className="space-y-2 pb-24">
          {filteredLeads.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">🐪</p>
              <p className="font-medium">No hay leads {filtro !== 'Todos' ? `en estado "${filtro}"` : ''}</p>
            </div>
          ) : (
            filteredLeads.map(lead => {
              const config = STATUS_CONFIG[lead.estado] || STATUS_CONFIG['Nuevo']
              return (
                <button
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className={`w-full bg-white rounded-2xl p-4 shadow-sm border-l-4 ${config.card} text-left hover:shadow-md transition-shadow active:scale-[0.99]`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                          {config.label}
                        </span>
                        {lead.estado === 'Nuevo' && (
                          <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                            ¡Nuevo!
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-gray-900 truncate">{lead.nombre}</p>
                      <p className="text-sm text-gray-500">{lead.telefono}</p>
                      {lead.mensaje && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1 italic">"{lead.mensaje}"</p>
                      )}
                      {lead.notas && (
                        <p className="text-xs text-nomadas-brown mt-1 line-clamp-1">📝 {lead.notas}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400">{timeAgo(lead.timestamp)}</p>
                      <svg className="w-4 h-4 text-gray-300 mt-2 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* FAB - Add lead */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-nomadas-brown text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-nomadas-dark transition-colors active:scale-95"
      >
        +
      </button>

      {/* Lead modal */}
      {selectedLead && (
        <LeadModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={handleUpdate}
        />
      )}

      {/* Add lead modal */}
      {showAddModal && (
        <AddLeadModal
          onClose={() => setShowAddModal(false)}
          onAdd={async (data) => {
            await fetch('/api/leads', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            })
            setShowAddModal(false)
            fetchLeads(true)
          }}
        />
      )}
    </div>
  )
}

function AddLeadModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ nombre: '', telefono: '', mensaje: '' })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.telefono) return
    setSaving(true)
    await onAdd(form)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Agregar lead manual</h2>
          <div className="space-y-3 mb-6">
            <input
              type="text"
              placeholder="Nombre"
              value={form.nombre}
              onChange={e => setForm(p => ({...p, nombre: e.target.value}))}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-nomadas-brown/30"
            />
            <input
              type="tel"
              placeholder="Teléfono (ej: +593999999999) *"
              value={form.telefono}
              onChange={e => setForm(p => ({...p, telefono: e.target.value}))}
              required
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-nomadas-brown/30"
            />
            <textarea
              placeholder="Qué preguntó / qué quiere..."
              value={form.mensaje}
              onChange={e => setForm(p => ({...p, mensaje: e.target.value}))}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-nomadas-brown/30"
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-600">
              Cancelar
            </button>
            <button type="submit" disabled={saving || !form.telefono} className="flex-1 bg-nomadas-brown text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-50">
              {saving ? 'Guardando...' : 'Agregar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
