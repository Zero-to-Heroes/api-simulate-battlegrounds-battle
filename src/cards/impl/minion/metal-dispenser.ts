import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { AvengeInput } from '../../../simulation/avenge';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { magnetizeToTarget } from '../../../simulation/magnetize';
import { AvengeCard } from '../../card.interface';

export const MetalDispenser: AvengeCard = {
	cardIds: [CardIds.MetalDispenser_BG34_176, CardIds.MetalDispenser_BG34_176_G],
	baseAvengeValue: (cardId: string) => 3,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const loops = minion.cardId === CardIds.MetalDispenser_BG34_176_G ? 2 : 1;
		for (let i = 0; i < loops; i++) {
			const cardId = input.gameState.cardsData.getRandomMagneticVolumizer(
				input.hero,
				input.gameState.anomalies,
				input.hero.tavernTier ?? 1,
			);
			magnetizeToTarget(
				[minion],
				minion,
				[cardId],
				input.board,
				input.hero,
				input.otherBoard,
				input.otherHero,
				input.gameState,
			);
			addCardsInHand(input.hero, input.board, [cardId], input.gameState);
		}
	},
};
