import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage/HomePage'
import PreviewPage from './pages/PreviewPage/PreviewPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/preview/:id" element={<PreviewPage />} />
    </Routes>
  )
}
