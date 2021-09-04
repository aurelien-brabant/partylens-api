import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import {  IsValidNametagValidator } from "./services/isValidNametag";

@Module({
    imports: [
        UsersModule
    ],

    providers: [
        IsValidNametagValidator
    ]
})
export class ValidatorsModule {}
