import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { DeathrattleSpawnCard } from '../../card.interface';

export const Scallywag: DeathrattleSpawnCard = {
	cardIds: [CardIds.Scallywag_BGS_061, CardIds.Scallywag_TB_BaconUps_141],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		return simplifiedSpawnEntities(
			minion.cardId === CardIds.Scallywag_TB_BaconUps_141
				? CardIds.Scallywag_SkyPirateToken_TB_BaconUps_141t
				: CardIds.Scallywag_SkyPirateToken_BGS_061t,
			1,
			input,
		);
	},
};
