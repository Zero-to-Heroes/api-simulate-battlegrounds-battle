import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { OnAttackInput } from '../../../simulation/on-attack';
import { TempCardIds } from '../../../temp-card-ids';
import { OnAttackCard } from '../../card.interface';

export const BigwigBandit: OnAttackCard = {
	cardIds: [TempCardIds.BigwigBandit, TempCardIds.BigwigBandit_G],
	onAnyMinionAttack: (minion: BoardEntity, input: OnAttackInput) => {
		const mult = minion.cardId === TempCardIds.BigwigBandit_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(null);
		addCardsInHand(input.attackingHero, input.attackingBoard, cardsToAdd, input.gameState);
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
