import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnMinionKilledInput } from '../../../simulation/attack';
import { modifyStats } from '../../../simulation/stats';
import { OnMinionKilledCard } from '../../card.interface';

export const Mutalisk: OnMinionKilledCard = {
	cardIds: [CardIds.KerriganQueenOfBlades_MutaliskToken_BG31_HERO_811t6, CardIds.Mutalisk_BG31_HERO_811t6_G],
	onMinionKilled: (
		minion: BoardEntity,
		input: OnMinionKilledInput,
	): { dmgDoneByAttacker: number; dmgDoneByDefender: number } => {
		const mult = minion.cardId === CardIds.Mutalisk_BG31_HERO_811t6_G ? 2 : 1;
		modifyStats(minion, minion, 1 * mult, 0, input.attackingBoard, input.attackingHero, input.gameState);
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
