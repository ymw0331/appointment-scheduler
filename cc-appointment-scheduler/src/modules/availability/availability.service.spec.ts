import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/postgresql';
import { AvailabilityService } from './availability.service';
import { ConfigService } from '../config/config.service';
import { TimeUtils } from '../../common/utils/time.utils';

describe('AvailabilityService', () => {
  let service: AvailabilityService;
  let em: EntityManager;
  let configService: ConfigService;

  const mockEntityManager = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockConfigService = {
    getEffectiveConfig: jest.fn().mockResolvedValue({
      slotDurationMinutes: 30,
      maxSlotsPerAppointment: 1,
      operationalDays: [1, 2, 3, 4, 5],
      operationalStartTime: '09:00',
      operationalEndTime: '18:00',
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvailabilityService,
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AvailabilityService>(AvailabilityService);
    em = module.get<EntityManager>(EntityManager);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAvailability', () => {
    it('should return available slots for a weekday', async () => {
      const date = '2024-04-04';
      mockEntityManager.findOne.mockResolvedValue(null);
      mockEntityManager.find
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await service.getAvailability(date);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('date', date);
      expect(result[0]).toHaveProperty('time');
      expect(result[0]).toHaveProperty('available_slots', 1);
    });

    it('should return empty array for weekend', async () => {
      const date = '2024-04-06';

      const result = await service.getAvailability(date);

      expect(result).toEqual([]);
    });

    it('should return empty array for day off', async () => {
      const date = '2024-04-04';
      mockEntityManager.findOne.mockResolvedValue({ date: new Date(date) });

      const result = await service.getAvailability(date);

      expect(result).toEqual([]);
    });

    it('should exclude unavailable windows', async () => {
      const date = '2024-04-04';
      mockEntityManager.findOne.mockResolvedValue(null);
      mockEntityManager.find
        .mockResolvedValueOnce([
          {
            startTime: '12:30',
            endTime: '13:30',
          },
        ])
        .mockResolvedValueOnce([]);

      const result = await service.getAvailability(date);

      const lunchSlots = result.filter(
        (slot) => slot.time === '12:30' || slot.time === '13:00'
      );
      expect(lunchSlots).toHaveLength(0);
    });

    it('should mark booked slots as unavailable', async () => {
      const date = '2024-04-04';
      mockEntityManager.findOne.mockResolvedValue(null);
      mockEntityManager.find
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          {
            date: new Date(date),
            startTime: '10:00',
            slotCount: 1,
          },
        ]);

      const result = await service.getAvailability(date);

      const bookedSlot = result.find((slot) => slot.time === '10:00');
      expect(bookedSlot?.available_slots).toBe(0);
    });
  });
});