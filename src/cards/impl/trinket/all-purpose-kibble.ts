import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardTrinket } from '../../../bgs-player-entity';
import { OnAttackInput } from '../../../simulation/on-attack';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { OnWheneverAnotherMinionAttacksCard } from '../../card.interface';

export const AllPurposeKibble: OnWheneverAnotherMinionAttacksCard = {
	cardIds: [CardIds.AllPurposeKibble_BG32_MagicItem_200],
	onWheneverAnotherMinionAttacks: (trinket: BoardTrinket, input: OnAttackInput) => {
		if (
			!hasCorrectTribe(
				input.attacker,
				input.attackingHero,
				Race.BEAST,
				input.gameState.anomalies,
				input.gameState.allCards,
			)
		) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}

		const buff = trinket.scriptDataNum1 || 2;
		modifyStats(input.attacker, trinket, buff, 0, input.attackingBoard, input.attackingHero, input.gameState);
		trinket.scriptDataNum1 = (trinket.scriptDataNum1 || 2) + 2;
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
