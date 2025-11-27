import { DollarSign } from 'lucide-react'

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <DollarSign className="w-16 h-16 mx-auto mb-4 text-green-500" />
        <h1 className="text-4xl font-bold mb-2">peasant-budget</h1>
        <p className="text-gray-400 text-xl">Everything a modern peasant needs 💰</p>
        <p className="text-sm text-gray-500 mt-4">AI-powered budget tracker for survival between pay periods</p>
      </div>
    </div>
  )
}

export default App
