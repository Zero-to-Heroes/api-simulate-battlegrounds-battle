import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { pickRandom } from '../../../services/utils';
import { OnAttackInput } from '../../../simulation/on-attack';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { OnAttackCard } from '../../card.interface';

export const Charmwing: OnAttackCard = {
	cardIds: [CardIds.Charmwing_BG33_240, CardIds.Charmwing_BG33_240_G],
	onAnyMinionAttack: (minion: BoardEntity, input: OnAttackInput) => {
		if (input.attacker !== minion) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}

		const mult = minion.cardId === CardIds.Charmwing_BG33_240_G ? 2 : 1;
		const picked = [];
		for (let i = 0; i < 2; i++) {
			const candidates = input.attackingBoard.filter(
				(e) =>
					e.cardId !== CardIds.Charmwing_BG33_240 &&
					e.cardId !== CardIds.Charmwing_BG33_240_G &&
					// !picked.includes(e) && // Not sure about this yet
					hasCorrectTribe(
						e,
						input.attackingHero,
						Race.DRAGON,
						input.gameState.anomalies,
						input.gameState.allCards,
					),
			);
			const target = pickRandom(candidates);
			if (!!target) {
				picked.push(target);
				for (let j = 0; j < mult; j++) {
					modifyStats(
						target,
						minion,
						0,
						minion.health,
						input.attackingBoard,
						input.attackingHero,
						input.gameState,
					);
				}
			}
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
