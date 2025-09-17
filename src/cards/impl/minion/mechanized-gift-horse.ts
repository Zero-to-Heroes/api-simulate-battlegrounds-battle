import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { DeathrattleSpawnCard } from '../../card.interface';

export const MechanizedGiftHorse: DeathrattleSpawnCard = {
	cardIds: [CardIds.MechanizedGiftHorse_BG27_008, CardIds.MechanizedGiftHorse_BG27_008_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		return simplifiedSpawnEntities(
			minion.cardId === CardIds.MechanizedGiftHorse_BG27_008_G
				? CardIds.MechanizedGiftHorse_MechorseToken_BG27_008_Gt
				: CardIds.MechanizedGiftHorse_MechorseToken_BG27_008t,
			2,
			input,
		);
	},
};
