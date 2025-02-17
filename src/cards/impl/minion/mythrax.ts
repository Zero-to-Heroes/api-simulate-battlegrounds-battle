import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { modifyStats } from '../../../simulation/stats';
import { getMinionsOfDifferentTypes } from '../../../utils';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const MythraxTheUnraveler: EndOfTurnCard = {
	cardIds: [CardIds.MythraxTheUnraveler_BGS_202, CardIds.MythraxTheUnraveler_TB_BaconUps_258],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const differentTypes = getMinionsOfDifferentTypes(input.board, input.hero, input.gameState)?.length ?? 0;
		if (differentTypes) {
			const mult = minion.cardId === CardIds.MythraxTheUnraveler_TB_BaconUps_258 ? 2 : 1;
			modifyStats(
				minion,
				mult * 2 * differentTypes,
				mult * 1 * differentTypes,
				input.board,
				input.hero,
				input.gameState,
			);
			input.gameState.spectator.registerPowerTarget(minion, minion, input.board, input.hero, input.otherHero);
		}
	},
};
