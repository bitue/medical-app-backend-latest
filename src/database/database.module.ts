//src/database/database.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: true, // Be cautious about using synchronize in production
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}

// ===========================FOR THE PRODUCTION ENVIRONMENT WITH SSL===========================
// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { ConfigModule, ConfigService } from '@nestjs/config';

// @Module({
//   imports: [
//     ConfigModule.forRoot(),
//     TypeOrmModule.forRootAsync({
//       imports: [ConfigModule],
//       useFactory: (configService: ConfigService) => ({
//         type: 'postgres',
//         host: configService.get('POSTGRES_HOST'),
//         port: configService.get('POSTGRES_PORT'),
//         username: configService.get('POSTGRES_USER'),
//         password: configService.get('POSTGRES_PASSWORD'),
//         database: configService.get('POSTGRES_DB'),
//         ssl: {
//           rejectUnauthorized: false, // You can set it to `true` in production if you want to verify SSL certificates
//         },
//         extra: {
//           sslmode: configService.get('SSL_MODE') || 'require', // Default to 'require' if not set
//           channel_binding: configService.get('CHANNEL_BINDING') || 'require', // Default to 'require' if not set
//         },
//         entities: [__dirname + '/../**/*.entity{.ts,.js}'],
//         synchronize: true, // Be cautious about using synchronize in production
//         autoLoadEntities: true,
//       }),
//       inject: [ConfigService],
//     }),
//   ],
// })
// export class DatabaseModule {}
