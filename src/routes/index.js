import express from 'express';
import { bot, session } from './../bot';
import { getIpAction } from '../helpers';
import { messages } from '../messages';
import path from "path";
import { getReplyKeyboard } from '../keyboards';

const routes = express.Router();

const getHandle = async (req, res) => {

  await getIpAction(req);

  await bot.telegram.sendMessage(
    req.params.id,
    messages.agreed,
    getReplyKeyboard()
  );

  const sessionKey = `${req.params.id}:${req.params.id}`;

  const currSession = await session.getSession(sessionKey);

  await session.saveSession(sessionKey, { ...currSession, listenPressButton: true });

  res.redirect(302, process.env.REDIRECT_URL);
};

routes.get('/user-ip/:id', getHandle);

routes.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/../../public/404.html'));
});

export default routes;



