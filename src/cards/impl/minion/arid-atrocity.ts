import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { getMinionsOfDifferentTypes } from '../../../utils';
import { DeathrattleSpawnCard } from '../../card.interface';

export const AridAtrocity: DeathrattleSpawnCard = {
	cardIds: [CardIds.AridAtrocity_BG29_864, CardIds.AridAtrocity_BG29_864_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const aridAtrocityStatsMultiplier = minion.cardId === CardIds.AridAtrocity_BG29_864_G ? 2 : 1;
		const friendlyDeadEntities = input.gameState.sharedState.deaths.filter((e) => e.friendly === minion.friendly);
		const types = getMinionsOfDifferentTypes(friendlyDeadEntities, input.boardWithDeadEntityHero, input.gameState);
		const constaridAtrocityStats = aridAtrocityStatsMultiplier * 6 * types.length;
		return simplifiedSpawnEntities(
			minion.cardId === CardIds.AridAtrocity_BG29_864_G
				? CardIds.AridAtrocity_DesertedGolemToken_BG29_864_Gt
				: CardIds.AridAtrocity_DesertedGolemToken_BG29_864t,
			1,
			input,
		).map((e) => ({
			...e,
			attack: e.attack + constaridAtrocityStats,
			health: e.health + constaridAtrocityStats,
		}));
	},
};
