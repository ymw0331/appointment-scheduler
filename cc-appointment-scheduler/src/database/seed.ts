import { MikroORM } from '@mikro-orm/postgresql';
import { AppConfig } from '../modules/config/entities/app-config.entity';
import { DayOff } from '../modules/admin-days-off/entities/day-off.entity';
import { UnavailableWindow } from '../modules/admin-unavailable/entities/unavailable-window.entity';
import mikroOrmConfig from '../mikro-orm.config';

async function seed() {
  const orm = await MikroORM.init(mikroOrmConfig);
  const em = orm.em.fork();

  console.log('Seeding database...');

  const existingConfig = await em.findOne(AppConfig, {});
  if (!existingConfig) {
    const config = new AppConfig({
      slotDurationMinutes: 30,
      maxSlotsPerAppointment: 1,
      operationalDays: [1, 2, 3, 4, 5],
      operationalStartTime: '09:00',
      operationalEndTime: '18:00',
    });
    em.persist(config);
    console.log('Created default configuration');
  }

  const existingDayOff = await em.findOne(DayOff, {});
  if (!existingDayOff) {
    const dayOff = new DayOff({
      date: new Date('2024-12-25'),
      note: 'Christmas Day',
    });
    em.persist(dayOff);
    console.log('Created sample day off');
  }

  const existingWindow = await em.findOne(UnavailableWindow, { weekday: { $gte: 1, $lte: 5 } });
  if (!existingWindow) {
    for (let weekday = 1; weekday <= 5; weekday++) {
      const lunchBreak = new UnavailableWindow({
        weekday,
        startTime: '12:30',
        endTime: '13:30',
        note: 'Lunch break',
      });
      em.persist(lunchBreak);
    }
    console.log('Created lunch break unavailable windows');
  }

  await em.flush();
  await orm.close();
  console.log('Database seeded successfully');
}

seed().catch((err) => {
  console.error('Error seeding database:', err);
  process.exit(1);
});