import { BoardEntity } from '../../../board-entity';
import { getNeighbours } from '../../../simulation/attack';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { StartOfCombatCard } from '../../card.interface';

export const TimewarpedDragonling: StartOfCombatCard = {
	cardIds: [TempCardIds.TimewarpedDragonling, TempCardIds.TimewarpedDragonling_G],
	startOfCombatTiming: 'start-of-combat',
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedDragonling_G ? 2 : 1;
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
