import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { RebornEffectInput } from '../../../simulation/reborn';
import { RebornEffectCard } from '../../card.interface';
import { addStatsToBoard } from '../../../utils';

export const OranomonosTheWilted: RebornEffectCard = {
	cardIds: [CardIds.OranomonosTheWilted_BG33_116, CardIds.OranomonosTheWilted_BG33_116_G],
	rebornEffect: (minion: BoardEntity, input: RebornEffectInput): void => {
		const mult = minion.cardId === CardIds.OranomonosTheWilted_BG33_116_G ? 2 : 1;
		input.boardWithKilledMinionHero.globalInfo.UndeadAttackBonus += 1 * mult;
		addStatsToBoard(
			minion,
			input.boardWithKilledMinion,
			input.boardWithKilledMinionHero,
			1 * mult,
			0,
			input.gameState,
			Race[Race.UNDEAD],
			false,
		);
	},
};
