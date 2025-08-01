import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { updateVenomous } from '../../../keywords/venomous';
import { pickRandom } from '../../../services/utils';
import { OnAttackInput } from '../../../simulation/on-attack';
import { hasCorrectTribe } from '../../../utils';
import { OnAttackCard } from '../../card.interface';

export const BileSpitter: OnAttackCard = {
	cardIds: [CardIds.BileSpitter_BG33_318, CardIds.BileSpitter_BG33_318_G],
	onAnyMinionAttack: (minion: BoardEntity, input: OnAttackInput) => {
		if (minion !== input.attacker) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}

		const mult = minion.cardId === CardIds.BileSpitter_BG33_318_G ? 2 : 1;
		for (let i = 0; i < mult; i++) {
			const candidates = input.attackingBoard.filter(
				(e) =>
					e !== minion &&
					!e.venomous &&
					!e.poisonous &&
					hasCorrectTribe(
						e,
						input.attackingHero,
						Race.MURLOC,
						input.gameState.anomalies,
						input.gameState.allCards,
					),
			);
			const target = pickRandom(candidates);
			if (target) {
				updateVenomous(
					target,
					true,
					input.attackingBoard,
					input.attackingHero,
					input.defendingHero,
					input.gameState,
				);
			}
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
