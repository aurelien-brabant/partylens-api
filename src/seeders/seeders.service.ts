import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {CreatePartyDto} from 'src/parties/dto/create-party.dto';
import { PartiesService } from 'src/parties/service/parties.service';
import { UserEntity, UserRolePrivilege, UserState } from 'src/users/entity/user.entity';
import { UsersService } from 'src/users/service/users.service';
import { getConnection, Repository } from 'typeorm';

//import faker from 'faker/';
const faker = require('faker');

import {CreatePartymemberDto} from 'src/parties/dto/create-partymember.dto';

@Injectable()
export class SeedersService {
    constructor(
        private readonly usersService: UsersService,
        private readonly partiesService: PartiesService,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) {}

    async seed(userNb: number, partyNb: number, userPassword: string) {
        await getConnection().synchronize(true);
        console.log('Dropped database');
        await this.seedFakeUsers(userNb, userPassword); 
        await this.seedParties(partyNb);
    }

    async seedFakeUsers(userNb: number, pwd: string)
    {
        for (let i = 0; i < userNb; ++i) {
            const user = await this.usersService.create({
                email: faker.unique(faker.internet.email),
                name: faker.name.findName(),
                password: pwd,
            });

            console.log("USER >> %s (%s)", user.name, user.email);
        }

        /* generate a single administrator account */

        let adminUser = await this.usersService.create({
            email: 'admin@partylens.fr',
            name: 'admin',
            password: 'admin'
        });

        adminUser.privilege = UserRolePrivilege.ADMIN;
        adminUser.state = UserState.ACTIVATED;

        adminUser = await this.userRepository.save(adminUser);

        console.log("USER >> %s (%s)", adminUser.name, adminUser.email);
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
                    nametag: `${usersCopy[currentIndex].name}#${usersCopy[currentIndex].tag}`,
                })
                usersCopy.slice(currentIndex, 1);
            }

            partyData.members = members;
            await this.partiesService.create(owner.id, partyData);

            console.log("Party >> %s (%d members)", partyData.name, memberCount + 1);
        }

    }
}
