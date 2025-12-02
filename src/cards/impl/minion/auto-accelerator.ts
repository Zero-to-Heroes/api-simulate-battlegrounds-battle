import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { BattlecryCard } from '../../card.interface';

export const AutoAccelerator: BattlecryCard = {
	cardIds: [CardIds.AutoAccelerator_BG34_170, CardIds.AutoAccelerator_BG34_170_G],
	battlecry: (entity: BoardEntity, input: BattlecryInput) => {
		const loops = entity.cardId === CardIds.AutoAccelerator_BG34_170_G ? 2 : 1;
		for (let i = 0; i < loops; i++) {
			const cardToAdd = input.gameState.cardsData.getRandomMagneticVolumizer(
				input.hero,
				input.gameState.anomalies,
				input.hero.tavernTier ?? 1,
			);
			addCardsInHand(input.hero, input.board, [cardToAdd], input.gameState);
		}
		return true;
	},
};
