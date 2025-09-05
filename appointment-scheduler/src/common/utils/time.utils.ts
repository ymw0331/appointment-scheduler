export class TimeUtils {
  // Convert "14:30" to 870 minutes from midnight
  static timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Convert 870 minutes back to "14:30"
  static minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  // Check if "14:30" aligns to 30-minute slot grid
  static isTimeAligned(timeStr: string, slotDuration: number): boolean {
    return this.timeToMinutes(timeStr) % slotDuration === 0;
  }

  // Generate ["09:00", "09:30", "10:00", ...] for booking slots
  static generateSlotTimes(start: string, end: string, duration: number): string[] {
    const startMin = this.timeToMinutes(start);
    const endMin = this.timeToMinutes(end);
    const slots: string[] = [];

    for (let min = startMin; min < endMin; min += duration) {
      slots.push(this.minutesToTime(min));
    }
    return slots;
  }

  // Check if multi-slot appointment overlaps with lunch break
  static doesSlotOverlap(
    slotStart: number,
    slotDuration: number,
    slotCount: number,
    windowStart: number,
    windowEnd: number
  ): boolean {
    const slotEnd = slotStart + slotDuration * slotCount;
    return slotStart < windowEnd && slotEnd > windowStart;
  }
}
