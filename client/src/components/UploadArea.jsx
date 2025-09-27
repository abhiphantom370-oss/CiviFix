import React, { useRef, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export default function UploadArea({ value, onChange }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const form = new FormData()
      Array.from(files).forEach((f) => form.append('files', f))
      const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: form })
      const data = await res.json()
      onChange([...(value||[]), ...(data.files||[])])
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold mb-1">Add Photos</div>
          <div className="text-xs text-gray-600">Up to 6 images</div>
        </div>
        <button onClick={() => inputRef.current?.click()} className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm disabled:opacity-60" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Choose Files'}
        </button>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      </div>
      {!!(value&&value.length) && (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {value.map((url) => (
            <img key={url} src={url} alt="upload" className="w-full h-24 object-cover rounded-lg" />
          ))}
        </div>
      )}
    </div>
  )
}

