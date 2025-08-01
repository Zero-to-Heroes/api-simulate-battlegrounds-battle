import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { BattlecryCard, DeathrattleSpawnCard } from '../../card.interface';

export const ShipwreckedRascal: BattlecryCard & DeathrattleSpawnCard = {
	cardIds: [CardIds.ShipwreckedRascal_BG33_821, CardIds.ShipwreckedRascal_BG33_821_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const mult = minion.cardId === CardIds.ShipwreckedRascal_BG33_821_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(null);
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cardsToAdd, input.gameState);
		return [];
	},
	battlecry: (minion: BoardEntity, input: BattlecryInput): boolean => {
		const mult = minion.cardId === CardIds.ShipwreckedRascal_BG33_821_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(null);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
		return true;
	},
};
