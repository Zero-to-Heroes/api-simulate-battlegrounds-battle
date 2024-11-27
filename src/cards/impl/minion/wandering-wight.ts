import { BoardEntity } from '../../../board-entity';
import { OnOtherSpawnInput } from '../../../simulation/add-minion-to-board';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { AfterOtherSpawnedCard } from '../../card.interface';

export const WanderingWight: AfterOtherSpawnedCard = {
	cardIds: [TempCardIds.WanderingWight, TempCardIds.WanderingWight_G],
	afterOtherSpawned: (minion: BoardEntity, input: OnOtherSpawnInput) => {
		const mult = minion.cardId === TempCardIds.WanderingWight ? 1 : 2;
		modifyStats(minion, 0, minion.attack * mult, input.board, input.hero, input.gameState);
	},
};
