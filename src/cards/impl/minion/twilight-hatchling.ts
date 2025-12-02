import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TwilightHatchling: DeathrattleSpawnCard = {
	cardIds: [CardIds.TwilightHatchling_BG34_630, CardIds.TwilightHatchling_BG34_630_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const mult = minion.cardId === CardIds.TwilightHatchling_BG34_630_G ? 2 : 1;
		const spawns = simplifiedSpawnEntities(CardIds.TwilightHatchling_TwilightWhelpToken_BG34_630t, mult, input);
		spawns.forEach((e) => {
			e.attackImmediately = true;
		});
		return spawns;
	},
};
