import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { BattlecryCard } from '../../card.interface';

export const MechaJaraxxus: BattlecryCard = {
	cardIds: [CardIds.MechaJaraxxus_BG25_807, CardIds.MechaJaraxxus_BG25_807_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mechaJaraxxusCardsToAdd = minion.cardId === CardIds.MechaJaraxxus_BG25_807 ? [null] : [null, null];
		addCardsInHand(input.hero, input.board, mechaJaraxxusCardsToAdd, input.gameState);
		return true;
	},
};
