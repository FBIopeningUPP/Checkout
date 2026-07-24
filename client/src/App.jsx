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
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 uppercase">
      <div className="bg-gray-900 p-6 border-4 border-gray-400 shadow-[8px_8px_0_0_rgba(0,0,0,1)] w-96 text-white">
        <h2 className="text-3xl font-bold mb-4 text-yellow-400">Manage Shelf #{shelf.id}</h2>

        {shelf.productId ? (
          <div>
            <p className="text-xl">Product: <span className="font-bold text-green-400">{products.find(p=>p.id===shelf.productId)?.name}</span></p>
            <p className="text-xl">Stock: {shelf.stock}</p>

            <button
              onClick={closeMenu}
              className="mt-6 bg-red-600 hover:bg-red-500 w-full py-2 border-2 border-red-400 shadow-[4px_4px_0_0_rgba(0,0,0,1)] font-bold cursor-pointer active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              Close Menu
            </button>
          </div>
        ) : (
          <div>
            <p className="mb-4 text-gray-400 text-xl">Assign a product:</p>
            <div className="flex gap-4">
              {products.map(p => (
                <button
                  key={p.id}
                  onClick={() => assignProduct(shelf.id, p.id)}
                  className="bg-blue-600 hover:bg-blue-500 flex-1 py-3 border-2 border-blue-400 shadow-[4px_4px_0_0_rgba(0,0,0,1)] font-bold cursor-pointer active:translate-x-1 active:translate-y-1 active:shadow-none transition-all text-xl"
                >
                  {p.name}
                </button>
              ))}
            </div>
            <button onClick={closeMenu} className="mt-6 bg-transparent text-gray-400 hover:text-white w-full py-2 cursor-pointer border-2 border-transparent hover:border-gray-600">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div> 
  )
}
function HUD() {
  const cash = useStore(s => s.cash)
  return (
    <div className="absolute top-4 left-4 z-10 text-5xl text-green-400 drop-shadow-[4px_4px_0_rgba(0,0,0,1)] font-bold">
      ${cash}
    </div>
  )
}
function App() {
  return (
    <div className="w-screen h-screen overflow-hidden relative">
      <GameCanvas />
      <HUD />
      <ShelfMenu />
    </div>
  )
}

export default App