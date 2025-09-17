import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { BattlecryCard } from '../../card.interface';

export const SandSwirler: BattlecryCard = {
	cardIds: [CardIds.SandSwirler_BG32_841, CardIds.SandSwirler_BG32_841_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput): boolean => {
		const mult = minion.cardId === CardIds.GlowingCinder_BG32_842_G ? 2 : 1;
		input.hero.globalInfo.ElementalHealthBuff += 1 * mult;
		return true;
	},
};
