import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SeedersService } from "./seeders/seeders.service";

import { Command } from 'commander';

const program = new Command();

program
  .option('-u, --user-nb <number>', 'number of random users that will be generated', '20')
  .option('-p --party-nb <number>', 'number of random parties that will be generated', '5')
  .option('-P --user-password <password>', 'The password which is used for every generated user except admin', 'pass')

program.parse(process.argv)

const options = program.opts();

async function bootstrap() {
    NestFactory.createApplicationContext(AppModule)
      .then(appContext => {
        const seeder = appContext.get(SeedersService);
        seeder
          .seed(options.userNb, options.partyNb, options.userPassword)
          .catch(error => {
            throw error;
          })
          .finally(() => appContext.close());
      })
      .catch(error => {
        throw error;
      });
  }
  bootstrap();
