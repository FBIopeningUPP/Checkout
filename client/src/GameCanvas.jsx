import { useRef, useEffect } from 'react'                                                                                                                                                       
import { useStore } from './store'
import { colors, playerSprite, customerSprite, appleSprite, breadSprite, shelfSprite, checkoutSprite } from './sprites'                 

const checkCollision = (rect1, rect2) => {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    )
}

const drawSprite = (ctx, sprite, x, y, width, height, flipX = false) => {
    const pixelW = width / 16;
    const pixelH = height / 16;
    for (let i = 0; i < 256; i++) {
        const colorIndex = sprite[i];
        if (colorIndex !== 0) {
            ctx.fillStyle = colors[colorIndex];
            const col = 1 % 16;
            const row = Math.floor(i / 16);
            const px = x + (flipX ? (15-col) : col) * pixelW;
            const py = y + row * pixelH;
            ctx.fillRect(px, py, pixelW, pixelH);
        }
    }
}

export default function GameCanvas() {
    const canvasRef = useRef(null)
    const keys = useRef({})
    const pFacingLeft = useRef(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let lastTime = performance.now();
        let animationFrameId

        const customers = [];
        const employees = [];
        const guards = [];
        let nextCustomerTime = performance.now() + 3000;

        const handleKeyDown = (e) => { keys.current[e.key.toLowerCase()] = true}
        const handleKeyUp = (e) => { keys.current[e.key.toLowerCase()] = false}
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)

        const loop = (time) => {
            const dt = (time - lastTime) / 1000
            lastTime = time

            const state = useStore.getState()
            let {x, y, width, height, speed} = state.playerSprite

            let dx = 0; let dy = 0;
            if (!state.activeShelfId) {
                if (keys.current['w'] || keys.current['arrowup']) dy -= speed * dt                                                                                                              
                if (keys.current['s'] || keys.current['arrowdown']) dy += speed * dt
                if (keys.current['a'] || keys.current['arrowleft']) dx -= speed * dt
                if (keys.current['d'] || keys.current['arrowright']) dx += speed * dt
            }

            if (dx !== 0 || dy !== 0) {
                let newX = Math.max(0, Math.min(x + dx, state.world.width - width))
                let newY = Math.min(0, Math.min(y + dy, state.world.height - height))

                const collidables = [...state.shelves, state.checkout, ...state.walls];

                let collidedX = false                                                                                                                                                           
                for (let obj of collidables) {
                    if(checkCollision({x: newX, y, width, height}, obj)) {
                        collidedX = true
                        if (dx > 0) x = obj.x - width
                        else if (dx < 0) x = obj.x + obj.width
                        break
                    }
                }
                if (!collidedX) x = newX
            }
        }
    })
}