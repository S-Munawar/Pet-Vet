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
import VerifyEmail from './components/VerifyEmail'
import AdminRoute from './components/AdminRoute'
import VetRoute from './components/VetRoute'
import PetOwnerRoute from './components/PetOwnerRoute'
import ConsultedPets from './components/ConsultedPets'

function App() {
  return (
    <BrowserRouter>
    <AuthProvider>
      <div className="app-shell">
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/social-auth" element={<SocialAuth />} />
            <Route path="/add-pet" element={<PetOwnerRoute><AddPet /></PetOwnerRoute>} />
            <Route path="/select-pet" element={<ProtectedRoute><SelectPet /></ProtectedRoute>} />
            <Route path="/consult" element={<PetOwnerRoute><ConsultVet /></PetOwnerRoute>} />
            <Route path="/ai" element={<ProtectedRoute><AIPetAdvisor /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/consulted-pets" element={<VetRoute><ConsultedPets /></VetRoute>} />
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
