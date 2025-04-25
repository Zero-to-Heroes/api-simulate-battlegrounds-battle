import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { OnStatsChangedInput } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { DeathrattleSpawnCard, OnStatsChangedCard } from '../../card.interface';

export const SilkyShimmermoth: OnStatsChangedCard & DeathrattleSpawnCard = {
	cardIds: [TempCardIds.SilkyShimmermoth, TempCardIds.SilkyShimmermoth_G],
	// Technically this is "after this gains attack", but I'm not sure it is important at this stage
	onStatsChanged: (minion: BoardEntity, input: OnStatsChangedInput) => {
		if (input.attackAmount <= 0 || input.target !== minion) {
			return;
		}

		const mult = minion.cardId === TempCardIds.SilkyShimmermoth ? 1 : 2;
		input.hero.globalInfo.BeetleAttackBuff += 2 * mult;
		input.hero.globalInfo.BeetleHealthBuff += 2 * mult;
	},
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const mult = minion.cardId === TempCardIds.SilkyShimmermoth ? 1 : 2;
		return simplifiedSpawnEntities(CardIds.BoonOfBeetles_BeetleToken_BG28_603t, 1 * mult, input);
	},
};
