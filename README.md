# Where To? 🍽️

A cost-optimized restaurant recommendation MVP for Mumbai.

## Architecture

```
where-to/
├── backend/          # Express + Mongoose API
└── frontend/         # Nuxt 3 + Tailwind CSS
```

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`)

### 1. Start the backend

```bash
cd backend
cp .env.example .env    # fill in GOOGLE_PLACES_API_KEY if you have one
npm install
npm run seed            # loads 40 Mumbai restaurants into MongoDB
npm run dev             # starts on http://localhost:3001
```

### 2. Start the frontend

```bash
cd frontend
npm install
npm run dev             # starts on http://localhost:3000
```

Open http://localhost:3000 and enjoy.

---

## API

### `POST /api/recommendations`
```json
{ "lat": 19.0551, "lng": 72.8283, "mood": "date", "budget": 3 }
```

Moods: `date` | `chill` | `work` | `quick`  
Budget: `1` (budget) → `4` (fine dining)

### `POST /api/feedback`
```json
{ "anonymousId": "uuid", "restaurantId": "mongo-id", "liked": true }
```

---

## How the Recommendation Engine Works

1. **Bounding box query** — Pull restaurants within ~5 km from MongoDB (no API call)
2. **Haversine filter** — Exact distance filtering (removes bounding box corners)
3. **Budget filter** — Allow ±1 price tier tolerance
4. **Weighted scoring**:
   - 35% vibe match (mood → vibe scores)
   - 25% distance (closer = higher score)
   - 20% budget match
   - 15% rating
   - 5% priority boost (admin > curated > google)
5. Return top 5

## Google Places Ingestion

The `/api/recommendations` endpoint checks if there are **zero results** in the DB for the area. Only then does it call Google Places API. Strict filters: rating ≥ 4.5, reviews ≥ 200.

Add your `GOOGLE_PLACES_API_KEY` to `backend/.env` to enable this fallback.
