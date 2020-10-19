import Scene from 'telegraf/scenes/base';
import { getAmountKeyboard } from '../keyboards';
import { messages } from '../messages';
import scenes from '../constants/scenes';
import buttons from '../constants/buttons';
import { getExchAmount } from '../api';

const estimateExchange = new Scene(scenes.estExch);

estimateExchange.enter(async ctx => {
  const { tradingData } = ctx.session;
  const { amount, currFrom, currTo, externalIdName, extraId } = tradingData;
  const { ticker: currFromTicker } = currFrom;
  const { ticker: currToTicker } = currTo;

  const fromTo = `${currFromTicker}_${currToTicker}`;
  const { estimatedAmount } = await getExchAmount(amount, fromTo);

  if (externalIdName) {
    delete ctx.session.tradingData.externalIdName;
  }

  if (extraId) {
    delete ctx.session.tradingData.extraId;
  }

  await ctx.replyWithHTML(
    `Selected pair <b>${currFromTicker.toUpperCase()}-${currToTicker.toUpperCase()}</b>. You’re sending <b>${amount} ${currFromTicker.toUpperCase()}</b>; you’ll get ~<b>${estimatedAmount} ${currToTicker.toUpperCase()}</b>.\nEnter the recipient <b>${currToTicker.toUpperCase()}</b> wallet address.`,
    getAmountKeyboard(ctx)
  );
});

estimateExchange.hears([/(.*)/gi, buttons.back], async ctx => {
  const { text } = ctx.message;
  const { tradingData } = ctx.session;

  if (text === buttons.back) {
    delete ctx.session.tradingData.amount;
    await ctx.scene.enter(scenes.amount);
    return;
  }

  if (text.match(/[^()A-Za-z0-9\s]+/gi)) {
    await ctx.reply(messages.validErr);
    return;
  }

  ctx.session.tradingData = { ...tradingData, walletCode: text };

  await ctx.scene.enter(scenes.addInfo);

});

export default estimateExchange;
