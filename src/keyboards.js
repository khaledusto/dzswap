import Markup from 'telegraf/markup';
import buttons from './constants/buttons';
import popularCurrs from './constants/popularCurrs';

export const getMainKeyboard = () => {
  return Markup.keyboard([buttons.accept])
    .oneTime()
    .resize()
    .extra();
};

export const getReplyKeyboard = () => {
  return Markup.keyboard([buttons.start])
    .oneTime()
    .resize()
    .extra();
};

export const getFromKeyboard = (chosenCurr) => {
  const popularCurrsWithActive = { ...popularCurrs, [chosenCurr]:  `✅ ${popularCurrs[chosenCurr]}`};
  const { btc, eth, bch, ltc, xmr, zec } = popularCurrsWithActive;
  const fullKb = [[btc, eth], [bch, ltc], [xmr, zec], [buttons.cancel], [buttons.help]];

  return Markup.keyboard(fullKb)
    .resize()
    .extra();
};

export const getToKeyboard = (chosenCurr) => {
  const popularCurrsWithActive = { ...popularCurrs, [chosenCurr]:  `✅ ${popularCurrs[chosenCurr]}`};
  const { btc, eth, bch, ltc, xmr, zec } = popularCurrsWithActive;
  const fullKb = [
    [btc, eth],
    [bch, ltc],
    [xmr, zec],
    [buttons.back, buttons.cancel],
    [buttons.help]
  ];

  return Markup.keyboard(fullKb)
    .resize()
    .extra();
};

export const getAmountKeyboard = () => {
  return Markup.keyboard([[buttons.back, buttons.cancel], [buttons.help]])
    .resize()
    .extra();
};

export const getExtraIDKeyboard = () => {
  return Markup.keyboard([[buttons.back, buttons.next], [buttons.cancel], [buttons.help]])
    .resize()
    .extra();
};

export const getAgreeKeyboard = () => {
  return Markup.keyboard([[buttons.confirm, buttons.back], [buttons.help]])
    .resize()
    .extra();
};

export const getBackKeyboard = () => {
  return Markup.keyboard([[buttons.startNew], [buttons.help]])
    .resize()
    .extra();
};

export const getEmptyKeyboard = () => {
  return Markup.removeKeyboard().extra();
};
