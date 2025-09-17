import { CardIds } from '../../../services/card-ids';
import { BoardTrinket } from '../../../bgs-player-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';

export const RivendarePortrait = {
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		// Portraits are a bit weird, as having 2 of them makes stats go x3 instead of x4,
		// so we process them all in one go
		if (trinket.scriptDataNum1 != 99) {
			const rivendareTrinkets = input.playerEntity.trinkets.filter(
				(t) => t.cardId === CardIds.RivendarePortrait_BG30_MagicItem_310,
			);
			const buffBonus = rivendareTrinkets.length;
			input.playerBoard
				.filter(
					(e) =>
						e.cardId === CardIds.TitusRivendare_BG25_354 || e.cardId === CardIds.TitusRivendare_BG25_354_G,
				)
				.forEach((e) => {
					modifyStats(
						e,
						trinket,
						0,
						buffBonus * e.health,
						input.playerBoard,
						input.playerEntity,
						input.gameState,
					);
				});
			rivendareTrinkets.forEach((t) => (t.scriptDataNum1 = 99));
			return true;
		}
	},
};
