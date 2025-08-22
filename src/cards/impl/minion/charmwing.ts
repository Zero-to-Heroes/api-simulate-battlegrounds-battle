import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { pickRandom } from '../../../services/utils';
import { OnAttackInput } from '../../../simulation/on-attack';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { RallyCard } from '../../card.interface';

export const Charmwing: RallyCard = {
	cardIds: [CardIds.Charmwing_BG33_240, CardIds.Charmwing_BG33_240_G],
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		const mult = minion.cardId === CardIds.Charmwing_BG33_240_G ? 2 : 1;
		const picked = [];
		for (let i = 0; i < 2; i++) {
			const candidates = input.attackingBoard.filter(
				(e) =>
					!Charmwing.cardIds.includes(e.cardId) &&
					!picked.includes(e) && // Not sure about this yet
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
						minion.maxHealth,
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
