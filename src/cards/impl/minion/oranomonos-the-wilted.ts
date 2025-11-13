import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { RebornEffectInput } from '../../../simulation/reborn';
import { addStatsToBoard } from '../../../utils';
import { RebornEffectCard } from '../../card.interface';

const baseAttackGained = 2;

export const OranomonosTheWilted: RebornEffectCard = {
	cardIds: [CardIds.OranomonosTheWilted_BG33_116, CardIds.OranomonosTheWilted_BG33_116_G],
	rebornEffect: (minion: BoardEntity, input: RebornEffectInput): void => {
		const mult = minion.cardId === CardIds.OranomonosTheWilted_BG33_116_G ? 2 : 1;
		input.boardWithKilledMinionHero.globalInfo.UndeadAttackBonus += baseAttackGained * mult;
		addStatsToBoard(
			minion,
			input.boardWithKilledMinion,
			input.boardWithKilledMinionHero,
			baseAttackGained * mult,
			0,
			input.gameState,
			Race[Race.UNDEAD],
			false,
		);
	},
};
