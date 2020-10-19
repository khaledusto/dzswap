import Scene from 'telegraf/scenes/base';
import scenes from '../constants/scenes';
import { messages } from '../messages';
import { getBackKeyboard } from '../keyboards';

const startNewExchange = new Scene(scenes.startNewExchange);

startNewExchange.enter(async ctx => {
  await ctx.reply(messages.cancel, getBackKeyboard());
});

export default startNewExchange;
