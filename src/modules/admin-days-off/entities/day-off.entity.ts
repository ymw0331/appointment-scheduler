import { Entity, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';

@Entity()
@Unique({ properties: ['date'] })
export class DayOff {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid();

  @Property({ type: 'date' })
  date!: Date;

  @Property({ type: 'text', nullable: true })
  note?: string;

  @Property({ type: 'datetime', onCreate: () => new Date() })
  createdAt: Date = new Date();

  constructor(partial?: Partial<DayOff>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
