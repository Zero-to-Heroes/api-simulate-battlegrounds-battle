import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { DeathrattleSpawnCard } from '../../card.interface';

export const SlyRaptor: DeathrattleSpawnCard = {
	cardIds: [CardIds.SlyRaptor_BG25_806, CardIds.SlyRaptor_BG25_806_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.SlyRaptor_BG25_806_G ? 2 : 1;
		const target = input.gameState.cardsData.getRandomMinionForTribe(
			Race.BEAST,
			input.boardWithDeadEntityHero.tavernTier,
			SlyRaptor.cardIds,
		);
		const beastsFromRaptor = simplifiedSpawnEntities(target, 1, input);
		beastsFromRaptor.forEach((b) => {
			b.attack = 8 * mult;
			b.health = 8 * mult;
		});
		return beastsFromRaptor;
	},
};
