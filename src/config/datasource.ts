import { DataSourceOptions } from 'typeorm'
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'

const baseDataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'host.docker.internal',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DATABASE || 'postgres',
  synchronize: process.env.ENV_DEV ? true : false,
}

export const dataSourceOptions: PostgresConnectionOptions = {
  ...baseDataSourceOptions,
  entities: ['src/**/*.entity{.js,.ts}'],
}

export const dataSourceOptionsModule = {
  ...baseDataSourceOptions,
  autoLoadEntities: process.env.ENV_DEV ? true : false,
}
