import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UsePipes,
  HttpStatus,
  HttpCode,
  Get,
  Req,
  UseGuards,
  Param,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { loginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '../auth/auth.gards';
import { EventsService } from '../events/events.service';
import * as dayjs from 'dayjs';

// import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => EventsService))
    private readonly eventService: EventsService,
  ) {}

  @Post('auth/sign-up')
  @UsePipes(new ValidationPipe())
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('auth/login')
  @UsePipes(new ValidationPipe())
  signIn(@Body() signIn: loginUserDto) {
    return this.usersService.signIn(signIn);
  }
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Get('me')
  returnUser(@Req() req) {
    const user = this.usersService.returnUser(req.user.sub);
    return user;
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  getUserById(@Param('id') userId: string) {
    const user = this.usersService.returnUser(userId);
    return user;
  }
  @UseGuards(AuthGuard)
  @Get(':id/meal-vouchers/:month')
  async getMealVouchersAmount(
    @Param('id') userId: string,
    @Param('month') month: number,
  ) {
    const nbAbsence = await this.eventService.getAbsenceEmployee(userId, month);
    const firstDayOfMonth = dayjs()
      .month(month - 1)
      .startOf('month');
    const lastDayOfMonth = dayjs()
      .month(month - 1)
      .endOf('month');

    let workingDays = 0;

    // Itère sur chaque jour du mois et incrémente workingDays si le jour est un jour travaillé (du lundi au vendredi inclus)
    for (
      let day = firstDayOfMonth;
      day.isBefore(lastDayOfMonth) || day.isSame(lastDayOfMonth);
      day = day.add(1, 'day')
    ) {
      if (day.day() >= 1 && day.day() <= 5) {
        workingDays++;
      }
    }
    return { ticketRestaurant: (workingDays - nbAbsence) * 8 };
  }
}
