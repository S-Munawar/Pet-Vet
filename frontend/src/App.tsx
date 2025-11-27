import './App.css'
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import {
  Home,
  Login,
  Register,
  AddPet,
  SelectPet,
  ConsultVet,
  AIPetAdvisor,
  AdminDashboard,
  Profile,
  PetHistory,
  Analyze,
  About,
  Navbar,
  Footer,
} from './components'
import { AuthProvider } from './context/AuthContext'
import SocialAuth from './components/SocialAuth'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
    <AuthProvider>
      <div className="app-shell">
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="/social-auth" element={<SocialAuth />} />
            <Route path="/add-pet" element={<ProtectedRoute><AddPet /></ProtectedRoute>} />
            <Route path="/select-pet" element={<ProtectedRoute><SelectPet /></ProtectedRoute>} />
            <Route path="/consult" element={<ProtectedRoute><ConsultVet /></ProtectedRoute>} />
            <Route path="/ai" element={<ProtectedRoute><AIPetAdvisor /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><PetHistory /></ProtectedRoute>} />
            <Route path="/analyze" element={<ProtectedRoute><Analyze /></ProtectedRoute>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
    </BrowserRouter>
  )
}

export default App
