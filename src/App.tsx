
import { Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import Home from './pages/Home'
import History from './pages/History'
import Members from './pages/Members'
import Figures from './pages/Figures'
import FigureDetail from './pages/FigureDetail'
import EventDetail from './pages/EventDetail'
import Events from './pages/Events'

import DataConfig from './pages/DataConfig'
import './App.css'

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path="/members" element={<Members />} />
        <Route path="/figures" element={<Figures />} />
        <Route path="/figure/:name" element={<FigureDetail />} />
        <Route path="/events" element={<Events />} />
        <Route path="/event/:name" element={<EventDetail />} />
        <Route path="/data-config" element={<DataConfig />} />
      </Routes>
    </MainLayout>
  )
}

export default App
