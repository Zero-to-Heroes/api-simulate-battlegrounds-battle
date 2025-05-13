import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const AmplifyingLightspawn: EndOfTurnCard = {
	cardIds: [CardIds.AmplifyingLightspawn_BG32_845, CardIds.AmplifyingLightspawn_BG32_845_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput): boolean => {
		const mult = minion.cardId === CardIds.AmplifyingLightspawn_BG32_845_G ? 2 : 1;
		if (minion.scriptDataNum1 === 1) {
			input.hero.globalInfo.ElementalAttackBuff += 1 * mult;
		} else {
			input.hero.globalInfo.ElementalHealthBuff += 1 * mult;
		}
		return true;
	},
};
