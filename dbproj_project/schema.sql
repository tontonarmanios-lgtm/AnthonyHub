-- MT Theatre Tickets Database (SQLite)
-- Relational schema built from the provided CSV files.

DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS shows;
DROP TABLE IF EXISTS customers;

CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY,
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  address1    TEXT,
  address2    TEXT,
  city        TEXT,
  province    TEXT,
  postcode    TEXT,
  country     TEXT
);

CREATE TABLE shows (
  show_id   INTEGER PRIMARY KEY,
  title     TEXT NOT NULL,
  author    TEXT,
  show_date TEXT,
  show_time TEXT
);

CREATE TABLE orders (
  order_id    INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  show_id     INTEGER NOT NULL,
  qty         INTEGER NOT NULL CHECK (qty >= 0),
  price       REAL    NOT NULL CHECK (price >= 0),
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
  FOREIGN KEY (show_id)     REFERENCES shows(show_id)
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_show     ON orders(show_id);
