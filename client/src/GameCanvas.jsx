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

        const customers = [];
        let nextCustomerTime = performance.now() + 3000;

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

                const collidables = [...state.shelves, state.checkout];

                let collidedX = false
                for (let obj of collidables) {
                    if (checkCollision({x: newX, y, width, height }, obj )) {
                        collidedX = true
                        if (dx > 0) x = obj.x - width
                        else if (dx < 0) x = obj.x + obj.width
                        break
                    }
                }
                if (!collidedX) x = newX

                let collidedY = false
                for (let obj of collidables) {
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
            ctx.fillRect(0, 0, state.world.width, state.world.height);

            ctx.fillStyle = '#111827';
            const tileSize = 64;
            for (let i = 0; i < state.world.width; i += tileSize) {
                for (let j = 0; j < state.world.height; j += tileSize) {
                    if ((i / tileSize + j / tileSize) % 2 === 0) {
                        ctx.fillRect(i, j, tileSize, tileSize);
                    }
                }
            }

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

            ctx.fillStyle = state.checkout.color;
            ctx.fillRect(state.checkout.x, state.checkout.y, state.checkout.width, state.checkout.height);

            if(time > nextCustomerTime) {
                const stockedShelves = state.shelves.filter(s => s.stock > 0);
                if (stockedShelves.length > 0) {
                    const target = stockedShelves[Math.floor(Math.random() * stockedShelves.length)];
                    customers.push({
                        x: 800, y: 1200, speed: 150, state: 'TO_SHELF',
                        targetId: target.id, targetX: target.x + target.width/2, targetY: target.y + target.height/2
                    });
                }
                nextCustomerTime = time + 2000 + Math.random() * 2000;
            }

            customers.forEach( c => {
                const dx = c.targetX - c.x;
                const dy = c.targetY - c.y;
                const dist = Math.hypot(dx, dy);

                if (c.state === 'TO_SHELF') {
                    if (dist < 10) {
                        c.state = 'TO_CHECKOUT';
                        c.targetX = state.checkout.x + state.checkout.width/2;
                        c.targetY = state.checkout.y + state.checkout.height/2;
                    } else {
                        c.x += (dx / dist) * c.speed * dt;
                        c.y += (dy / dist) * c.speed * dt;
                    }
                } else if (c.state === 'TO_CHECKOUT') {
                    if (dist < 50) c.state = 'WAITING';
                    else {
                        c.x += (dx / dist) * c.speed * dt;
                        c.y += (dy / dist) * c.speed * dt;
                    }
                }

                ctx.fillStyle = '#f43f5e'
                ctx.beginPath();
                ctx.arc(c.x, c.y, 16, 0, Math.PI * 2);
                ctx.fill();

                if (c.state === 'WAITING') {
                    ctx.fillStyle = '#facc15';
                    ctx.fillRect(c.x - 4, c.y - 24, 8, 8);
                }
            });

            ctx.fillStyle = '#3b92f6'
            ctx.fillRect(x, y, width, height)

            const checkoutCenter = { x: state.checkout.x + state.checkout.width/2, y: state.checkout.y + state.checkout.height/2 };
            const distToCheckout = Math.hypot(pCenter.x - checkoutCenter.x, pCenter.y - checkoutCenter.y);

            let interactText = '[E] Interact';
            if (distToCheckout < minDist) {
                minDist = distToCheckout;
                nearest = state.checkout;
                interactText = '[E] Serve Customers';
            }

            if (nearest && !state.activeShelfId) {
                ctx.fillStyle = 'white'
                ctx.font = '24px "VT323", monospace'
                ctx.fillText(interactText, nearest.x, nearest.y - 10)

                if (keys.current['e']) {
                    keys.current['e'] = false
                    if (nearest.id === 'checkout') {
                        const waiting = customers.filter(c => c.state === 'WAITING');
                        if (waiting.length > 0) {
                            useStore.getState().serveCustomers(waiting.length);
                            const remaining = customers.filter(c => c.state !== 'WAITING');
                            customers.length = 0;
                            customers.push(...remaining);
                        }
                    } else {
                        useStore.setState({ activeShelfId: nearest.id })
                    }
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