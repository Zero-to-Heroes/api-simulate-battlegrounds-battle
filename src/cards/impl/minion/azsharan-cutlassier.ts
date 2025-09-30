import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { BattlecryInput } from '../../../simulation/battlecries';
import { BattlecryCard } from '../../card.interface';

export const AzsharanCutlassier: BattlecryCard = {
	cardIds: [CardIds.AzsharanCutlassier_BG33_830, CardIds.AzsharanCutlassier_BG33_830_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mult = minion.cardId === CardIds.AzsharanCutlassier_BG33_830_G ? 2 : 1;
		input.hero.globalInfo.TavernSpellAttackBuff += 1 * mult;
		return true;
	},
};
