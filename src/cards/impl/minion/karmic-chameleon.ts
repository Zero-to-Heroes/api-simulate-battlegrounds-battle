import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { AvengeInput } from '../../../simulation/avenge';
import { makeMinionGolden } from '../../../simulation/utils/golden';
import { copyEntity } from '../../../utils';
import { AvengeCard, hasOnSpawned } from '../../card.interface';
import { cardMappings } from '../_card-mappings';

export const KarmicChameleon: AvengeCard = {
	cardIds: [CardIds.KarmicChameleon_BG31_802, CardIds.KarmicChameleon_BG31_802_G],
	baseAvengeValue: (cardId: string) => 5,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const board = input.board.filter((e) => e.health > 0 && !e.definitelyDead);
		const chameleonIndex = input.board.findIndex((entity) => entity.entityId === minion.entityId);
		if (chameleonIndex > 0) {
			const minionToTheLeft = board[chameleonIndex - 1];
			if (!!minionToTheLeft) {
				const clone: BoardEntity = {
					...copyEntity(minionToTheLeft),
					entityId: input.gameState.sharedState.currentEntityId++,
				};
				if (minion.cardId === CardIds.KarmicChameleon_BG31_802_G) {
					makeMinionGolden(
						clone,
						minion,
						input.board,
						input.hero,
						input.otherBoard,
						input.otherHero,
						input.gameState,
					);
				}
				input.board.splice(chameleonIndex, 1, clone);
				input.gameState.spectator.registerPowerTarget(
					minion,
					minionToTheLeft,
					input.board,
					input.hero,
					input.otherHero,
				);
				// Also need to apply the aura, if it has one
				const onSpawnedImpl = cardMappings[clone.cardId];
				if (hasOnSpawned(onSpawnedImpl)) {
					onSpawnedImpl.onSpawned(clone, {
						hero: input.hero,
						board: board,
						gameState: input.gameState,
					});
				}
			}
		}
	},
};
