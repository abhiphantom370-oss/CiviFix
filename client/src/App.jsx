import React, { useEffect, useMemo, useState } from 'react'
import Logo from './assets/logo.svg'
import UploadArea from './components/UploadArea.jsx'
import AvatarUpload from './components/AvatarUpload.jsx'
import ChatAssistant from './components/ChatAssistant.jsx'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const fetchJson = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!response.ok) throw new Error('Request failed')
  return await response.json()
}

const postJson = (path, body) =>
  fetchJson(path, { method: 'POST', body: JSON.stringify(body) })
const putJson = (path, body) =>
  fetchJson(path, { method: 'PUT', body: JSON.stringify(body) })

function CivicFixApp() {
  const [currentView, setCurrentView] = useState('splash')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [issues, setIssues] = useState([])
  const [user, setUser] = useState({ fullName: '', email: '', phone: '', address: '', location: null, photoUrl: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [userPoints, setUserPoints] = useState(147)
  const [chatOpen, setChatOpen] = useState(false)

  const [reportForm, setReportForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    photos: [],
    location: null,
    anonymous: false,
  })

  // Demo categories
  const categories = useMemo(
    () => [
      { id: 'roads', name: 'Roads & Transport', icon: '🛣️', color: 'bg-orange-500', count: 45 },
      { id: 'water', name: 'Water & Drainage', icon: '💧', color: 'bg-blue-500', count: 32 },
      { id: 'electricity', name: 'Street Lights', icon: '💡', color: 'bg-yellow-500', count: 28 },
      { id: 'waste', name: 'Garbage Collection', icon: '🗑️', color: 'bg-green-500', count: 38 },
      { id: 'safety', name: 'Public Safety', icon: '🚨', color: 'bg-red-500', count: 15 },
      { id: 'parks', name: 'Parks & Recreation', icon: '🌳', color: 'bg-emerald-500', count: 12 },
      { id: 'noise', name: 'Noise Pollution', icon: '🔊', color: 'bg-purple-500', count: 8 },
      { id: 'animals', name: 'Stray Animals', icon: '🐕', color: 'bg-amber-500', count: 6 },
      { id: 'environment', name: 'Environment', icon: '🌍', color: 'bg-teal-500', count: 19 },
      { id: 'building', name: 'Building Issues', icon: '🏢', color: 'bg-slate-500', count: 11 },
      { id: 'accessibility', name: 'Accessibility', icon: '♿', color: 'bg-indigo-500', count: 4 },
      { id: 'other', name: 'Other Issues', icon: '❓', color: 'bg-gray-500', count: 7 },
    ],
    []
  )

  // Effects
  useEffect(() => {
    const timer = setTimeout(() => setCurrentView('login'), 1200)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isLoggedIn) return
    fetchJson('/issues').then(setIssues).catch(() => {})
  }, [isLoggedIn])

  useEffect(() => {
    const cached = localStorage.getItem('civicfix:user')
    if (cached) {
      try { setUser(JSON.parse(cached)) } catch {}
    }
    fetchJson('/me').then((u) => { setUser(u); localStorage.setItem('civicfix:user', JSON.stringify(u)) }).catch(() => {})
  }, [])

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchesSearch =
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filterStatus === 'all' || issue.status === filterStatus
      return matchesSearch && matchesFilter
    })
  }, [issues, searchTerm, filterStatus])

  const formatTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const getCurrentLocation = () =>
    new Promise((resolve) =>
      setTimeout(() =>
        resolve({ lat: 19.1176, lng: 72.906, address: '123 Main Street, Airoli, Navi Mumbai, MH 400708' }),
      400)
    )

  const submitReport = async (data) => {
    const created = await postJson('/issues', data)
    setIssues((prev) => [created, ...prev])
    setUserPoints((p) => p + 10)
  }

  const upvoteIssue = async (id) => {
    const updated = await postJson(`/issues/${id}/upvote`, {})
    setIssues((prev) => prev.map((i) => (i.id === id ? updated : i)))
    setUserPoints((p) => p + 1)
  }

  const addComment = async (id, text) => {
    await postJson(`/issues/${id}/comment`, { text })
    setIssues((prev) => prev.map((i) => (i.id === id ? { ...i, comments: i.comments + 1 } : i)))
  }

  // UI pieces (splash/login simplified)
  const renderSplash = () => (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-blue-500 to-purple-600 flex items-center justify-center">
      <div className="text-center text-white">
        <img src={Logo} alt="CivicFix" className="w-24 h-24 mx-auto mb-4 drop-shadow-xl" />
        <div className="text-3xl font-bold">CivicFix</div>
        <div className="opacity-90">Building Better Cities Together</div>
      </div>
    </div>
  )

  const renderLogin = () => (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 -z-10 animate-pulse">
        <div className="absolute -top-10 -left-10 w-64 h-64 bg-emerald-400/30 blur-3xl rounded-full" />
        <div className="absolute top-1/3 -right-10 w-80 h-80 bg-blue-400/30 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-purple-400/30 blur-3xl rounded-full" />
      </div>
      <div className="min-h-screen bg-gradient-to-br from-emerald-400/40 via-blue-500/40 to-purple-600/40 flex items-center justify-center p-4">
        <div className="bg-white/95 rounded-3xl shadow-2xl w-full max-w-sm p-6">
          <div className="text-center mb-6">
            <div className="bg-gradient-to-br from-emerald-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-xl">🏛️</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-purple-600 bg-clip-text text-transparent">Welcome</h1>
            <p className="text-gray-600 text-sm">Continue making your city better</p>
          </div>

          <div className="mb-4"><AvatarUpload value={user.photoUrl} onChange={(photoUrl) => setUser((u) => ({ ...u, photoUrl }))} /></div>
          <div className="space-y-2 mb-4">
            <input value={user.fullName} onChange={(e) => setUser((u) => ({ ...u, fullName: e.target.value }))} placeholder="Full Name" className="w-full border-2 border-gray-200 rounded-xl px-3 py-3" />
            <input value={user.address} onChange={(e) => setUser((u) => ({ ...u, address: e.target.value }))} placeholder="Address" className="w-full border-2 border-gray-200 rounded-xl px-3 py-3" />
          </div>
          <div className="space-y-2 mb-4">
            <button onClick={() => { /* email flow placeholder */ }} className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium">📧 Continue with Email</button>
            <button onClick={() => { /* phone flow placeholder */ }} className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium">📱 Continue with Phone</button>
          </div>
          <div className="space-y-2 mb-4">
            <button onClick={async () => {
              if (!navigator.geolocation) return
              navigator.geolocation.getCurrentPosition(async (pos) => {
                const location = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }
                setUser((u) => ({ ...u, location }))
              })
            }} className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium">📍 Share Live Location</button>
            <div className="text-xs text-gray-600">{user.location ? `Lat: ${user.location.lat.toFixed(4)}, Lng: ${user.location.lng.toFixed(4)}` : 'Location not set'}</div>
          </div>

          <button onClick={async () => {
            try {
              const saved = await putJson('/me', user)
              localStorage.setItem('civicfix:user', JSON.stringify(saved))
              setIsLoggedIn(true)
              setCurrentView('home')
            } catch {}
          }} className="w-full bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600 text-white py-4 px-4 rounded-2xl font-medium">Enter CivicFix</button>
        </div>
      </div>
    </div>
  )

  const renderHome = () => (
    <div className="pb-20">
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl p-2">
              <span className="text-white text-xl">🏛️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Good day!</h1>
              <p className="text-sm text-gray-600">Airoli, Mumbai</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="bg-gray-100 rounded-full p-2" onClick={() => setCurrentView('notifications')}>🔔</button>
            <button onClick={() => setCurrentView('profile')} className="bg-gray-100 rounded-full p-1">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                {user.photoUrl ? <img src={user.photoUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">☰</div>}
              </div>
            </button>
          </div>
        </div>
        <div className="bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl p-4 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-emerald-100 text-sm">Your Impact</p>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold">{userPoints}</span>
                <span className="text-emerald-200">Civic Points</span>
              </div>
            </div>
            <div className="bg-white/20 rounded-full p-3">🏆</div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        <h2 className="font-bold text-lg mb-3 text-gray-800">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setCurrentView('report')} className="bg-gradient-to-br from-red-500 to-pink-500 text-white p-4 rounded-2xl flex flex-col items-center space-y-2">
            <div className="bg-white/20 rounded-full p-3">📷</div>
            <span className="font-semibold">Report Issue</span>
          </button>
          <button onClick={() => setCurrentView('nearby')} className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white p-4 rounded-2xl flex flex-col items-center space-y-2">
            <div className="bg-white/20 rounded-full p-3">📍</div>
            <span className="font-semibold">Nearby Issues</span>
          </button>
          <button onClick={() => setChatOpen(true)} className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white p-4 rounded-2xl flex flex-col items-center space-y-2">
            <div className="bg-white/20 rounded-full p-3">💬</div>
            <span className="font-semibold">Assistant</span>
          </button>
        </div>
      </div>

      <div className="px-4">
        <h2 className="font-bold text-lg mb-3 text-gray-800">Recent Activity</h2>
        <div className="space-y-3">
          {issues.slice(0, 3).map((issue) => (
            <div key={issue.id} className="bg-white rounded-2xl p-4 border border-gray-200">
              <div className="flex items-start space-x-3">
                <div className="bg-gray-500 rounded-xl w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-lg">❗</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-sm">{issue.title}</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    {issue.location.address} • {formatTimeAgo(issue.createdAt)}
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <button onClick={() => upvoteIssue(issue.id)} className="text-red-500">👍 {issue.upvotes}</button>
                    <button onClick={() => addComment(issue.id, 'Great report!')} className="text-blue-500">💬 {issue.comments}</button>
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                      {issue.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderReport = () => (
    <div className="p-4 pb-24">
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm -mx-4 mb-4">
        <div className="flex items-center space-x-3">
          <button onClick={() => setCurrentView('home')} className="bg-gray-100 rounded-full p-2">←</button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Report Issue</h1>
            <p className="text-sm text-gray-600">Help improve your community</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-200 mb-4">
        <label className="block font-semibold mb-2">Issue Title</label>
        <input value={reportForm.title} onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })} className="w-full border border-gray-300 rounded-xl px-3 py-3" placeholder="Brief description..." maxLength={100} />
        <p className="text-xs text-gray-500 mt-1">{reportForm.title.length}/100</p>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-200 mb-4">
        <label className="block font-semibold mb-2">Description</label>
      <div className="bg-white rounded-2xl p-4 border border-gray-200 mb-4">
        <label className="block font-semibold mb-2">Photos</label>
        <UploadArea value={reportForm.photos} onChange={(photos) => setReportForm({ ...reportForm, photos })} />
      </div>
        <textarea value={reportForm.description} onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })} className="w-full border border-gray-300 rounded-xl px-3 py-3 h-24" placeholder="Details..." maxLength={500} />
        <p className="text-xs text-gray-500 mt-1">{reportForm.description.length}/500</p>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-200 mb-4">
        <h3 className="font-semibold mb-3">Priority</h3>
        <div className="grid grid-cols-4 gap-2">
          {['low','medium','high','critical'].map((p) => (
            <button key={p} onClick={() => setReportForm({ ...reportForm, priority: p })} className={`p-2 rounded-xl border-2 text-center ${reportForm.priority===p? 'border-blue-500 scale-105': 'border-gray-200'}`}>{p}</button>
          ))}
        </div>
      </div>

      <button disabled={!reportForm.title || !reportForm.description || !selectedCategory} onClick={async () => {
        const location = await getCurrentLocation()
        await submitReport({ ...reportForm, category: selectedCategory, location })
        setCurrentView('home')
        setReportForm({ title: '', description: '', category: '', priority: 'medium', photos: [], location: null, anonymous: false })
        setSelectedCategory('')
      }} className={`w-full py-4 rounded-2xl font-semibold ${reportForm.title && reportForm.description && selectedCategory ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
        Submit Report
      </button>
    </div>
  )

  const renderNearby = () => (
    <div className="pb-24">
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <button onClick={() => setCurrentView('home')} className="bg-gray-100 rounded-full p-2">←</button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Nearby Issues</h1>
            <p className="text-sm text-gray-600">{filteredIssues.length} issues in your area</p>
          </div>
        </div>
        <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search issues..." className="w-full px-3 py-3 border rounded-xl" />
        <div className="flex space-x-2 mt-3 px-1">
          {[{key:'all',label:'All'},{key:'reported',label:'Reported'},{key:'in-progress',label:'In Progress'},{key:'resolved',label:'Resolved'}].map((f)=> (
            <button key={f.key} onClick={() => setFilterStatus(f.key)} className={`px-3 py-2 rounded-xl text-sm ${filterStatus===f.key?'bg-blue-500 text-white':'bg-gray-100 text-gray-700'}`}>{f.label}</button>
          ))}
        </div>
      </div>

      <div className="px-4 space-y-3 mt-4">
        {filteredIssues.map((issue) => (
          <div key={issue.id} className="bg-white rounded-2xl p-4 border">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-gray-800 text-sm">{issue.title}</h3>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{issue.status}</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">📍 {issue.location.address} • {formatTimeAgo(issue.createdAt)}</p>
            <div className="flex items-center space-x-4 mt-2">
              <button onClick={() => upvoteIssue(issue.id)} className="text-red-500">❤️ {issue.upvotes}</button>
              <button onClick={() => addComment(issue.id, 'Nice catch!')} className="text-blue-500">💬 {issue.comments}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderProfile = () => (
    <div className="pb-20">
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <button onClick={() => setCurrentView('home')} className="bg-gray-100 rounded-full p-2">←</button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">My Profile</h1>
            <p className="text-sm text-gray-600">Your information</p>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-4">
        <AvatarUpload value={user.photoUrl} onChange={(photoUrl) => setUser((u) => ({ ...u, photoUrl }))} />
        <div className="grid grid-cols-1 gap-3">
          <input value={user.fullName} onChange={(e)=>setUser((u)=>({...u, fullName: e.target.value}))} className="border rounded-xl px-3 py-3" placeholder="Full Name" />
          <input value={user.address} onChange={(e)=>setUser((u)=>({...u, address: e.target.value}))} className="border rounded-xl px-3 py-3" placeholder="Address" />
        </div>
        <button onClick={async ()=>{ const saved = await putJson('/me', user); setUser(saved); localStorage.setItem('civicfix:user', JSON.stringify(saved)); }} className="w-full bg-blue-600 text-white rounded-xl py-3">Save</button>
      </div>
    </div>
  )

  const renderNotifications = () => (
    <div className="pb-20">
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <button onClick={() => setCurrentView('home')} className="bg-gray-100 rounded-full p-2">←</button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Notifications</h1>
            <p className="text-sm text-gray-600">Your report progress</p>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {issues.slice(0, 10).map((i) => (
          <div key={i.id} className="bg-white border rounded-xl p-3">
            <div className="font-medium">{i.title}</div>
            <div className="text-xs text-gray-600">Status: {i.status} • Upvotes: {i.upvotes} • Comments: {i.comments}</div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderBottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 max-w-md mx-auto">
      <div className="flex justify-around">
        <button onClick={() => setCurrentView('home')} className={`flex flex-col items-center p-2 ${currentView==='home'?'text-blue-600':'text-gray-500'}`}>🏠<span className="text-xs">Home</span></button>
        <button onClick={() => setCurrentView('nearby')} className={`flex flex-col items-center p-2 ${currentView==='nearby'?'text-blue-600':'text-gray-500'}`}>📍<span className="text-xs">Nearby</span></button>
        <button onClick={() => setCurrentView('report')} className="flex flex-col items-center p-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl">📷<span className="text-xs">Report</span></button>
      </div>
    </div>
  )

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative">
      {isLoggedIn && (
        <div className="fixed top-0 left-0 right-0 bg-black text-white text-xs px-4 py-1 flex justify-between items-center max-w-md mx-auto z-50">
          <span>9:41</span>
          <span>CivicFix</span>
          <span>100% 🔋</span>
        </div>
      )}

      {currentView === 'splash' && renderSplash()}
      {currentView === 'login' && renderLogin()}
      {isLoggedIn && currentView === 'home' && renderHome()}
      {isLoggedIn && currentView === 'report' && renderReport()}
      {isLoggedIn && currentView === 'nearby' && renderNearby()}
      {isLoggedIn && currentView === 'profile' && renderProfile()}
      {isLoggedIn && currentView === 'notifications' && renderNotifications()}
      {isLoggedIn && renderBottomNav()}
      <ChatAssistant open={chatOpen} onClose={() => setChatOpen(false)} issues={issues} />
    </div>
  )
}

export default CivicFixApp

