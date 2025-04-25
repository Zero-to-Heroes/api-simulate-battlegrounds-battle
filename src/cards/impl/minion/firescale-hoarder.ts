import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { BattlecryCard, DeathrattleEffectCard } from '../../card.interface';

export const FirescaleHoarder: BattlecryCard & DeathrattleEffectCard = {
	cardIds: [CardIds.FirescaleHoarder_BG32_820, CardIds.FirescaleHoarder_BG32_820_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mult = minion.cardId === CardIds.FirescaleHoarder_BG32_820_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.ShinyRing_BG28_168);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
		return true;
	},
	deathrattleEffect: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.FirescaleHoarder_BG32_820_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.ShinyRing_BG28_168);
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cardsToAdd, input.gameState);
	},
};
