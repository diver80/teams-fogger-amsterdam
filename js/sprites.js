/**
 * Sprites & Visual Renderers for Amsterdam Fogger
 * Procedural canvas drawing for crisp high-DPI graphics, vibrant colors, and zero asset latency.
 */
class SpriteRenderer {
    constructor() {
        this.animTime = 0;
    }

    update(dt) {
        this.animTime += dt;
    }

    // Draw the entire background scenery (Hotel, Roads, Tram median, RAI entrance)
    drawBackground(ctx, width, height, gridY, numLanes) {
        // 1. Hotel / Start Sidewalk (Bottom 2 rows)
        const bottomZoneH = gridY * 2;
        const bottomZoneY = height - bottomZoneH;

        // Brick sidewalk pattern
        ctx.fillStyle = '#4a443e';
        ctx.fillRect(0, bottomZoneY, width, bottomZoneH);

        // Cobblestone accents
        ctx.strokeStyle = '#38332e';
        ctx.lineWidth = 1.5;
        for (let x = 0; x < width; x += 32) {
            for (let y = bottomZoneY; y < height; y += 16) {
                const shift = ((Math.floor(y / 16)) % 2) * 16;
                ctx.strokeRect(x + shift, y, 32, 16);
            }
        }

        // Hotel Curbside & Awning banner at very bottom
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, height - 18, width, 18);
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 10px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🏨 HOTEL DEPARTURE — CROSS DE AMSTEL FIETSPAD TOWARDS RAI AMSTERDAM', width / 2, height - 5);

