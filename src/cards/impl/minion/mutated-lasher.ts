import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { modifyStats } from '../../../simulation/stats';
import { DeathrattleEffectCard } from '../../card.interface';

export const MutatedLasher: DeathrattleEffectCard = {
	cardIds: [CardIds.MutatedLasher_BG31_852, CardIds.MutatedLasher_BG31_852_G],
	deathrattleEffect: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.MutatedLasher_BG31_852_G ? 2 : 1;
		input.boardWithDeadEntityHero.globalInfo.MutatedLasherAttackBuff += 2 * mult;
		input.boardWithDeadEntityHero.globalInfo.MutatedLasherHealthBuff += 3 * mult;
		input.boardWithDeadEntity
			.filter((e) => input.gameState.cardsData.getTavernLevel(e.cardId) % 2 === 1)
			.forEach((e) => {
				modifyStats(
					e,
					2 * mult,
					3 * mult,
					input.boardWithDeadEntity,
					input.boardWithDeadEntityHero,
					input.gameState,
				);
				input.gameState.spectator.registerPowerTarget(
					minion,
					e,
					input.boardWithDeadEntity,
					input.boardWithDeadEntityHero,
					input.otherBoardHero,
				);
			});
	},
};
