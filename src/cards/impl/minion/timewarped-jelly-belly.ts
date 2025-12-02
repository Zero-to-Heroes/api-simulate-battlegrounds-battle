import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { RebornEffectInput } from '../../../simulation/reborn';
import { addStatsToBoard } from '../../../utils';
import { RebornEffectCard } from '../../card.interface';

export const TimewarpedJellyBelly: RebornEffectCard = {
	cardIds: [CardIds.TimewarpedJellyBelly_BG34_Giant_024, CardIds.TimewarpedJellyBelly_BG34_Giant_024_G],
	rebornEffect: (minion: BoardEntity, input: RebornEffectInput) => {
		const mult = minion.cardId === CardIds.TimewarpedJellyBelly_BG34_Giant_024_G ? 2 : 1;
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
