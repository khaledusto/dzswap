import Telegraf from 'telegraf';
import rp from 'request-promise';
import RedisSession from 'telegraf-session-redis';
import Stage from 'telegraf/stage';
import start from './controllers/start';
import currFrom from './controllers/currFrom';
import curTo from './controllers/curTo';
import amount from './controllers/amount';
import addInfo from './controllers/addInfo';
import estimateExchange from './controllers/estimateExchange';
import checkAgree from './controllers/checkAgree';
import read from './controllers/read';
import startNewExchange from './controllers/startNewExchange';
import { messages } from './messages';
import scenes from './constants/scenes';
import buttons from './constants/buttons';
import { createAnswerByUpdateSubType, pause } from './helpers';
import updateTypes from './constants/updateTypes';

export const bot = new Telegraf(process.env.API_BOT_KEY);

export const stage = new Stage([
  start,
  currFrom,
  curTo,
  amount,
  addInfo,
  estimateExchange,
  checkAgree,
  read,
  startNewExchange
]);

export const session = new RedisSession({
  store: {
    host: process.env.DB_REDIS_HOST || '127.0.0.1',
    port: process.env.DB_REDIS_PORT || 6379,
  }
});

stage.hears([buttons.help, buttons.cancel], async ctx => {
  const { text } = ctx.message;

  if (text === buttons.help) {
    await ctx.reply(`${messages.support}\n${process.env.CN_EMAIL}`);
    return;
  }

  if (text === buttons.cancel) {

    ctx.session.tradingData = {};

    await ctx.scene.leave();

    await ctx.scene.enter(scenes.startNewExchange);
  }
});

stage.command('start', async (ctx, next) => {
  await ctx.scene.leave();
  return next();
});

bot.use(session);

bot.use(stage.middleware());

bot.start(async ctx => {
  if (ctx.session) {
    ctx.session = null;
  }

  await ctx.scene.enter(scenes.read);
});

bot.on(updateTypes.message, async (ctx, next) => {
  const { session, updateSubTypes, message, scene } = ctx;

  if ((!session || !session.userId) && !scene.current) {

    await ctx.reply(messages.replyForCrash);

    await ctx.scene.leave();

    ctx.session = null;

    await pause(500);

    await ctx.scene.enter(scenes.read);

    return;
  }

  if (message.text === messages.startNewExchange || message.text === messages.startExchange) {
    await ctx.scene.enter(scenes.currFrom);
    return;
  }

  const promises = updateSubTypes.map(async type => {

    const textMessage = createAnswerByUpdateSubType(type);

    if (textMessage) {
      await ctx.reply(textMessage);
      await pause(500);
    }

  });

  await Promise.all(promises);

  if (scene.current) {

    if (scene.current.id === scenes.read) {
      await ctx.reply(messages.pressButton);
      return;
    }

    if (scene.current.id === scenes.startNewExchange) {
      await ctx.reply(messages.pressButton);
      return;
    }

    if (scene.current.id === scenes.agree) {
      await ctx.reply(messages.pressButton);
      return;
    }

    if (scene.current.id === scenes.start && !session.listenPressButton) {
      await scene.reenter();
      return;
    }

    if (scene.current.id === scenes.start && session.listenPressButton) {
      await ctx.reply(messages.pressButton);
      return;
    }

  }

  return next();
});

export async function initBot() {
  if (process.env.NODE_ENV === 'development') {
    rp(`https://api.telegram.org/bot${process.env.API_BOT_KEY}/deleteWebhook`).then(() =>
      bot.startPolling()
    );
  } else if (process.env.NODE_ENV !== 'development' && process.env.APP_USE_CERTIFICATE == 'true') {
    await bot.telegram.setWebhook(
      `${process.env.APP_EXTERNAL_HOST}/${process.env.API_BOT_KEY}`,
      {
        source: process.env.SSL_CERTIFICATE_PATH
      }
    );
  } else if (process.env.NODE_ENV !== 'development' && process.env.APP_USE_CERTIFICATE == 'false' ) {
    await bot.telegram.setWebhook(
      `${process.env.APP_EXTERNAL_HOST}/${process.env.API_BOT_KEY}`);
  }
}
