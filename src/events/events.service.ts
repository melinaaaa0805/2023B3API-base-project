import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Between, FindManyOptions, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './entities/events.entity';
import { CreateEventDto } from './dto/create-event.dto';
import * as dayjs from 'dayjs';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  // Function to create a new Event
  async createEvent(
    userId: string,
    createEventDto: CreateEventDto,
  ): Promise<Event | null> {
    // Règle : Impossible d'avoir deux événements quel que soit le statut sur la même journée
    const options: FindManyOptions<Event> = {
      where: {
        userId: userId,
        date: createEventDto.date,
      },
      relations: ['user'],
    };
    const hasEventOnSameDay = await this.eventRepository.findOne(options);

    if (hasEventOnSameDay !== null) {
      throw new UnauthorizedException(
        'An event already exists for this user on the same day',
      );
    }

    // Règle : Il est impossible de se mettre en télétravail plus de deux jours par semaine
    if (createEventDto.eventType === 'RemoteWork') {
      // Convertir createEventDto.date en objet dayjs
      const selectedDate = dayjs(createEventDto.date);

      // Obtenir le lundi de la semaine correspondante
      const dayjsMonday = selectedDate.startOf('week').subtract(1, 'day');
      const monday = dayjsMonday.toDate();

      // Obtenir le vendredi de la semaine en ajoutant 4 jours à partir du lundi
      const dayjsfriday = dayjsMonday.add(6, 'day');
      const friday = dayjsfriday.toDate();

      const options: FindManyOptions<Event> = {
        where: {
          userId: userId,
          eventType: 'RemoteWork',
          date: Between(monday, friday),
        },
      };
      const remotesWorkCountThisWeek =
        await this.eventRepository.count(options);
      if (remotesWorkCountThisWeek >= 2) {
        throw new UnauthorizedException(
          'You cannot have more than two remote work events per week',
        );
      }
    }

    // Règle : Les télétravails ne sont pas soumis à validation d'un supérieur
    if (createEventDto.eventType === 'RemoteWork') {
      createEventDto.eventStatus = 'Accepted';
    }

    // Règle : Si un Employé essaie de créer un évènement de congé, ce dernier est en statut En attente
    if (createEventDto.eventType === 'PaidLeave') {
      createEventDto.eventStatus = 'Pending';
    }

    // Créer l'événement
    const newEvent = this.eventRepository.create({
      ...createEventDto,
      userId: userId,
    });

    // Enregistrez l'événement dans la base de données
    const savedEvent = await this.eventRepository.save(newEvent);

    return savedEvent;
  }
  //retourne un évènement
  async getEvent(id: string) {
    const options: FindManyOptions<Event> = {
      where: { id: id },
    };
    const event = await this.eventRepository.findOne(options);
    if (event == null) {
      throw new NotFoundException();
    }
    return event;
  }
  //retourne tous les evenements
  async getAll() {
    const event = await this.eventRepository.find();
    if (event == null) {
      throw new NotFoundException();
    }
    return event;
  }

  // recherche si l'utilisateur est assigné à un projet le jour de l'evenement

  async updateEvent(eventId: string) {
    const update = await this.eventRepository.update(eventId, {
      eventStatus: 'Accepted',
    });
    return update;
  }
  // decline un evenement
  async declineEvent(eventId: string) {
    const update = await this.eventRepository.update(eventId, {
      eventStatus: 'Declined',
    });
    return update;
  }
  //retourne les absences d'un employé pour un mois
  async getAbsenceEmployee(userId: string, month: number) {
    const dayjsfirstDayOfMonth = dayjs()
      .month(month - 1)
      .startOf('month');
    const dayJslastDayOfMonth = dayjs()
      .month(month - 1)
      .endOf('month');

    const lastDayOfMonth = dayJslastDayOfMonth.toDate();
    console.log('la date est ' + JSON.stringify(lastDayOfMonth));
    const firstDayOfMonth = dayjsfirstDayOfMonth.toDate();
    const options: FindManyOptions<Event> = {
      where: {
        userId: userId,
        date: Between(firstDayOfMonth, lastDayOfMonth),
        eventStatus: 'Accepted',
      },
    };
    try {
      const event = await this.eventRepository.count(options);
      return event;
    } catch {
      return 0;
    }
  }
}
