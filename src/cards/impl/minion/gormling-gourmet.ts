import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { BattlecryCard, DeathrattleSpawnCard } from '../../card.interface';

export const GormlingGourmet: BattlecryCard & DeathrattleSpawnCard = {
	cardIds: [CardIds.GormlingGourmet_BG32_336, CardIds.GormlingGourmet_BG32_336_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mult = minion.cardId === CardIds.GormlingGourmet_BG32_336 ? 1 : 2;
		const cardsToAdd = Array(mult).fill(CardIds.SeafoodStew_BG32_337);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
		return true;
	},
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.GormlingGourmet_BG32_336 ? 1 : 2;
		const cardsToAdd = Array(mult).fill(CardIds.SeafoodStew_BG32_337);
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cardsToAdd, input.gameState);
		return [];
	},
};
