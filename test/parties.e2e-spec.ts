import {HttpStatus, INestApplication, ValidationPipe} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import {TypeOrmModule} from '@nestjs/typeorm';
import {isJWT} from 'class-validator';
import * as request from 'supertest';
import {getConnection} from 'typeorm';
import {AuthModule} from '../src/auth/auth.module';
import {CreateUserDto} from '../src/users/dto/create-user.dto';
import {UsersService} from '../src/users/service/users.service';
import {UsersModule} from '../src/users/users.module';
import {PartiesModule} from '../src/parties/parties.module';
import {PartiesService} from '../src/parties/service/parties.service';
import {SeedersModule} from '../src/seeders/seeders.module';
import {SeedersService} from '../src/seeders/seeders.service';

describe('e', () => {
    const USER_NB = 10;

    let app: INestApplication;
    let usersService: UsersService;
    let partiesService: PartiesService;

    let users = null; 

    let jwtToken: string = null;

    beforeAll(async () => {
        const loggedUserDto: CreateUserDto = {
            email: 'user@gmail.com',
            name: 'user',
            password: 'user'
        };

        const moduleRef = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRoot({
                    type: 'postgres',
                    username: process.env.POSTGRES_USER,
                    password: process.env.POSTGRES_PASSWORD,
                    database: process.env.POSTGRES_DATABASE,
                    host: process.env.POSTGRES_TESTING_HOST,
                    autoLoadEntities: true,
                    synchronize: true,
                }),
                AuthModule,
                UsersModule,
                PartiesModule,
                SeedersModule
            ]
        })
            .compile();

        app = moduleRef.createNestApplication();

        await getConnection().synchronize(true);

        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            transform: true,
        }))

        const basereq = request(app.getHttpServer())
        .post('/auth/login')
        .set('Accept', 'application/json');

        await app.init();

        usersService = app.get(UsersService);
        partiesService = app.get(PartiesService);
        
        const seeder = app.get(SeedersService);

        users = seeder.generateUserDtos(USER_NB);

        for (const user of users) {
            await usersService.create(user);

            const res = await basereq.send(user);
            expect(res.status).toEqual(HttpStatus.CREATED);
            expect(res.body.access_token).toBeDefined();
            expect(isJWT(res.body.access_token)).toBeTruthy();
            user.jwtToken = res.body.access_token;
        }
    })

    afterAll(async () => {
        await app.close();
    })

    it('[GET /parties] SHOULD return an array', async () => {
        const res = await request(app.getHttpServer())
        .get('/parties')
        .set('Authorization', `Bearer ${users[0].jwtToken}`);

        expect(res.status).toEqual(HttpStatus.OK);
        expect(Array.isArray(res.body)).toBe(true);
    })
    
    // missing Bearer token
    it('[GET /parties] SHOULD refuse authentication', async () => {
        const res = await request(app.getHttpServer())
        .get('/parties')

        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
    });

    it('[GET /parties] SHOULD refuse authentication', async () => {
        const res = await request(app.getHttpServer())
        .get('/parties')

        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
    });

});