        // Canal railing / chained bikes decorative border
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, bottomZoneY + 6);
        ctx.lineTo(width, bottomZoneY + 6);
        ctx.stroke();

        // 2. Bike Lanes (Lower Zone: Lanes 1, 2, 3)
        // Authentic Amsterdam "Fietspad" iconic reddish tarmac!
        const laneH = gridY;
        const lowerRoadY = bottomZoneY - (laneH * 3);
        ctx.fillStyle = '#993322'; // Iconic Amsterdam red bike path
        ctx.fillRect(0, lowerRoadY, width, laneH * 3);

        // White lane divider dashes & bike stencils
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 2;
        ctx.setLineDash([14, 14]);
        for (let i = 1; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(0, lowerRoadY + i * laneH);
            ctx.lineTo(width, lowerRoadY + i * laneH);
            ctx.stroke();
        }
        ctx.setLineDash([]);

        // White bicycle painted stencils on the tarmac
        this.drawBikeStencil(ctx, 80, lowerRoadY + laneH * 0.5, 0.7);
        this.drawBikeStencil(ctx, width - 120, lowerRoadY + laneH * 1.5, 0.7);
        this.drawBikeStencil(ctx, width / 2, lowerRoadY + laneH * 2.5, 0.7);

        // 3. Middle Safe Island (Median Strip with Tram Tracks & Tulips)
        const medianY = lowerRoadY - laneH;
        ctx.fillStyle = '#52525b';
        ctx.fillRect(0, medianY, width, laneH);

        // Cobblestones on median
        ctx.strokeStyle = '#3f3f46';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 24) {
            ctx.strokeRect(x, medianY, 24, laneH);
        }

        // Tram Tracks (GVB Amsterdam Tram Line 4)
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, medianY + laneH * 0.35);
        ctx.lineTo(width, medianY + laneH * 0.35);
        ctx.moveTo(0, medianY + laneH * 0.65);
        ctx.lineTo(width, medianY + laneH * 0.65);
        ctx.stroke();

        // Tram track ties (sleepers)
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        for (let x = 0; x < width; x += 16) {
            ctx.beginPath();
            ctx.moveTo(x, medianY + laneH * 0.28);
            ctx.lineTo(x, medianY + laneH * 0.72);
            ctx.stroke();
        }

        // Amsterdam Tulip Planters along median
        for (let x = 30; x < width; x += 150) {
            this.drawTulipBox(ctx, x, medianY + 4, 38, 14);
        }

        // Amsterdam "XXX" city flag posts on median
        this.drawAmsterdamFlag(ctx, 110, medianY + 8);
        this.drawAmsterdamFlag(ctx, width - 110, medianY + 8);

        // 4. Bike Lanes (Upper Fast Zone: Lanes 4, 5, 6)
        const upperRoadY = medianY - (laneH * 3);
        ctx.fillStyle = '#83281b'; // Darker intense red asphalt
        ctx.fillRect(0, upperRoadY, width, laneH * 3);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([14, 14]);
        for (let i = 1; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(0, upperRoadY + i * laneH);
            ctx.lineTo(width, upperRoadY + i * laneH);
            ctx.stroke();
        }
        ctx.setLineDash([]);

        this.drawBikeStencil(ctx, 140, upperRoadY + laneH * 0.5, 0.7);
        this.drawBikeStencil(ctx, width - 80, upperRoadY + laneH * 1.5, 0.7);
        this.drawBikeStencil(ctx, width / 2 - 60, upperRoadY + laneH * 2.5, 0.7);

        // 5. Top Safe Zone / RAI Plaza & Conference Hall Entrance
        const plazaH = upperRoadY;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, plazaH);

        // Subtle modern tiles in plaza
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 36) {
            for (let y = 0; y < plazaH; y += 24) {
                ctx.strokeRect(x, y, 36, 24);
            }
        }

        // Top Modern Header Arch: "RAI AMSTERDAM — ATLASSIAN TEAM '26"
        this.drawRaiFacade(ctx, width, plazaH);
    }

    drawBikeStencil(ctx, x, y, scale = 1) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 2;

        // Wheels
        ctx.beginPath();
        ctx.arc(-14, 0, 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(14, 0, 8, 0, Math.PI * 2);
        ctx.stroke();

        // Frame
        ctx.beginPath();
        ctx.moveTo(-14, 0);
        ctx.lineTo(0, 0);
        ctx.lineTo(7, -10);
        ctx.lineTo(-7, -10);
        ctx.lineTo(-14, 0);
        ctx.moveTo(0, 0);
        ctx.lineTo(-7, -10);
        ctx.moveTo(14, 0);
        ctx.lineTo(7, -10);
        ctx.lineTo(4, -14);
        ctx.lineTo(10, -14);
        ctx.stroke();
        ctx.restore();
    }

    drawTulipBox(ctx, x, y, w, h) {
        ctx.save();
        // Wooden planter box
        ctx.fillStyle = '#78350f';
        ctx.fillRect(x, y + 4, w, h);
        ctx.strokeStyle = '#451a03';
        ctx.strokeRect(x, y + 4, w, h);

        // Green foliage
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(x + 2, y + 1, w - 4, 5);

        // Vibrant tulip heads (red, yellow, orange)
        const colors = ['#ef4444', '#facc15', '#f97316', '#ec4899'];
        for (let i = 0; i < 4; i++) {
            ctx.fillStyle = colors[i % colors.length];
            const tx = x + 4 + i * 8;
            ctx.beginPath();
            ctx.arc(tx, y - 1, 3.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    drawAmsterdamFlag(ctx, x, y) {
        ctx.save();
        // Flag pole
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y + 26);
        ctx.lineTo(x, y - 4);
        ctx.stroke();

        // Flag body (Red, Black stripe with 3 white X's, Red)
        const fw = 22;
        const fh = 14;
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(x + 2, y - 4, fw, fh);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 2, y + 1, fw, 5);

        // Three St. Andrew's crosses (XXX)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 5px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('× × ×', x + 13, y + 5);
        ctx.restore();
    }

    drawRaiFacade(ctx, width, plazaH) {
        ctx.save();
        // RAI Entrance Canopy
        const gradient = ctx.createLinearGradient(0, 0, 0, 48);
        gradient.addColorStop(0, '#0052cc'); // Atlassian Blue
        gradient.addColorStop(1, '#0747a6');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, 32);

        // Glowing border line
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 32);
        ctx.lineTo(width, 32);
        ctx.stroke();

        // Signboard text
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.letterSpacing = '1px';
        ctx.fillText('⚡ RAI AMSTERDAM • ATLASSIAN TEAM \'26 ⚡', width / 2, 17);

        ctx.font = '600 9px sans-serif';
        ctx.fillStyle = '#93c5fd';
        ctx.fillText('CONFERENCE KEYNOTE GATES & BADGE SCAN', width / 2, 28);
        ctx.restore();
    }

    // Draw the 5 goal bays at the top
    drawGoalBays(ctx, bays, width) {
        bays.forEach((bay, index) => {
            const bx = bay.x;
            const by = bay.y;
            const bw = bay.width;
            const bh = bay.height;

            ctx.save();
            if (bay.filled) {
                // Goal secured! Glowing green portal
                ctx.fillStyle = '#065f46';
                ctx.fillRect(bx, by, bw, bh);
                ctx.strokeStyle = '#34d399';
                ctx.lineWidth = 3;
                ctx.strokeRect(bx, by, bw, bh);

                // Checkmark / badge icon
                ctx.fillStyle = '#a7f3d0';
                ctx.font = 'bold 18px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('✓', bx + bw / 2, by + bh / 2 - 4);

                ctx.font = 'bold 9px sans-serif';
                ctx.fillStyle = '#ecfdf5';
                ctx.fillText(bay.title || 'CHECKED IN', bx + bw / 2, by + bh - 6);
            } else {
                // Open booth target
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(bx, by, bw, bh);
                ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
                ctx.lineWidth = 2;
                ctx.setLineDash([4, 4]);
                ctx.strokeRect(bx, by, bw, bh);
                ctx.setLineDash([]);

                // Target pulse indicator
                const pulse = Math.sin(this.animTime * 4 + index) * 0.2 + 0.8;
                ctx.fillStyle = `rgba(56, 189, 248, ${pulse})`;
                ctx.font = 'bold 10px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(bay.icon || '🎟️', bx + bw / 2, by + bh / 2 - 5);

                ctx.fillStyle = '#94a3b8';
                ctx.font = 'bold 8px sans-serif';
                ctx.fillText(bay.shortName || `GATE ${index + 1}`, bx + bw / 2, by + bh - 7);
            }
            ctx.restore();
        });
    }

    // Draw the Consultant Player Character
    drawConsultant(ctx, x, y, width, height, characterType, facing, isHopping, hopProgress, hasShield, hasCoffeeBoost, isInvulnerable = false, isTequilaActive = false) {
        ctx.save();
        ctx.translate(x + width / 2, y + height / 2);

        // Invulnerability blinking
        if (isInvulnerable && Math.floor(this.animTime * 14) % 2 === 0) {
            ctx.globalAlpha = 0.35;
        }

        // Drunken Tequila wobble sway
        if (isTequilaActive) {
            const drunkSway = Math.sin(this.animTime * 9) * 0.22;
            ctx.rotate(drunkSway);
        }

        // Coffee boost aura trail
        if (hasCoffeeBoost) {
            ctx.save();
            const glow = Math.sin(this.animTime * 12) * 5 + 15;
            ctx.shadowColor = '#eab308';
            ctx.shadowBlur = glow;
            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, width * 0.65, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // Noise canceling shield aura
        if (hasShield) {
            ctx.save();
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2.5;
            ctx.setLineDash([5, 3]);
            ctx.beginPath();
            ctx.arc(0, 0, width * 0.7, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // Ground shadow under jumper (drawn before jump offset & facing rotation)
        if (isHopping) {
            ctx.save();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
            ctx.beginPath();
            ctx.ellipse(0, 16, 14 * (1 - Math.sin(hopProgress * Math.PI) * 0.3), 5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Hop squash & stretch
        let scaleX = 1;
        let scaleY = 1;
        let jumpOffsetY = 0;
        if (isHopping) {
            jumpOffsetY = -Math.sin(hopProgress * Math.PI) * 12;
            scaleX = 1 - Math.sin(hopProgress * Math.PI) * 0.2;
            scaleY = 1 + Math.sin(hopProgress * Math.PI) * 0.25;
        }

        ctx.translate(0, jumpOffsetY);
        ctx.scale(scaleX, scaleY);

        // Rotation based on facing
        if (facing === 'down') ctx.rotate(Math.PI);
        if (facing === 'left') ctx.rotate(-Math.PI / 2);
        if (facing === 'right') ctx.rotate(Math.PI / 2);

        const halfW = width / 2;
        const halfH = height / 2;

        // Custom Consultant Costumes
        if (characterType === 'agile_coach') {
            // Birkenstocks / Shoes
            ctx.fillStyle = '#a16207';
            ctx.fillRect(-10, 8, 7, 10);
            ctx.fillRect(3, 8, 7, 10);

            // Linen Trousers
            ctx.fillStyle = '#fde047';
            ctx.fillRect(-11, -2, 22, 12);

            // Graphic Conference T-Shirt (Teal)
            ctx.fillStyle = '#0d9488';
            ctx.fillRect(-12, -14, 24, 15);

            // Atlassian Lanyard around neck
            ctx.strokeStyle = '#0284c7';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-5, -14);
            ctx.lineTo(0, -4);
            ctx.lineTo(5, -14);
            ctx.stroke();
            // Lanyard badge card
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-3, -4, 6, 8);
            ctx.fillStyle = '#0284c7';
            ctx.fillRect(-2, -3, 4, 3);

            // Head / Hair (Messy Bun)
            ctx.fillStyle = '#fdba74'; // Skin tone
            ctx.beginPath();
            ctx.arc(0, -18, 9, 0, Math.PI * 2);
            ctx.fill();

            // Hair
            ctx.fillStyle = '#7c2d12';
            ctx.beginPath();
            ctx.arc(0, -22, 8, Math.PI, 0);
            ctx.fill();
            // Bun
            ctx.beginPath();
            ctx.arc(0, -28, 4, 0, Math.PI * 2);
            ctx.fill();

            // Sticky Notes in hand
            ctx.fillStyle = '#f43f5e';
            ctx.fillRect(8, -8, 6, 6);
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(10, -6, 6, 6);

        } else if (characterType === 'jira_admin') {
            // Dark Mode Techie: Hoodie + glowing laptop
            // Sneakers
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(-10, 8, 7, 10);
            ctx.fillRect(3, 8, 7, 10);

            // Dark Denim Jeans
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(-11, -2, 22, 12);

            // Charcoal Tech Hoodie
            ctx.fillStyle = '#334155';
            ctx.fillRect(-12, -14, 24, 15);

            // Jira Logo pin
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(0, -8, 3, 0, Math.PI * 2);
            ctx.fill();

            // Head & Beanie
            ctx.fillStyle = '#fed7aa';
            ctx.beginPath();
            ctx.arc(0, -18, 9, 0, Math.PI * 2);
            ctx.fill();

            // Black Beanie
            ctx.fillStyle = '#09090b';
            ctx.beginPath();
            ctx.arc(0, -20, 8.5, Math.PI * 0.9, Math.PI * 2.1);
            ctx.fill();

            // Glowing Laptop held forward
            ctx.fillStyle = '#64748b';
            ctx.fillRect(-7, -26, 14, 4);
            ctx.fillStyle = '#38bdf8'; // Glowing blue screen
            ctx.fillRect(-6, -25, 12, 2);

        } else {
            // Solutions Architect (Blazer, Coffee Cup, Professional)
            // Dress shoes
            ctx.fillStyle = '#451a03';
            ctx.fillRect(-10, 8, 7, 10);
            ctx.fillRect(3, 8, 7, 10);

            // Chinos
            ctx.fillStyle = '#cbd5e1';
            ctx.fillRect(-11, -2, 22, 12);

            // Navy Blazer
            ctx.fillStyle = '#1e3a8a';
            ctx.fillRect(-12, -14, 24, 15);

            // White shirt collar
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(-4, -14);
            ctx.lineTo(0, -7);
            ctx.lineTo(4, -14);
            ctx.fill();

            // Atlassian Lanyard
            ctx.strokeStyle = '#2563eb';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-5, -14);
            ctx.lineTo(0, -5);
            ctx.lineTo(5, -14);
            ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-3, -5, 6, 7);

            // Head
            ctx.fillStyle = '#fbcfe8';
            ctx.beginPath();
            ctx.arc(0, -18, 9, 0, Math.PI * 2);
            ctx.fill();

            // Sleek Hair
            ctx.fillStyle = '#172554';
            ctx.beginPath();
            ctx.arc(0, -21, 8.5, Math.PI, 0);
            ctx.fill();

            // Coffee Cup in right hand
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(9, -12, 6, 9);
            ctx.fillStyle = '#92400e'; // Coffee sleeve
            ctx.fillRect(9, -9, 6, 4);
        }

        ctx.restore();
    }

    // Draw various Amsterdam Cyclists & Vehicles
    drawBicycle(ctx, bike) {
        ctx.save();

        const dir = bike.direction; // 1 for right, -1 for left
        const type = bike.type;
        const w = bike.width;
        const h = bike.height;

        if (dir === -1) {
            ctx.translate(bike.x + w, bike.y);
            ctx.scale(-1, 1);
        } else {
            ctx.translate(bike.x, bike.y);
        }

        // Wheel spinning rotation
        const wheelAngle = (this.animTime * bike.speed * 0.15) % (Math.PI * 2);

        // Bicycle Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        ctx.beginPath();
        ctx.ellipse(w * 0.45, h * 0.8, w * 0.42, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        if (type === 'tram') {
            this._drawTram(ctx, w, h);
        } else if (type === 'bakfiets') {
            this._drawBakfiets(ctx, w, h, wheelAngle, bike);
        } else if (type === 'courier') {
            this._drawCourier(ctx, w, h, wheelAngle, bike);
        } else if (type === 'fatbike') {
            this._drawFatbike(ctx, w, h, wheelAngle, bike);
        } else if (type === 'racer') {
            this._drawMamilRacer(ctx, w, h, wheelAngle, bike);
        } else if (type === 'swapfiets') {
            this._drawSwapfiets(ctx, w, h, wheelAngle, bike);
        } else {
            // Default: Classic Omafiets (Grandma bike)
            this._drawOmafiets(ctx, w, h, wheelAngle, bike);
        }

        // Ringing Bell Visual Waves
        if (bike.isRingingBell) {
            ctx.save();
            ctx.strokeStyle = '#facc15';
            ctx.lineWidth = 2;
            const bellPhase = (this.animTime * 15) % 3;
            for (let b = 1; b <= 3; b++) {
                ctx.beginPath();
                ctx.arc(w * 0.7, h * 0.25, 6 + b * 5, -Math.PI * 0.35, Math.PI * 0.35);
                ctx.stroke();
            }
            ctx.restore();
        }

        ctx.restore();
    }

    // 1. Classic Omafiets (Grandma city bike)
    _drawOmafiets(ctx, w, h, angle, bike) {
        // Rear wheel
        this._drawWheel(ctx, 10, h * 0.65, 9, '#1e293b', angle);
        // Front wheel
        this._drawWheel(ctx, w - 12, h * 0.65, 9, '#1e293b', angle);

        // Black steel frame (Dutch step-through loop frame)
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(10, h * 0.65);
        ctx.lineTo(w * 0.45, h * 0.65); // Bottom bracket
        ctx.lineTo(w - 12, h * 0.65);
        ctx.moveTo(w * 0.45, h * 0.65);
        ctx.lineTo(w * 0.35, h * 0.35); // Seat post
        ctx.lineTo(w * 0.7, h * 0.4); // Down tube
        ctx.lineTo(w - 12, h * 0.65); // Fork
        ctx.lineTo(w * 0.68, h * 0.22); // Handlebars
        ctx.stroke();

        // Saddle
        ctx.fillStyle = '#78350f';
        ctx.fillRect(w * 0.28, h * 0.32, 10, 3);

        // Front wicker basket with tulips or baguette
        ctx.fillStyle = '#b45309';
        ctx.fillRect(w * 0.7, h * 0.25, 10, 8);
        ctx.strokeStyle = '#78350f';
        ctx.strokeRect(w * 0.7, h * 0.25, 10, 8);
        // Tulip sticking out of basket
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(w * 0.75, h * 0.22, 3, 0, Math.PI * 2);
        ctx.fill();

        // Relaxed upright commuter cyclist
        // Body (coat)
        ctx.fillStyle = bike.color || '#0284c7';
        ctx.fillRect(w * 0.35, h * 0.15, 10, 14);

        // Head & Scarf
        ctx.fillStyle = '#fbcfe8';
        ctx.beginPath();
        ctx.arc(w * 0.42, h * 0.08, 5, 0, Math.PI * 2);
        ctx.fill();

        // Scarf trailing in wind
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(w * 0.22, h * 0.12, 12, 3);

        // Pumping leg animation
        const legY = Math.sin(angle) * 4;
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(w * 0.38, h * 0.3);
        ctx.lineTo(w * 0.45, h * 0.5 + legY);
        ctx.lineTo(w * 0.48, h * 0.65 + legY);
        ctx.stroke();
    }

    // 2. The Famous Amsterdam Bakfiets (Long cargo trike with wooden box & kids!)
    _drawBakfiets(ctx, w, h, angle, bike) {
        // Rear wheel
        this._drawWheel(ctx, 12, h * 0.65, 10, '#1e293b', angle);
        // Front smaller wheel
        this._drawWheel(ctx, w - 10, h * 0.72, 7, '#1e293b', angle);

        // Heavy Long-John frame
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(12, h * 0.65);
        ctx.lineTo(w * 0.4, h * 0.65);
        ctx.lineTo(w - 10, h * 0.72);
        ctx.moveTo(w * 0.4, h * 0.65);
        ctx.lineTo(w * 0.35, h * 0.3); // Seat post
        ctx.stroke();

        // Large Wooden Cargo Box (The Bak)
        ctx.fillStyle = '#92400e';
        ctx.fillRect(w * 0.42, h * 0.38, w * 0.48, 16);
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(w * 0.42, h * 0.38, w * 0.48, 16);

        // Kids / Golden retriever dog inside the box!
        // Kid 1 with yellow helmet
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(w * 0.52, h * 0.32, 5, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(w * 0.52, h * 0.35, 4, 0, Math.PI * 2);
        ctx.fill();

        // Golden retriever head
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(w * 0.76, h * 0.33, 5, 0, Math.PI * 2);
        ctx.fill();
        // Dog ears
        ctx.fillStyle = '#b45309';
        ctx.fillRect(w * 0.72, h * 0.32, 3, 5);

        // Parent rider
        ctx.fillStyle = '#0f766e';
        ctx.fillRect(w * 0.3, h * 0.14, 11, 14);
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(w * 0.36, h * 0.08, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    // 3. Swapfiets (Deluxe blue front tire!)
    _drawSwapfiets(ctx, w, h, angle, bike) {
        // Rear wheel (Black)
        this._drawWheel(ctx, 10, h * 0.65, 9, '#1e293b', angle);
        // Signature iconic Swapfiets light blue front wheel!
        this._drawWheel(ctx, w - 12, h * 0.65, 9, '#38bdf8', angle);

        // Steel frame
        ctx.strokeStyle = '#18181b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(10, h * 0.65);
        ctx.lineTo(w * 0.45, h * 0.65);
        ctx.lineTo(w * 0.32, h * 0.32);
        ctx.moveTo(w * 0.45, h * 0.65);
        ctx.lineTo(w - 12, h * 0.65);
        ctx.lineTo(w * 0.68, h * 0.22);
        ctx.stroke();

        // Tech commuter rider with backpack
        ctx.fillStyle = '#475569';
        ctx.fillRect(w * 0.35, h * 0.15, 11, 14);
        // Backpack
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(w * 0.24, h * 0.17, 7, 10);

        ctx.fillStyle = '#fbcfe8';
        ctx.beginPath();
        ctx.arc(w * 0.42, h * 0.08, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    // 4. Food Delivery Courier (Thuisbezorgd / Flink / Gorillas)
    _drawCourier(ctx, w, h, angle, bike) {
        this._drawWheel(ctx, 10, h * 0.65, 9, '#09090b', angle);
        this._drawWheel(ctx, w - 12, h * 0.65, 9, '#09090b', angle);

        // Sleek e-bike frame
        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(10, h * 0.65);
        ctx.lineTo(w * 0.45, h * 0.65);
        ctx.lineTo(w - 12, h * 0.65);
        ctx.lineTo(w * 0.72, h * 0.22);
        ctx.stroke();

        // Forward aggressive leaning rider
        ctx.fillStyle = '#c2410c';
        ctx.fillRect(w * 0.38, h * 0.16, 12, 13);

        // Huge glowing orange insulated delivery backpack!
        ctx.fillStyle = '#f97316';
        ctx.fillRect(w * 0.18, h * 0.1, 14, 15);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(w * 0.18, h * 0.1, 14, 15);

        // Delivery logo on backpack
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 7px sans-serif';
        ctx.fillText('🍕', w * 0.22, h * 0.24);

        // Helmet
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(w * 0.48, h * 0.09, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    // 5. Electric Fatbike & VanMoof
    _drawFatbike(ctx, w, h, angle, bike) {
        // Chunky 20" extra-wide fat tires!
        this._drawWheel(ctx, 12, h * 0.65, 11, '#000000', angle, true);
        this._drawWheel(ctx, w - 12, h * 0.65, 11, '#000000', angle, true);

        // Matte black thick frame
        ctx.strokeStyle = '#18181b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(12, h * 0.65);
        ctx.lineTo(w * 0.45, h * 0.62);
        ctx.lineTo(w - 12, h * 0.65);
        ctx.lineTo(w * 0.7, h * 0.24);
        ctx.stroke();

        // Long bench two-seater saddle
        ctx.fillStyle = '#27272a';
        ctx.fillRect(w * 0.25, h * 0.38, 22, 5);

        // High-intensity LED headlight beam
        ctx.save();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.beginPath();
        ctx.moveTo(w - 6, h * 0.38);
        ctx.lineTo(w + 35, h * 0.2);
        ctx.lineTo(w + 35, h * 0.75);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Cool hipster teen in puffer jacket
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(w * 0.36, h * 0.16, 13, 14);

        // Puffer jacket ridges
        ctx.strokeStyle = '#312e81';
        ctx.lineWidth = 1;
        ctx.strokeRect(w * 0.36, h * 0.16, 13, 14);

        // Head + Cap backwards
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(w * 0.44, h * 0.09, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ef4444'; // Red cap
        ctx.fillRect(w * 0.38, h * 0.06, 9, 3);
    }

    // 6. MAMIL Road Racer (Middle-Aged Man In Lycra)
    _drawMamilRacer(ctx, w, h, angle, bike) {
        // High-speed racing wheels with thin tires
        this._drawWheel(ctx, 10, h * 0.65, 9, '#0284c7', angle);
        this._drawWheel(ctx, w - 12, h * 0.65, 9, '#0284c7', angle);

        // Neon Carbon-Fiber Frame
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(10, h * 0.65);
        ctx.lineTo(w * 0.42, h * 0.65);
        ctx.lineTo(w * 0.34, h * 0.35);
        ctx.moveTo(w * 0.42, h * 0.65);
        ctx.lineTo(w - 12, h * 0.65);
        ctx.lineTo(w * 0.72, h * 0.3); // Drop handlebars
        ctx.stroke();

        // Aero drop handlebars
        ctx.beginPath();
        ctx.arc(w * 0.74, h * 0.34, 4, -Math.PI * 0.5, Math.PI * 0.5);
        ctx.stroke();

        // Extreme aerodynamic forward tuck position
        ctx.fillStyle = '#f43f5e'; // Neon Pink Lycra Jersey
        ctx.beginPath();
        ctx.ellipse(w * 0.46, h * 0.22, 12, 6, -Math.PI * 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Tear-drop aero time-trial helmet
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.ellipse(w * 0.6, h * 0.16, 7, 4, -Math.PI * 0.2, 0, Math.PI * 2);
        ctx.fill();
    }

    // 7. GVB Amsterdam Combino Tram #4
    _drawTram(ctx, w, h) {
        // Main Tram Body (Signature Blue and White GVB Livery)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 4, w, h - 8);

        // Bottom Blue Stripe
        ctx.fillStyle = '#0284c7'; // GVB Blue
        ctx.fillRect(0, h - 11, w, 7);

        // Dark roof with pantograph
        ctx.fillStyle = '#334155';
        ctx.fillRect(0, 2, w, 5);

        // Tram Windows with commuter silhouettes
        const winW = 14;
        const winH = 10;
        const winGap = 6;
        for (let x = 12; x < w - 18; x += winW + winGap) {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(x, 10, winW, winH);

            // Passenger silhouette inside
            ctx.fillStyle = '#64748b';
            ctx.beginPath();
            ctx.arc(x + winW / 2, 13, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Tram Headlights (Glowing)
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(w - 4, h - 9, 3, 0, Math.PI * 2);
        ctx.fill();

        // Tram Number Sign
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(w - 20, 5, 14, 5);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 5px sans-serif';
        ctx.fillText('4 RAI', w - 18, 9);
    }

    _drawWheel(ctx, cx, cy, radius, rimColor, angle, isFat = false) {
        ctx.save();
        ctx.translate(cx, cy);

        // Tire
        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        // Rim
        ctx.strokeStyle = rimColor;
        ctx.lineWidth = isFat ? 3.5 : 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.72, 0, Math.PI * 2);
        ctx.stroke();

        // Spokes
        ctx.rotate(angle);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-radius * 0.7, 0);
        ctx.lineTo(radius * 0.7, 0);
        ctx.moveTo(0, -radius * 0.7);
        ctx.lineTo(0, radius * 0.7);
        ctx.stroke();

        ctx.restore();
    }

    // Draw Collectible Power-ups
    drawCollectible(ctx, item) {
        ctx.save();
        ctx.translate(item.x, item.y);

        const bob = Math.sin(this.animTime * 6) * 3;
        ctx.translate(0, bob);

        // Glow ring
        ctx.fillStyle = 'rgba(254, 240, 138, 0.35)';
        ctx.beginPath();
        ctx.arc(12, 12, 16, 0, Math.PI * 2);
        ctx.fill();

        if (item.type === 'stroopwafel') {
            // Golden dutch waffle with waffle pattern
            ctx.fillStyle = '#d97706';
            ctx.beginPath();
            ctx.arc(12, 12, 11, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(4, 8); ctx.lineTo(20, 8);
            ctx.moveTo(3, 12); ctx.lineTo(21, 12);
            ctx.moveTo(4, 16); ctx.lineTo(20, 16);
            ctx.moveTo(8, 4); ctx.lineTo(8, 20);
            ctx.moveTo(12, 3); ctx.lineTo(12, 21);
            ctx.moveTo(16, 4); ctx.lineTo(16, 20);
            ctx.stroke();
        } else if (item.type === 'coffee') {
            // Flat White coffee to-go cup with steam
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(7, 8, 10, 12);
            ctx.fillStyle = '#92400e'; // Sleeve
            ctx.fillRect(7, 12, 10, 5);
            ctx.fillStyle = '#e2e8f0'; // Lid
            ctx.fillRect(6, 6, 12, 3);
            // Steam
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(10, 4);
            ctx.quadraticCurveTo(12, 2, 10, 0);
            ctx.stroke();
        } else if (item.type === 'swagsocks') {
            // Jira blue and white striped socks
            ctx.fillStyle = '#0284c7';
            ctx.fillRect(8, 5, 8, 14);
            ctx.fillRect(8, 14, 12, 6);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(8, 7, 8, 2);
            ctx.fillRect(8, 11, 8, 2);
        } else if (item.type === 'headphones') {
            // Noise Canceling Headphones
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(12, 10, 8, Math.PI, 0);
            ctx.stroke();
            ctx.fillStyle = '#0284c7';
            ctx.fillRect(3, 8, 4, 7);
            ctx.fillRect(17, 8, 4, 7);
        } else if (item.type === 'tequila') {
            // Golden Agave Tequila Shot Glass
            // Glass base & body
            ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
            ctx.fillRect(8, 7, 8, 14);
            // Golden Tequila liquid
            ctx.fillStyle = '#eab308';
            ctx.fillRect(9, 10, 6, 10);
            // White salt rim
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(7, 6, 10, 1.5);
            // Fresh green lime wedge clipped on rim
            ctx.fillStyle = '#84cc16';
            ctx.beginPath();
            ctx.arc(6, 6, 5, -Math.PI * 0.6, Math.PI * 0.3);
            ctx.fill();
            ctx.strokeStyle = '#4d7c0f';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        ctx.restore();
    }
}

window.SpriteRenderer = SpriteRenderer;
