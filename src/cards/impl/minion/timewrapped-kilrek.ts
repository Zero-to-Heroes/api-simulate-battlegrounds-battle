import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { TempCardIds } from '../../../temp-card-ids';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TimewrappedKilrek: DeathrattleSpawnCard = {
	cardIds: [TempCardIds.TimewrappedKilrek, TempCardIds.TimewrappedKilrek_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === TempCardIds.TimewrappedKilrek_G ? 2 : 1;
		const tavernTier = input.boardWithDeadEntityHero.tavernTier ?? 3;
		const cardsToAdd = Array(mult).map(() =>
			input.gameState.cardsData.getRandomMinionForTribe(Race.DEMON, tavernTier),
		);
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cardsToAdd, input.gameState);
		return [];
	},
};
