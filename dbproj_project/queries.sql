-- Example queries for the MT Theatre Tickets database

-- Q1) Tickets sold and revenue per show (most tickets first)
SELECT
  s.show_id,
  s.title,
  s.author,
  s.show_date,
  s.show_time,
  SUM(o.qty) AS tickets_sold,
  ROUND(SUM(o.qty * o.price), 2) AS revenue
FROM orders o
JOIN shows s ON s.show_id = o.show_id
GROUP BY s.show_id
ORDER BY tickets_sold DESC, revenue DESC;

-- Q2) Top customers by total tickets purchased
SELECT
  c.customer_id,
  c.first_name,
  c.last_name,
  c.city,
  c.province,
  SUM(o.qty) AS total_tickets,
  ROUND(SUM(o.qty * o.price), 2) AS total_spent
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
GROUP BY c.customer_id
ORDER BY total_tickets DESC, total_spent DESC;

-- Q3) Which authors sold the most tickets?
SELECT
  s.author,
  SUM(o.qty) AS tickets_sold,
  ROUND(SUM(o.qty * o.price), 2) AS revenue
FROM orders o
JOIN shows s ON s.show_id = o.show_id
GROUP BY s.author
ORDER BY tickets_sold DESC, revenue DESC;

-- TEMPLATE: Paste your assignment question here and write the query below.
-- Example: "Which show date had the highest total revenue?"
-- Write your query below this line:
-- SELECT ...;
