import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { magnetizeToTarget } from '../../../simulation/magnetize';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const RicketyRepairbot: EndOfTurnCard = {
	cardIds: [CardIds.RicketyRepairbot_BG32_173, CardIds.RicketyRepairbot_BG32_173_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === CardIds.RicketyRepairbot_BG32_173_G ? 2 : 1;
		for (let i = 0; i < mult; i++) {
			const minionToMagnetize = input.gameState.cardsData.getRandomMechToMagnetize(input.hero.tavernTier ?? 1);
			magnetizeToTarget(minion, minion, minionToMagnetize, input.board, input.hero, input.gameState);
		}
	},
};
