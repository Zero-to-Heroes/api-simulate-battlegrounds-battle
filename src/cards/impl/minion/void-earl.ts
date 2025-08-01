import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { DeathrattleSpawnCard } from '../../card.interface';

export const VoidEarl: DeathrattleSpawnCard = {
	cardIds: [CardIds.VoidEarl_BG33_157, CardIds.VoidEarl_BG33_157_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const mult = minion.cardId === CardIds.VoidEarl_BG33_157_G ? 2 : 1;
		return simplifiedSpawnEntities(CardIds.VoidwalkerLegacy_BG_CS2_065, 2 * mult, input);
	},
};
