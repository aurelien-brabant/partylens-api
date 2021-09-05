import { HttpStatus, INestApplication, ValidationPipe } from "@nestjs/common"
import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { doesNotMatch } from "assert";
import { isJWT } from "class-validator";
import { assert, exception } from "console";
import exp from "constants";
import * as request from 'supertest';
import { getConnection, Repository, UsingJoinColumnOnlyOnOneSideAllowedError } from "typeorm";
import { AuthModule } from "../src/auth/auth.module";
import { generateRandomIndexes } from "../src/misc/random";
import { ServiceException } from "../src/misc/serviceexception";
import { SeedersModule } from "../src/seeders/seeders.module";
import { CreateUserDto } from "../src/users/dto/create-user.dto";
import { UsersService } from "../src/users/service/users.service";

describe('Authentication', () => {
    let users: CreateUserDto[] = [
        {
            email: 'user@gmail.com',
            name: 'user',
            password: 'pass'
        },
        {
            email: 'otheruser@gmail.com',
            name: 'otheruser',
            password: 'otherpass',
        },
    ];

    let app: INestApplication;
    let usersService: UsersService;

    beforeAll(async () => {
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
                SeedersModule
            ]
        })
            .compile();

        app = moduleRef.createNestApplication();
        await app.init();

        await getConnection().synchronize(true);

        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            transform: true,
        }))

        usersService = app.get(UsersService);

        for (const user of users) {
            await usersService.create({ ... user });
        }
    })

    afterAll(async () => {
        await app.close();
    })

    // Body validation is handled by Passport, not class-validator. Thus no extensive validation checking is really required.
    it('Authorization should be refused: body is empty', async () => {
        const res = await request(app.getHttpServer())
            .post('/auth/login')
            .set('Accept', 'application/json')
            .send();
        
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
    })

    // Select one of the user randomly to make connection attempt
    it('Login should be successful, valid credentials are provided', async () => {
        const { email, password } = users[Math.round(Math.random() * (users.length - 1))];

        const res = await request(app.getHttpServer())
            .post('/auth/login')
            .set('Accept', 'application/json')
            .send({
                email,
                password
            });

        expect(res.status).toEqual(HttpStatus.CREATED);
        expect(res.body.access_token).toBeDefined();
        expect(isJWT(res.body.access_token)).toBeTruthy();
    });

    // select two random users from the array and try to login
    it('Should _NOT_ login with invalid password', async () => {
        const basereq = request(app.getHttpServer())
        .post('/auth/login')
        .set('Accept', 'application/json');

        for (let i = 1; i < users.length; ++i) {
            const res = await basereq.send({
                email: users[0].email,
                password: users[i].password
            });
            
            expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
        }
    })
    
})