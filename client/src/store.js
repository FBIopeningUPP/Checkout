import { create } from 'zustand'

export const useStore = create((set) => ({
    player: { x: 400, y: 300, width: 32, height: 32, speed: 250 },
    world: { width: 1600, height: 1200},
    objects:[
        { id: 1, x: 300, y: 200, width: 128, height: 64, color: '#4b5563' },
        { id: 2, x: 600, y: 400, width: 64, height: 128, color: '#4b5563' },
        { id: 3, x: 300, y: 600, width: 256, height: 64, color: '#4b5563' }
    ]
})) 