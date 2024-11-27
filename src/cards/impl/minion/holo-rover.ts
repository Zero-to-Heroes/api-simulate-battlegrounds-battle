import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { OnAttackInput } from '../../../simulation/on-attack';
import { TempCardIds } from '../../../temp-card-ids';
import { OnAttackCard } from '../../card.interface';

export const HoloRover: OnAttackCard = {
	cardIds: [TempCardIds.HoloRover, TempCardIds.HoloRover_G],
	onAttack: (minion: BoardEntity, input: OnAttackInput) => {
		const numberOfCard = minion.cardId === TempCardIds.HoloRover_G ? 2 : 1;
		for (let i = 0; i < numberOfCard; i++) {
			const magneticMech = input.gameState.cardsData.getRandomMechToMagnetize(input.playerEntity.tavernTier);
			addCardsInHand(input.playerEntity, input.playerBoard, [magneticMech], input.gameState);
		}
	},
};
