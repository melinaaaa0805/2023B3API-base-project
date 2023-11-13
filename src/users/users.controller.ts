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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { loginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '../auth/auth.gards';

// import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
    if (!user) {
      // Gérer le cas où aucun utilisateur n'est trouvé avec l'ID spécifié
      return 'Utilisateur non trouvé';
    }

    // Faire quelque chose avec l'utilisateur trouvé
    return user;
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  getUserById(@Param('id') userId: string) {
    const user = this.usersService.returnUser(userId);
    return user;
  }
}

// @Get()
// findAll() {
//  return this.usersService.findAll();
// }
/*
  @Get('/auth/login')
  findOne(username: string, password: string, email: string) {
    return this.usersService.signIn(username, password, email);
  }
  @Get('/me')
  findOne(){
    return 
  }*/
/*
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }*/

//@Delete(':id')
//remove(@Param('id') id: string) {
//return this.usersService.delete(id);
//}
