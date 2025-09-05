import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('appointments')
@Index(['date', 'startTime'])
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'int' })
  slotCount: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  customerName?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  customerEmail?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}