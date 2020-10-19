import Scene from 'telegraf/scenes/base';
import { isAvailableCurr, getCurrencyName, pause, getMessageIfCurrencyNotFound } from '../helpers';
import { messages } from '../messages';
import { getAllCurrencies, getCurrInfo } from '../api';
import { getFromKeyboard } from '../keyboards';
import scenes from '../constants/scenes';
import Transaction from '../models/Transaction';

const currFrom = new Scene(scenes.currFrom);

currFrom.enter(async ctx => {

  if (ctx.session.listenPressButton) {
    ctx.session.listenPressButton = false;
  }

  if (!ctx.session.allCurrencies) {
    ctx.session.allCurrencies = await getAllCurrencies();
  }

  ctx.session.tradingData = {};

  const { tradingData, userId } = ctx.session;

  const userTransactions = await Transaction.find({ telegramUserId: userId });

  if (userTransactions) {
    const promises = userTransactions.map(async trn => {

      trn.disableNotify = true;

      await trn.save();
    });

    await Promise.all(promises);
  }

  const chosenCurr = tradingData.currFrom ? tradingData.currFrom.ticker : '';
  await ctx.replyWithHTML(messages.selectFromMsg, getFromKeyboard(chosenCurr));
});

currFrom.hears(/(.*)/gi, async (ctx) => {
  const { text } = ctx.message;
  const { allCurrencies, tradingData } = ctx.session;

  if (text && text.trim().length) {

    if (text.match(/^[\u{2705}]/gu)) {
      await ctx.scene.enter(scenes.currTo);
      return;
    }

    if (text.match(/[^()A-Za-z\s]+/gi)) {
      await ctx.reply(messages.validErr);
      return;
    }

    const currencyName = getCurrencyName(text);
    const currIndex = isAvailableCurr(currencyName, allCurrencies);

    if (currIndex === -1) {
      await ctx.reply(getMessageIfCurrencyNotFound(currencyName));
      await pause(500);
      await ctx.scene.reenter();
      return;
    }

    await ctx.replyWithHTML(`Selected currency - <b>${allCurrencies[currIndex].ticker.toUpperCase()}</b>.`);

    ctx.session.tradingData = { ...tradingData, currFrom: await getCurrInfo(allCurrencies[currIndex].ticker) };

    await ctx.scene.enter(scenes.currTo);
  }

});

export default currFrom;
