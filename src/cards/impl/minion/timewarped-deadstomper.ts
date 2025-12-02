import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { OnOtherSpawnAuraInput } from '../../../simulation/add-minion-to-board';
import { modifyStats } from '../../../simulation/stats';
import { AfterOtherSpawnedCard } from '../../card.interface';

export const TimewarpedDeadstomper: AfterOtherSpawnedCard = {
	cardIds: [CardIds.TimewarpedDeadstomper_BG34_Giant_654, CardIds.TimewarpedDeadstomper_BG34_Giant_654_G],
	afterOtherSpawned: (minion: BoardEntity, input: OnOtherSpawnAuraInput) => {
		const mult = minion.cardId === CardIds.TimewarpedDeadstomper_BG34_Giant_654_G ? 2 : 1;
		input.board.forEach((e) => {
			modifyStats(e, minion, 3 * mult, 0, input.board, input.hero, input.gameState);
		});
	},
};
