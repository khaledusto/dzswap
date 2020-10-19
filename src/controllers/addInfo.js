import Scene from 'telegraf/scenes/base';
import { getExtraIDKeyboard } from '../keyboards';
import { messages } from '../messages';
import buttons from '../constants/buttons';
import scenes from '../constants/scenes';

const addInfo = new Scene(scenes.addInfo);

addInfo.enter(async ctx => {
  const { tradingData } = ctx.session;
  const { currTo } = tradingData;
  const { hasExternalId, externalIdName } = currTo;

  if (hasExternalId) {
    await ctx.reply(
      `Enter the ${externalIdName}`,
      getExtraIDKeyboard()
    );
    ctx.session.tradingData = { ...tradingData, externalIdName };
  } else {
    await ctx.scene.enter(scenes.agree);
  }
});

addInfo.hears([/(.*)/gi, buttons.back, buttons.next], async ctx => {
    const { text } = ctx.message;
    const { tradingData } = ctx.session;

    if (text === buttons.back) {
      await ctx.scene.enter(scenes.estExch);
      return;
    }

    if (text === buttons.next) {
      await ctx.scene.enter(scenes.agree);
      return;
    }

    if (text.match(/[^A-Za-z0-9\s]+/gi)) {
      await ctx.reply(messages.validErr);
      return;
    }

    ctx.session.tradingData = { ...tradingData, extraId: text };

    await ctx.scene.enter(scenes.agree);

  }
);

export default addInfo;
