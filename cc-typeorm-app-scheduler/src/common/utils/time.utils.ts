import { format, parseISO } from 'date-fns';

export class TimeUtils {
  static timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  static minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  static isTimeAligned(timeStr: string, slotDuration: number): boolean {
    const minutes = this.timeToMinutes(timeStr);
    return minutes % slotDuration === 0;
  }

  static generateSlotTimes(
    startTime: string,
    endTime: string,
    slotDuration: number,
  ): string[] {
    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);
    const slots: string[] = [];

    for (let minutes = startMinutes; minutes < endMinutes; minutes += slotDuration) {
      slots.push(this.minutesToTime(minutes));
    }

    return slots;
  }

  static doesSlotOverlap(
    slotStart: number,
    slotDuration: number,
    slotCount: number,
    windowStart: number,
    windowEnd: number,
  ): boolean {
    const slotEnd = slotStart + slotDuration * slotCount;
    return slotStart < windowEnd && slotEnd > windowStart;
  }

  static formatDate(date: Date): string {
    return format(date, 'yyyy-MM-dd');
  }

  static parseDate(dateStr: string): Date {
    return parseISO(dateStr);
  }

  static getDayOfWeek(date: Date): number {
    const day = date.getDay();
    return day === 0 ? 7 : day;
  }

  static combineDateTime(date: Date, time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);
    return combined;
  }

  static isValidTimeFormat(time: string): boolean {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return timeRegex.test(time);
  }

  static isValidDateFormat(date: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateRegex.test(date);
  }
}