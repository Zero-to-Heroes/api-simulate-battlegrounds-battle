import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { TempCardIds } from '../../../temp-card-ids';
import { DeathrattleSpawnCard } from '../../card.interface';

export const VoidEarl: DeathrattleSpawnCard = {
	cardIds: [TempCardIds.VoidEarl, TempCardIds.VoidEarl_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const mult = minion.cardId === TempCardIds.VoidEarl_G ? 2 : 1;
		return simplifiedSpawnEntities(CardIds.VoidwalkerLegacy_BG_CS2_065, 2 * mult, input);
	},
};
