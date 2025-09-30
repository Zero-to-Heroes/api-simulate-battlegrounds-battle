import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { OnAttackInput } from '../../../simulation/on-attack';
import { RallyCard } from '../../card.interface';

export const SuperConstructor: RallyCard = {
	cardIds: [CardIds.SuperConstructor_BG33_808, CardIds.SuperConstructor_BG33_808_G],
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		const mult = minion.cardId === CardIds.SuperConstructor_BG33_808_G ? 2 : 1;
		input.attackingHero.globalInfo.TavernSpellAttackBuff += 1 * mult;
		input.attackingHero.globalInfo.TavernSpellHealthBuff += 1 * mult;
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
