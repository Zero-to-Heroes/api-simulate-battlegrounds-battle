import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TimewarpedKilrek: DeathrattleSpawnCard = {
	cardIds: [CardIds.TimewarpedKilrek_BG34_Giant_584, CardIds.TimewarpedKilrek_BG34_Giant_584_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.TimewarpedKilrek_BG34_Giant_584_G ? 2 : 1;
		const tavernTier = input.boardWithDeadEntityHero.tavernTier ?? 3;
		const cardsToAdd = Array(mult).map(() =>
			input.gameState.cardsData.getRandomMinionForTribe(Race.DEMON, tavernTier),
		);
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cardsToAdd, input.gameState);
		return [];
	},
};
