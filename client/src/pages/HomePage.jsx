import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchTours } from '../api.js'

function HomePage() {
  const [tours, setTours] = useState([])
  // Создаем отдельное состояние для отображения отфильтрованных результатов
  const [filteredTours, setFilteredTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Состояния для полей формы поиска
  const [searchLocation, setSearchLocation] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchTours()
        // Предполагаем, что сервер возвращает массив в res.data или res.data.data
        const toursData = res.data?.data || res.data || []
        setTours(toursData)
        setFilteredTours(toursData) // Изначально показываем все туры
      } catch (e) {
        console.error(e)
        setError('Failed to load tours')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  // Функция фильтрации при нажатии на кнопку Search
  const handleSearch = (e) => {
    e.preventDefault() // Предотвращаем перезагрузку страницы, если кнопка внутри формы

    const filtered = tours.filter((tour) => {
      // 1. Фильтр по локации/названию (без учета регистра)
      const matchesLocation = tour.name
        .toLowerCase()
        .includes(searchLocation.toLowerCase()) || 
        (tour.description && tour.description.toLowerCase().includes(searchLocation.toLowerCase()))

      // 2. Фильтр по датам (работает, если у ваших туров в БД есть поля типа tour.startDate / tour.endDate)
      // Если на бэкенде дат нет, эти строчки можно пока закомментировать
      const matchesStartDate = startDate ? new Date(tour.startDate) >= new Date(startDate) : true
      const matchesEndDate = endDate ? new Date(tour.endDate) <= new Date(endDate) : true

      return matchesLocation && matchesStartDate && matchesEndDate
    })

    setFilteredTours(filtered)
  }

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Find your next stay</h1>
          <p>Search deals on tours, trips and experiences around the world.</p>
        </div>
        {/* Оборачиваем в тег form, чтобы поиск также срабатывал по нажатию на Enter */}
        <form className="hero-search" onSubmit={handleSearch}>
          <input 
            placeholder="Where are you going?" 
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
          />
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button type="submit" className="btn primary">Search</button>
        </form>
      </section>

      {loading && <div className="loading">Loading tours...</div>}
      {error && !loading && <div className="error">{error}</div>}

      {!loading && !error && (
        <div className="grid">
          {/* Рендерим именно ОТФИЛЬТРОВАННЫЙ массив */}
          {filteredTours.length > 0 ? (
            filteredTours.map((tour) => (
              <Link
                key={tour.uid}
                to={`/tours/${tour.uid}`}
                className="card card-link"
              >
                {Array.isArray(tour.images) && tour.images[0] && (
                  <img src={tour.images[0]} alt={tour.name} className="card-image" />
                )}
                <h2>{tour.name}</h2>
                <p className="price">{tour.price} $</p>
                {/* <p>{tour.description}</p> */}
                <p>{tour.startDate} - {tour.endDate}</p>
                <p>
                  Duration: <strong>{tour.duration}</strong>
                </p>
              </Link>
            ))
          ) : (
            <div className="no-results">No tours found matching your criteria.</div>
          )}
        </div>
      )}
    </div>
  )
}

export default HomePage