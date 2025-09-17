import { CardIds } from '../../../services/card-ids';
import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { AvengeInput } from '../../../simulation/avenge';
import { addStatsToBoard } from '../../../utils';
import { AvengeCard } from '../../card.interface';

export const BirdBuddy: AvengeCard = {
	cardIds: [CardIds.BirdBuddy_BG21_002, CardIds.BirdBuddy_BG21_002_G],
	baseAvengeValue: (cardId: string) => 1,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const mult = minion.cardId === CardIds.BirdBuddy_BG21_002_G ? 2 : 1;
		addStatsToBoard(minion, input.board, input.hero, 1 * mult, 1 * mult, input.gameState, Race[Race.BEAST]);
	},
};
