# Tap Analytics

Requirements:
- Allow users to aggregate data by interval (e.g. daily, weekly, monthly tap counts)
- Allow users to specify a date range
- Should require an API key to access
    - API keys should belong to a team, and should only be able to access taps from that team’s tags
- A rate limit of 100 queries per hour for API consumers.
- *Bonus:* Propose a method for streaming tap data in real-time to the frontend.


## Installation

⚠️ Requires Docker installed on your machine

```bash
docker compose up -d
docker exec -it nest-backend pnpm run seed
# Copy an API Key from the script logs
```

Example request to endpoint

```bash
curl --request POST \
  --url http://localhost:3000/v1/api/tap/analytics \
  --header 'Content-Type: application/json' \
  --header 'x-api-key: <API_KEY>' \
  --data '{
	"startDate": "2023-01-01",
	"endDate": "2023-12-22",
	"interval": "week"
}'
```

### Technology and Tools

- NestJS
- Typescript
- TypeOrm
- PostgreSQL
- Docker

### System Diagram

<p align="center">
  <img src="https://i.ibb.co/TWTdHY9/Screenshot-2024-03-14-at-16-17-14.png" width="500" alt="Diagram" />
</p>

### Task 1 considerations

#### Stack choices

_NestJS_

- Features & functionalities out of the box (e.g: Api Guard, Rate Limiter, ORM support etc..)
- TypeScript for type safety
- Provides a Full Stack Typescript environment when working with React frontends

_PostgreSQL_

- In Postgres we trust :)
- Relational database given the CSV data and relationship between Taps and Tags
- Highly scalable, porformant and reliable. Can handle complexe queries (like the one we're using in this project in tap-analytics.service.ts)
- Easy to set up and is suitable for use in large-scale systems that require high read and write speeds

_In-memory_ caching

- Simplicity of use and speed are the most important.
- Manage load spikes by reducing the number of DB hits, improving scalability
- Reduce endpoint response time to a single digit ms

#### Api Key management

Since the API requires an API key to be accessed, I went ahead and created an api_key table. A few API Keys are generated with the seed script, and are displayed in the script logs. That will be the only time you can access the plain text key. I would usually use a dedicated Secrets Manager service on a major Cloud provider (like AWS SSM and KMS). But for this challenge I wanted to have a minimum level of security by storing the API Key in a hashed form.

## Project Structure

```tap-analytics
├── data               // the CSV files to seed the DB
├── package.json
├── src                // Nest App
    ├── bonus          // Live example for the bonus question
    ├── config         // Datasource config
    ├── dto
    ├── entities       // TypeOrm models
    ├── services
        ├── guard      // Validate/Authorize Api Key for endpoint
        ├── hashing    // Hash keys
        ├── seed       // Seed DB
        ├── analytics  // Business logic for Tap Analytics
    ├── utils
├── docker-compose.yml
├── Dockerfile
├── questions.md        // Task 2 - Answer these questions
```
