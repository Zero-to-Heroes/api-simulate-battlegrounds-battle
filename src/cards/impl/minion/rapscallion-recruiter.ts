import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { DeathrattleSpawnCard } from '../../card.interface';

export const RapscallionRecruiter: DeathrattleSpawnCard = {
	cardIds: [CardIds.RapscallionRecruiter_BG26_018, CardIds.RapscallionRecruiter_BG26_018_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		return simplifiedSpawnEntities(
			minion.cardId === CardIds.RapscallionRecruiter_BG26_018_G
				? CardIds.Scallywag_TB_BaconUps_141
				: CardIds.Scallywag_BGS_061,
			2,
			input,
		);
	},
};
