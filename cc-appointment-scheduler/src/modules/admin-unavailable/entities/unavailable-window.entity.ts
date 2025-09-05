import { Entity, PrimaryKey, Property, Check } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';

@Entity()
@Check({ expression: 'weekday BETWEEN 1 AND 7' })
@Check({ expression: 'start_time < end_time' })
export class UnavailableWindow {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid();

  @Property({ type: 'integer', nullable: true })
  weekday?: number;

  @Property({ type: 'date', nullable: true })
  date?: Date;

  @Property({ type: 'time' })
  startTime!: string;

  @Property({ type: 'time' })
  endTime!: string;

  @Property({ type: 'text', nullable: true })
  note?: string;

  @Property({ type: 'datetime', onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ type: 'datetime', onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(partial?: Partial<UnavailableWindow>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}