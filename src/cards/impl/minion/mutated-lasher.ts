import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { modifyStats } from '../../../simulation/stats';
import { DeathrattleEffectCard } from '../../card.interface';

const baseAttackBuff = 3;
const baseHealthBuff = 3;

export const MutatedLasher: DeathrattleEffectCard = {
	cardIds: [CardIds.MutatedLasher_BG31_852, CardIds.MutatedLasher_BG31_852_G],
	deathrattleEffect: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.MutatedLasher_BG31_852_G ? 2 : 1;
		input.boardWithDeadEntityHero.globalInfo.MutatedLasherAttackBuff += baseAttackBuff * mult;
		input.boardWithDeadEntityHero.globalInfo.MutatedLasherHealthBuff += baseHealthBuff * mult;
		input.boardWithDeadEntity
			.filter((e) => input.gameState.cardsData.getTavernLevel(e.cardId) % 2 === 1)
			.forEach((e) => {
				modifyStats(
					e,
					minion,
					baseAttackBuff * mult,
					baseHealthBuff * mult,
					input.boardWithDeadEntity,
					input.boardWithDeadEntityHero,
					input.gameState,
				);
			});
	},
};
