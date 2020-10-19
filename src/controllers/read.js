import Scene from 'telegraf/scenes/base';
import scenes from '../constants/scenes';
import { messages } from '../messages';
import { getMainKeyboard } from '../keyboards';
import UserModel from '../models/User';

const read = new Scene(scenes.read);

read.enter(async ctx => {
  await ctx.reply(messages.startMsg, getMainKeyboard());
});

read.hears([/(.*)/gi, messages.read], async ctx => {
  const { message } = ctx;

  if (message.text !== messages.read) {
    await ctx.reply(messages.pressButton);
    return;
  }

  const { from } = message;
  const user = from;
  const { id: userId, username } = user;

  try {
    const userInDB = await UserModel.findOne({ userId: user.id });

    if (!userInDB) {
      await UserModel.create({ userId, username });
    }
  } catch (e) {
    logger.error(`${__filename}: ${e}`);
  }

  ctx.session.userId = userId;

  await ctx.scene.enter(scenes.start);

});

export default read;
