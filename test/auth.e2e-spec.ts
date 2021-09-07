import { HttpStatus, INestApplication, ValidationPipe } from "@nestjs/common"
import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { isJWT } from "class-validator";
import {SeedersService} from "../src/seeders/seeders.service";
import * as request from 'supertest';
import { getConnection } from "typeorm";
import { AuthModule } from "../src/auth/auth.module";
import { SeedersModule } from "../src/seeders/seeders.module";
import { CreateUserDto } from "../src/users/dto/create-user.dto";
import { UsersService } from "../src/users/service/users.service";

describe('Authentication', () => {
    const BASE_USER_NB = 10;
    const WRONG_USER_NB = 10;

    let users: CreateUserDto[];
    let seeder: SeedersService;

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

        await getConnection().synchronize(true);

        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            transform: true,
        }))

        await app.init();

        usersService = app.get(UsersService);
        seeder = app.get(SeedersService);

        users = seeder.generateUserDtos(BASE_USER_NB);

        for (const user of users) {
            await usersService.create({ ... user });
        }
    });

    afterAll(async () => {
        await app.close();
    });

    // Body validation is handled by Passport, not class-validator. Thus no extensive validation checking is really required.
    it('Authorization should be refused: body is empty', async () => {
        const res = await request(app.getHttpServer())
            .post('/auth/login')
            .set('Accept', 'application/json')
            .send();
        
        expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
    })

    // Select one of the user randomly to make connection attempt
    it(`Login should be successful for (${BASE_USER_NB}) valid users.`, async () => {
        for (const user of users) {
            const res = await request(app.getHttpServer())
                .post('/auth/login')
                .set('Accept', 'application/json')
                .send(user);

            expect(res.status).toEqual(HttpStatus.CREATED);
            expect(res.body.access_token).toBeDefined();
            expect(isJWT(res.body.access_token)).toBeTruthy();           
        }

    });

    // select two random users from the array and try to login
    it(`Should _NOT_ login with ${WRONG_USER_NB} invalid users`, async () => {
        const wrongUsers = seeder.generateUserDtos(WRONG_USER_NB);

        for (const wrongUser of wrongUsers) {
            const res = await request(app.getHttpServer())
                .post('/auth/login')
                .set('Accept', 'application/json')
                .send(wrongUser);

                expect(res.status).toEqual(HttpStatus.UNAUTHORIZED);
        }
    });
});
