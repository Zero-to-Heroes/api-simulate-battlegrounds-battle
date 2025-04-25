import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { TempCardIds } from '../../../temp-card-ids';
import { BattlecryCard, DeathrattleEffectCard } from '../../card.interface';

export const GormlingGourmet: BattlecryCard & DeathrattleEffectCard = {
	cardIds: [TempCardIds.GormlingGourmet, TempCardIds.GormlingGourmet_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mult = minion.cardId === TempCardIds.GormlingGourmet ? 1 : 2;
		const cardsToAdd = Array(mult).fill(TempCardIds.SeafoodStew);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
		return true;
	},
	deathrattleEffect: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === TempCardIds.GormlingGourmet ? 1 : 2;
		const cardsToAdd = Array(mult).fill(TempCardIds.SeafoodStew);
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cardsToAdd, input.gameState);
	},
};
