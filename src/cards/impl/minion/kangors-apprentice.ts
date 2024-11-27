import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { hasCorrectTribe } from '../../../utils';
import { DeathrattleSpawnCard } from '../../card.interface';

export const KangorsApprentice: DeathrattleSpawnCard = {
	cardIds: [CardIds.KangorsApprentice_BGS_012, CardIds.KangorsApprentice_TB_BaconUps_087],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const numberToSpawn = minion.cardId === CardIds.KangorsApprentice_BGS_012 ? 2 : 4;
		const cardIdsToSpawn = input.gameState.sharedState.deaths
			.filter((entity) => entity.friendly === minion.friendly)
			.filter((entity) =>
				hasCorrectTribe(entity, input.boardWithDeadEntityHero, Race.MECH, input.gameState.allCards),
			)
			.slice(0, numberToSpawn)
			.map((entity) => entity.cardId);
		const spawnedEntities: BoardEntity[] = [];
		cardIdsToSpawn.forEach((cardId) => spawnedEntities.push(...simplifiedSpawnEntities(cardId, 1, input)));
		return spawnedEntities;
	},
};
