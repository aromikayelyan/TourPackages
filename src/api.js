import packagesMockData from "../data.json" // Твои фейковые туры из предыдущего шага

// Инициализируем "Базу данных" в localStorage, чтобы данные сохранялись при перезагрузке страницы
const initLocalStorage = () => {
  // Достаем то, что лежит в localStorage сейчас
  const currentLocalPackages = JSON.parse(localStorage.getItem("packages"));

  // Если в памяти вообще ничего нет ИЛИ длина массива в файле изменилась
  if (!currentLocalPackages || currentLocalPackages.length !== packagesMockData.length) {
    localStorage.setItem("packages", JSON.stringify(packagesMockData));
  }

  // Остальная твоя инициализация остается без изменений
  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify([
      { uid: "usr-agency-alpha", email: "alpha@test.com", password: "123" }
    ]))
  }
  if (!localStorage.getItem("carts")) {
    localStorage.setItem("carts", JSON.stringify({}))
  }
  if (!localStorage.getItem("chats")) {
    localStorage.setItem("chats", JSON.stringify([]))
  }
  if (!localStorage.getItem("ratings")) {
    localStorage.setItem("ratings", JSON.stringify({}))
  }
}
initLocalStorage()

// Хелперы для быстрого чтения/записи в localStorage
const getDB = (key) => JSON.parse(localStorage.getItem(key))
const saveDB = (key, data) => localStorage.setItem(key, JSON.stringify(data))

// Имитируем задержку сети для реалистичности (опционально)
const mockDelay = (data) => new Promise((resolve) => setTimeout(() => resolve({ data }), 300))

// ==================== API FUNCTIONS ====================

// 1. ТУРЫ (PACKAGES)
export const fetchTours = () => {
  return mockDelay(getDB("packages"))
}

export const fetchTourByUid = (uid) => {
  const tours = getDB("packages")
  const tour = tours.find((p) => p.uid === uid)
  return mockDelay(tour || null)
}

export const fetchToursByUser = (userUId) => {
  const tours = getDB("packages")
  const userTours = tours.filter((p) => p.creatorUserUId === userUId)
  return mockDelay(userTours)
}

export const createTour = (formData) => {
  const tours = getDB("packages")
  
  // Так как бэкенда нет, FormData нужно превратить в обычный объект
  const newTour = {}
  formData.forEach((value, key) => {
    newTour[key] = value
  })

  // Заполняем дефолтные поля
  newTour.id = tours.length + 1
  newTour.uid = `pkg-${Date.now()}`
  newTour.price = Number(newTour.price) || 0
  newTour.availableSeats = Number(newTour.availableSeats) || 10
  newTour.forSlide = newTour.forSlide === 'true' || newTour.forSlide === true
  newTour.created_at = new Date().toISOString()
  newTour.updated_at = new Date().toISOString()

  // Если была загружена картинка, превращаем её в мок-ссылку
  if (newTour.images && newTour.images instanceof File) {
    newTour.images = URL.createObjectURL(newTour.images) 
  } else {
    newTour.images = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e" // дефолт
  }

  tours.push(newTour)
  saveDB("packages", tours)
  return mockDelay(newTour)
}

// 2. РЕЙТИНГИ
export const createRating = (uid, data) => {
  const ratings = getDB("ratings")
  if (!ratings[uid]) ratings[uid] = []
  
  const newRating = { ...data, created_at: new Date().toISOString() }
  ratings[uid].push(newRating)
  
  saveDB("ratings", ratings)
  return mockDelay(newRating)
}

// 3. ПОЛЬЗОВАТЕЛИ (AUTH)
export const registerUser = (data) => {
  const users = getDB("users")
  const userExists = users.some((u) => u.email === data.email)
  
  if (userExists) {
    return Promise.reject({ response: { data: { message: "User already exists" } } })
  }

  const newUser = {
    ...data,
    uid: `usr-${Date.now()}`,
    created_at: new Date().toISOString()
  }
  
  users.push(newUser)
  saveDB("users", users)
  return mockDelay(newUser)
}

export const loginUser = (data) => {
  const users = getDB("users")
  const user = users.find((u) => u.email === data.email && u.password === data.password)
  
  if (!user) {
    return Promise.reject({ response: { data: { message: "Неверный логин или пароль" } } })
  }
  
  return mockDelay({ user, token: "mock-jwt-token" })
}

// 4. КОРЗИНА (CART)
export const fetchCart = (useruid) => {
  const carts = getDB("carts")
  // Если корзины нет, возвращаем пустую структуру
  const userCart = carts[useruid] || { products: [] }
  return mockDelay(userCart)
}

export const updateCart = (useruid, products) => {
  console.log('Updating local cart for user:', useruid, 'with products:', products)
  const carts = getDB("carts")
  
  carts[useruid] = { products }
  saveDB("carts", carts)
  
  return mockDelay(carts[useruid])
}

export const addToCart = async (useruid, tourUid) => {
  try {
    const cartRes = await fetchCart(useruid)
    let currentProducts = []
    
    if (cartRes.data?.products) {
      if (Array.isArray(cartRes.data.products)) {
        currentProducts = cartRes.data.products
      } else if (typeof cartRes.data.products === 'string') {
        try {
          currentProducts = JSON.parse(cartRes.data.products)
        } catch (e) {
          currentProducts = []
        }
      }
    }
    
    if (currentProducts.includes(tourUid)) {
      throw new Error('Tour already in cart')
    }
    
    const updatedProducts = [...currentProducts, tourUid]
    const updateRes = await updateCart(useruid, updatedProducts)
    return updateRes
  } catch (error) {
    console.error('Error adding to cart:', error)
    if (error.message === 'Tour already in cart') {
      throw error
    }
    throw new Error(error.response?.data?.message || error.message || 'Failed to add to cart')
  }
}

// 5. ЧАТЫ
export const fetchChats = () => {
  return mockDelay(getDB("chats"))
}

export const fetchUserChats = (userUId) => {
  const chats = getDB("chats")
  const userChats = chats.filter((c) => c.user1id === userUId || c.uuser2id === userUId)
  return mockDelay(userChats)
}

export const createChat = (user1id, user2id) => {
  const chats = getDB("chats")
  const newChat = {
    id: chats.length + 1,
    uid: `chat-${Date.now()}`,
    user1id,
    uuser2id: user2id,
    created_at: new Date().toISOString()
  }
  chats.push(newChat)
  saveDB("chats", chats)
  return mockDelay(newChat)
}

// Экспортируем пустой объект-заглушку вместо axios-инстанса, чтобы не ломать импорты
const api = {}
export default api