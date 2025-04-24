import { BoardEntity } from '../../../board-entity';
import { magnetizeToTarget } from '../../../simulation/magnetize';
import { TempCardIds } from '../../../temp-card-ids';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const RicketyRepairbot: EndOfTurnCard = {
	cardIds: [TempCardIds.RicketyRepairbot, TempCardIds.RicketyRepairbot_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === TempCardIds.RicketyRepairbot_G ? 2 : 1;
		for (let i = 0; i < mult; i++) {
			const minionToMagnetize = input.gameState.cardsData.getRandomMechToMagnetize(input.hero.tavernTier ?? 1);
			magnetizeToTarget(minion, minion, minionToMagnetize, input.board, input.hero, input.gameState);
		}
	},
};
