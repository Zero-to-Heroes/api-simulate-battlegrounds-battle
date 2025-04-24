import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnAttackInput } from '../../../simulation/on-attack';
import { modifyStats } from '../../../simulation/stats';
import { OnAttackCard } from '../../card.interface';

export const VoidRay: OnAttackCard = {
	cardIds: [CardIds.WarpGate_VoidRayToken_BG31_HERO_802pt5, CardIds.VoidRay_BG31_HERO_802pt5_G],
	onAnyMinionAttack: (minion: BoardEntity, input: OnAttackInput) => {
		const mult = minion.cardId === CardIds.VoidRay_BG31_HERO_802pt5_G ? 2 : 1;
		modifyStats(input.attacker, minion, 5 * mult, 0, input.attackingBoard, input.attackingHero, input.gameState);
		modifyStats(minion, minion, 5 * mult, 0, input.attackingBoard, input.attackingHero, input.gameState);
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
