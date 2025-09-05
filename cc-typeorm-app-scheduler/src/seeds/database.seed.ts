import { AppDataSource } from '../config/typeorm.config';
import { AppConfig } from '../entities/app-config.entity';
import { DayOff } from '../entities/day-off.entity';
import { UnavailableWindow } from '../entities/unavailable-window.entity';

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('🌱 Seeding database...');

    const configRepo = AppDataSource.getRepository(AppConfig);
    const dayOffRepo = AppDataSource.getRepository(DayOff);
    const windowRepo = AppDataSource.getRepository(UnavailableWindow);

    // Check if config already exists
    const existingConfig = await configRepo.findOne({ where: {} });
    if (!existingConfig) {
      // Seed default configuration
      const config = configRepo.create({
        slotDurationMinutes: 30,
        maxSlotsPerAppointment: 1,
        operationalDays: [1, 2, 3, 4, 5],
        operationalStartTime: '09:00',
        operationalEndTime: '18:00',
      });
      await configRepo.save(config);
      console.log('✅ Default configuration created');
    }

    // Check if sample day off exists
    const christmasDay = new Date('2024-12-25');
    const existingDayOff = await dayOffRepo.findOne({ where: { date: christmasDay } });
    if (!existingDayOff) {
      // Seed sample day off
      const dayOff = dayOffRepo.create({
        date: christmasDay,
        note: 'Christmas Day',
      });
      await dayOffRepo.save(dayOff);
      console.log('✅ Sample day off created (Christmas Day)');
    }

    // Check if lunch breaks exist
    const existingWindows = await windowRepo.find({ where: { weekday: 1 } });
    if (existingWindows.length === 0) {
      // Seed lunch breaks for weekdays
      for (let weekday = 1; weekday <= 5; weekday++) {
        const lunchBreak = windowRepo.create({
          weekday,
          startTime: '12:30',
          endTime: '13:30',
          note: 'Lunch break',
        });
        await windowRepo.save(lunchBreak);
      }
      console.log('✅ Lunch breaks created for weekdays');
    }

    console.log('🎉 Database seeded successfully');
    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed().catch(console.error);