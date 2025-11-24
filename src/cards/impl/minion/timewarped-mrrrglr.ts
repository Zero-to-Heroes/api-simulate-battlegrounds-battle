import { BoardEntity } from '../../../board-entity';
import { getNeighbours } from '../../../simulation/attack';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { StartOfCombatCard } from '../../card.interface';

export const TimewarpedMrrrglr: StartOfCombatCard = {
	cardIds: [TempCardIds.TimewarpedMrrrglr, TempCardIds.TimewarpedMrrrglr_G],
	startOfCombatTiming: 'start-of-combat',
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const targets = getNeighbours(input.playerBoard, minion);
		// Multiplier not needed if relying on global info?
		const mult = minion.cardId === TempCardIds.TimewarpedMrrrglr_G ? 2 : 1;
		// When it's summoned by Y'Shaarj hero power, the info isn't set
		const totalAttackInHand = input.playerEntity.hand?.map((e) => e.attack ?? 0).reduce((a, b) => a + b, 0) ?? 0;
		const totalHealthInHand = input.playerEntity.hand?.map((e) => e.health ?? 0).reduce((a, b) => a + b, 0) ?? 0;
		// If the minion is gilded in combat, the global info becomes unreliable
		const attackBuff =
			(minion.gildedInCombat ? 0 : input.playerEntity.globalInfo.ChoralAttackBuff) || totalAttackInHand || 0;
		const healthBuff =
			(minion.gildedInCombat ? 0 : input.playerEntity.globalInfo.ChoralHealthBuff) || totalHealthInHand || 0;
		for (let i = 0; i < mult; i++) {
			for (const target of targets) {
				modifyStats(
					target,
					minion,
					attackBuff,
					healthBuff,
					input.playerBoard,
					input.playerEntity,
					input.gameState,
				);
			}
		}
		return true;
	},
};
