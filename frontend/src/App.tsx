import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import HomePage from './pages/HomePage'
import ScannerPage from './pages/ScannerPage'
import HistoryPage from './pages/HistoryPage'
import AboutPage from './pages/AboutPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'

function App() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg transition-colors">
      <Routes>
        {/* Public routes (no header/footer) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        
        {/* Layout routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          
          {/* Protected routes - login required */}
          <Route path="scanner" element={
            <ProtectedRoute>
              <ScannerPage />
            </ProtectedRoute>
          } />
          <Route path="history" element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </div>
  )
}

export default App
