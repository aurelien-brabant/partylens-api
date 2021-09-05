import {HttpStatus, INestApplication, ValidationPipe} from '@nestjs/common';
import {Test} from '@nestjs/testing';
import {TypeOrmModule} from '@nestjs/typeorm';
import {isJWT} from 'class-validator';
import * as request from 'supertest';
import {getConnection} from 'typeorm';
import {AuthModule} from '../src/auth/auth.module';
import {AuthService} from '../src/auth/auth.service';
import {CreateUserDto} from '../src/users/dto/create-user.dto';
import {UsersService} from '../src/users/service/users.service';

describe('e', () => {
    let app: INestApplication;
    let usersService: UsersService;

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
            ]
        })
            .compile();

        app = moduleRef.createNestApplication();

        await getConnection().synchronize(true);

        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            transform: true,
        }))

        usersService = app.get(UsersService);

        await usersService.create(loggedUserDto);

        await app.init();

        const res = await request(app.getHttpServer())
        .post('/auth/login')
        .set('Accept', 'application/json')
        .send({
            email: loggedUserDto.email,
            password: loggedUserDto.password
        });

        expect(res.status).toEqual(HttpStatus.CREATED);
        expect(res.body.access_token).toBeDefined();
        expect(isJWT(res.body.access_token)).toBeTruthy();

        jwtToken = res.body.access_token;
    })

    afterAll(async () => {
        await app.close();
    })

    it('dummy test', async () => {
        expect(true).toBeTruthy();
    })
});
