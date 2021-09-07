import { HttpStatus, INestApplication, ValidationPipe } from "@nestjs/common";
import { CreateUserDto } from "../src/users/dto/create-user.dto";
import { UsersService } from "../src/users/service/users.service";
import * as request from 'supertest';
import { AuthModule } from "../src/auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Test } from "@nestjs/testing";
import { getConnection } from "typeorm";
import { UserEntity } from "../src/users/entity/user.entity";
import {SeedersService} from "../src/seeders/seeders.service";
import {UsersModule} from "../src/users/users.module";
import {SeedersModule} from "../src/seeders/seeders.module";

describe('Users', () => {
    const BASE_USER_NB = 10;
    const POST_USER_NB = 50;

    let users = null; 
    let app: INestApplication;
    let usersService: UsersService;
    let seedersService: SeedersService;

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
                SeedersModule,
                UsersModule
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
        seedersService = app.get(SeedersService);

        users = seedersService.generateUserDtos(BASE_USER_NB);

        for (const user of users) {
            await usersService.create({ ...user });
        }
    });

    afterAll(async () => {
        await app.close();
    });

    it(`[ POST /users ] Should add (${POST_USER_NB}) users to the database`, async () => {

        const userDtos: CreateUserDto[] = seedersService.generateUserDtos(POST_USER_NB);

        const excludedFields = [ 'email', 'password' ];

        for (const userDto of userDtos) {
            const res = await request(app.getHttpServer())
            .post('/users')
            .set('Accept', 'application/json')
            .send(userDto);

            expect(res.status).toEqual(HttpStatus.CREATED);
            const createdUser = res.body;
            expect(createdUser.name).toEqual(userDto.name);

            for (const excludedField of excludedFields) {
                expect(createdUser[excludedField]).toBeUndefined() 
            }
        }
    });

    it(`[POST /users] Should _NOT_ POST (${BASE_USER_NB}) users: email already exists (conflict error)`, async () => {

        for (const user of users) {
            const res = await request(app.getHttpServer())
            .post('/users')
            .set('Accept', 'application/json')
            .send(user);

            expect(res.status).toEqual(HttpStatus.CONFLICT);
        }
    });

    it('[POST /users] Should _NOT_ POST user: invalid username', async () => {
        const invalidUsernames = [
            '_darksasuke78', // starting with an underscore
            '78darksasuke', // starting with a digit
            'darksasukeandnarutolover', // too long
            'Ri', // too short
            'Ri Zitas' // contains space
        ]

        for (const invalidUsername of invalidUsernames) {
            const res = await request(app.getHttpServer())
                .post('/users')
                .set('Accept', 'application/json')
                .send({
                email: 'somevalidemail@gmail.com',
                name: invalidUsername,
                password: 'somecoolpassword'
            });

            expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
        }
    });

    /**
     * Ensure that a given set of usernames is indeed valid.
     */

    it('[POST /users] Should POST user: valid usernames', async () => {
        const validUsernames = [
            'darksasuke78',
            'dark_sasuke_78',
            'D0Rk_SaSuKe',
            'Rizitoz',
            'i_l_O_v_e_u'
        ];

        for (let i = 0; i != validUsernames.length; ++i) {
            const res = await request(app.getHttpServer())
                .post('/users')
                .set('Accept', 'application/json')
                .send({
                email: `somevalidemail${i}@gmail.com`, // to avoid conflict use a number
                name: validUsernames[i],
                password: 'somecoolpassword'
            });

            expect(res.status).toEqual(HttpStatus.CREATED);
        }
    });

    it('[POST /users] Should _NOT_ POST user: invalid email', async () => {
        const invalidEmails = [
            'testgmail.com',
            '.aurelienbrabant@gmail.com',
            'aurelien brabant@gmail.com'
        ];

        for (const invalidEmail of invalidEmails) {
            const res = await request(app.getHttpServer())
                .post('/users')
                .set('Accept', 'application/json')
                .send(invalidEmail);

            expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
        }
    });

    /**
     * Ensure that the passed usernames are indeed NOT valid.
     */

    it('[POST /users] Should _NOT_ POST user: missing a required field', async () => {
        const basereq = request(app.getHttpServer())
        .post('/users')
        .set('Accept', 'application/json');

        const invalidDto = {
            email: 'test@gmail.com',
            name: 'test78',
            password: 'test78'
        }

        // try each time with a different missing property
        for (const key in invalidDto) {
            const reqBody = { ...invalidDto };
            delete reqBody[key];

            const res = await basereq.send(reqBody);
            expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
        }
    });
});
