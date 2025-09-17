import { CardIds } from '../../../services/card-ids';
import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnAttackInput } from '../../../simulation/on-attack';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { RallyCard } from '../../card.interface';

export const stompingStegodonAttack = 3;
export const stompingStegodonHealth = 0;

export const StompingStegodon: RallyCard = {
	cardIds: [CardIds.StompingStegodon_BG33_840, CardIds.StompingStegodon_BG33_840_G],
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		const debug = minion.entityId === 10597;
		const mult = minion.cardId === CardIds.StompingStegodon_BG33_840_G ? 2 : 1;
		const candidates = input.attackingBoard.filter(
			(e) =>
				e !== minion &&
				hasCorrectTribe(
					e,
					input.attackingHero,
					Race.BEAST,
					input.gameState.anomalies,
					input.gameState.allCards,
				),
		);
		const enchantmentCardIdToAdd =
			minion.cardId === CardIds.StompingStegodon_BG33_840_G
				? CardIds.StompingStegodon_StompingEnchantment_BG33_840_Ge2
				: CardIds.StompingStegodon_StompingEnchantment_BG33_840e2;
		for (const candidate of candidates) {
			modifyStats(
				candidate,
				minion,
				stompingStegodonAttack * mult,
				stompingStegodonHealth * mult,
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
			existingEnchantment.repeats += 1;
		}

		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
