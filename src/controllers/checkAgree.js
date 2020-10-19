import Scene from 'telegraf/scenes/base';
import { getAgreeKeyboard, getBackKeyboard } from '../keyboards';
import { getIpFromDB, addTransactionToDB, pause } from '../helpers';
import { getExchAmount, sendTransactionData } from '../api';
import buttons from '../constants/buttons';
import scenes from '../constants/scenes';
import { messages } from '../messages';

const checkAgree = new Scene(scenes.agree);

checkAgree.enter(async ctx => {
  const { tradingData } = ctx.session;
  const { currFrom, currTo, walletCode, extraId, externalIdName, amount } = tradingData;
  const { ticker: currFromTicker } = currFrom;
  const { ticker: currToTicker } = currTo;
  const extraIdMsg = extraId && externalIdName ? `Your ${externalIdName} is <b>${extraId}</b>.\n` : '';

  const fromTo = `${currFromTicker}_${currToTicker}`;
  const { estimatedAmount } = await getExchAmount(amount, fromTo);

  await ctx.replyWithHTML(
    `Selected pair <b>${currFromTicker.toUpperCase()}-${currToTicker.toUpperCase()}</b>. You're sending <b>${amount} ${currFromTicker.toUpperCase()}</b>; you’ll get ~<b>${estimatedAmount} ${currToTicker.toUpperCase()}</b>.\nYour recipient <b>${currToTicker.toUpperCase()}</b> wallet address is <b>${walletCode}</b>\n${extraIdMsg}\nPlease make sure all the information you’ve entered is correct. Then tap the Confirm button below.`,
    getAgreeKeyboard()
  );
});

checkAgree.hears([buttons.confirm, buttons.back], async ctx => {
  const { text } = ctx.message;

  if (text === buttons.back) {
    if (ctx.session.tradingData.extraId) {
      delete ctx.session.tradingData.extraId;
    }

    if (ctx.session.tradingData.externalIdName) {
      delete ctx.session.tradingData.externalIdName;
    }

    await ctx.scene.enter(scenes.estExch);
    return;
  }

  if (text === buttons.confirm) {
    const { userId, tradingData } = ctx.session;
    const { currFrom, currTo, walletCode, amount, extraId = '' } = tradingData;
    const ip = await getIpFromDB(userId);

    const data = {
      userId,
      amount,
      extraId,
      ip,
      from: currFrom.ticker,
      to: currTo.ticker,
      address: walletCode,
    };

    const res = await sendTransactionData(data);

    if (res && res.payinAddress) {
      const { transactionExplorerMask } = currTo;
      await addTransactionToDB(res, userId, transactionExplorerMask);

      await ctx.replyWithHTML(
        `You’re sending <b>${amount} ${currFrom.ticker.toUpperCase()}</b>; you’ll get ~<b>${res.amount} ${currTo.ticker.toUpperCase()}</b>.\nHere is the deposit address for your exchange.\nIn order to start the exchange, use your wallet to send your deposit to this address.`,
        getBackKeyboard()
      );

      await pause(500);

      await ctx.reply(`${res.payinAddress}`);    
      if (res.payinExtraId) {
        await ctx.replyWithHTML(`${res.payinExtraIdName} - <b>${res.payinExtraId}</b>`);
      }

      await pause(1000);

      await ctx.replyWithHTML(`Transaction ID - <b>${res.id}</b>.`);
      await ctx.reply(messages.waiting);

      return;
    }

    await ctx.reply(`Sorry, the address you’ve entered is invalid.`);
    await ctx.scene.enter(scenes.estExch);
  }
});

export default checkAgree;
