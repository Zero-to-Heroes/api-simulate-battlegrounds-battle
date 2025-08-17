import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';

export const ChoralMrrrglr = {
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		// Multiplier not needed if relying on global info?
		const multiplier = minion.cardId === CardIds.ChoralMrrrglr_BG26_354_G ? 2 : 1;
		// When it's summoned by Y'Shaarj hero power, the info isn't set
		const totalAttackInHand = input.playerEntity.hand?.map((e) => e.attack ?? 0).reduce((a, b) => a + b, 0) ?? 0;
		const totalHealthInHand = input.playerEntity.hand?.map((e) => e.health ?? 0).reduce((a, b) => a + b, 0) ?? 0;
		// If the minion is gilded in combat, the global info becomes unreliable
		const attackBuff =
			(minion.gildedInCombat ? 0 : input.playerEntity.globalInfo.ChoralAttackBuff) ||
			multiplier * totalAttackInHand ||
			0;
		const healthBuff =
			(minion.gildedInCombat ? 0 : input.playerEntity.globalInfo.ChoralHealthBuff) ||
			multiplier * totalHealthInHand ||
			0;
		modifyStats(minion, minion, attackBuff, healthBuff, input.playerBoard, input.playerEntity, input.gameState);
		return true;
	},
};
