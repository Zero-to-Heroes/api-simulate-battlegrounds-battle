import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { DeathrattleSpawnCard } from '../../card.interface';

export const Mechorse: DeathrattleSpawnCard = {
	cardIds: [
		CardIds.MechanizedGiftHorse_MechorseToken_BG27_008t,
		CardIds.MechanizedGiftHorse_MechorseToken_BG27_008_Gt,
	],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		return simplifiedSpawnEntities(
			minion.cardId === CardIds.MechanizedGiftHorse_MechorseToken_BG27_008_Gt
				? CardIds.MechanizedGiftHorse_MechaponyToken_BG27_008_Gt2
				: CardIds.MechanizedGiftHorse_MechaponyToken_BG27_008t2,
			1,
			input,
		);
	},
};
