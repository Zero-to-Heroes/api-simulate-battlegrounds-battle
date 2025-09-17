import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { DeathrattleSpawnCard } from '../../card.interface';

export const Manasaber: DeathrattleSpawnCard = {
	cardIds: [CardIds.Manasaber_BG26_800, CardIds.Manasaber_BG26_800_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const cublingId =
			minion.cardId === CardIds.Manasaber_BG26_800_G
				? CardIds.Manasaber_CublingToken_BG26_800_Gt
				: CardIds.Manasaber_CublingToken_BG26_800t;
		return simplifiedSpawnEntities(cublingId, 2, input);
	},
};
