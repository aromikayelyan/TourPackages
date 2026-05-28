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
    // В некоторых контекстах поле может называться userUId, в других uid. Делаем универсально:
    const currentUid = user?.userUId || user?.uid;
    if (currentUid) {
      loadChats()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadChats = async () => {
    const currentUid = user?.userUId || user?.uid;
    if (!currentUid) return
    setLoading(true)
    setError('')
    try {
      const res = await fetchUserChats(currentUid)
      // Наш мок всегда возвращает { data: [...] }
      setChats(res.data || [])
    } catch (e) {
      console.error(e)
      setError('Failed to load chats')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateChat = async (e) => {
    e.preventDefault()
    const currentUid = user?.userUId || user?.uid;

    if (!currentUid) {
      alert('Please sign in to create a chat')
      return
    }
    
    const targetUid = otherUserId.trim()
    if (!targetUid) {
      alert('Please enter a user ID')
      return
    }
    if (currentUid === targetUid) {
      alert('Cannot create chat with yourself')
      return
    }

    setCreatingChat(true)
    try {
      const res = await createChat(currentUid, targetUid)
      
      // Наш api.js возвращает уже существующий чат вместо генерации ошибки.
      // Проверим, был ли этот чат у нас в списке ранее:
      const chatExists = chats.some(c => c.id === res.data?.id || c.uid === res.data?.uid)
      
      if (chatExists) {
        alert('Chat already exists in your list!')
      } else {
        alert('Chat successfully started!')
      }

      setOtherUserId('')
      await loadChats() // Перезагружаем список чатов
    } catch (e) {
      console.error(e)
      const errorMsg = e.response?.data?.message || e.message || 'Failed to create chat'
      alert(errorMsg)
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

  // Вытаскиваем uid текущего пользователя для безопасного сравнения в рендере
  const myUid = user.userUId || user.uid;

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
              placeholder="Enter user UID (e.g. usr-agency-alpha)"
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
              // Сверяем с myUid, чтобы точно определить ID собеседника
              const otherUser = c.user1id === myUid ? c.uuser2id : c.user1id
              return (
                <li key={c.id || c.uid} className="list-item chat-item" style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
                  <div className="chat-item-info">
                    <strong>Chat with:</strong> <span style={{ color: '#007bff' }}>{otherUser}</span>
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