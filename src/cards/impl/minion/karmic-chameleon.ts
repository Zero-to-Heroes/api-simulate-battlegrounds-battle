import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { AvengeInput } from '../../../simulation/avenge';
import { makeMinionGolden } from '../../../simulation/utils/golden';
import { addImpliedMechanics } from '../../../utils';
import { AvengeCard } from '../../card.interface';

export const KarmicChameleon: AvengeCard = {
	cardIds: [CardIds.KarmicChameleon_BG31_802, CardIds.KarmicChameleon_BG31_802_G],
	baseAvengeValue: (cardId: string) => 5,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const chameleonIndex = input.board.findIndex((entity) => entity.entityId === minion.entityId);
		if (chameleonIndex > 0) {
			const minionToTheLeft = input.board[chameleonIndex - 1];
			const clone: BoardEntity = addImpliedMechanics(
				{
					...minionToTheLeft,
					entityId: input.gameState.sharedState.currentEntityId++,
					lastAffectedByEntity: null,
					definitelyDead: false,
					attackImmediately: false,
				},
				input.gameState.cardsData,
			);
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
			input.gameState.spectator.registerPowerTarget(
				minion,
				minionToTheLeft,
				input.board,
				input.hero,
				input.otherHero,
			);
			input.board.splice(chameleonIndex, 1, clone);
		}
	},
};
