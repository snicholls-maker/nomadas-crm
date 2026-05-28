import { NextResponse } from 'next/server'

const SHEET_ID = '1splahVg4bKlrbRmw9IwKcrpDltUdiNRtMy4qAyk9-P8'
const GID = '1694905221'

export async function GET() {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${GID}`
    const res = await fetch(url, { cache: 'no-store' })
    const text = await res.text()

    // Strip JSONP wrapper: /*O_o*/\ngoogle.visualization.Query.setResponse({...});
    const jsonStr = text.replace(/^[\s\S]*?setResponse\(/, '').replace(/\);?\s*$/, '')
    const data = JSON.parse(jsonStr)

    const rows = data.table.rows
    const result = rows.map(row => ({
      ts: row.c[0]?.v || '',
      phone: row.c[1]?.v || '',
      name: row.c[2]?.v || '',
      type: row.c[3]?.v || '',
      user: row.c[4]?.v || '',
      bot: row.c[5]?.v || '',
    })).filter(r => r.phone)

    return NextResponse.json({ rows: result })
  } catch (error) {
    console.error('Sheets error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
