import { Module } from "@nestjs/common";
import { UsersModule } from "src/users/users.module";
import { IsValidNametag, IsValidNametagValidator } from "./services/isValidNametag";

@Module({
    imports: [
        UsersModule
    ],

    providers: [
        IsValidNametagValidator
    ]
})
export class ValidatorsModule {}
