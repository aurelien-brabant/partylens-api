import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {CreatePartyDto} from 'src/parties/dto/create-party.dto';
import { PartiesService } from 'src/parties/service/parties.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UserEntity, UserRolePrivilege, UserState } from 'src/users/entity/user.entity';
import { UsersService } from 'src/users/service/users.service';
import { getConnection, Repository, UsingJoinColumnIsNotAllowedError } from 'typeorm';
import { getFakeUsers } from './datagen';

//import faker from 'faker';
const faker = require('faker');

import {PartyEntity} from 'src/parties/entity/party.entity';
import {CreatePartymemberDto} from 'src/parties/dto/create-partymember.dto';

@Injectable()
export class SeedersService {
    constructor(
        private readonly usersService: UsersService,
        private readonly partiesService: PartiesService,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(PartyEntity)
        private readonly partyRepository: Repository<PartyEntity>
    ) {}

    async seed() {
        await getConnection().synchronize(true);
        console.log('Dropped database');
        await this.seedFakeUsers(50); 
        await this.seedParties(100);
    }

    async seedFakeUsers(userNb: number) {
        getFakeUsers(userNb).forEach(async (userData: CreateUserDto) => {
            await this.usersService.create(userData);
            console.log("[USER GENERATED] %s (%s)", userData.name, userData.email);
        })

        /* generate a single administrator account */
        
        const adminUser = await this.usersService.create({
            email: 'admin@partylens.fr',
            name: 'admin',
            password: 'admin'
        });

        adminUser.privilege = UserRolePrivilege.ADMIN;
        adminUser.state = UserState.ACTIVATED;

        await this.userRepository.save(adminUser);
        console.log('[USER GENERATED] administrator account generated!');

        console.log('Seeding users: done!')
    }

    async seedParties(n: number) {
        const users = await this.userRepository.find();

        for (let i = 0; i != n; ++i) {
            const partyData: CreatePartyDto = {
               name: faker.random.words(3),
               description: faker.lorem.slug(20),
               startDate: faker.date.soon().toJSON()
            };

            let memberCount = Math.round(Math.random() * users.length);

            const ownerIndex = Math.round(Math.random() * (users.length - 1));

            const owner = users[ownerIndex];

            const usersCopy = users.slice();

            usersCopy.splice(ownerIndex, 1);

            const members: CreatePartymemberDto[] = [];
            for (let i = 0; i < memberCount && usersCopy.length > 0; ++i) {
                let currentIndex = Math.round(Math.random() * (usersCopy.length - 1));
                members.push({
                    id: usersCopy[currentIndex].id
                })
                usersCopy.slice(currentIndex, 1);
            }

            partyData.members = members;
            await this.partiesService.create(owner.id, partyData);

            console.log("[PARTY GENERATED] %s (%d members)", partyData.name, memberCount + 1);
        }
        
    }
}
