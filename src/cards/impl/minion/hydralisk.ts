import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnAttackInput } from '../../../simulation/on-attack';
import { modifyStats } from '../../../simulation/stats';
import { OnAttackCard } from '../../card.interface';

export const Hydralisk: OnAttackCard = {
	cardIds: [CardIds.KerriganQueenOfBlades_HydraliskToken_BG31_HERO_811t4, CardIds.Hydralisk_BG31_HERO_811t4_G],
	onAnyMinionAttack: (minion: BoardEntity, input: OnAttackInput) => {
		if (minion !== input.attacker) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}
		const mult = minion.cardId === CardIds.Hydralisk_BG31_HERO_811t4_G ? 2 : 1;
		const buff = input.attackingHero.tavernTier;
		modifyStats(minion, buff * mult, 0, input.attackingBoard, input.attackingHero, input.gameState);
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
