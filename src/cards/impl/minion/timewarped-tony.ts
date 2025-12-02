import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TimewarpedTony: DeathrattleSpawnCard = {
	cardIds: [CardIds.TimewarpedTony_BG34_Giant_326, CardIds.TimewarpedTony_BG34_Giant_326_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.TimewarpedTony_BG34_Giant_326_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.EyesOfTheEarthMother_EBG_Spell_017);
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cardsToAdd, input.gameState);
		return [];
	},
};
