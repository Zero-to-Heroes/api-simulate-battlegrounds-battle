import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { StartOfCombatCard } from '../../card.interface';

export const ChoralMrrrglr: StartOfCombatCard = {
	cardIds: [CardIds.ChoralMrrrglr_BG26_354, CardIds.ChoralMrrrglr_BG26_354_G],
	startOfCombatTiming: 'start-of-combat',
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		// Multiplier not needed if relying on global info?
		const multiplier = minion.cardId === CardIds.ChoralMrrrglr_BG26_354_G ? 2 : 1;
		// When it's summoned by Y'Shaarj hero power, the info isn't set
		const totalAttackInHand = input.playerEntity.hand?.map((e) => e.attack ?? 0).reduce((a, b) => a + b, 0) ?? 0;
		const totalHealthInHand = input.playerEntity.hand?.map((e) => e.health ?? 0).reduce((a, b) => a + b, 0) ?? 0;
		// If the minion is gilded in combat, the global info becomes unreliable
		const attackBuff =
			multiplier *
			((minion.gildedInCombat ? 0 : input.playerEntity.globalInfo.ChoralAttackBuff) || totalAttackInHand || 0);
		const healthBuff =
			multiplier *
			((minion.gildedInCombat ? 0 : input.playerEntity.globalInfo.ChoralHealthBuff) || totalHealthInHand || 0);
		modifyStats(minion, minion, attackBuff, healthBuff, input.playerBoard, input.playerEntity, input.gameState);
		return true;
	},
};
