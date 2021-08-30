import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SeedersModule } from "./seeders/seeders.module";
import { SeedersService } from "./seeders/seeders.service";

async function bootstrap() {
    NestFactory.createApplicationContext(AppModule)
      .then(appContext => {
        const seeder = appContext.get(SeedersService);
        seeder
          .seed()
          .then(() => {
              console.log('seeding OK');
          })
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
