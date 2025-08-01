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
	onAnyMinionAttack: (minion: BoardEnchantment, input: OnAttackInput) => {
		if (input.isSelfAttacking) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}

		const mult = minion.cardId === CardIds.StompingStegodon_StompingEnchantment_BG33_840_Ge2 ? 2 : 1;
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
			candidate.enchantments.push({
				cardId:
					input.attacker.cardId === CardIds.StompingStegodon_BG33_840_G
						? CardIds.StompingStegodon_StompingEnchantment_BG33_840_Ge2
						: CardIds.StompingStegodon_StompingEnchantment_BG33_840e2,
				originEntityId: input.attacker.entityId,
				timing: input.gameState.sharedState.currentEntityId++,
			});
		}

		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
