import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/postgresql';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { ConfigService } from '../config/config.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let em: EntityManager;
  let configService: ConfigService;

  const mockEntityManager = {
    findOne: jest.fn(),
    find: jest.fn(),
    persistAndFlush: jest.fn(),
    removeAndFlush: jest.fn(),
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
        AppointmentsService,
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

    service = module.get<AppointmentsService>(AppointmentsService);
    em = module.get<EntityManager>(EntityManager);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAppointment', () => {
    const validDto: CreateAppointmentDto = {
      date: '2024-04-04',
      time: '10:00',
      slots: 1,
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
    };

    it('should create appointment successfully', async () => {
      mockEntityManager.findOne.mockResolvedValue(null);
      mockEntityManager.find.mockResolvedValue([]);
      mockEntityManager.persistAndFlush.mockResolvedValue(undefined);

      const result = await service.createAppointment(validDto);

      expect(result).toBeDefined();
      expect(result.date).toBe(validDto.date);
      expect(result.startTime).toBe(validDto.time);
      expect(result.slotCount).toBe(validDto.slots);
      expect(mockEntityManager.persistAndFlush).toHaveBeenCalled();
    });

    it('should throw BadRequestException for misaligned time', async () => {
      const dto = { ...validDto, time: '10:15' };

      await expect(service.createAppointment(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for invalid slot count', async () => {
      const dto = { ...validDto, slots: 10 };

      await expect(service.createAppointment(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for non-operational day', async () => {
      const dto = { ...validDto, date: '2024-04-06' };

      await expect(service.createAppointment(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for outside operational hours', async () => {
      const dto = { ...validDto, time: '08:00' };

      await expect(service.createAppointment(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for day off', async () => {
      mockEntityManager.findOne.mockResolvedValueOnce({ date: new Date(validDto.date) });

      await expect(service.createAppointment(validDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException for slot already booked', async () => {
      mockEntityManager.findOne.mockResolvedValue(null);
      mockEntityManager.find
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          {
            date: new Date(validDto.date),
            startTime: '10:00',
            slotCount: 1,
          },
        ]);

      await expect(service.createAppointment(validDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should handle multi-slot appointments', async () => {
      mockConfigService.getEffectiveConfig.mockResolvedValueOnce({
        slotDurationMinutes: 30,
        maxSlotsPerAppointment: 3,
        operationalDays: [1, 2, 3, 4, 5],
        operationalStartTime: '09:00',
        operationalEndTime: '18:00',
      });

      const dto = { ...validDto, slots: 2 };
      mockEntityManager.findOne.mockResolvedValue(null);
      mockEntityManager.find.mockResolvedValue([]);
      mockEntityManager.persistAndFlush.mockResolvedValue(undefined);

      const result = await service.createAppointment(dto);

      expect(result.slotCount).toBe(2);
    });
  });

  describe('deleteAppointment', () => {
    it('should delete appointment successfully', async () => {
      const appointment = { id: 'test-id' };
      mockEntityManager.findOne.mockResolvedValue(appointment);
      mockEntityManager.removeAndFlush.mockResolvedValue(undefined);

      await service.deleteAppointment('test-id');

      expect(mockEntityManager.removeAndFlush).toHaveBeenCalledWith(appointment);
    });

    it('should throw NotFoundException for non-existent appointment', async () => {
      mockEntityManager.findOne.mockResolvedValue(null);

      await expect(service.deleteAppointment('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAppointments', () => {
    it('should return all appointments', async () => {
      const appointments = [
        { id: '1', date: new Date('2024-04-04'), startTime: '10:00' },
        { id: '2', date: new Date('2024-04-04'), startTime: '11:00' },
      ];
      mockEntityManager.find.mockResolvedValue(appointments);

      const result = await service.getAppointments();

      expect(result).toHaveLength(2);
      expect(mockEntityManager.find).toHaveBeenCalled();
    });

    it('should filter appointments by date', async () => {
      const appointments = [
        { id: '1', date: new Date('2024-04-04'), startTime: '10:00' },
      ];
      mockEntityManager.find.mockResolvedValue(appointments);

      const result = await service.getAppointments('2024-04-04');

      expect(result).toHaveLength(1);
      expect(mockEntityManager.find).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ date: expect.any(Date) }),
        expect.anything(),
      );
    });
  });
});