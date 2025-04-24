import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';

export const ChoralMrrrglr = {
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const multiplier = minion.cardId === CardIds.ChoralMrrrglr_BG26_354_G ? 2 : 1;
		// When it's summoned by Y'Shaarj hero power, the info isn't set
		const attackBuff =
			(input.playerEntity.globalInfo?.ChoralAttackBuff ||
				input.playerEntity.hand?.map((e) => e.attack ?? 0).reduce((a, b) => a + b, 0)) ??
			0;
		const healthBuff =
			(input.playerEntity.globalInfo?.ChoralHealthBuff ||
				input.playerEntity.hand?.map((e) => e.health ?? 0).reduce((a, b) => a + b, 0)) ??
			0;
		modifyStats(
			minion,
			minion,
			multiplier * attackBuff,
			multiplier * healthBuff,
			input.playerBoard,
			input.playerEntity,
			input.gameState,
		);
		return true;
	},
};
