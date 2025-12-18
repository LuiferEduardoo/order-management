import { registerAs } from '@nestjs/config';

export default registerAs('config', () => {
  return {
    port: process.env.APP_PORT,
    nodeEnv: process.env.NODE_ENV,
    db: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
  };
});
