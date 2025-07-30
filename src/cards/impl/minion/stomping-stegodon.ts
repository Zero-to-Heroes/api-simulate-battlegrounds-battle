import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnAttackInput } from '../../../simulation/on-attack';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { hasCorrectTribe } from '../../../utils';
import { OnAttackCard } from '../../card.interface';

export const StompingStegodon: OnAttackCard = {
	cardIds: [TempCardIds.StompingStegodon, TempCardIds.StompingStegodon_G],
	onAnyMinionAttack: (minion: BoardEntity, input: OnAttackInput) => {
		if (input.attacker !== minion) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}

		const mult = minion.cardId === TempCardIds.StompingStegodon_G ? 2 : 1;
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
		for (const candidate of candidates) {
			modifyStats(
				candidate,
				minion,
				2 * mult,
				2 * mult,
				input.attackingBoard,
				input.attackingHero,
				input.gameState,
			);
			candidate.enchantments.push({
				cardId:
					minion.cardId === TempCardIds.StompingStegodon_G
						? TempCardIds.StompingStegodonEnchantment_G
						: TempCardIds.StompingStegodonEnchantment,
				originEntityId: minion.entityId,
				timing: input.gameState.sharedState.currentEntityId++,
			});
		}

		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
