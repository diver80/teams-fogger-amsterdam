# 🇳🇱 Amsterdam Fogger: Team '26 Edition

> **Hotel to RAI Amsterdam:** Can your consultants survive Europe's wildest morning bike rush to reach the Atlassian conference keynote?

A fast, funny, retro-arcade Frogger-style game built for attendees of **Atlassian Team '26 in Amsterdam**.

---

## 🎮 Play Online

Once deployed to GitHub Pages, the live game is available at:
👉 **[https://diver80.github.io/teams-fogger-amsterdam/](https://diver80.github.io/teams-fogger-amsterdam/)**

---

## 📖 The Story

It's 08:30 AM in Amsterdam. You and your fellow consultants are walking from your hotel to the **RAI Amsterdam Convention Centre** where the Atlassian conference keynote is about to start.

Between your coffee cup and the RAI badge scanners lies Amsterdam's infamous multi-lane cycling gauntlet:
- **Lane 1 (Omafiets):** Casual black city bikes with wicker baskets and rusty bells. Slow and predictable.
- **Lane 2 (Swapfiets):** Office commuters with signature light blue front tires.
- **Lane 3 (Bakfietsen):** Heavyweight wooden cargo trikes carrying 2 kids, a dog, and groceries! Extra-wide hitbox.
- **Central Refuge Island:** Cobblestones, blooming tulip boxes, and Amsterdam flag posts. Watch out for the **GVB Tram Line 4** dinging across the tracks!
- **Lane 4 (Food Couriers):** Thuisbezorgd & Flink riders with glowing orange backpacks darting through traffic.
- **Lane 5 (Fatbikes & VanMoofs):** Sleek high-speed electric fatbikes zooming at 40+ km/h with bright LED beams.
- **Lane 6 (MAMIL Lycra Racers):** Supersonic peloton riders in neon jerseys shouting *"PAS OP!"* at Mach 1!
- **Destination (RAI Amsterdam):** 5 conference gates to secure (Keynote Hall, Jira Service Hub, Confluence Lounge, Loom Studio, and Rovo AI Arena)!

Fill all 5 check-in bays to complete the stage and advance to the next rush hour slot!

---

## 🕹️ Controls

| Platform | Controls |
| :--- | :--- |
| **Desktop / Laptop** | Arrow Keys <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> or <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> |
| **Special Skill** | <kbd>Space</kbd> (Jira Admin: Sprint Blocker - freezes traffic for 2.8s) |
| **Mobile / Tablet** | On-screen Virtual D-Pad buttons or Touch Swipes anywhere on screen |
| **Audio** | Sound toggle button in the top HUD (Web Audio API procedural sound engine) |

---

## 🧑‍💼 Playable Consultant Classes

1. **The Agile Coach 🧘**
   - Birkenstocks, linen pants, sticky notes.
   - *Perk:* Quick Agile Pivot (Faster hop recovery time).
2. **The Jira Admin 💻**
   - Dark mode hoodie, backpack, glowing laptop.
   - *Perk:* Sprint Blocker (Freeze traffic for 2.8 seconds once per life with <kbd>Space</kbd> or on-screen button).
3. **The Enterprise Architect 👔**
   - Navy blazer, conference lanyard, coffee cup.
   - *Perk:* +25% Bonus Points on every successful RAI check-in.

---

## 🧇 Collectibles & Power-ups

- 🧇 **Warm Stroopwafel:** +200 bonus points!
- ☕ **Flat White Coffee:** +100 points and a 5-second caffeine sprint boost!
- 🧦 **Atlassian Swag Socks:** +500 points!
- 🎧 **Noise-Canceling Headphones:** Grants an active shield absorbing 1 bike scrape!

---

## 🚀 Publishing to GitHub Pages (`diver80`)

This repository is already configured with zero dependencies and a GitHub Actions workflow ready to publish in minutes.

### Step 1: Initialize Git and Commit
In your terminal inside this project folder:

```bash
git init
git add .
git commit -m "feat: Amsterdam Fogger - Team '26 Edition for GitHub Pages"
git branch -M main
```

### Step 2: Create Repository on GitHub
1. Go to [https://github.com/new](https://github.com/new) under your account `diver80`.
2. Name the repository: `teams-fogger-amsterdam` (or any name you prefer).
3. Leave it Public and do not initialize with README (we already have it).

### Step 3: Push to GitHub
```bash
git remote add origin https://github.com/diver80/teams-fogger-amsterdam.git
git push -u origin main
```

### Step 4: Enable GitHub Pages
1. Go to your repository on GitHub: `https://github.com/diver80/teams-fogger-amsterdam`
2. Click **Settings** ➡️ **Pages** (under Code and automation in the left sidebar).
3. Under **Build and deployment** > **Source**:
   - Select **GitHub Actions** (the included `.github/workflows/deploy.yml` will automatically build and publish).
   - *Or* select **Deploy from a branch** > branch `main` > `/ (root)` > Click **Save**.
4. Within 1 minute, your game will be live at:
   `https://diver80.github.io/teams-fogger-amsterdam/`!

---

## 🛠️ Tech Stack

- **Zero External Dependencies:** 100% vanilla HTML5, CSS3, and JavaScript.
- **Canvas 2D Engine:** High-performance, crisp high-DPI procedural rendering with animated cyclists, spinning spokes, pedestrian crowds, tram lines, and Amsterdam canals.
- **Web Audio API:** 100% synthesized procedural sound effects (realistic two-tone Dutch bicycle bells, GVB tram bells, crash clatter, hops, and an 8-bit retro chiptune soundtrack) with zero external asset loading delay.
- **Mobile Friendly:** Fully responsive viewport with virtual D-Pad and swipe gestures.
