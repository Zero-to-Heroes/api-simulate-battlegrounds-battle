import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { getNeighbours } from '../../../simulation/attack';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { StartOfCombatCard } from '../../card.interface';

export const TimewarpedDragonling: StartOfCombatCard = {
	cardIds: [CardIds.TimewarpedDragonling_BG34_Giant_029, CardIds.TimewarpedDragonling_BG34_Giant_029_G],
	startOfCombatTiming: 'start-of-combat',
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const mult = minion.cardId === CardIds.TimewarpedDragonling_BG34_Giant_029_G ? 2 : 1;
		const neighbours = getNeighbours(input.playerBoard, minion);
		const targets = [...neighbours, minion];
		const tavernTier = input.playerEntity.tavernTier ?? 3;
		for (const target of targets) {
			modifyStats(
				target,
				minion,
				tavernTier * mult,
				tavernTier * mult,
				input.playerBoard,
				input.playerEntity,
				input.gameState,
			);
		}
		return { hasTriggered: true, shouldRecomputeCurrentAttacker: false };
	},
};
