import { Controller, Post, Delete, Get, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { GetAppointmentsQueryDto } from './dto/get-appointments.dto';

@ApiTags('Appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Book an appointment',
    description: 'Creates a new appointment with validation for time slots, conflicts, and availability'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Appointment booked successfully',
    type: AppointmentResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid booking data (time alignment, operational hours)' })
  @ApiResponse({ status: 409, description: 'Booking conflict (time slot already taken)' })
  async create(@Body() dto: CreateAppointmentDto): Promise<AppointmentResponseDto> {
    return this.appointmentsService.createAppointment(dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel an appointment' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  @ApiResponse({ status: 204, description: 'Appointment cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async cancel(@Param('id') id: string): Promise<void> {
    return this.appointmentsService.cancelAppointment(id);
  }

  @Get()
  @ApiOperation({ 
    summary: 'List appointments',
    description: 'Get all appointments, optionally filtered by date'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of appointments',
    type: [AppointmentResponseDto]
  })
  async list(@Query() query: GetAppointmentsQueryDto): Promise<AppointmentResponseDto[]> {
    return this.appointmentsService.getAppointments(query.date);
  }
}
