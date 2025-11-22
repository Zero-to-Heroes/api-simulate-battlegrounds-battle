import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { TempCardIds } from '../../../temp-card-ids';
import { BattlecryCard, DeathrattleSpawnCard } from '../../card.interface';

export const TimewarpedThorncaller: DeathrattleSpawnCard & BattlecryCard = {
	cardIds: [TempCardIds.TimewarpedThorncaller, TempCardIds.TimewarpedThorncaller_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedThorncaller_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(TempCardIds.BloodGemBarrage);
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cardsToAdd, input.gameState);
		return [];
	},
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedThorncaller_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(TempCardIds.BloodGemBarrage);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
		return true;
	},
};
