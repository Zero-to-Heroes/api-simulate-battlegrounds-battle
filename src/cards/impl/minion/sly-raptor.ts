import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { DeathrattleSpawnCard } from '../../card.interface';

export const SlyRaptor: DeathrattleSpawnCard = {
	cardIds: [CardIds.SlyRaptor_BG25_806, CardIds.SlyRaptor_BG25_806_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const raptorStat = minion.cardId === CardIds.SlyRaptor_BG25_806_G ? 14 : 7;
		const beastPool = input.gameState.cardsData.beastSpawns.filter((id) => id !== CardIds.SlyRaptor_BG25_806);
		const beastsFromRaptor = simplifiedSpawnEntities(
			beastPool[Math.floor(Math.random() * beastPool.length)],
			1,
			input,
		);
		beastsFromRaptor.forEach((b) => {
			b.attack = raptorStat;
			b.health = raptorStat;
		});
		return beastsFromRaptor;
	},
};
