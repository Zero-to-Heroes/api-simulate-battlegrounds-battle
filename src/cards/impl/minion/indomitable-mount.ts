import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { DeathrattleSpawnCard } from '../../card.interface';

export const IndomitableMount: DeathrattleSpawnCard = {
	cardIds: [CardIds.IndomitableMount_BG30_105, CardIds.IndomitableMount_BG30_105_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const tiersToSummon = [2, 3, 4];
		const output = [];
		for (const tier of tiersToSummon) {
			const candidates = input.gameState.cardsData.beastSpawns.filter(
				(id) => input.gameState.allCards.getCard(id).techLevel === tier,
			);
			let spawnId = pickRandom(candidates);
			if (minion.cardId === CardIds.IndomitableMount_BG30_105_G) {
				const premiumDbfId = input.gameState.allCards.getCard(spawnId).battlegroundsPremiumDbfId;
				spawnId = input.gameState.allCards.getCard(premiumDbfId).id;
			}
			output.push(...simplifiedSpawnEntities(spawnId, 1, input));
		}
		return output;
	},
};
