import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { modifyStats } from '../../../simulation/stats';
import { getMinionsOfDifferentTypes } from '../../../utils';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const LightfangEnforcer: EndOfTurnCard = {
	cardIds: [CardIds.LightfangEnforcer_BGS_009, CardIds.LightfangEnforcer_TB_BaconUps_082],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === CardIds.LightfangEnforcer_TB_BaconUps_082 ? 2 : 1;
		const targets = getMinionsOfDifferentTypes(input.board, input.hero, input.gameState);
		for (const entity of targets) {
			modifyStats(entity, 4 * mult, 4 * mult, input.board, input.hero, input.gameState);
		}
	},
};
