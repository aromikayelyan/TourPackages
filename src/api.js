import packagesMockData from "../data.json" 
import usersMockData from "../database/users.json" 
import cartsMockData from "../database/cart.json"
import chatsMockData from "../database/chat.json"
import ratingsMockData from "../database/rates.json"

// ==================== ИНИЦИАЛИЗАЦИЯ БАЗЫ ДАННЫХ ====================
const initLocalStorage = () => {
  const currentLocalPackages = JSON.parse(localStorage.getItem("packages"));

  // 1. Инициализация туров
  if (!currentLocalPackages || currentLocalPackages.length !== packagesMockData.length) {
    localStorage.setItem("packages", JSON.stringify(packagesMockData));
  }

  // 2. Инициализация пользователей
  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify(usersMockData || []));
  }

  // 3. Инициализация корзин
  if (!localStorage.getItem("carts")) {
    let initialCarts = {};
    if (Array.isArray(cartsMockData)) {
      cartsMockData.forEach(c => {
        const uid = c.useruid || c.userUid || c.userId;
        let prods = c.products || [];
        if (typeof prods === 'string') {
          try { prods = JSON.parse(prods); } catch(e) { prods = []; }
        }
        if (uid) initialCarts[uid] = { products: prods };
      });
    } else {
      initialCarts = cartsMockData || {};
    }
    localStorage.setItem("carts", JSON.stringify(initialCarts));
  }

  // 4. Инициализация чатов
  if (!localStorage.getItem("chats")) {
    localStorage.setItem("chats", JSON.stringify(chatsMockData || []));
  }

  // 5. Инициализация рейтингов
  if (!localStorage.getItem("ratings")) {
    let initialRatings = {};
    if (Array.isArray(ratingsMockData)) {
      ratingsMockData.forEach(r => {
        if (!initialRatings[r.packageId]) initialRatings[r.packageId] = [];
        ratingsMockData.push(r);
      });
    } else {
      initialRatings = ratingsMockData || {};
    }
    localStorage.setItem("ratings", JSON.stringify(initialRatings));
  }
}

initLocalStorage()

// Хелперы чтения/записи
const getDB = (key) => JSON.parse(localStorage.getItem(key))
const saveDB = (key, data) => localStorage.setItem(key, JSON.stringify(data))

// Имитация задержки ответа сервера
const mockDelay = (data) => new Promise((resolve) => setTimeout(() => resolve({ data }), 300))


// ==================== API FUNCTIONS ====================

// 1. ТУРЫ (PACKAGES)
export const fetchTours = () => {
  const tours = getDB("packages") || []
  
  const fixedTours = tours.map(t => {
    let normalizedImages = [];
    
    // Перехватываем строку с запятыми и превращаем её в массив
    if (typeof t.images === 'string') {
      normalizedImages = t.images.split(',').map(img => img.trim());
    } else if (Array.isArray(t.images)) {
      normalizedImages = t.images;
    } else if (typeof t.image === 'string') {
      normalizedImages = t.image.split(',').map(img => img.trim());
    } else {
      normalizedImages = ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e"];
    }

    return {
      ...t,
      images: normalizedImages
    }
  })
  
  return mockDelay(fixedTours)
}

export const fetchTourByUid = (uid) => {
  const tours = getDB("packages") || []
  const tour = tours.find((p) => p.uid === uid)
  
  if (!tour) return mockDelay(null) // Если не найден, возвращаем null

  const copyTour = { ...tour }
  let normalizedImages = [];

  // Разбиваем строку с запятыми на массив ссылок
  if (typeof copyTour.images === 'string') {
    normalizedImages = copyTour.images.split(',').map(img => img.trim());
  } else if (Array.isArray(copyTour.images)) {
    normalizedImages = copyTour.images;
  } else if (typeof copyTour.image === 'string') {
    normalizedImages = copyTour.image.split(',').map(img => img.trim());
  } else {
    normalizedImages = ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e"];
  }

  copyTour.images = normalizedImages;

  // ХИТРЫЙ ТРЮК ДЛЯ СОВМЕСТИМОСТИ:
  // Мы делаем так, чтобы copyTour вел себя как ОБЪЕКТ для отдельной страницы,
  // но если корзина CartPage обратится к нему по индексу [0], он вернет сам себя!
  Object.defineProperty(copyTour, '0', {
    value: copyTour,
    enumerable: false // Чтобы не зациклить объект при чтении полей
  });

  // Возвращаем объект (который прикидывается массивом, если его попросит корзина)
  return mockDelay(copyTour)
}

export const fetchToursByUser = (userUId) => {
  const tours = getDB("packages")
  const userTours = tours.filter((p) => p.creatorUserUId === userUId)
  return mockDelay(userTours)
}

export const createTour = (formData) => {
  const tours = getDB("packages")
  const newTour = {}
  
  formData.forEach((value, key) => {
    newTour[key] = value
  })

  newTour.id = tours.length + 1
  newTour.uid = `pkg-${Date.now()}`
  newTour.price = Number(newTour.price) || 0
  newTour.availableSeats = Number(newTour.availableSeats) || 10
  newTour.forSlide = newTour.forSlide === 'true' || newTour.forSlide === true
  newTour.created_at = new Date().toISOString()
  newTour.updated_at = new Date().toISOString()

  // Сохраняем картинку строкой, как у вас и было в оригинальном коде
  if (newTour.images && newTour.images instanceof File) {
    newTour.images = URL.createObjectURL(newTour.images) 
  } else {
    newTour.images = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
  }

  tours.push(newTour)
  saveDB("packages", tours)
  return mockDelay(newTour)
}


// 2. РЕЙТИНГИ / ОТЗЫВЫ (RATES)
export const fetchRatingsByPackage = (packageId) => {
  const ratings = getDB("ratings")
  return mockDelay(ratings[packageId] || [])
}

export const createRating = (uid, data) => {
  const ratings = getDB("ratings")
  if (!ratings[uid]) ratings[uid] = []
  
  const newRating = { ...data, created_at: new Date().toISOString() }
  ratings[uid].push(newRating)
  
  saveDB("ratings", ratings)
  return mockDelay(newRating)
}


// 3. ПОЛЬЗОВАТЕЛИ & АВТОРИЗАЦИЯ (USERS / AUTH)
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
  const userCart = carts[useruid] || { products: [] }
  return mockDelay(userCart)
}

export const updateCart = (useruid, products) => {
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


// 5. ЧАТЫ (CHATS)
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

const api = {}
export default api