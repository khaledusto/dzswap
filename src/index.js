import express from 'express';
import 'dotenv/config';
import "./services/Logger";
import { connectDatabase } from './connectDB';
import routes from './routes';
import StatusWorker from './services/StatusWorker';
import { bot, initBot } from './bot';

const app = express();

app.use('/', routes);

app.use(bot.webhookCallback(`/${process.env.API_BOT_KEY}`));

app.listen(process.env.APP_PORT, async () => {
  logger.info(`Server listening on ${process.env.APP_HOST}:${process.env.APP_PORT}`);
  await initBot();
  await connectDatabase(process.env.DB_HOST, process.env.DB_PORT, process.env.DB_NAME);
  await StatusWorker.run();
});

process.on('uncaughtException', (err) => {

  logger.error(`message: ${err.message} stack: ${err.stack}`, () => {
    process.exit(1);
  });

});
