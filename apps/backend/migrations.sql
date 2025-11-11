-- Enable UUID in Node; we pass UUID from app. No DB extension required.

create table if not exists trades (
  id uuid primary key,
  symbol text not null,
  qty numeric(20,6) not null check (qty <> 0),
  price numeric(20,6) not null check (price > 0),
  trade_time timestamptz not null,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists idx_trades_symbol_time on trades(symbol, trade_time);

create table if not exists lots (
  id bigserial primary key,
  symbol text not null,
  buy_trade_id uuid not null references trades(id) on delete restrict,
  qty_initial numeric(20,6) not null check (qty_initial > 0),
  qty_open numeric(20,6) not null check (qty_open >= 0),
  price numeric(20,6) not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_lots_symbol_open on lots(symbol, id) where qty_open > 0;
create unique index if not exists uidx_lots_buy_trade on lots(buy_trade_id);

create table if not exists lot_fills (
  id bigserial primary key,
  lot_id bigint not null references lots(id) on delete cascade,
  sell_trade_id uuid not null references trades(id) on delete restrict,
  symbol text not null,
  qty numeric(20,6) not null check (qty > 0),
  buy_price numeric(20,6) not null,
  sell_price numeric(20,6) not null,
  pnl numeric(20,6) not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_lot_fills_symbol_trade on lot_fills(symbol, sell_trade_id);

create table if not exists realized_pnl_by_symbol (
  symbol text primary key,
  realized_qty numeric(20,6) not null default 0,
  realized_pnl numeric(20,6) not null default 0,
  last_sell_trade_time timestamptz
);