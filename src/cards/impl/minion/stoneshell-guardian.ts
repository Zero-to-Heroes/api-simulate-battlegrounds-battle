import { GameTag } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { hasEntityMechanic } from '../../../utils';
import { StartOfCombatCard } from '../../card.interface';

export const StoneshellGuardian: StartOfCombatCard = {
	cardIds: [CardIds.StoneshellGuardian_BG33_HERO_000_Buddy, CardIds.StoneshellGuardian_BG33_HERO_000_Buddy_G],
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		// let totalSpawned = 0;
		const numberOfCopies = minion.cardId === CardIds.StoneshellGuardian_BG33_HERO_000_Buddy_G ? 2 : 1;
		for (let i = 0; i < numberOfCopies; i++) {
			const rallyMinions = input.playerBoard.filter(
				(e) =>
					!StoneshellGuardian.cardIds.includes(e.cardId) &&
					hasEntityMechanic(e, GameTag.BACON_RALLY, input.gameState.allCards),
			);
			for (const target of rallyMinions) {
				const rallyEnchantments = target.enchantments.filter((e) =>
					hasEntityMechanic(e, GameTag.BACON_RALLY, input.gameState.allCards),
				);
				minion.enchantments.push({
					cardId: target.cardId,
					originEntityId: target.entityId,
					timing: input.gameState.sharedState.currentEntityId++,
				});
				for (const rallyEnchantment of rallyEnchantments) {
					minion.enchantments.push({
						cardId: rallyEnchantment.cardId,
						originEntityId: rallyEnchantment.originEntityId,
						timing: input.gameState.sharedState.currentEntityId++,
					});
				}
				input.gameState.spectator.registerPowerTarget(
					minion,
					target,
					input.playerBoard,
					input.playerEntity,
					input.opponentEntity,
				);
			}
		}
		return true;
	},
};
