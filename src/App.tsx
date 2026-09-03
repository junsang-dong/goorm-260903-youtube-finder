import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { PreferenceProvider } from './context/PreferenceContext'
import { VideosProvider } from './context/VideosContext'
import { HomePage } from './pages/HomePage'
import { TitleDetailPage } from './pages/TitleDetailPage'

export default function App() {
  return (
    <PreferenceProvider>
      <VideosProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/title/:slug" element={<TitleDetailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </VideosProvider>
    </PreferenceProvider>
  )
}
