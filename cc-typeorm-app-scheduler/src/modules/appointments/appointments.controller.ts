import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';

@ApiTags('Appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @UseGuards(ThrottlerGuard)
  @ApiOperation({ summary: 'Book a new appointment' })
  @ApiResponse({
    status: 201,
    description: 'Appointment created successfully',
    type: AppointmentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid appointment data',
  })
  @ApiResponse({
    status: 409,
    description: 'Slot already booked',
  })
  async createAppointment(
    @Body() dto: CreateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    return await this.appointmentsService.createAppointment(dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel an appointment' })
  @ApiParam({
    name: 'id',
    description: 'Appointment ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Appointment cancelled successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Appointment not found',
  })
  async deleteAppointment(@Param('id') id: string): Promise<void> {
    return await this.appointmentsService.deleteAppointment(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get appointments' })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Filter by date (YYYY-MM-DD)',
    example: '2024-04-04',
  })
  @ApiResponse({
    status: 200,
    description: 'List of appointments',
    type: [AppointmentResponseDto],
    isArray: true,
  })
  async getAppointments(
    @Query('date') date?: string,
  ): Promise<AppointmentResponseDto[]> {
    return await this.appointmentsService.getAppointments(date);
  }
}