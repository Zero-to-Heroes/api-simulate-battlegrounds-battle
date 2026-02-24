import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { DeathrattleSpawnCard, OnDamagedCard, OnDamagedInput } from '../../card.interface';

export const SilkyShimmermoth: OnDamagedCard & DeathrattleSpawnCard = {
	cardIds: [CardIds.SilkyShimmermoth_BG32_204, CardIds.SilkyShimmermoth_BG32_204_G],
	onDamaged: (minion: BoardEntity, input: OnDamagedInput) => {
		if (input.damagedEntity !== minion) {
			return;
		}

		const mult = minion.cardId === CardIds.SilkyShimmermoth_BG32_204 ? 1 : 2;
		input.hero.globalInfo.BeetleAttackBuff += 2 * mult;
		input.hero.globalInfo.BeetleHealthBuff += 2 * mult;
	},
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const mult = minion.cardId === CardIds.SilkyShimmermoth_BG32_204 ? 1 : 2;
		return simplifiedSpawnEntities(CardIds.BoonOfBeetles_BeetleToken_BG28_603t, 1 * mult, input);
	},
};
