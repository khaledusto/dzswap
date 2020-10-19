import Scene from 'telegraf/scenes/base';
import scenes from '../constants/scenes';
import { getEmptyKeyboard } from '../keyboards';

const start = new Scene(scenes.start);

start.enter(async ctx => {
  const { userId } = ctx.session;

  const opts = {
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    ...getEmptyKeyboard(),
  };

  await ctx.replyWithHTML(`Please follow this <a href="${process.env.APP_EXTERNAL_HOST}/user-ip/${userId}">link</a> to read our Terms of Use and Privacy Policy. Then, return to the bot to proceed.`, opts);
});

export default start;
