import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnAttackInput } from '../../../simulation/on-attack';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { hasCorrectTribe } from '../../../utils';
import { DefaultChargesCard, OnWheneverAnotherMinionAttacksCard } from '../../card.interface';

export const BluesySiren: OnWheneverAnotherMinionAttacksCard & DefaultChargesCard = {
	cardIds: [TempCardIds.BluesySiren, TempCardIds.BluesySiren_G],
	defaultCharges: (entity: BoardEntity) => 3,
	onWheneverAnotherMinionAttacks: (minion: BoardEntity, input: OnAttackInput) => {
		if (
			!hasCorrectTribe(
				input.attacker,
				input.attackingHero,
				Race.NAGA,
				input.gameState.anomalies,
				input.gameState.allCards,
			)
		) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}

		const mult = minion.cardId === TempCardIds.BluesySiren_G ? 2 : 1;
		minion.abiityChargesLeft = minion.abiityChargesLeft - 1;
		// TODO: update Deep Blues future buffs
		modifyStats(
			input.attacker,
			minion,
			2 * mult,
			3 * mult,
			input.attackingBoard,
			input.attackingHero,
			input.gameState,
		);
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
