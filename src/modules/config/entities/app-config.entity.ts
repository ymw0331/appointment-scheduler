import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';

// Fields: slotDurationMinutes, maxSlotsPerAppointment, operationalDays, operationalStartTime, operationalEndTime, timestamps, and a constructor for partial assignment.

@Entity()
export class AppConfig {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid();

  @Property({ type: 'integer', default: 30 })
  slotDurationMinutes: number = 30;

  @Property({ type: 'integer', default: 1 })
  maxSlotsPerAppointment: number = 1;

  @Property({ type: 'array', default: [1, 2, 3, 4, 5] })
  operationalDays: number[] = [1, 2, 3, 4, 5];

  @Property({ type: 'time', default: '09:00' })
  operationalStartTime: string = '09:00';

  @Property({ type: 'time', default: '18:00' })
  operationalEndTime: string = '18:00';

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  // Add constructor to support partial initialization
  constructor(partial?: Partial<AppConfig>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
