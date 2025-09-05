import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Check,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('unavailable_windows')
@Check('"weekday" BETWEEN 1 AND 7')
@Check('"startTime" < "endTime"')
export class UnavailableWindow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', nullable: true })
  weekday?: number;

  @Column({ type: 'date', nullable: true })
  date?: Date;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}