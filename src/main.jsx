import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueueProvider } from './store/QueueContext'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueueProvider>
        <App />
      </QueueProvider>
    </BrowserRouter>
  </React.StrictMode>
)
