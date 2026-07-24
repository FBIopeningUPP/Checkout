import { useRef, useEffect } from 'react'
import { useStore } from './store'

const checkCollision = (rect1, rect2) => {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    )
}

export default function GameCanvas() {
    const canvasRef = useRef(null)
    const keys = useRef({})

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        let lastTime = performance.now()
        let animationFrameId

        const handleKeyDown = (e) => { keys.current[e.key.toLowerCase()] = true}
        const handleKeyUp = (e) => {keys.current[e.key.toLowerCase()] = false}
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)

        const loop = (time) => {
            const dt = (time - lastTime) / 1000
            lastTime = time

            const state = useStore.getState()
            let { x, y, width, height, speed} = state.player

            let dx = 0; let dy = 0;
            if (!state.activeShelfId) {
                if (keys.current['w'] || keys.current['arrowup']) dy -= speed * dt
                if (keys.current['s'] || keys.current['arrowdown']) dy += speed * dt
                if (keys.current['a'] || keys.current['arrowleft']) dx -= speed * dt
                if (keys.current['d'] || keys.current['arrowright']) dx += speed * dt
            }

            if (dx !== 0 || dy !== 0) {
                let newX = Math.max(0, Math.min(x + dx, state.world.width - width))
                let newY = Math.max(0, Math.min(y + dy, state.world.height - height))

                let collidedX = false
                for (let obj of state.shelves) {
                    if (checkCollision({x: newX, y, width, height }, obj )) {
                        collidedX = true
                        if (dx > 0) x = obj.x - width
                        else if (dx < 0) x = obj.x + obj.width
                        break
                    }
                }
                if (!collidedX) x = newX

                let collidedY = false
                for (let obj of state.shelves) {
                    if (checkCollision({ x, y: newY, width, height }, obj)) {
                        collidedY = true
                        if (dy > 0) y = obj.y - height
                        else if (dy < 0) y = obj.y + obj.height
                        break
                    }
                }
                if (!collidedY) y = newY

                useStore.setState({ player: { ...state.player, x, y } })
            }

            if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
                canvas.width = window.innerWidth
                canvas.height = window.innerHeight
            }

            ctx.fillStyle = '#111827'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            ctx.save()
            const camX = Math.max(0, Math.min(x + width/2 - canvas.width/2, state.world.width - canvas.width))
            const camY = Math.max(0, Math.min(y + height/2 - canvas.height/2, state.world.height - canvas.height))
            ctx.translate(-camX, -camY)

            ctx.fillStyle = '#1f2937'
            ctx.fillRect(0, 0, state.world.width, state.world.height)

            let nearest = null; 
            let minDist = 100;
            const pCenter = { x: x + width/2, y: y + height/2 };

            state.shelves.forEach(shelf => {
                ctx.fillStyle = shelf.productId ? '#10b981' : shelf.color
                ctx.fillRect(shelf.x, shelf.y, shelf.width, shelf.height)

                const sCenter = { x: shelf.x + shelf.width/2, y: shelf.y + shelf.height/2 };
                const dist = Math.hypot(pCenter.x - sCenter.x, pCenter.y - sCenter.y);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = shelf;
                }
            })

            ctx.fillStyle = '#3b92f6'
            ctx.fillRect(x, y, width, height)

            if (nearest && !state.activeShelfId) {
                ctx.fillStyle = 'white'
                ctx.font = '16px monospace'
                ctx.fillText('[E] Interact', nearest.x, nearest.y - 10)

                if (keys.current['e']) {
                    keys.current['e'] = false
                    useStore.setState({ activeShelfId: nearest.id })
                }
            }

            ctx.restore()
            animationFrameId = requestAnimationFrame(loop)
        }

        animationFrameId = requestAnimationFrame(loop)

        return () => {
            cancelAnimationFrame(animationFrameId)
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [])

    return <canvas ref={canvasRef} className="block w-full h-full" />
}