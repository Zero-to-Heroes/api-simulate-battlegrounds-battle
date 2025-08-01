import { CardIds, GameTag, hasMechanic } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnAttackInput } from '../../../simulation/on-attack';
import { grantStatsToMinionsOfEachType } from '../../../utils';
import { OnAttackCard } from '../../card.interface';

export const PrimevalMonstrosity: OnAttackCard = {
	cardIds: [CardIds.PrimevalMonstrosity_BG33_320, CardIds.PrimevalMonstrosity_BG33_320_G],
	onAnyMinionAttack: (minion: BoardEntity, input: OnAttackInput) => {
		if (hasMechanic(input.gameState.allCards.getCard(input.attacker.cardId), GameTag.BACON_RALLY)) {
			const mult = minion.cardId === CardIds.PrimevalMonstrosity_BG33_320_G ? 2 : 1;
			grantStatsToMinionsOfEachType(
				minion,
				input.attackingBoard,
				input.attackingHero,
				3 * mult,
				3 * mult,
				input.gameState,
			);
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
