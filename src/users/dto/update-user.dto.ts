import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  /*
    async update(id: string, updateUserDto: CreateUserDto) {
        const user = await this.usersRepository.update(id, updateUserDto);
        return user;
      }*/
}
