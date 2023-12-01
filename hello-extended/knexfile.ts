// knexfile.ts

import { Knex } from 'knex';
import { parseConfigFile } from '@dbos-inc/dbos-sdk/dist/src/dbos-sdk-runtime/config'
import { DBOSConfig } from '@dbos-inc/dbos-sdk/dist/src/dbos-sdk';

const [dbosConfig, ]: [DBOSConfig, unknown] = parseConfigFile();

const config: Knex.Config = {
  client: 'pg',
  connection: {
    host: dbosConfig.poolConfig.host,
    user: dbosConfig.poolConfig.user,
    password: dbosConfig.poolConfig.password,
    database: dbosConfig.poolConfig.database,
  },
  migrations: {
    directory: './migrations'
  }
};

export default config;
