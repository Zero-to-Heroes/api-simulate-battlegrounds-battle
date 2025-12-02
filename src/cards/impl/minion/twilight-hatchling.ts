import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TwilightHatchling: DeathrattleSpawnCard = {
	cardIds: [
		CardIds.TwilightHatchling_TwilightWhelpToken_BG34_630t,
		CardIds.TwilightHatchling_TwilightWhelpToken_BG34_630_Gt,
	],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const mult = minion.cardId === CardIds.TwilightHatchling_TwilightWhelpToken_BG34_630_Gt ? 2 : 1;
		const spawns = simplifiedSpawnEntities(CardIds.TwilightWhelp, mult, input);
		spawns.forEach((e) => {
			e.attackImmediately = true;
		});
		return spawns;
	},
};
