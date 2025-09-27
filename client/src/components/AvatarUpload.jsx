import React, { useRef, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export default function AvatarUpload({ value, onChange }) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef(null)

  const handleSelect = async (file) => {
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('files', file)
      const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: form })
      const data = await res.json()
      const url = (data.files && data.files[0]) || ''
      if (url) onChange(url)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
        {value ? (
          <img src={value} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-500">👤</span>
        )}
      </div>
      <div>
        <button className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm disabled:opacity-60" disabled={uploading} onClick={() => inputRef.current?.click()}>
          {uploading ? 'Uploading...' : 'Upload Photo'}
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleSelect(e.target.files?.[0])} />
      </div>
    </div>
  )
}

