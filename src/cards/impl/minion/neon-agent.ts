import { BoardEntity } from '../../../board-entity';
import { pickRandom } from '../../../services/utils';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { OnAttackInput } from '../../../simulation/on-attack';
import { TempCardIds } from '../../../temp-card-ids';
import { OnAttackCard } from '../../card.interface';

export const NeonAgent: OnAttackCard = {
	cardIds: [TempCardIds.NeonAgent, TempCardIds.NeonAgent_G],
	onAttack: (minion: BoardEntity, input: OnAttackInput) => {
		const cards = [];
		const numberOfCards = minion.cardId === TempCardIds.NeonAgent_G ? 2 : 1;
		for (let i = 0; i < numberOfCards; i++) {
			cards.push(pickRandom(input.gameState.cardsData.battlecryMinions));
		}
		addCardsInHand(input.playerEntity, input.playerBoard, cards, input.gameState);
	},
};