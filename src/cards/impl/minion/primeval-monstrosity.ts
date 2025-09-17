import { CardIds } from '../../../services/card-ids';
import { GameTag } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnAttackInput } from '../../../simulation/on-attack';
import { grantStatsToMinionsOfEachType, hasEntityMechanic } from '../../../utils';
import { OnWheneverAnotherMinionAttacksCard } from '../../card.interface';

export const PrimevalMonstrosity: OnWheneverAnotherMinionAttacksCard = {
	cardIds: [CardIds.PrimevalMonstrosity_BG33_320, CardIds.PrimevalMonstrosity_BG33_320_G],
	onWheneverAnotherMinionAttacks: (minion: BoardEntity, input: OnAttackInput) => {
		if (hasEntityMechanic(input.attacker, GameTag.BACON_RALLY, input.gameState.allCards)) {
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
