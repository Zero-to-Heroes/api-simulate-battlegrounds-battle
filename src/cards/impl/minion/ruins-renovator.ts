import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { TempCardIds } from '../../../temp-card-ids';
import { DeathrattleSpawnCard } from '../../card.interface';

export const RuinsRenovator: DeathrattleSpawnCard = {
	cardIds: [TempCardIds.RuinsRenovator, TempCardIds.RuinsRenovator_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const mult = minion.cardId === TempCardIds.RuinsRenovator_G ? 2 : 1;
		const spawns = [];
		for (let i = 0; i < mult; i++) {
			const spawnId = input.gameState.cardsData.getRandomDivineShield(input.boardWithDeadEntityHero.tavernTier);
			spawns.push(...simplifiedSpawnEntities(spawnId, 1, input));
		}
		return spawns;
	},
};
