import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnAttackInput } from '../../../simulation/on-attack';
import { grantStatsToMinionsOfEachType } from '../../../utils';
import { RallyCard } from '../../card.interface';

export const Yrel: RallyCard = {
	cardIds: [CardIds.Yrel_BG23_350, CardIds.Yrel_BG23_350_G],
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		const mult = minion.cardId === CardIds.Yrel_BG23_350_G ? 2 : 1;
		grantStatsToMinionsOfEachType(
			input.attacker,
			input.attackingBoard,
			input.attackingHero,
			1 * mult,
			2 * mult,
			input.gameState,
		);
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
