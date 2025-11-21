import { BoardEntity } from '../../../board-entity';
import { AvengeInput } from '../../../simulation/avenge';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { AvengeCard } from '../../card.interface';

export const MetalDispenser: AvengeCard = {
	cardIds: [TempCardIds.MetalDispenser, TempCardIds.MetalDispenser_G],
	baseAvengeValue: (cardId: string) => 3,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const loops = minion.cardId === TempCardIds.MetalDispenser_G ? 2 : 1;
		for (let i = 0; i < loops; i++) {
			const cardId = input.gameState.cardsData.getRandomMagneticVolumizer(
				input.hero,
				input.gameState.anomalies,
				input.hero.tavernTier ?? 1,
			);
			addCardsInHand(input.hero, input.board, [cardId], input.gameState);
		}
	},
};
