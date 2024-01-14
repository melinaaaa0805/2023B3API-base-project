import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateUserDto, isUUID } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { loginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>, // Repository pour les entités utilisateur
    private readonly jwtService: JwtService, // Service JWT pour la génération de jetons
  ) {}

  // Fonction pour créer un nouvel utilisateur
  // Hache le mot de passe de l'utilisateur avant de l'enregistrer dans la base de données
  async create(createUserDto: CreateUserDto) {
    const saltOrRounds = 10;
    const newUser = this.userRepository.create({
      ...createUserDto,
      password: await bcrypt.hash(createUserDto.password, saltOrRounds),
    });
    const insertedUser = await this.userRepository.save(newUser);
    delete insertedUser.password; // Ne pas retourner le mot de passe dans la réponse
    return insertedUser;
  }

  // Fonction pour authentifier un utilisateur et générer un jeton JWT
  async signIn(loginUserDto: loginUserDto) {
    // Trouve l'utilisateur en fonction de son email
    const options: FindOneOptions<User> = {
      where: { email: loginUserDto.email },
    };
    const user = await this.userRepository.findOne(options);

    // Compare le mot de passe fourni avec le mot de passe haché stocké
    const match = await bcrypt.compare(loginUserDto.password, user.password);

    if (!match) {
      throw new UnauthorizedException(); // Lance une exception si les mots de passe ne correspondent pas
    }

    // Génère un jeton JWT avec les informations de l'utilisateur
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  // Fonction pour récupérer tous les utilisateurs
  // Supprime le mot de passe de chaque objet utilisateur dans la réponse
  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find();
    for (const user of users) {
      delete user.password; // Ne pas retourner les mots de passe dans la réponse
    }
    return users;
  }

  // Fonction pour récupérer un utilisateur spécifique par ID
  // Lance des exceptions pour le format UUID invalide et lorsque l'utilisateur n'est pas trouvé
  async returnUser(id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException(
        "Format UUID invalide pour l'ID utilisateur",
      );
    }

    // Trouve l'utilisateur par ID
    const user = await this.userRepository.findOne({
      where: { id: id },
    });

    // Lance une exception si l'utilisateur n'est pas trouvé
    if (user === null) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    delete user.password; // Ne pas retourner le mot de passe dans la réponse
    return user;
  }
}
