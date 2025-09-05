import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('app_config')
export class AppConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', default: 30 })
  slotDurationMinutes: number;

  @Column({ type: 'int', default: 1 })
  maxSlotsPerAppointment: number;

  @Column('int', { array: true, default: [1, 2, 3, 4, 5] })
  operationalDays: number[];

  @Column({ type: 'time', default: '09:00' })
  operationalStartTime: string;

  @Column({ type: 'time', default: '18:00' })
  operationalEndTime: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}