import { create } from 'zustand'

export const useStore = create((set) => ({
    player: { x: 400, y: 300, width: 32, height: 32, speed: 250 },
    world: { width: 1600, height: 1200},
    cash: 0,
    checkout: { id: 'checkout', x: 800, y: 100, width: 128, height: 64, color: '#eab308'},
    products: [
        { id: 'p1', name: 'Apple', cost: 1, sell: 3 },
        { id: 'p2', name: 'Bread', cost: 2, sell: 5 }
    ],
    shelves: [
        { id: 1, x: 300, y: 200, width: 128, height: 64, color: '#4b5563', productId: null, stock: 0 },
        { id: 2, x: 600, y: 400, width: 64, height: 128, color: '#4b5563', productId: null, stock: 0 },
        { id: 3, x: 300, y: 600, width: 256, height: 64, color: '#4b5563', productId: null, stock: 0 }
    ],
    serveCustomers: (count) => set(state => ({
        cash: state.cash + (count * 5)
    })),
    takeStock: (shelfId) => set(state => ({
        shelves: state.shelves.map(s => 
            s.id === shelfId && s.stock > 0 ? { ...s, stock: s.stock - 1 } : s
        )
    })),
    assignProduct: (shelfId, productId) => set(state => ({
        shelves: state.shelves.map(s => s.id === shelfId ? {...s, productId, stock: 10} : s),
        activeShelfId: null
    })),
    closeMenu: () => set({ activeShelfId: null })
})) 