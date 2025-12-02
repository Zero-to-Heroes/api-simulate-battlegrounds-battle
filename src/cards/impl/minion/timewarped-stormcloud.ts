import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { AvengeInput } from '../../../simulation/avenge';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { AvengeCard, DeathrattleSpawnCard } from '../../card.interface';

export const TimewarpedStormcloud: DeathrattleSpawnCard & AvengeCard = {
	cardIds: [CardIds.TimewarpedStormcloud_BG34_PreMadeChamp_031, CardIds.TimewarpedStormcloud_BG34_PreMadeChamp_031_G],
	baseAvengeValue: (cardId: string) => 3,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const mult = minion.cardId === CardIds.TimewarpedStormcloud_BG34_PreMadeChamp_031_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.TavernTempest_BGS_123);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.TimewarpedStormcloud_BG34_PreMadeChamp_031_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.TavernTempest_BGS_123);
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cardsToAdd, input.gameState);
		return [];
	},
};
