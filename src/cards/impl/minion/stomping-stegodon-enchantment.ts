import { Race } from '@firestone-hs/reference-data';
import { BoardEnchantment } from '../../../board-entity';
import { OnAttackInput } from '../../../simulation/on-attack';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { hasCorrectTribe } from '../../../utils';
import { OnAttackCard } from '../../card.interface';

export const StompingStegodonEnchantment: OnAttackCard = {
	cardIds: [TempCardIds.StompingStegodonEnchantment, TempCardIds.StompingStegodonEnchantment_G],
	onAnyMinionAttack: (minion: BoardEnchantment, input: OnAttackInput) => {
		if (input.isSelfAttacking) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}

		const mult = minion.cardId === TempCardIds.StompingStegodonEnchantment_G ? 2 : 1;
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
					input.attacker.cardId === TempCardIds.StompingStegodon_G
						? TempCardIds.StompingStegodonEnchantment_G
						: TempCardIds.StompingStegodonEnchantment,
				originEntityId: input.attacker.entityId,
				timing: input.gameState.sharedState.currentEntityId++,
			});
		}

		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
