import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { OnAttackInput } from '../../../simulation/on-attack';
import { OnAttackCard } from '../../card.interface';

export const GreedySnaketongue: OnAttackCard = {
	cardIds: [CardIds.GreedySnaketongue_BG33_315, CardIds.GreedySnaketongue_BG33_315_G],
	onAnyMinionAttack: (minion: BoardEntity, input: OnAttackInput) => {
		if (minion !== input.attacker) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}

		const mult = minion.cardId === CardIds.GreedySnaketongue_BG33_315_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.TavernCoin_BG28_810);
		addCardsInHand(input.attackingHero, input.attackingBoard, cardsToAdd, input.gameState);
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
