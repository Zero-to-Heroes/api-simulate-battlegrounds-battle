import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';

export const Vaelastrasz = {
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const vaelastraszBonus = minion.cardId === CardIds.Vaelastrasz_TB_BaconShop_HERO_56_Buddy_G ? 6 : 3;
		input.playerBoard
			.filter((e) => e.entityId !== minion.entityId)
			.forEach((e) => {
				modifyStats(
					e,
					minion,
					vaelastraszBonus,
					vaelastraszBonus,
					input.playerBoard,
					input.playerEntity,
					input.gameState,
				);
			});
		return true;
	},
};
