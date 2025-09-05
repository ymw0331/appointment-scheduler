import { Entity, PrimaryKey, Property, Index } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';

@Entity()
@Index({ properties: ['date', 'startTime'] })
export class Appointment {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid();

  @Property({ type: 'date' })
  date!: Date;

  @Property({ type: 'time' })
  startTime!: string;

  @Property({ type: 'integer' })
  slotCount!: number;

  @Property({ type: 'text', nullable: true })
  customerName?: string;

  @Property({ type: 'text', nullable: true })
  customerEmail?: string;

  @Property({ type: 'datetime', onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ type: 'datetime', onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(partial?: Partial<Appointment>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}