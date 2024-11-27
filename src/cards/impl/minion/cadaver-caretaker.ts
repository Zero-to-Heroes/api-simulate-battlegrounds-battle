import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { DeathrattleSpawnCard } from '../../card.interface';

export const CadaverCaretaker: DeathrattleSpawnCard = {
	cardIds: [CardIds.CadaverCaretaker_BG30_125, CardIds.CadaverCaretaker_BG30_125_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const mult = minion.cardId === CardIds.CadaverCaretaker_BG30_125_G ? 2 : 1;
		return simplifiedSpawnEntities(CardIds.SkeletonToken, 3 * mult, input);
	},
};
