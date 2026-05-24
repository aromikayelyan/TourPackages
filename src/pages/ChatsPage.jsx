import { useEffect, useState } from 'react'
import { fetchUserChats, createChat } from '../api.js'
import { useAuth } from '../AuthContext.jsx'

function ChatsPage() {
  const { user } = useAuth()
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [otherUserId, setOtherUserId] = useState('')
  const [creatingChat, setCreatingChat] = useState(false)

  useEffect(() => {
    if (user?.userUId) {
      loadChats()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadChats = async () => {
    if (!user?.userUId) return
    setLoading(true)
    setError('')
    try {
      const res = await fetchUserChats(user.userUId)
      setChats(res.data)
    } catch (e) {
      console.error(e)
      setError('Failed to load chats')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateChat = async (e) => {
    e.preventDefault()
    if (!user?.userUId) {
      alert('Please sign in to create a chat')
      return
    }
    if (!otherUserId.trim()) {
      alert('Please enter a user ID')
      return
    }
    if (user.userUId === otherUserId.trim()) {
      alert('Cannot create chat with yourself')
      return
    }
    setCreatingChat(true)
    try {
      await createChat(user.userUId, otherUserId.trim())
      setOtherUserId('')
      await loadChats()
    } catch (e) {
      console.error(e)
      const errorMsg = e.response?.data?.message || e.message || 'Failed to create chat'
      if (errorMsg.includes('already exists')) {
        alert('Chat already exists!')
        await loadChats()
      } else {
        alert(errorMsg)
      }
    } finally {
      setCreatingChat(false)
    }
  }

  if (!user) {
    return (
      <div className="page">
        <h1>Chats</h1>
        <p>Please sign in to view your chats.</p>
      </div>
    )
  }

  if (loading) return <div className="page"><h1>Chats</h1><p>Loading chats...</p></div>
  if (error) return <div className="page"><h1>Chats</h1><p className="error">{error}</p></div>

  return (
    <div className="page">
      <h1>Your Chats</h1>
      
      <section className="section">
        <h2>Start New Chat</h2>
        <form className="form" onSubmit={handleCreateChat} style={{ maxWidth: '400px' }}>
          <label>
            User ID to chat with
            <input
              type="text"
              value={otherUserId}
              onChange={(e) => setOtherUserId(e.target.value)}
              placeholder="Enter user UID"
              required
            />
          </label>
          <button className="btn primary" type="submit" disabled={creatingChat}>
            {creatingChat ? 'Creating...' : 'Start Chat'}
          </button>
        </form>
      </section>

      <section className="section">
        <h2>Your Chats ({chats.length})</h2>
        {chats.length === 0 ? (
          <p>You don't have any chats yet. Start a new chat above!</p>
        ) : (
          <ul className="list">
            {chats.map((c) => {
              const otherUser = c.user1id === user.userUId ? c.uuser2id : c.user1id
              return (
                <li key={c.id} className="list-item chat-item">
                  <div className="chat-item-info">
                    <strong>Chat with:</strong> {otherUser}
                    <br />
                    <small>Created: {c.created_at ? new Date(c.created_at).toLocaleDateString() : 'N/A'}</small>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

export default ChatsPage


