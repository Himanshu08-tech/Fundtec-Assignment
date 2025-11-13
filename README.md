# Fundtec-Assignment
# Lotwise Portfolio Tracker

A simple portfolio trade tracker using FIFO lots:
- Buy (qty > 0) → creates a new lot
- Sell (qty < 0) → closes earliest open lots (FIFO), logs lot fills, and updates realized P&L
- Views for open positions and realized P&L

Stack
- Backend: Node.js (Express), Postgres, KafkaJS (producer)
- Worker: Node.js (KafkaJS consumer), Postgres (FIFO matching)
- Frontend: Next.js
- Infra: Docker Compose (Postgres, Kafka, ZooKeeper, Kafka UI)

---

## Monorepo structure

├─ apps/
│ ├─ backend/
│ │ ├─ src/server.js
│ │ ├─ scripts/migrate.js
│ │ ├─ migrations.sql
│ │ ├─ .env.example
│ │ └─ package.json
│ │
│ ├─ worker/
│ │ ├─ src/worker.js
│ │ ├─ .env.example
│ │ └─ package.json
│ │
│ └─ frontend/
│ ├─ pages/index.js
│ ├─ pages/trade.js
│ ├─ pages/positions.js
│ ├─ pages/pnl.js
│ ├─ .env.local.example
│ └─ package.json
│
└─ infra/
├─ docker-compose.yml # Postgres + Kafka + ZooKeeper + Kafka UI
└─ (optional data volumes)


## Architecture
[ Next.js UI ] → [ Express API ]
Trade form - POST /trades → insert + publish to Kafka (key = symbol)
Positions - GET /positions → open lots + avg cost
P&L - GET /pnl → realized P&L summary
│
▼
[ Kafka topic: trades ]
│
▼
[ Worker (consumer) ]
- FIFO lot matching
- Updates lots, lot_fills, realized summary
│
▼
[ DB ]

Why Kafka?
- Decouples ingestion from a stateful matcher
- Per-symbol ordering by using Kafka key = symbol

---

## Prerequisites

- Docker Desktop (with Docker Compose)
- Node.js 18+ (npm included). Yarn optional.
- Ports: 5432 (Postgres), 29092 (Kafka), 8080 (Kafka UI), 4000 (API), 3000 (Frontend)

---

## Run locally (Windows/macOS/Linux)

1) Start infra

cd infra
docker compose up -d
# Kafka UI → http://localhost:8080 (wait until it’s up)
Backend API

cd ../apps/backend

# Create .env from example
# Windows CMD:
copy /Y .env.example .env
# PowerShell:
# Copy-Item .env.example .env
# macOS/Linux:
# cp .env.example .env

npm install
npm run migrate   # applies migrations.sql
npm run dev       # http://localhost:4000

Worker

cd ../worker
# Create .env from example (same copy command as above)
npm install
npm start         # "Consumer has joined the group" → OK

Frontend

cd ../frontend
# Create .env.local from example
# Windows CMD:
copy /Y .env.local.example .env.local
# macOS/Linux:
# cp .env.local.example .env.local

npm install
npm run dev       # http://localhost:3000

Notes

Use docker compose (with a space). If you typed docker-compose, switch to docker compose.
If you posted trades before starting the worker, re-send them (consumer starts from latest by default).


Data model
Tables (simplified)

trades
id (uuid PK), symbol, qty (numeric), price (numeric), trade_time, created_at, processed_at (set by worker)
lots
id (bigserial PK), symbol, buy_trade_id (FK→trades), qty_initial, qty_open, price, created_at
lot_fills
id (bigserial PK), lot_id (FK→lots), sell_trade_id (FK→trades), symbol, qty, buy_price, sell_price, pnl, created_at
realized_pnl_by_symbol
symbol (PK), realized_qty, realized_pnl, last_sell_trade_time

Indexes

trades(symbol, trade_time)
lots(symbol) where qty_open > 0
lot_fills(symbol, sell_trade_id)
Numeric types

qty, price, pnl: numeric(20,6) to avoid float rounding issues

Relationships

Each BUY trade creates one lot
SELL trades generate multiple lot_fills (1-to-many) while consuming qty_open from older lots
realized_pnl_by_symbol is an upserted aggregate over lot_fills



FIFO matching (worker):

Consume trades by topic key = symbol → per-symbol order guaranteed
For BUY (qty > 0):
Insert a new lot with qty_open = qty at buy price
For SELL (qty < 0):
remaining = -qty
SELECT open lots for symbol ORDER BY id ASC FOR UPDATE (FIFO)
For each lot:
matchQty = min(remaining, lot.qty_open)
Insert lot_fill(lot_id, sell_trade_id, qty, buy_price, sell_price, pnl)
Update lot.qty_open -= matchQty
realized_pnl += (sell_price − buy_price) × matchQty
remaining -= matchQty
If remaining > 0 → insufficient inventory (transaction rolled back)
Upsert realized_pnl_by_symbol with realized_qty and realized_pnl deltas
Idempotency:
Worker locks the trade row FOR UPDATE; if processed_at is already set, it skips
On success, sets processed_at = now()


Deployment link:
Fe: https://fundtec-assignment-r6nq.vercel.app/
Be: https://fundtec-assignment-backend.onrender.com
Database : https://supabase.com/dashboard/project/gfrxrcyoroypxowlrzcp/sql/61b5cceb-35a7-4ba3-b63c-abf81a306bf8
