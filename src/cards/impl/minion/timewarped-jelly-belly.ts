import { BoardEntity } from '../../../board-entity';
import { RebornEffectInput } from '../../../simulation/reborn';
import { TempCardIds } from '../../../temp-card-ids';
import { addStatsToBoard } from '../../../utils';
import { RebornEffectCard } from '../../card.interface';

export const TimewarpedJellyBelly: RebornEffectCard = {
	cardIds: [TempCardIds.TimewarpedJellyBelly, TempCardIds.TimewarpedJellyBelly_G],
	rebornEffect: (minion: BoardEntity, input: RebornEffectInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedJellyBelly_G ? 2 : 1;
		addStatsToBoard(
			minion,
			input.boardWithKilledMinion,
			input.boardWithKilledMinionHero,
			1 * mult,
			2 * mult,
			input.gameState,
		);
	},
};
