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
            const col = i % 16;
            const row = Math.floor(i / 16);
            const px = x + (flipX ? (15 - col) : col) * pixelW;
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

        const handleKeyDown = (e) => { keys.current[e.key.toLowerCase()] = true }
        const handleKeyUp = (e) => { keys.current[e.key.toLowerCase()] = false }
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)

        const loop = (time) => {
            const dt = (time - lastTime) / 1000
            lastTime = time

            const state = useStore.getState()
            let { x, y, width, height, speed } = state.player

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

                const collidables = [...state.shelves, state.checkout, ...state.walls];

                let collidedX = false
                for (let obj of collidables) {
                    if (checkCollision({ x: newX, y, width, height }, obj)) {
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

            if (state.isDayActive) {
                const newTime = state.dayTimeLeft - dt;
                if (newTime <= 0) {
                    useStore.getState().endDay();
                } else {
                    useStore.setState({ dayTimeLeft: newTime });
                }
            } else {
                customers.length = 0;
            }

            if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
                canvas.width = window.innerWidth
                canvas.height = window.innerHeight
            }

            ctx.fillStyle = '#111827'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            ctx.save()
            const camX = Math.max(0, Math.min(x + width / 2 - canvas.width / 2, state.world.width - canvas.width))
            const camY = Math.max(0, Math.min(y + height / 2 - canvas.height / 2, state.world.height - canvas.height))
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

            state.walls.forEach(w => {
                ctx.fillStyle = w.color;
                ctx.fillRect(w.x, w.y, w.width, w.height);
            });

            ctx.fillStyle = '#1e3a8a';
            ctx.fillRect(700, 1168, 200, 32);
            ctx.fillStyle = 'white';
            ctx.font = '24px "VT323", monospace';
            ctx.fillText("ENTRANCE", 760, 1192);

            let nearest = null;
            let minDist = 200;
            const pCenter = { x: x + width / 2, y: y + height / 2 };

            state.shelves.forEach(shelf => {
                for (let sx = 0; sx < shelf.width; sx += 64) {
                    for (let sy = 0; sy < shelf.height; sy += 64) {
                        drawSprite(ctx, shelfSprite, shelf.x + sx, shelf.y + sy, 64, 64);
                    }
                }

                if (!shelf.productId) {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                    ctx.fillRect(shelf.x, shelf.y, shelf.width, shelf.height);
                }

                if (shelf.productId && shelf.stock > 0) {
                    const sprite = shelf.productId === 'p1' ? appleSprite : breadSprite;
                    const count = Math.min(Math.ceil(shelf.stock / 3), 3);

                    for (let i = 0; i < count; i++) {
                        if (shelf.width > shelf.height) {
                            drawSprite(ctx, sprite, shelf.x + 16 + (i * 32), shelf.y + 16, 32, 32);
                        } else {
                            drawSprite(ctx, sprite, shelf.x + 16, shelf.y + 16 + (i * 32), 32, 32);
                        }
                    }
                }

                const sCenter = { x: shelf.x + shelf.width / 2, y: shelf.y + shelf.height / 2 };

                const dist = Math.hypot(pCenter.x - sCenter.x, pCenter.y - sCenter.y);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = shelf;
                }
            })

            ctx.fillStyle = '#78350f'
            ctx.fillRect(state.checkout.x, state.checkout.y, state.checkout.width, state.checkout.height);
            drawSprite(ctx, checkoutSprite, state.checkout.x + 32, state.checkout.y, 64, 64);

            if (state.isDayActive && time > nextCustomerTime) {
                const stockedShelves = state.shelves.filter(s => s.stock > 0);
                if (stockedShelves.length > 0) {
                    const target = stockedShelves[Math.floor(Math.random() * stockedShelves.length)];
                    const isThief = Math.random() < 0.15;
                    customers.push({
                        x: 800, y: 1250, speed: isThief ? 220 : 150, state: 'ENTERING', isThief,
                        targetId: target.id, targetX: target.x + target.width / 2, targetY: target.y + target.height / 2
                    });
                }
                nextCustomerTime = time + 2000 + Math.random() * 2000;
            }

            customers.forEach(c => {
                const dx = c.targetX - c.x;
                const dy = c.targetY - c.y;
                const dist = Math.hypot(dx, dy);

                let moveX = 0;
                let moveY = 0;

                if (c.state === 'ENTERING') {
                    const dyEnter = 1100 - c.y;
                    if (Math.abs(dyEnter) < 10) c.state = 'TO_SHELF';
                    else moveY = -c.speed * dt;
                } else if (c.state === 'TO_SHELF') {
                    if (dist < 10) {
                        const targetShelf = state.shelves.find(s => s.id === c.targetId);
                        if (targetShelf && targetShelf.stock > 0) {
                            useStore.getState().takeStock(c.targetId);
                            if (c.isThief) {
                                c.state = 'FLEEING';
                                c.targetX = 800;
                                c.targetY = 1300;
                            } else {
                                c.state = 'TO_CHECKOUT';
                                c.targetX = state.checkout.x + state.checkout.width / 2;
                                c.targetY = state.checkout.y + state.checkout.height / 2;
                            }
                        } else {
                            c.state = 'LEAVING';
                        }
                    } else {
                        moveX = (dx / dist) * c.speed * dt;
                        moveY = (dy / dist) * c.speed * dt;
                    }
                } else if (c.state === 'TO_CHECKOUT') {
                    if (dist < 50) {
                        c.state = 'WAITING';
                    } else {
                        moveX = (dx / dist) * c.speed * dt;
                        moveY = (dy / dist) * c.speed * dt;
                    }
                } else if (c.state === 'LEAVING' || c.state === 'FLEEING') {
                    const dyOut = 1300 - c.y;
                    const dxOut = 800 - c.x;
                    const distOut = Math.hypot(dxOut, dyOut);
                    if (distOut < 10) c.state = 'DESPAWN';
                    else {
                        moveX = (dxOut / distOut) * c.speed * dt;
                        moveY = (dyOut / distOut) * c.speed * dt;
                    }
                } else if (c.state === 'ARRESTED') {
                    if (!c.arrestTimer) c.arrestTimer = time + 2000;
                    if (time > c.arrestTimer) c.state = 'DESPAWN';
                }

                if (moveX !== 0 || moveY !== 0) {
                    const cSize = 32;
                    let newX = c.x + moveX;
                    let newY = c.y + moveY;
                    const collidables = [...state.shelves, state.checkout];

                    let collidedX = false;
                    for (let obj of collidables) {
                        if (obj.id === c.targetId) continue;
                        if (c.state === 'TO_CHECKOUT' && obj.id === 'checkout') continue;

                        if (checkCollision({ x: newX - 16, y: c.y - 16, width: cSize, height: cSize }, obj)) {
                            collidedX = true; break;
                        }
                    }
                    if (!collidedX) c.x = newX;

                    let collidedY = false;
                    for (let obj of collidables) {
                        if (obj.id === c.targetId) continue;
                        if (c.state === 'TO_CHECKOUT' && obj.id === 'checkout') continue;

                        if (checkCollision({ x: c.x - 16, y: newY - 16, width: cSize, height: cSize }, obj)) {
                            collidedY = true; break;
                        }
                    }
                    if (!collidedY) c.y = newY;
                }

                const flipX = dx < 0;
                const bob = (moveX !== 0 || moveY !== 0) ? Math.sin(time * 20) * 4 : 0;

                if (c.isThief) {
                    ctx.fillStyle = c.state === 'ARRESTED' ? ((time % 500 > 250) ? 'blue' : 'red') : 'rgba(239, 68, 68, 0.4)';
                    ctx.fillRect(c.x - 16, c.y - 16, 32, 32);
                }

                drawSprite(ctx, customerSprite, c.x - 16, c.y - 16 + bob, 32, 32, flipX);

                if (c.state === 'WAITING') {
                    ctx.fillStyle = '#facc15';
                    ctx.fillRect(c.x - 4, c.y - 24, 8, 8);
                }
            })

            for (let i = customers.length - 1; i >= 0; i--) {
                if (customers[i].state === 'DESPAWN') customers.splice(i, 1);
            }

            if (guards.length < state.guardCount) {
                guards.push({ x: 800, y: 500, speed: 280, state: 'PATROL', tx: 800, ty: 500 });
            }

            guards.forEach(g => {
                const activeThief = customers.find(c => c.isThief && c.state === 'FLEEING');

                if (activeThief) {
                    g.state = 'CHASE';
                    g.tx = activeThief.x;
                    g.ty = activeThief.y;

                    if (Math.hypot(g.tx - g.x, g.ty - g.y) < 25) {
                        activeThief.state = 'ARRESTED';
                        useStore.getState().catchThief();
                    }
                } else {
                    g.state = 'PATROL';
                    if (Math.hypot(g.tx - g.x, g.ty - g.y) < 10) {
                        g.tx = Math.random() * 1200 + 200;
                        g.ty = Math.random() * 800 + 200;
                    }
                }

                const gdx = g.tx - g.x;
                const gdy = g.ty - g.y;
                const gDist = Math.hypot(gdx, gdy);
                if (gDist > 10) {
                    g.x += (gdx / gDist) * g.speed * dt;
                    g.y += (gdy / gDist) * g.speed * dt;
                }

                const bob = gDist > 10 ? Math.sin(time * 25) * 4 : 0;
                ctx.fillStyle = g.state === 'CHASE' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.5)';
                ctx.fillRect(g.x - 16, g.y - 16, 32, 32);
                drawSprite(ctx, playerSprite, g.x - 16, g.y - 16 + bob, 32, 32, gdx < 0);
            });

            if (employees.length < state.employeeCount) {
                employees.push({ x: 800, y: 1250, speed: 200, targetId: null });
            }

            employees.forEach(e => {
                if (!e.targetId) {
                    const emptyShelf = state.shelves.find(s => s.productId && s.stock < 3);
                    if (emptyShelf && state.cash >= state.products.find(p => p.id === emptyShelf.productId).cost * 10) {
                        e.targetId = emptyShelf.id;
                    }
                }

                let moveX = 0; let moveY = 0;
                if (e.targetId) {
                    const targetShelf = state.shelves.find(s => s.id === e.targetId);

                    if (!targetShelf || targetShelf.stock >= 3) {
                        e.targetId = null;
                    } else {
                        const tx = targetShelf.x + targetShelf.width / 2;
                        const ty = targetShelf.y + targetShelf.height / 2;
                        const dist = Math.hypot(tx - e.x, ty - e.y);
                        if (dist < 10) {
                            useStore.getState().restockShelf(e.targetId);
                            e.targetId = null;
                        } else {
                            moveX = ((tx - e.x) / dist) * e.speed * dt;
                            moveY = ((ty - e.y) / dist) * e.speed * dt;
                        }
                    }
                }

                if (moveX !== 0 || moveY !== 0) {
                    const eSize = 32;
                    let newX = e.x + moveX;
                    let newY = e.y + moveY;
                    const collidables = [...state.shelves, state.checkout];

                    let collidedX = false;
                    for (let obj of collidables) {
                        if (obj.id === e.targetId) continue;
                        if (checkCollision({ x: newX - 16, y: e.y - 16, width: eSize, height: eSize }, obj)) {
                            collidedX = true; break;
                        }
                    }
                    if (!collidedX) e.x = newX;

                    let collidedY = false;
                    for (let obj of collidables) {
                        if (obj.id === e.targetId) continue;
                        if (checkCollision({ x: e.x - 16, y: newY - 16, width: eSize, height: eSize }, obj)) {
                            collidedY = true; break;
                        }
                    }
                    if (!collidedY) e.y = newY;
                }

                const bob = (moveX !== 0 || moveY !== 0) ? Math.sin(time * 20) * 4 : 0;
                ctx.fillStyle = 'rgba(168, 85, 247, 0.4)';
                ctx.fillRect(e.x - 16, e.y - 16, 32, 32);
                drawSprite(ctx, playerSprite, e.x - 16, e.y - 16 + bob, 32, 32, moveX < 0);

                if (e.targetId) {
                    ctx.fillStyle = '#78350f';
                    ctx.fillRect(e.x + (moveX < 0 ? -12 : 4), e.y - 8 + bob, 12, 12);
                    ctx.fillStyle = '#d97706';
                    ctx.fillRect(e.x + (moveX < 0 ? -10 : 6), e.y - 6 + bob, 8, 8);
                }
            });

            if (dx < 0) pFacingLeft.current = true;
            else if (dx > 0) pFacingLeft.current = false;

            const pBob = (dx !== 0 || dy !== 0) ? Math.sin(time * 20) * 4 : 0;
            drawSprite(ctx, playerSprite, x, y + pBob, width, height, pFacingLeft.current);

            const checkoutCenter = { x: state.checkout.x + state.checkout.width / 2, y: state.checkout.y + state.checkout.height / 2 };
            const distToCheckout = Math.hypot(pCenter.x - checkoutCenter.x, pCenter.y - checkoutCenter.y);

            let interactText = '[E] Interact';
            if (distToCheckout < minDist) {
                minDist = distToCheckout;
                nearest = state.checkout;
                interactText = '[E] Serve Customers';
            }

            if (state.buildMode) {
                const snapX = Math.floor((x + 16) / 32) * 32;
                const snapY = Math.floor((y + 16) / 32) * 32;

                ctx.globalAlpha = 0.5;
                for (let sx = 0; sx < 128; sx += 64) {
                    for (let sy = 0; sy < 64; sy += 64) {
                        drawSprite(ctx, shelfSprite, snapX + sx, snapY + sy, 64, 64);
                    }
                }
                ctx.globalAlpha = 1.0;

                ctx.fillStyle = 'white'
                ctx.font = '24px "VT323", monospace'
                ctx.fillText('[E] Place Shelf', snapX, snapY - 10)

                if (keys.current['e']) {
                    keys.current['e'] = false;
                    useStore.getState().placeShelf(snapX, snapY);
                }
            }

            else if (nearest && !state.activeShelfId) {
                ctx.fillStyle = 'white'
                ctx.font = '24px "VT323", monospace'
                ctx.fillText(interactText, nearest.x, nearest.y - 10)

                if (keys.current['e']) {
                    keys.current['e'] = false
                    if (nearest.id === 'checkout') {
                        const waiting = customers.filter(c => c.state === 'WAITING');
                        if (waiting.length > 0) {
                            useStore.getState().serveCustomers(waiting.length);
                            waiting.forEach(c => c.state = 'LEAVING');
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