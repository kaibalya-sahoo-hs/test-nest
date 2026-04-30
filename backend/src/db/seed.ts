import { NestFactory } from "@nestjs/core";
import { AppModule } from "src/app.module";
import { SeedService } from "src/database/seed.service";

async function seed() {
    const app =  await NestFactory.createApplicationContext(AppModule)
    const seeder = app.get(SeedService)
    try {
        await seeder.seedAll()
        console.log("Seeding complete")
    } catch (error) {
        console.log("Error in seeding", error)
    }finally{
        app.close()
    }
}

seed()