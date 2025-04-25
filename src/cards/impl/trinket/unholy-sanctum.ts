import { CardIds } from '@firestone-hs/reference-data';
import { BoardTrinket } from '../../../bgs-player-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { modifyStats } from '../../../simulation/stats';
import { DeathrattleTriggeredCard } from '../../card.interface';

export const UnholySanctum: DeathrattleTriggeredCard = {
	cardIds: [CardIds.UnholySanctum_BG32_MagicItem_862, CardIds.UnholySanctum_UnholySanctumToken_BG32_MagicItem_862t],
	onDeathrattleTriggered: (trinket: BoardTrinket, input: DeathrattleTriggeredInput) => {
		const mult = trinket.cardId === CardIds.UnholySanctum_BG32_MagicItem_862 ? 1 : 2;
		const target = input.boardWithDeadEntity[input.boardWithDeadEntity.length - 1];
		if (!!target) {
			modifyStats(
				target,
				trinket,
				3 * mult,
				3 * mult,
				input.boardWithDeadEntity,
				input.boardWithDeadEntityHero,
				input.gameState,
			);
		}
	},
};
