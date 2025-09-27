import React, { useMemo, useState } from 'react'

export default function ChatAssistant({ open, onClose, issues }) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! Ask me about your reports, statuses, or how to report.' }
  ])

  const send = () => {
    if (!input.trim()) return
    const text = input.trim()
    setMessages((m) => [...m, { role: 'user', text }])
    setInput('')
    // simple rules-based replies
    let reply = "I didn't catch that. Ask about 'status', 'upvotes', or 'how to report'."
    const lower = text.toLowerCase()
    if (lower.includes('status')) {
      const counts = issues.reduce((acc, i) => { acc[i.status] = (acc[i.status]||0)+1; return acc }, {})
      reply = `You have ${counts['reported']||0} reported, ${counts['in-progress']||0} in-progress, and ${counts['resolved']||0} resolved issues.`
    } else if (lower.includes('upvote')) {
      const total = issues.reduce((s, i) => s + (i.upvotes||0), 0)
      reply = `Your community gathered ${total} upvotes across visible issues.`
    } else if (lower.includes('report')) {
      reply = 'To report, tap Report, add title, description, optional photos, then Submit.'
    }
    setTimeout(() => setMessages((m) => [...m, { role: 'assistant', text: reply }]), 200)
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto p-4 m-2">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold">CivicFix Assistant</div>
          <button onClick={onClose} className="text-gray-500">✖</button>
        </div>
        <div className="h-64 overflow-y-auto space-y-2 border rounded-lg p-2 bg-gray-50">
          {messages.map((m, idx) => (
            <div key={idx} className={`max-w-[80%] px-3 py-2 rounded-xl ${m.role==='assistant' ? 'bg-emerald-100 text-emerald-900 self-start' : 'bg-blue-100 text-blue-900 self-end ml-auto'}`}>{m.text}</div>
          ))}
        </div>
        <div className="mt-2 flex space-x-2">
          <input value={input} onChange={(e)=>setInput(e.target.value)} className="flex-1 border rounded-xl px-3 py-2" placeholder="Type your question..." />
          <button onClick={send} className="px-4 py-2 bg-blue-600 text-white rounded-xl">Send</button>
        </div>
      </div>
    </div>
  )
}

