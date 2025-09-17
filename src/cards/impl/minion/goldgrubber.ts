import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { modifyStats } from '../../../simulation/stats';
import { isGolden } from '../../../utils';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const GoldGrubber: EndOfTurnCard = {
	cardIds: [CardIds.Goldgrubber_BGS_066, CardIds.Goldgrubber_TB_BaconUps_130],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === CardIds.Goldgrubber_TB_BaconUps_130 ? 2 : 1;
		const goldenMinions = input.board.filter((e) => isGolden(e.cardId, input.gameState.allCards)).length;
		for (let i = 0; i < goldenMinions; i++) {
			modifyStats(minion, minion, 3 * mult, 2 * mult, input.board, input.hero, input.gameState);
		}
	},
};
