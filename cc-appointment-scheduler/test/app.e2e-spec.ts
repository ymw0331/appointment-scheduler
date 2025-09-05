import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppointmentScheduler (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/health (GET)', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('database');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('uptime');
        });
    });
  });

  describe('/availability (GET)', () => {
    it('should return available slots for a weekday', () => {
      const monday = '2024-04-01';
      return request(app.getHttpServer())
        .get(`/availability?date=${monday}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('date', monday);
          expect(res.body[0]).toHaveProperty('time');
          expect(res.body[0]).toHaveProperty('available_slots');
        });
    });

    it('should return empty array for weekend', () => {
      const saturday = '2024-04-06';
      return request(app.getHttpServer())
        .get(`/availability?date=${saturday}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(0);
        });
    });

    it('should return 400 for invalid date format', () => {
      return request(app.getHttpServer())
        .get('/availability?date=invalid-date')
        .expect(400);
    });

    it('should return 400 for missing date parameter', () => {
      return request(app.getHttpServer())
        .get('/availability')
        .expect(400);
    });
  });

  describe('/appointments (POST)', () => {
    it('should create an appointment successfully', () => {
      const appointmentData = {
        date: '2024-04-04',
        time: '10:00',
        slots: 1,
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
      };

      return request(app.getHttpServer())
        .post('/appointments')
        .send(appointmentData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('date', appointmentData.date);
          expect(res.body).toHaveProperty('startTime', appointmentData.time);
          expect(res.body).toHaveProperty('slotCount', appointmentData.slots);
          expect(res.body).toHaveProperty('customerName', appointmentData.customerName);
        });
    });

    it('should return 400 for misaligned time', () => {
      const appointmentData = {
        date: '2024-04-04',
        time: '10:15',
        slots: 1,
      };

      return request(app.getHttpServer())
        .post('/appointments')
        .send(appointmentData)
        .expect(400);
    });

    it('should return 400 for invalid date format', () => {
      const appointmentData = {
        date: 'invalid-date',
        time: '10:00',
        slots: 1,
      };

      return request(app.getHttpServer())
        .post('/appointments')
        .send(appointmentData)
        .expect(400);
    });

    it('should return 400 for invalid time format', () => {
      const appointmentData = {
        date: '2024-04-04',
        time: '25:00',
        slots: 1,
      };

      return request(app.getHttpServer())
        .post('/appointments')
        .send(appointmentData)
        .expect(400);
    });

    it('should return 400 for weekend booking', () => {
      const appointmentData = {
        date: '2024-04-06',
        time: '10:00',
        slots: 1,
      };

      return request(app.getHttpServer())
        .post('/appointments')
        .send(appointmentData)
        .expect(400);
    });

    it('should return 400 for out of hours booking', () => {
      const appointmentData = {
        date: '2024-04-04',
        time: '08:00',
        slots: 1,
      };

      return request(app.getHttpServer())
        .post('/appointments')
        .send(appointmentData)
        .expect(400);
    });
  });

  describe('/config (GET)', () => {
    it('should return current configuration', () => {
      return request(app.getHttpServer())
        .get('/config')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('slotDurationMinutes');
          expect(res.body).toHaveProperty('maxSlotsPerAppointment');
          expect(res.body).toHaveProperty('operationalDays');
          expect(res.body).toHaveProperty('operationalStartTime');
          expect(res.body).toHaveProperty('operationalEndTime');
        });
    });
  });

  describe('/config (PUT)', () => {
    it('should update configuration', () => {
      const updates = {
        slotDurationMinutes: 15,
        maxSlotsPerAppointment: 3,
      };

      return request(app.getHttpServer())
        .put('/config')
        .send(updates)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('slotDurationMinutes', 15);
          expect(res.body).toHaveProperty('maxSlotsPerAppointment', 3);
        });
    });

    it('should return 400 for invalid slot duration', () => {
      const updates = {
        slotDurationMinutes: 3,
      };

      return request(app.getHttpServer())
        .put('/config')
        .send(updates)
        .expect(400);
    });
  });
});