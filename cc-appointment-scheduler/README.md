# Appointment Scheduler API

A production-ready appointment scheduling system built with NestJS, TypeScript, MikroORM, and PostgreSQL. Designed for Money Max's MIS interview assignment, this API demonstrates enterprise-grade architecture and best practices.

## Overview

This system provides a comprehensive appointment scheduling solution inspired by platforms like Calendly and Google Appointments. It features dynamic slot availability, configurable business hours, multi-slot bookings, and administrative controls for managing days off and unavailable windows.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌───────────────┐
│   Client Apps   │────▶│   NestJS API     │────▶│  PostgreSQL   │
│  (Web/Mobile)   │     │   + MikroORM     │     │   Database    │
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
├── modules/
│   ├── availability/      # Slot availability calculation
│   ├── appointments/      # Booking management & validation
│   ├── config/           # Runtime configuration
│   ├── admin-days-off/   # Holiday/closure management
│   ├── admin-unavailable/# Unavailable window management
│   └── health/           # Health check endpoint
├── common/
│   ├── filters/          # Global exception handling
│   ├── interceptors/     # Request logging
│   └── utils/            # Time manipulation utilities
└── database/             # Migrations and seeding
```

## Features

- **Dynamic Slot Generation**: Configurable slot duration (5-60 minutes)
- **Multi-Slot Bookings**: Book 1-5 contiguous slots per appointment
- **Flexible Configuration**: Runtime-adjustable operational hours and days
- **Collision Detection**: Prevents double-booking with atomic validation
- **Admin Controls**: Manage holidays and recurring unavailable windows
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Production Ready**: Rate limiting, logging, error handling, health checks

## Quick Start

### Prerequisites

- Node.js 20+ and npm
- Docker and Docker Compose
- PostgreSQL (via Docker)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd appointment-scheduler

# Copy environment variables
cp .env.example .env

# Start PostgreSQL
docker-compose up -d

# Install dependencies
npm install

# Run database migrations
npm run db:migrate

# Seed initial data
npm run db:seed

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

## API Endpoints

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

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST/PUT/DELETE | `/admin/days-off` | Manage holidays |
| GET/POST/PUT/DELETE | `/admin/unavailable` | Manage unavailable windows |

## Example Requests

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

### Update Configuration

```bash
curl -X PUT "http://localhost:3000/config" \
  -H "Content-Type: application/json" \
  -d '{
    "slotDurationMinutes": 15,
    "maxSlotsPerAppointment": 3
  }'
```

## Business Rules

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

4. **Configuration Priority**:
   - Database config → Environment variables → Defaults
   - Runtime updates via API override environment settings

## Testing

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

### Test Coverage

- **Availability Service**: Slot generation, unavailable windows, capacity tracking
- **Appointments Service**: Booking validation, collision detection, multi-slot handling
- **Config Service**: Runtime updates, validation, caching
- **E2E Tests**: Full API flow, error handling, edge cases

## Development

```bash
# Start with watch mode
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Format code
npm run format

# Generate migration
npm run db:migrate:create
```

## Production Deployment

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
DATABASE_URL=postgresql://user:pass@host:5432/db
SLOT_DURATION_MINUTES=30
MAX_SLOTS_PER_APPOINTMENT=1
OPERATIONAL_DAYS=1,2,3,4,5
OPERATIONAL_START=09:00
OPERATIONAL_END=18:00
```

## Technical Decisions

### Why MikroORM?
- Type-safe queries with TypeScript
- Built-in migration system
- Entity metadata reflection
- Excellent NestJS integration

### Why 30-minute default slots?
- Industry standard for appointments
- Balances flexibility with efficiency
- Easily divisible into hours

### Time Handling
- Server-local time (no timezone complexity)
- ISO 8601 date format (YYYY-MM-DD)
- 24-hour time format (HH:mm)
- Minutes from midnight for calculations

### Collision Detection Strategy
- Atomic database operations
- Range overlap checking
- Pre-validation before persistence

## Assumptions

1. **Single Capacity**: Each slot has capacity of 1 (no parallel bookings)
2. **Local Time**: All times are server-local (timezone handling out of scope)
3. **No Authentication**: Security layer to be added separately
4. **Synchronous Processing**: No queue/async job processing needed

## Future Enhancements

- [ ] User authentication & authorization
- [ ] Email notifications
- [ ] Recurring appointments
- [ ] Multiple resource/staff scheduling
- [ ] Timezone support
- [ ] Webhook integrations
- [ ] Analytics dashboard
- [ ] Mobile app SDK

## Performance Considerations

- Configuration caching reduces database queries
- Indexed date/time fields for fast lookups
- Connection pooling for database efficiency
- Rate limiting prevents abuse
- Efficient slot calculation algorithms

## Security Features

- Helmet.js for security headers
- Rate limiting on booking endpoints
- Input validation with class-validator
- SQL injection protection via parameterized queries
- CORS configuration

## Monitoring

- Health endpoint for uptime monitoring
- Structured logging with request IDs
- Error tracking with stack traces
- Database connection status

## License

MIT

## Author

Wayne Yong

---

Built for Money Max MIS Interview Assignment | NestJS + TypeScript + PostgreSQL