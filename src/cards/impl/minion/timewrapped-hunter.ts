import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { TempCardIds } from '../../../temp-card-ids';
import { BattlecryCard, DeathrattleSpawnCard } from '../../card.interface';

export const TimewrappedHunter: BattlecryCard & DeathrattleSpawnCard = {
	cardIds: [TempCardIds.TimewrappedHunter, TempCardIds.TimewrappedHunter_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mult = minion.cardId === TempCardIds.TimewrappedHunter_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.PointyArrow_EBG_Spell_014);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
		return true;
	},
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === TempCardIds.TimewrappedHunter_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.PointyArrow_EBG_Spell_014);
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cardsToAdd, input.gameState);
		return [];
	},
};
