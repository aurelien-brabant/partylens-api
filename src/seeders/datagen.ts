import { CreateUserDto } from "src/users/dto/create-user.dto";
//import faker from 'faker';
const faker = require('faker')

const DEFAULT_USER_PASS = 'pass'; /* passwords are all the same to make testing easy */

export const getFakeUsers = (n: number): CreateUserDto[] => {
    const users: CreateUserDto[] = [];
    
    for (let i = 0; i != n; ++i) {
        users.push({
            email: faker.internet.email(),
            name: faker.name.findName(),
            password: DEFAULT_USER_PASS,
        })
    }

    return users;
}
