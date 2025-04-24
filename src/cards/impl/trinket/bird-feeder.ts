import { BoardEntity } from '../../../board-entity';
import { AvengeInput } from '../../../simulation/avenge';
import { TempCardIds } from '../../../temp-card-ids';
import { addStatsToBoard } from '../../../utils';
import { AvengeCard } from '../../card.interface';

export const BirdFeeder: AvengeCard = {
	cardIds: [TempCardIds.BirdFeeder, TempCardIds.BirdFeeder_Greater],
	baseAvengeValue: (cardId: string) => 2,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const buff = minion.cardId === TempCardIds.BirdFeeder ? 1 : 4;
		addStatsToBoard(input.hero, input.board, input.hero, buff, buff, input.gameState);
	},
};
