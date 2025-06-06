import { CardIds } from '@firestone-hs/reference-data';
import { BoardTrinket } from '../../../bgs-player-entity';
import { OnAttackInput } from '../../../simulation/on-attack';
import { modifyStats } from '../../../simulation/stats';
import { OnAttackCard } from '../../card.interface';

export const AllPurposeKibble: OnAttackCard = {
	cardIds: [CardIds.AllPurposeKibble_BG32_MagicItem_200],
	onAnyMinionAttack: (trinket: BoardTrinket, input: OnAttackInput) => {
		const buff = trinket.scriptDataNum1 || 2;
		modifyStats(input.attacker, trinket, buff, 0, input.attackingBoard, input.attackingHero, input.gameState);
		trinket.scriptDataNum1 = (trinket.scriptDataNum1 || 2) + 2;
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
