import {Routes} from "@nestjs/core";
import {PartiesModule} from "./parties/parties.module";
import {UsersModule} from "./users/users.module";

export const routes: Routes = [
  {
    path: '/users',
    module: UsersModule,
    children: [
      {
        path: '/:userId/parties',
        module: PartiesModule,
      },
    ],
  },
];
