import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { AvengeInput } from '../../../simulation/avenge';
import { modifyStats } from '../../../simulation/stats';
import { AvengeCard } from '../../card.interface';

export const Stuntdrake: AvengeCard = {
	cardIds: [CardIds.Stuntdrake_BG34_732, CardIds.Stuntdrake_BG34_732_G],
	baseAvengeValue: (cardId: string) => 3,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const loops = minion.cardId === CardIds.Stuntdrake_BG34_732_G ? 2 : 1;
		for (let i = 0; i < loops; i++) {
			const picked: BoardEntity[] = [];
			for (let j = 0; j < 2; j++) {
				const possibleTargets = input.board.filter(
					(e) => !Stuntdrake.cardIds.includes(e.cardId) && !picked.includes(e),
				);
				const target = pickRandom(possibleTargets);
				if (!!target) {
					modifyStats(target, minion, minion.attack, 0, input.board, input.hero, input.gameState);
					picked.push(target);
				}
			}
		}
	},
};
