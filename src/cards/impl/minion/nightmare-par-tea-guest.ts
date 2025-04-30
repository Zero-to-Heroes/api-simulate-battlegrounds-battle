import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { BattlecryCard, DeathrattleSpawnCard } from '../../card.interface';

export const NightmareParTeaGuest: BattlecryCard & DeathrattleSpawnCard = {
	cardIds: [CardIds.NightmareParTeaGuest_BG32_111, CardIds.NightmareParTeaGuest_BG32_111_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mult = minion.cardId === CardIds.NightmareParTeaGuest_BG32_111_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.MisplacedTeaSet_BG28_888);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
		return true;
	},
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.NightmareParTeaGuest_BG32_111_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.MisplacedTeaSet_BG28_888);
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cardsToAdd, input.gameState);
		return [];
	},
};
