import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEnchantment } from '../../../board-entity';
import { OnAttackInput } from '../../../simulation/on-attack';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { OnAttackCard } from '../../card.interface';

export const StompingStegodonEnchantment: OnAttackCard = {
	cardIds: [
		CardIds.StompingStegodon_StompingEnchantment_BG33_840e2,
		CardIds.StompingStegodon_StompingEnchantment_BG33_840_Ge2,
	],
	onAnyMinionAttack: (enchantment: BoardEnchantment, input: OnAttackInput) => {
		if (!input.isSelfAttacking) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}

		const mult = enchantment.cardId === CardIds.StompingStegodon_StompingEnchantment_BG33_840_Ge2 ? 2 : 1;
		const nbOfTriggers = enchantment.repeats ?? 1;
		const enchantmentCardIdToAdd =
			enchantment.cardId === CardIds.StompingStegodon_StompingEnchantment_BG33_840_Ge2
				? CardIds.StompingStegodon_StompingEnchantment_BG33_840_Ge2
				: CardIds.StompingStegodon_StompingEnchantment_BG33_840e2;
		const candidates = input.attackingBoard.filter(
			(e) =>
				e !== input.attacker &&
				hasCorrectTribe(
					e,
					input.attackingHero,
					Race.BEAST,
					input.gameState.anomalies,
					input.gameState.allCards,
				),
		);
		for (const candidate of candidates) {
			modifyStats(
				candidate,
				input.attacker,
				2 * mult,
				2 * mult,
				input.attackingBoard,
				input.attackingHero,
				input.gameState,
			);
			let existingEnchantment = candidate.enchantments.find((e) => e.cardId === enchantmentCardIdToAdd);
			if (!existingEnchantment) {
				existingEnchantment = {
					cardId: enchantmentCardIdToAdd,
					originEntityId: input.attacker.entityId,
					timing: input.gameState.sharedState.currentEntityId++,
					repeats: 0,
				};
				candidate.enchantments.push(existingEnchantment);
			}
			existingEnchantment.repeats += nbOfTriggers;
		}

		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
