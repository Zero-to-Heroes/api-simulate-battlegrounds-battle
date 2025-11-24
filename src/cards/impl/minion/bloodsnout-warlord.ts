import { GameTag } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { playBloodGemsOn } from '../../../simulation/blood-gems';
import { OnAttackInput } from '../../../simulation/on-attack';
import { hasEntityMechanic } from '../../../utils';
import { OnWheneverAnotherMinionAttacksCard } from '../../card.interface';

export const BloodsnoutWarlord: OnWheneverAnotherMinionAttacksCard = {
	cardIds: [CardIds.BloodsnoutWarlord_BG33_884, CardIds.BloodsnoutWarlord_BG33_884_G],
	onWheneverAnotherMinionAttacks: (minion: BoardEntity, input: OnAttackInput) => {
		if (hasEntityMechanic(input.attacker, GameTag.BACON_RALLY, input.gameState.allCards)) {
			const mult = minion.cardId === CardIds.BloodsnoutWarlord_BG33_884_G ? 2 : 1;
			for (const target of input.attackingBoard) {
				playBloodGemsOn(
					minion,
					target,
					2 * mult,
					input.attackingBoard,
					input.attackingHero,
					input.defendingBoard,
					input.defendingHero,
					input.gameState,
				);
			}
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
