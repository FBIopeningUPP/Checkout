import React, { act } from 'react'
import GameCanvas from './GameCanvas'
import { useStore } from './store'

function ShelfMenu() {
  const activeShelfId = useStore(s => s.activeShelfId)
  const shelves = useStore(s => s.shelves)
  const products = useStore(s => s.products)
  const assignProduct = useStore(s => s.assignProduct)
  const closeMenu = useStore(s => s.closeMenu)

  if (!activeShelfId) return null

  const shelf = shelves.find(s => s.id === activeShelfId)

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-600 shadow-xl w-96 text-white">
        <h2 className="text-xl font-bold mb-4">Manage Shelf #{shelf.id}</h2>

        {shelf.productId ? (
          <div>
            <p>Product: <span className="font-bold text-green-400">{products.find(p=>p.id===shelf.productId)?.name}</span></p>
            <p>Stock: {shelf.stock}</p>
            <button onClick={closeMenu} className="mt-6 bg-gray-600 hover:bg-gray-500 w-full py-2 rounded font-bold cursor-pointer">
              Close
            </button>
          </div>
        ) : (
          <div>
            <p className="mb-4 text-gray-400">Assign a product to this empty shelf:</p>
            <div className="flex gap-2">
              {products.map(p => (
                <button
                  key={p.id}
                  onClick={() => assignProduct(shelf.id, p.id)}
                  className="bg-blue-600 hover:bg-blue-500 flex-1 py-2 rounded font-bold cursor-pointer"
                >
                  {p.name}
                </button>
              ))}
            </div>
            <button onClick={closeMenu} className="mt-4 bg-transparent text-sm text-gray-400 hover:text-white w-full py-2 cursor-pointer">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>    
  )
}

function App() {
  return (
    <div className="w-screen h-screen overflow-hidden relative">
      <GameCanvas />
      <ShelfMenu />
    </div>
  )
}

export default App