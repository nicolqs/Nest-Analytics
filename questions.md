## Task 1 Bonus

#### Bonus: Propose a method for streaming tap data in real-time to the frontend.

### Server-Sent Events (SSE)

Since the client is only consuming data from the server, SSE is a great candidate for streaming tap data in real-time.

View code example in `bonus/` folder and load [http://localhost:3000/](http://localhost:3000/)

Pros:

- Server-Sent Events allow the server to push updates to the client over HTTP
- SSE is simpler than WebSockets as it uses standard HTTP connections

Some weaknesses:

- One-way communication: Clients can't send data to the server
- SSE require the client to re-establish a broken connection

## Task 2 Questions

### Discuss any potential modifications to your design for handling 1 billion or even 100 billion tap records.

1. In case the dataset grows significantly, I would consider partitioning and sharding the tables:

- Partitioning divides a table into smaller, more manageable pieces
- Create Partitioned Tables, following the Range Partitioning strategy: we can divide into partitions based date ranges. That way we can have fast queries for specific interval
- Sharding distributes data across multiple database instances, spreading the load

Keep in mind: Always Monitor Performance and create a plan to consider Data Growth (eg. to avoid costly reconfiguration.)

2. **TimescaleDB: PostgreSQL for time series and events**

- This particular challenge is only focused on Tap event records over time: perfect candidate for a **Time series Database**
- TimescaleDB hash a really high data ingest rate. The Data compression algorithm can make the DB much more efficient (at 1B+ row scale)
- One of their main feature is Hypertables: partition data by a time interval column. Which automatically create new partitions at any interval you want to use

Found this article on [How We Scaled PostgreSQL to 350 TB+ (With 10B New Records/Day)](https://www.timescale.com/blog/how-we-scaled-postgresql-to-350-tb-with-10b-new-records-day/)

### Explore how you would adapt your design to achieve sub 50ms response times.

Achieving sub-50ms requires to look at the entire stack:

1. Look at existing code and infra

- Refactor and synchronous code into Asynchronous code: non-blocking I/O operations
- DB optimization: schema, index, queries: EXPLAIN ANALYZE
- Define and use great cache strategies: write-through, lazy cache, LRU caching
- Scalable infrastructure: auto scaling policies
- Use an APM like Datadog to indentify slow queries, bottlenecks, P99 ..

2. Cron jobs / workers to cache aggregated results on a specific cadence

Find patterns of how our users are looking at the data. Based on the main 4 search params: startDate endDate interval teamId, we can see which are queried the most together and therefor have workers with smart strategies to build aggregated cached results.

Suggestion: To start with, we can cache past 7 days (which cover Today and Yesterday filters) for active teams that have queried the API in the past week.

_Note_: Trade off with application cache, computed results could be stored in Materialized Views. They are faster in case of cache miss (that would re-run the entire DB query)
