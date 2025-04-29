import { CardIds } from '@firestone-hs/reference-data';
import { DefaultScriptDataNumCard } from '../../card.interface';

export const SharptoothSnapper: DefaultScriptDataNumCard = {
	cardIds: [CardIds.SharptoothSnapper_BG32_201, CardIds.SharptoothSnapper_BG32_201_G],
	defaultScriptDataNum: (cardId: string) => (cardId === CardIds.SharptoothSnapper_BG32_201_G ? 2 : 1),
};
