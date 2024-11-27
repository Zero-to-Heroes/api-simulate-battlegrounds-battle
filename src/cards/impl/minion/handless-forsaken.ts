import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { DeathrattleSpawnCard } from '../../card.interface';

export const HandlessForsaken: DeathrattleSpawnCard = {
	cardIds: [CardIds.HandlessForsaken_BG25_010, CardIds.HandlessForsaken_BG25_010_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const mult = minion.cardId === CardIds.HandlessForsaken_BG25_010 ? 1 : 2;
		return simplifiedSpawnEntities(CardIds.HandlessForsaken_HelpingHandToken_BG25_010t, mult, input);
	},
};
