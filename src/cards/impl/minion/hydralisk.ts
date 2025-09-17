import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { OnAttackInput } from '../../../simulation/on-attack';
import { modifyStats } from '../../../simulation/stats';
import { RallyCard } from '../../card.interface';

export const Hydralisk: RallyCard = {
	cardIds: [CardIds.KerriganQueenOfBlades_HydraliskToken_BG31_HERO_811t4, CardIds.Hydralisk_BG31_HERO_811t4_G],
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		const mult = minion.cardId === CardIds.Hydralisk_BG31_HERO_811t4_G ? 2 : 1;
		const buff = input.attackingHero.tavernTier;
		modifyStats(minion, minion, buff * mult, 0, input.attackingBoard, input.attackingHero, input.gameState);
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
