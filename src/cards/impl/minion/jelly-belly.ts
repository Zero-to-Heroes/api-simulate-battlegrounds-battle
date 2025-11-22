import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { RebornEffectInput } from '../../../simulation/reborn';
import { modifyStats } from '../../../simulation/stats';
import { RebornEffectCard } from '../../card.interface';

export const JellyBelly: RebornEffectCard = {
	cardIds: [CardIds.JellyBelly_BG25_005, CardIds.JellyBelly_BG25_005_G],
	rebornEffect: (minion: BoardEntity, input: RebornEffectInput) => {
		const mult = minion.cardId === CardIds.JellyBelly_BG25_005_G ? 2 : 1;
		modifyStats(
			minion,
			minion,
			2 * mult,
			3 * mult,
			input.boardWithKilledMinion,
			input.boardWithKilledMinionHero,
			input.gameState,
		);
	},
};
