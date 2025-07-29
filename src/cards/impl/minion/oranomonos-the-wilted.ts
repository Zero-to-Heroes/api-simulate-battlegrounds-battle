import { BoardEntity } from '../../../board-entity';
import { RebornEffectInput } from '../../../simulation/reborn';
import { TempCardIds } from '../../../temp-card-ids';
import { RebornEffectCard } from '../../card.interface';

export const OranomonosTheWilted: RebornEffectCard = {
	cardIds: [TempCardIds.OranomonosTheWilted, TempCardIds.OranomonosTheWilted_G],
	rebornEffect: (minion: BoardEntity, input: RebornEffectInput): void => {
		const mult = minion.cardId === TempCardIds.OranomonosTheWilted_G ? 2 : 1;
		input.opponentBoardHero.globalInfo.UndeadAttackBonus += 1 * mult;
	},
};
