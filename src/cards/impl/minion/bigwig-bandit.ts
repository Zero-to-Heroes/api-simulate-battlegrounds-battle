import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { OnAttackInput } from '../../../simulation/on-attack';
import { OnAttackCard } from '../../card.interface';

export const BigwigBandit: OnAttackCard = {
	cardIds: [CardIds.BigwigBandit_BG33_822, CardIds.BigwigBandit_BG33_822_G],
	onAnyMinionAttack: (minion: BoardEntity, input: OnAttackInput) => {
		const mult = minion.cardId === CardIds.BigwigBandit_BG33_822_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(null);
		addCardsInHand(input.attackingHero, input.attackingBoard, cardsToAdd, input.gameState);
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
