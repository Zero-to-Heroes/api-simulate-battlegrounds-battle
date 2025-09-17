import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { AvengeInput } from '../../../simulation/avenge';
import { addStatsToBoard } from '../../../utils';
import { AvengeCard } from '../../card.interface';

export const BirdFeeder: AvengeCard = {
	cardIds: [CardIds.BirdFeeder_BG32_MagicItem_864, CardIds.BirdFeeder_BirdFeederToken_BG32_MagicItem_864t],
	baseAvengeValue: (cardId: string) => 2,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const buff = minion.cardId === CardIds.BirdFeeder_BG32_MagicItem_864 ? 1 : 4;
		addStatsToBoard(input.hero, input.board, input.hero, buff, buff, input.gameState);
	},
};
