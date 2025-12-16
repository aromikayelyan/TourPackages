import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage.jsx'
import TourDetailsPage from './pages/TourDetailsPage.jsx'
import AuthPage from './pages/AuthPage.jsx'
import CartPage from './pages/CartPage.jsx'
import ChatsPage from './pages/ChatsPage.jsx'
import AddEventPage from './pages/AddEventPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import { useAuth } from './AuthContext.jsx'

function App() {
  const { user } = useAuth()

  return (
    <BrowserRouter>
      <div className="app">
        <header className="app-header">
          <Link to="/tours" className="logo">Home</Link>
          <nav className="nav">
            <Link to="/tours">Tours</Link>
            <Link to="/add-event">Add event</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/chats">Chats</Link>
            {user ? (
              <Link to="/profile">{user.Username || 'Profile'}</Link>
            ) : (
              <Link to="/auth">Sign in / Sign up</Link>
            )}
          </nav>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Navigate to="/tours" replace />} />
            <Route path="/tours" element={<HomePage />} />
            <Route path="/tours/:uid" element={<TourDetailsPage />} />
            <Route path="/add-event" element={<AddEventPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/chats" element={<ChatsPage />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-section">
              <h3>About Us</h3>
              <p>Your trusted partner for unforgettable travel experiences. We specialize in curated tours and events worldwide.</p>
            </div>
            <div className="footer-section">
              <h3>Partners</h3>
              <p>We proudly collaborate with:</p>
              <ul>
                <li>Aviasales</li>
                <li>Major Airlines</li>
                <li>Hotel Chains</li>
                <li>Local Tour Operators</li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Contact</h3>
              <p>
                <strong>Address:</strong><br />
                Markt 1, 8000 Brugge, Belgium
              </p>
              <p>
                <strong>Phone:</strong><br />
                +32 50 123 4567
              </p>
              <p>
                <strong>Email:</strong><br />
                info@touragency.com
              </p>
            </div>
            <div className="footer-section">
              <h3>Follow Us</h3>
              <p>Stay connected on social media for the latest deals and travel tips.</p>
            </div>
          </div>
          <div className="footer-bottom">
            © {new Date().getFullYear()} Tour Agency. All rights reserved.
          </div>
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App
