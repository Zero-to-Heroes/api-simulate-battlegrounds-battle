import { BoardEntity } from '../../../board-entity';
import { AvengeInput } from '../../../simulation/avenge';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { AvengeCard } from '../../card.interface';

export const Lurker: AvengeCard = {
	cardIds: [TempCardIds.Lurker, TempCardIds.Lurker_G],
	baseAvengeValue: (cardId: string) => 2,
	avenge: (minion: BoardEntity, input: AvengeInput): void => {
		modifyStats(minion, 1, 1, input.board, input.hero, input.gameState);
	},
};
