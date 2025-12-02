import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { BattlecryCard, DeathrattleSpawnCard } from '../../card.interface';

export const TimewarpedThorncaller: DeathrattleSpawnCard & BattlecryCard = {
	cardIds: [CardIds.TimewarpedThorncaller_BG34_Giant_078, CardIds.TimewarpedThorncaller_BG34_Giant_078_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.TimewarpedThorncaller_BG34_Giant_078_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.BloodGemBarrage_BG34_689);
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cardsToAdd, input.gameState);
		return [];
	},
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mult = minion.cardId === CardIds.TimewarpedThorncaller_BG34_Giant_078_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.BloodGemBarrage_BG34_689);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
		return true;
	},
};
