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
            if (keys.current['w'] || keys.current['arrowup']) dy -= speed * dt
            if (keys.current['s'] || keys.current['arrowdown']) dy += speed * dt
            if (keys.current['a'] || keys.current['arrowleft']) dx -= speed * dt
            if (keys.current['d'] || keys.current['arrowright']) dx += speed * dt

            if (dx !== 0 || dy !== 0) {
                let newX = Math.max(0, Math.min(x + dx, state.world.width - width))
                let newY = Math.max(0, Math.min(y + dy, state.world.height - height))

                const xBox = { x: newX, y, width, height }
                if (!state.objects.some(obj => checkCollision(xBox, obj))) x = newX

                const yBox = { x, y: newY, width, height }
                if (!state.objects.some(obj => checkCollision(xBox, obj))) y = newY

                useStore.setState({player: {...state.player, x, y } })
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
            ctx.filllRect(0, 0, state.world.width, state.world.height)

            state.objects.forEach(obj => {
                ctx.fillStyle = obj.color
                ctx.fillRect(obj.x, obj.y, obj.width, obj.height)
            })

            ctx.fillStyle = '#3b82f6'
            ctx.fillRect(x, y, width, height)

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