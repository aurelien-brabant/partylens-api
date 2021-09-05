import { HttpStatus, INestApplication, ValidationPipe } from "@nestjs/common";
import { CreateUserDto } from "../src/users/dto/create-user.dto";
import { UsersService } from "../src/users/service/users.service";
import * as request from 'supertest';
import { AuthModule } from "../src/auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Test } from "@nestjs/testing";
import { getConnection } from "typeorm";
import { UserEntity } from "../src/users/entity/user.entity";

describe('e', () => {
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

        for (const user of users) {
            await usersService.create({ ...user });
        }

        await app.init();
    })

    afterAll(async () => {
        await app.close();
    })

    it('[ POST /users ] Should add a user to the database', async () => {
        const userDto: CreateUserDto = {
            name: 'added_user',
            password: 'addeduserpass',
            email: 'addeduser@gmail.com'
        }

        const excludedFields = [ 'email', 'password' ];

        const res = await request(app.getHttpServer())
        .post('/users')
        .set('Accept', 'application/json')
        .send(userDto);

        expect(res.status).toEqual(HttpStatus.CREATED);

        const createdUser = res.body as Partial<UserEntity>;
        expect(createdUser.name).toEqual(userDto.name);

        for (const excludedField of excludedFields) {
            expect(createdUser[excludedField]).toBeUndefined() 
        }
    })

    it('[POST /users] Should _NOT_ POST user: email already exists (conflict error)', async () => {
        const res = await request(app.getHttpServer())
        .post('/users')
        .set('Accept', 'application/json')
        .send(users[1]);

        expect(res.status).toEqual(HttpStatus.CONFLICT);
    })

    it('[POST /users] Should _NOT_ POST user: invalid username', async () => {
        const invalidUsernames = [
            '_darksasuke78', // starting with an underscore
            '78darksasuke', // starting with a digit
            'darksasukeandnarutolover', // too long
            'Ri', // too short
            'Ri Zitas' // contains space
        ]

        const basereq = request(app.getHttpServer())
            .post('/users')
            .set('Accept', 'application/json');
        
        for (const invalidUsername of invalidUsernames) {
            const res = await basereq.send({
                email: 'somevalidemail@gmail.com',
                name: invalidUsername,
                password: 'somecoolpassword'
            });

            expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
        }
    })

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

        const basereq = request(app.getHttpServer())
            .post('/users')
            .set('Accept', 'application/json');
        
        for (let i = 0; i != validUsernames.length; ++i) {
            const res = await basereq.send({
                email: `somevalidemail${i}@gmail.com`, // to avoid conflict use a number
                name: validUsernames[i],
                password: 'somecoolpassword'
            });

            expect(res.status).toEqual(HttpStatus.CREATED);
        }
    })

    it('[POST /users] Should _NOT_ POST user: invalid email', async () => {
        const res = await request(app.getHttpServer())
        .post('/users')
        .set('Accept', 'application/json')
        .send({
            email: 'testgmail.com',
            name: 'test78' /* should not start with a digit */,
            password: 'test78'
        });

        expect(res.status).toEqual(HttpStatus.BAD_REQUEST);
    })

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
    })
})
