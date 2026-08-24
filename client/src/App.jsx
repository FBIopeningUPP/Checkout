import React from 'react'
import GameCanvas from './GameCanvas'
import { useStore } from './store'

function ShelfMenu() {
  const activeShelfId = useStore(s => s.activeShelfId)
  const shelves = useStore(s => s.shelves)
  const products = useStore(s => s.products)
  const assignProduct = useStore(s => s.assignProduct)
  const restockShelf = useStore(s => s.restockShelf)
  const closeMenu = useStore(s => s.closeMenu)
  const cash = useStore(s => s.cash)

  if (!activeShelfId) return null
  
  const shelf = shelves.find(s => s.id === activeShelfId)
  if (!shelf) return null
  const assignedProduct = shelf.productId ? products.find(p => p.id === shelf.productId) : null;

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 uppercase">
      <div className="bg-gray-900 p-6 border-4 border-gray-400 shadow-[8px_8px_0_0_rgba(0,0,0,1)] w-96 text-white">
        <h2 className="text-3xl font-bold mb-4 text-yellow-400">Manage Shelf #{shelf.id}</h2>

        {shelf.productId ? (
          <div>
            <p className="text-xl">Product: <span className="font-bold text-green-400">{assignedProduct.name}</span></p>
            <p className="text-xl">Stock: {shelf.stock}</p>
            <p className="text-lg text-gray-400 mt-2">Restock Cost: ${assignedProduct.cost * 10}</p>

            <button
              onClick={() => restockShelf(shelf.id)}
              disabled={cash < (assignedProduct.cost * 10)}
              className="mt-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:border-gray-600 disabled:text-gray-500 disabled:cursor-not-allowed w-full py-2 border-2 border-blue-400 shadow-[4px_4px_0_0_rgba(0,0,0,1)] font-bold cursor-pointer active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              Restock (+10 units)
            </button>

            <button
              onClick={closeMenu}
              className="mt-4 bg-red-600 hover:bg-red-500 w-full py-2 border-2 border-red-400 shadow-[4px_4px_0_0_rgba(0,0,0,1)] font-bold cursor-pointer active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              Close Menu
            </button>
          </div>
        ) : (
          <div>
            <p className="mb-4 text-gray-400 text-xl">Assign a product (10 units):</p>
            <div className="flex gap-4">
              {products.map(p => {
                const cost = p.cost * 10;
                const canAfford = cash >= cost;
                return (
                  <button
                    key={p.id}
                    onClick={() => canAfford && assignProduct(shelf.id, p.id)}
                    className={`flex-1 py-3 border-2 shadow-[4px_4px_0_0_rgba(0,0,0,1)] font-bold transition-all text-xl ${
                      canAfford
                        ? 'bg-blue-600 hover:bg-blue-500 border-blue-400 cursor-pointer active:translate-x-1 active:translate-y-1 active:shadow-none'
                        : 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {p.name} <br/>
                    <span className="text-sm">Cost: ${cost}</span>
                  </button>
                )
              })}
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
  const day = useStore(s => s.day)
  const time = useStore(s => s.dayTimeLeft)
  const isDayActive = useStore(s => s.isDayActive)
  const buildMode = useStore(s => s.buildMode)
  const startBuildMode = useStore(s => s.startBuildMode)
  const cancelBuildMode = useStore(s => s.cancelBuildMode)
  const hireEmployee = useStore(s => s.hireEmployee)
  const hireGuard = useStore(s => s.hireGuard)
  
  return (
    <>
      <div className="absolute top-4 left-4 z-10 flex gap-8 text-5xl text-white drop-shadow-[4px_4px_0_rgba(0,0,0,1)] font-bold">
        <div className="text-green-400">${cash}</div>
        <div className="text-yellow-400">Day {day}</div>
        <div className={time < 10 && isDayActive ? 'text-red-500 animate-pulse' : 'text-white'}>
          {isDayActive ? Math.ceil(time) + 's' : 'CLOSED'}
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10">
        {!buildMode ? (
          <div className="flex gap-4">
            <button
              onClick={startBuildMode}
              disabled={cash < 100}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:border-gray-600 disabled:text-gray-500 text-white p-4 border-4 border-blue-400 shadow-[4px_4px_0_0_rgba(0,0,0,1)] font-bold text-2xl cursor-pointer active:translate-x-1 active:translate-y-1 active:shadow-none transition-all uppercase"
            >
              Buy Shelf ($100)
            </button>
            <button
              onClick={hireEmployee}
              disabled={cash < 500}
              className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:border-gray-600 disabled:text-gray-500 text-white p-4 border-4 border-purple-400 shadow-[4px_4px_0_0_rgba(0,0,0,1)] font-bold text-2xl cursor-pointer active:translate-x-1 active:translate-y-1 active:shadow-none transition-all uppercase"
            >
              Hire Staff ($500)
            </button>
            <button
              onClick={hireGuard}
              disabled={cash < 1500}
              className="bg-red-600 hover:bg-red-500 disabled:bg-gray-700 disabled:border-gray-600 disabled:text-gray-500 text-white p-4 border-4 border-red-400 shadow-[4px_4px_0_0_rgba(0,0,0,1)] font-bold text-2xl cursor-pointer active:translate-x-1 active:translate-y-1 active:shadow-none transition-all uppercase"
            >
              Hire Guard ($1500)
            </button>
          </div>
        ) : (
          <button
            onClick={cancelBuildMode}
            className="bg-red-600 hover:bg-red-500 text-white p-4 border-4 border-red-400 shadow-[4px_4px_0_0_rgba(0,0,0,1)] font-bold text-2xl cursor-pointer active:translate-x-1 active:translate-y-1 active:shadow-none transition-all uppercase animate-pulse"
          >
            Cancel Placement
          </button>
        )}
      </div>
    </>
  )
}

function DaySummary() {
  const isDayActive = useStore(s => s.isDayActive)
  const gameState = useStore(s => s.gameState)
  const day = useStore(s => s.day)
  const rev = useStore(s => s.dailyRevenue)
  const exp = useStore(s => s.dailyExpenses)
  const startNextDay = useStore(s => s.startNextDay)

  if (isDayActive || gameState !== 'PLAYING') return null;
  const profit = rev - exp;
  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20 uppercase">
      <div className="bg-gray-900 p-8 border-4 border-gray-400 shadow-[8px_8px_0_0_rgba(0,0,0,1)] w-[500px] text-white text-center">
        <h1 className="text-5xl font-bold mb-8 text-yellow-400">Day {day} Complete!</h1>

        <div className="text-3xl flex justify-between mb-4">
          <span>Revenue:</span>
          <span className="text-green-400">+${rev}</span>
        </div>

        <div className="text-3xl flex justify-between mb-4">
          <span>Expenses:</span>
          <span className="text-red-400">-${exp}</span>
        </div>

        <div className="w-full h-1 bg-gray-600 my-4"></div>

        <div className="text-4xl flex justify-between mb-8 font-bold">
          <span>Profit:</span>
          <span className={profit >= 0 ? "text-green-400" : "text-red-500"}>
            {profit >= 0 ? '+' : ''}${profit}
          </span>
        </div>

        <button
          onClick={startNextDay}
          className="bg-blue-600 hover:bg-blue-500 w-full py-4 border-2 border-blue-400 shadow-[4px_4px_0_0_rgba(0,0,0,1)] font-bold text-3xl cursor-pointer active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
        >
          Start Next Day
        </button>
      </div>
    </div>
  )
}

function GameScreens() {
  const gameState = useStore(s => s.gameState);
  const startGame = useStore(s => s.startGame);

  if (gameState === 'MENU') {
    return (
      <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 uppercase">
        <div className="bg-gray-900 p-12 border-4 border-gray-400 shadow-[8px_8px_0_0_rgba(0,0,0,1)] text-white text-center">
          <h1 className="text-6xl font-bold mb-4 text-blue-400">Checkout</h1>
          <p className="text-2xl mb-8 text-gray-300">Run the store. Catch thieves. Make $5000.</p>
          <button onClick={startGame} className="bg-green-600 hover:bg-green-500 w-full py-4 border-2 border-green-400 shadow-[4px_4px_0_0_rgba(0,0,0,1)] font-bold text-4xl cursor-pointer active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">
            Start Demo
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'GAMEOVER') {
    return (
      <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50 uppercase">
        <div className="bg-gray-900 p-12 border-4 border-red-800 shadow-[8px_8px_0_0_rgba(0,0,0,1)] text-white text-center">
          <h1 className="text-6xl font-bold mb-4 text-red-500">Bankrupt!</h1>
          <p className="text-2xl mb-8 text-gray-400">You ran out of money.</p>
          <button onClick={startGame} className="bg-red-600 hover:bg-red-500 w-full py-4 border-2 border-red-400 shadow-[4px_4px_0_0_rgba(0,0,0,1)] font-bold text-4xl cursor-pointer active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'VICTORY') {
    return (
      <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50 uppercase">
        <div className="bg-gray-900 p-12 border-4 border-yellow-400 shadow-[8px_8px_0_0_rgba(0,0,0,1)] text-white text-center">
          <h1 className="text-6xl font-bold mb-4 text-yellow-400">Demo Complete!</h1>
          <p className="text-2xl mb-8 text-gray-300">You built a successful $5000 business!</p>
          <button onClick={startGame} className="bg-blue-600 hover:bg-blue-500 w-full py-4 border-2 border-blue-400 shadow-[4px_4px_0_0_rgba(0,0,0,1)] font-bold text-4xl cursor-pointer active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return null;
}

function App() {
  const gameState = useStore(s => s.gameState);
  
  return (
    <div className="w-screen h-screen overflow-hidden relative">
      <GameCanvas />
      {gameState === 'PLAYING' && (
        <>
          <HUD />
          <ShelfMenu />
          <DaySummary />
        </>
      )}
      <GameScreens />
    </div>
  )
}

export default App