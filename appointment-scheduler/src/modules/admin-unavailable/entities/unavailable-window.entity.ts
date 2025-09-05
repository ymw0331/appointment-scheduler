import { Entity, PrimaryKey, Property, Check } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';

@Entity()
@Check({ expression: 'start_time < end_time' })
export class UnavailableWindow {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid();

  @Property({ type: 'integer', nullable: true })
  weekday?: number; // 1=Monday, 7=Sunday (for recurring)

  @Property({ type: 'date', nullable: true })
  date?: Date; // For specific date unavailability

  @Property({ type: 'time' })
  startTime!: string;

  @Property({ type: 'time' })
  endTime!: string;

  @Property({ type: 'text', nullable: true })
  note?: string;

  @Property({ type: 'datetime', onCreate: () => new Date() })
  createdAt: Date = new Date();

  constructor(partial?: Partial<UnavailableWindow>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
