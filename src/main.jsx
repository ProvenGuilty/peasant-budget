import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { StorageContextProvider } from './storage'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StorageContextProvider>
      <App />
    </StorageContextProvider>
  </StrictMode>,
)
