import { BoardEntity } from '../../../board-entity';
import { OnOtherSpawnAuraInput } from '../../../simulation/add-minion-to-board';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { AfterOtherSpawnedCard } from '../../card.interface';

export const TimewarpedDeadstomper: AfterOtherSpawnedCard = {
	cardIds: [TempCardIds.TimewarpedDeadstomper, TempCardIds.TimewarpedDeadstomper_G],
	afterOtherSpawned: (minion: BoardEntity, input: OnOtherSpawnAuraInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedDeadstomper_G ? 2 : 1;
		input.board.forEach((e) => {
			modifyStats(e, minion, 3 * mult, 0, input.board, input.hero, input.gameState);
		});
	},
};
