import { CardIds } from '../../../services/card-ids';
import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { DeathrattleSpawnCard } from '../../card.interface';

export const SlyRaptor: DeathrattleSpawnCard = {
	cardIds: [CardIds.SlyRaptor_BG25_806, CardIds.SlyRaptor_BG25_806_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const raptorStat = minion.cardId === CardIds.SlyRaptor_BG25_806_G ? 10 : 5;
		const target = input.gameState.cardsData.getRandomMinionForTribe(
			Race.BEAST,
			input.boardWithDeadEntityHero.tavernTier,
			SlyRaptor.cardIds,
		);
		const beastsFromRaptor = simplifiedSpawnEntities(target, 1, input);
		beastsFromRaptor.forEach((b) => {
			b.attack = raptorStat;
			b.health = raptorStat;
		});
		return beastsFromRaptor;
	},
};
