import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { TempCardIds } from '../../../temp-card-ids';
import { BattlecryCard, DeathrattleEffectCard } from '../../card.interface';

export const NightmareParTeaGuest: BattlecryCard & DeathrattleEffectCard = {
	cardIds: [TempCardIds.NightmareParTeaGuest, TempCardIds.NightmareParTeaGuest_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mult = minion.cardId === TempCardIds.NightmareParTeaGuest_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.MisplacedTeaSet_BG28_888);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
		return true;
	},
	deathrattleEffect: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === TempCardIds.NightmareParTeaGuest_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.MisplacedTeaSet_BG28_888);
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cardsToAdd, input.gameState);
	},
};
