import Scene from 'telegraf/scenes/base';
import { messages } from '../messages';
import { getToKeyboard } from '../keyboards';
import { getCurrencyName, getMessageIfCurrencyNotFound, isAvailableCurr, pause, validatePair } from '../helpers';
import buttons from '../constants/buttons';
import scenes from '../constants/scenes';
import { getCurrInfo } from '../api';

const curTo = new Scene(scenes.currTo);

curTo.enter(async ctx => {
  const { tradingData } = ctx.session;
  const chosenCurr = tradingData.currFrom ? tradingData.currFrom.ticker : '';
  await ctx.replyWithHTML(messages.selectToMsg, getToKeyboard(chosenCurr));
});

curTo.hears([/(.*)/gi, buttons.back], async ctx => {
  const { text } = ctx.message;
  const { allCurrencies, tradingData } = ctx.session;

  if (text && text.trim().length) {

    if (text === buttons.back) {
      ctx.session.tradingData.currTo = '';
      await ctx.scene.enter(scenes.currFrom);
      return;
    }

    if (text.match(/^[\u{2705}]/gu)) {
      await ctx.reply(messages.sameCurErr);
      return;
    }

    if (text.match(/[^()A-Za-z\s]+/gi)) {
      await ctx.reply(messages.validErr);
      return;
    }

    const currencyName = getCurrencyName(text);
    const currIndex = isAvailableCurr(getCurrencyName(text), allCurrencies);

    if (currIndex === -1) {
      await ctx.reply(getMessageIfCurrencyNotFound(currencyName));
      await pause(500);
      await ctx.scene.reenter();
      return;
    }

    const currTo = await getCurrInfo(allCurrencies[currIndex].ticker);

    await ctx.replyWithHTML(`Selected currency - <b>${currTo.ticker.toUpperCase()}</b>.`);

    const { currFrom } = tradingData;
    const pair = `${currFrom.ticker}_${currTo.ticker}`;
    const hasPair = await validatePair(pair);

    if (hasPair) {

      ctx.session.tradingData = { ...tradingData, currTo };

      await ctx.scene.enter(scenes.amount);
      return;
    }

    await ctx.reply(messages.invalidPair);
    await ctx.scene.enter(scenes.currFrom);

  }

});

export default curTo;
