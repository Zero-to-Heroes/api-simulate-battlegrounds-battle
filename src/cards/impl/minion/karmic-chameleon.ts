import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { AvengeInput } from '../../../simulation/avenge';
import { makeMinionGolden } from '../../../simulation/utils/golden';
import { copyEntity, stringifySimple, stringifySimpleCard } from '../../../utils';
import { AvengeCard } from '../../card.interface';

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
			}
		}
	},
};
