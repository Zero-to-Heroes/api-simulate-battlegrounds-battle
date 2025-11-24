import { BoardEntity } from '../../../board-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { makeMinionGolden } from '../../../simulation/utils/golden';
import { TempCardIds } from '../../../temp-card-ids';
import { copyEntity } from '../../../utils';
import { hasOnSpawned, StartOfCombatCard } from '../../card.interface';
import { cardMappings } from '../_card-mappings';

export const TimewarpedChameleon: StartOfCombatCard = {
	cardIds: [TempCardIds.TimewarpedChameleon, TempCardIds.TimewarpedChameleon_G],
	startOfCombatTiming: 'start-of-combat',
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const board = input.playerBoard.filter((e) => e.health > 0 && !e.definitelyDead);
		const chameleonIndex = input.playerBoard.findIndex((entity) => entity.entityId === minion.entityId);
		if (chameleonIndex > 0) {
			const minionToTheLeft = board[chameleonIndex - 1];
			if (!!minionToTheLeft) {
				const clone: BoardEntity = {
					...copyEntity(minionToTheLeft),
					entityId: input.gameState.sharedState.currentEntityId++,
				};
				if (minion.cardId === TempCardIds.TimewarpedChameleon_G) {
					makeMinionGolden(
						clone,
						minion,
						input.playerBoard,
						input.playerEntity,
						input.opponentBoard,
						input.opponentEntity,
						input.gameState,
					);
				}
				input.playerBoard.splice(chameleonIndex, 1, clone);
				input.gameState.spectator.registerPowerTarget(
					minion,
					minionToTheLeft,
					input.playerBoard,
					input.playerEntity,
					input.opponentEntity,
				);
				// Also need to apply the aura, if it has one
				const onSpawnedImpl = cardMappings[clone.cardId];
				if (hasOnSpawned(onSpawnedImpl)) {
					onSpawnedImpl.onSpawned(clone, {
						hero: input.playerEntity,
						board: board,
						gameState: input.gameState,
					});
				}
				return { hasTriggered: true, shouldRecomputeCurrentAttacker: false };
			}
		}
		return { hasTriggered: false, shouldRecomputeCurrentAttacker: false };
	},
};
