import { GameTag, hasMechanic } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnAttackInput } from '../../../simulation/on-attack';
import { TempCardIds } from '../../../temp-card-ids';
import { grantStatsToMinionsOfEachType } from '../../../utils';
import { OnAttackCard } from '../../card.interface';

export const PrimevalMonstrosity: OnAttackCard = {
	cardIds: [TempCardIds.PrimevalMonstrosity, TempCardIds.PrimevalMonstrosity_G],
	onAnyMinionAttack: (minion: BoardEntity, input: OnAttackInput) => {
		if (hasMechanic(input.gameState.allCards.getCard(input.attacker.cardId), GameTag.RALLY)) {
			const mult = minion.cardId === TempCardIds.PrimevalMonstrosity_G ? 2 : 1;
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
