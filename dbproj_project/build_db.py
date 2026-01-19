"""Builds an SQLite database from the provided MT CSV files.

Input files (from the ZIP):
- MT Data Set - CUSTOMERS.csv
- MT Data Set - SHOWS.csv
- MT Data Set - ORDERS.csv

Output:
- mt.db (SQLite database)
- tickets_by_show.csv (example output)
- top_customers.csv (example output)

Run:
  python build_db.py
"""

import csv
import os
import sqlite3

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.join(os.path.dirname(BASE_DIR), "dbproj")  # where the CSVs were extracted
DB_PATH = os.path.join(BASE_DIR, "mt.db")

CUSTOMERS_CSV = os.path.join(SRC_DIR, "MT Data Set - CUSTOMERS.csv")
SHOWS_CSV = os.path.join(SRC_DIR, "MT Data Set - SHOWS.csv")
ORDERS_CSV = os.path.join(SRC_DIR, "MT Data Set - ORDERS.csv")

SCHEMA_SQL = os.path.join(BASE_DIR, "schema.sql")


def read_csv(path: str):
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            yield {k.strip(): (v.strip() if isinstance(v, str) else v) for k, v in row.items()}


def main() -> None:
    # Create / reset database
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON;")

    with open(SCHEMA_SQL, "r", encoding="utf-8") as f:
        conn.executescript(f.read())

    # Insert customers
    conn.executemany(
        """
        INSERT INTO customers(customer_id, first_name, last_name, address1, address2, city, province, postcode, country)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        [
            (
                int(r["UID"]),
                r["First Name"],
                r["Last Name"],
                r["Address"],
                r.get("Adress 2") or r.get("Address 2") or "",
                r["City"],
                r["Province/State"],
                r["Postcode"],
                r["Country"],
            )
            for r in read_csv(CUSTOMERS_CSV)
        ],
    )

    # Insert shows
    conn.executemany(
        """
        INSERT INTO shows(show_id, title, author, show_date, show_time)
        VALUES(?, ?, ?, ?, ?)
        """,
        [
            (
                int(r["UID"]),
                r["Title"],
                r["Author"],
                r["Date"],
                r["Time"],
            )
            for r in read_csv(SHOWS_CSV)
        ],
    )

    # Insert orders
    conn.executemany(
        """
        INSERT INTO orders(order_id, customer_id, show_id, qty, price)
        VALUES(?, ?, ?, ?, ?)
        """,
        [
            (
                int(r["UID"]),
                int(r["PEOPLE ID"]),
                int(r["SHOW ID"]),
                int(r["QTY"]),
                float(r["PRICE"]),
            )
            for r in read_csv(ORDERS_CSV)
        ],
    )

    conn.commit()

    # Example outputs to include as "proof" files
    cur = conn.cursor()

    # tickets/revenue per show
    rows = cur.execute(
        """
        SELECT s.show_id, s.title, s.author, s.show_date, s.show_time,
               SUM(o.qty) AS tickets_sold,
               ROUND(SUM(o.qty * o.price), 2) AS revenue
        FROM orders o
        JOIN shows s ON s.show_id = o.show_id
        GROUP BY s.show_id
        ORDER BY tickets_sold DESC, revenue DESC;
        """
    ).fetchall()

    with open(os.path.join(BASE_DIR, "tickets_by_show.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["show_id", "title", "author", "show_date", "show_time", "tickets_sold", "revenue"])
        w.writerows(rows)

    # top customers
    rows = cur.execute(
        """
        SELECT c.customer_id, c.first_name, c.last_name, c.city, c.province,
               SUM(o.qty) AS total_tickets,
               ROUND(SUM(o.qty * o.price), 2) AS total_spent
        FROM orders o
        JOIN customers c ON c.customer_id = o.customer_id
        GROUP BY c.customer_id
        ORDER BY total_tickets DESC, total_spent DESC;
        """
    ).fetchall()

    with open(os.path.join(BASE_DIR, "top_customers.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["customer_id", "first_name", "last_name", "city", "province", "total_tickets", "total_spent"])
        w.writerows(rows)

    conn.close()
    print("Built:", DB_PATH)


if __name__ == "__main__":
    main()
