// import { useEffect, useState } from 'react'
// import { fetchUserChats, createChat, getUserById } from '../api.js'
// import { useAuth } from '../AuthContext.jsx'

// function ChatsPage() {
//   const { user } = useAuth()
//   const [chats, setChats] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState('')
//   const [otherUserId, setOtherUserId] = useState('')
//   const [creatingChat, setCreatingChat] = useState(false)

//   useEffect(() => {
//     if (user?.userUId) {
//       loadChats()
//     } else {
//       setLoading(false)
//     }
//   }, [user])

//   const loadChats = async () => {
//     if (!user?.userUId) return
//     setLoading(true)
//     setError('')
//     try {
//       const res = await fetchUserChats(user.userUId)
//       setChats(res.data)
//     } catch (e) {
//       console.error(e)
//       setError('Failed to load chats')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleCreateChat = async (e) => {
//     e.preventDefault()
//     if (!user?.userUId) {
//       alert('Please sign in to create a chat')
//       return
//     }
//     if (!otherUserId.trim()) {
//       alert('Please enter a user ID')
//       return
//     }
//     if (user.userUId === otherUserId.trim()) {
//       alert('Cannot create chat with yourself')
//       return
//     }
//     setCreatingChat(true)
//     try {
//       await createChat(user.userUId, otherUserId.trim())
//       setOtherUserId('')
//       await loadChats()
//     } catch (e) {
//       console.error(e)
//       const errorMsg = e.response?.data?.message || e.message || 'Failed to create chat'
//       if (errorMsg.includes('already exists')) {
//         alert('Chat already exists!')
//         await loadChats()
//       } else {
//         alert(errorMsg)
//       }
//     } finally {
//       setCreatingChat(false)
//     }
//   }

//   if (!user) {
//     return (
//       <div className="page">
//         <h1>Chats</h1>
//         <p>Please sign in to view your chats.</p>
//       </div>
//     )
//   }

//   if (loading) return <div className="page"><h1>Chats</h1><p>Loading chats...</p></div>
//   if (error) return <div className="page"><h1>Chats</h1><p className="error">{error}</p></div>

//   return (
//     <div className="page">
//       <h1>Your Chats</h1>

//       <section className="section">
//         <h2>Start New Chat</h2>
//         <form className="form" onSubmit={handleCreateChat} style={{ maxWidth: '400px' }}>
//           <label>
//             User ID to chat with
//             <input
//               type="text"
//               value={otherUserId}
//               onChange={(e) => setOtherUserId(e.target.value)}
//               placeholder="Enter user UID"
//               required
//             />
//           </label>
//           <button className="btn primary" type="submit" disabled={creatingChat}>
//             {creatingChat ? 'Creating...' : 'Start Chat'}
//           </button>
//         </form>
//       </section>

//       <section className="section">
//         <h2>Your Chats ({chats.length})</h2>
//         {chats.length === 0 ? (
//           <p>You don't have any chats yet. Start a new chat above!</p>
//         ) : (
//           <ul className="list">
//             {chats.map((c) => {
//               const otherUser = c.user1id === user?.userUId ? c.user2id : c.user1id;

//               // Создаем динамический мини-компонент прямо внутри рендера,
//               // чтобы изолированно загрузить имя без изменения внешнего кода
//               const ChatName = (() => {
//                 const [name, setName] = React.useState('Loading...');

//                 React.useEffect(() => {
//                   let isMounted = true;
//                   if (otherUser && typeof getUserById === 'function') {
//                     getUserById(otherUser)
//                       .then((res) => {
//                         if (isMounted) {
//                           setName(res?.data?.Username || res?.data?.username || otherUser);
//                         }
//                       })
//                       .catch((err) => {
//                         console.error(err);
//                         if (isMounted) setName(otherUser);
//                       });
//                   }
//                   return () => { isMounted = false; };
//                 }, [otherUser]);

//                 return <span>{name}</span>;
//               });

//               return (
//                 <li key={c.id} className="list-item chat-item">
//                   <div className="chat-item-info">
//                     <strong>Chat with:</strong> <ChatName />
//                     <br />
//                     <small>
//                       Created: {c.created_at ? new Date(c.created_at).toLocaleDateString() : 'N/A'}
//                     </small>
//                   </div>
//                 </li>
//               );
//             })}
//           </ul>
//         )}
//       </section>
//     </div>
//   )
// }

// export default ChatsPage


import { useEffect, useState } from 'react'
import { fetchUserChats, createChat, getUserById } from '../api.js'
import { useAuth } from '../AuthContext.jsx'

// 1. ВЫНОСИМ КОМПОНЕНТ СТРОКИ ЧАТА НАВЕРХ (ПО ПРАВИЛАМ REACT)
function ChatListItem({ chat, currentUser }) {
  const [name, setName] = useState('Loading...')
  const otherUser = chat.user1id === currentUser?.userUId ? chat.user2id : chat.user1id

  useEffect(() => {
    let isMounted = true

    if (otherUser) {
      getUserById(otherUser)
        .then((res) => {
          if (isMounted) {
            // Проверяем все возможные варианты полей, которые может вернуть бэкенд
            setName(res?.data?.Username || res?.data?.username || res?.Username || otherUser)
          }
        })
        .catch((err) => {
          console.error('Ошибка при загрузке имени пользователя:', err)
          if (isMounted) setName(otherUser) // Если упало в ошибку, покажем хотя бы ID
        })
    }

    return () => {
      isMounted = false // Защита от утечек памяти, если компонент размонтировался до ответа сервера
    }
  }, [otherUser])

  return (
    <li className="list-item chat-item">
      <div className="chat-item-info">
        <strong>Chat with:</strong> {name}
        <br />
        <small>
          Created: {chat.created_at ? new Date(chat.created_at).toLocaleDateString() : 'N/A'}
        </small>
      </div>
    </li>
  )
}

// 2. ОСНОВНОЙ КОМПОНЕНТ СТРАНИЦЫ
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
            {chats.map((c) => (
              <ChatListItem 
                key={c.id} 
                chat={c} 
                currentUser={user} 
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default ChatsPage