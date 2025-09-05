# TypeORM Appointment Scheduler API

A production-ready appointment scheduling system built with NestJS, TypeScript, TypeORM, and PostgreSQL. This implementation demonstrates enterprise-grade architecture using TypeORM's powerful features for the Money Max MIS interview assignment.

## 🚀 Overview

This system provides a comprehensive appointment scheduling solution with dynamic slot availability, configurable business hours, multi-slot bookings, and administrative controls. It's built using TypeORM instead of MikroORM, leveraging the repository pattern and TypeORM's robust query builder.

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌───────────────┐
│   Client Apps   │────▶│   NestJS API     │────▶│  PostgreSQL   │
│  (Web/Mobile)   │     │   + TypeORM      │     │   Database    │
└─────────────────┘     └──────────────────┘     └───────────────┘
         │                       │                        │
         │                       ▼                        │
         │              ┌──────────────────┐             │
         └─────────────▶│   Swagger Docs   │◀────────────┘
                        └──────────────────┘
```

### Module Structure

```
src/
├── config/               # TypeORM and database configuration
├── entities/            # TypeORM entities
├── modules/
│   ├── availability/    # Slot availability calculation
│   ├── appointments/    # Booking management & validation
│   ├── config/         # Runtime configuration
│   └── health/         # Health check endpoint
├── common/
│   ├── filters/        # Global exception handling
│   ├── interceptors/   # Request logging
│   └── utils/          # Time manipulation utilities
├── migrations/         # TypeORM migrations
└── seeds/             # Database seeding
```

## ✨ Features

- **Dynamic Slot Generation**: Configurable slot duration (5-60 minutes)
- **Multi-Slot Bookings**: Book 1-5 contiguous slots per appointment
- **Flexible Configuration**: Runtime-adjustable operational hours and days
- **Collision Detection**: Prevents double-booking with database transactions
- **TypeORM Repository Pattern**: Clean data access layer
- **Query Builder**: Complex queries with TypeORM's powerful query builder
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Production Ready**: Rate limiting, logging, error handling, health checks

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm
- Docker and Docker Compose
- PostgreSQL (via Docker)

### Installation

```bash
# Clone or navigate to the directory
cd cc-typeorm-app-scheduler

# Copy environment variables
cp .env.example .env

# Start PostgreSQL
docker-compose up -d

# Install dependencies
npm install

# Generate and run migrations
npm run migration:generate -- -n InitialMigration
npm run migration:run

# Seed initial data
npm run seed

# Start development server
npm run dev
```

The API will be available at `http://localhost:3000` with Swagger docs at `http://localhost:3000/docs`.

### Using Make (Alternative)

```bash
make install    # Install deps and setup env
make db-up      # Start database
make migrate    # Run migrations
make seed       # Seed database
make dev        # Start dev server
```

## 📚 API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/availability?date=YYYY-MM-DD` | Get available slots |
| POST | `/appointments` | Book appointment |
| DELETE | `/appointments/:id` | Cancel appointment |
| GET | `/appointments?date=YYYY-MM-DD` | List appointments |

### Configuration

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/config` | Get current configuration |
| PUT | `/config` | Update configuration |

## 📝 Example Requests

### Check Availability

```bash
curl -X GET "http://localhost:3000/availability?date=2024-04-04"
```

Response:
```json
[
  { "date": "2024-04-04", "time": "09:00", "available_slots": 1 },
  { "date": "2024-04-04", "time": "09:30", "available_slots": 1 },
  { "date": "2024-04-04", "time": "10:00", "available_slots": 0 },
  { "date": "2024-04-04", "time": "10:30", "available_slots": 1 }
]
```

### Book Appointment

```bash
curl -X POST "http://localhost:3000/appointments" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-04-04",
    "time": "10:30",
    "slots": 2,
    "customerName": "John Doe",
    "customerEmail": "john@example.com"
  }'
```

## 📋 Business Rules

1. **Default Configuration**:
   - 30-minute slots
   - Weekdays only (Mon-Fri)
   - 09:00-18:00 operational hours
   - 1 slot per appointment (configurable 1-5)

2. **Availability Calculation**:
   - Excludes weekends and days off
   - Subtracts unavailable windows (e.g., lunch breaks)
   - Shows real-time capacity (0 = booked, 1 = available)

3. **Booking Validation**:
   - Time must align to slot grid
   - Within operational hours
   - No collision with existing appointments
   - Multi-slot bookings must be contiguous

## 🔧 TypeORM Features Used

- **Repository Pattern**: Clean separation of data access logic
- **Query Builder**: Complex queries for availability calculation
- **Transactions**: Atomic booking operations with pessimistic locking
- **Migrations**: Version-controlled database schema
- **Entity Decorators**: Type-safe entity definitions
- **Relations**: Efficient data loading strategies
- **Indexes**: Performance optimization for frequent queries

## 🧪 Testing

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# E2E tests
npm run test:e2e

# Coverage report
npm run test:cov
```

## 🚢 Production Deployment

```bash
# Build for production
npm run build

# Start production server
npm run start:prod
```

### Environment Variables

```env
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=appointments_typeorm
SLOT_DURATION_MINUTES=30
MAX_SLOTS_PER_APPOINTMENT=1
OPERATIONAL_DAYS=1,2,3,4,5
OPERATIONAL_START=09:00
OPERATIONAL_END=18:00
```

## 🎯 TypeORM vs MikroORM

### Why TypeORM for this project?
- **Mature Ecosystem**: Extensive documentation and community support
- **Repository Pattern**: Built-in repository pattern for clean architecture
- **Query Builder**: Powerful and intuitive query building
- **Migration System**: Robust migration generation and management
- **Active Development**: Regular updates and improvements

### Key Differences in Implementation
- Uses `Repository<Entity>` instead of `EntityManager`
- Decorators: `@Entity`, `@Column`, `@PrimaryGeneratedColumn`
- Built-in support for transactions with query runners
- More explicit relation handling
- Better IDE support and TypeScript integration

## 📊 Performance Optimizations

- Connection pooling (30 connections max)
- Database indexes on frequently queried fields
- Query result caching for configuration
- Pessimistic locking for concurrent bookings
- Efficient query building with minimal joins

## 🔒 Security Features

- Helmet.js for security headers
- Rate limiting on booking endpoints (100 req/min)
- Input validation with class-validator
- SQL injection protection via parameterized queries
- CORS configuration
- Environment-based configuration

## 📈 Monitoring

- Health endpoint with database connectivity check
- Structured logging with request correlation IDs
- Error tracking with detailed stack traces
- Request/response time logging
- Database query logging in development

## 🛠️ Development Tools

- **TypeORM CLI**: Migration generation and execution
- **Swagger UI**: Interactive API documentation
- **Docker Compose**: Local PostgreSQL instance
- **Makefile**: Common development tasks
- **Husky**: Git hooks for code quality

## 📝 Assumptions

1. **Single Capacity**: Each slot has capacity of 1
2. **Local Time**: All times are server-local
3. **No Authentication**: Security layer to be added separately
4. **Synchronous Processing**: No queue/async job processing

## 🚀 Future Enhancements

- [ ] User authentication & authorization
- [ ] Email notifications
- [ ] Recurring appointments
- [ ] Multiple resource/staff scheduling
- [ ] Timezone support
- [ ] Webhook integrations
- [ ] GraphQL API
- [ ] Redis caching

## 📄 License

MIT

## 👤 Author

Wayne Yong

---

Built for Money Max MIS Interview Assignment | NestJS + TypeORM + PostgreSQL

**TypeORM Implementation** - Demonstrating enterprise-grade architecture with TypeORM's powerful features