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
        await app.init();

        await getConnection().synchronize(true);

        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            transform: true,
        }))

        usersService = app.get(UsersService);

        for (const user of users) {
            await usersService.create({ ...user });
        }
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
        console.log(createdUser);
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
})