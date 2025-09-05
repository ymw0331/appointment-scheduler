import { Entity, PrimaryKey, Property, Index } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';

@Entity()
@Index({ properties: ['date', 'startTime'] }) // For fast queries
export class Appointment {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid();

  @Property({ type: 'date' })
  date!: Date;

  @Property({ type: 'time' })
  startTime!: string; // e.g., "14:30"

  @Property({ type: 'integer' })
  slotCount!: number; // How many consecutive slots

  @Property({ nullable: true })
  customerName?: string;

  @Property({ nullable: true })
  customerEmail?: string;
}
