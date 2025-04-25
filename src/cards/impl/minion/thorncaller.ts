import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { BattlecryCard, DeathrattleEffectCard } from '../../card.interface';

export const Thorncaller: BattlecryCard & DeathrattleEffectCard = {
	cardIds: [CardIds.Thorncaller_BG20_105, CardIds.Thorncaller_BG20_105_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput): boolean => {
		const mult = minion.cardId === CardIds.Thorncaller_BG20_105_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.BloodGem);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
		return true;
	},
	deathrattleEffect: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.Thorncaller_BG20_105_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.BloodGem);
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cardsToAdd, input.gameState);
	},
};
