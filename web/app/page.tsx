'use client'
import { useState } from 'react'

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const handleProcess = async () => {
    if (!file) return
    setStatus('uploading')
    setErrorMsg('')
    setResult(null)

    try {
      // Step 1: Upload to Supabase Storage
      const formData = new FormData()
      formData.append('file', file)

      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!uploadRes.ok) throw new Error('Upload failed')
      const { publicUrl } = await uploadRes.json()

      setStatus('processing')

      // Step 2: Process with AI
      const processRes = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioUrl: publicUrl })
      })
      if (!processRes.ok) throw new Error('AI processing failed')
      const data = await processRes.json()

      setResult(data)
      setStatus('done')
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong')
      setStatus('error')
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '8px' }}> Accountability Agent</h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>Upload meeting audio. Get transcripts, decisions & action items instantly.</p>

      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>📁 Select Audio/Video File</label>
        <input
          type="file"
          accept="audio/*,video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          style={{ marginBottom: '16px', padding: '8px', border: '1px solid #ddd', borderRadius: '6px', width: '100%' }}
        />

        <button
          onClick={handleProcess}
          disabled={!file || status === 'uploading' || status === 'processing'}
          style={{
            background: status === 'idle' || status === 'done' || status === 'error' ? '#2563eb' : '#94a3b8',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: status === 'idle' || status === 'done' || status === 'error' ? 'pointer' : 'not-allowed',
            width: '100%'
          }}
        >
          {status === 'uploading' ? 'Uploading...' : status === 'processing' ? 'AI is analyzing...' : 'Process Meeting'}
        </button>

        {errorMsg && <p style={{ color: '#dc2626', marginTop: '12px' }}>❌ {errorMsg}</p>}
      </div>

      {status === 'done' && result && (
        <div style={{ marginTop: '24px', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>✅ Analysis Complete</h2>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '6px' }}>📝 Transcript</h3>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#444' }}>{result.transcript}</p>
          </div>

          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '6px' }}>🎯 Action Items</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {result.actions.map((a: any, i: number) => (
                <li key={i} style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '8px', background: '#f9fafb' }}>
                  <strong>{a.description}</strong>
                  <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                    👤 {a.assignee || 'Unassigned'} •  {a.deadline || 'TBD'} •  {a.status || 'Open'}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
