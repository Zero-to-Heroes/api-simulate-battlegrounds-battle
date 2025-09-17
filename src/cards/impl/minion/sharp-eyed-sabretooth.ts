import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { pickRandomAlive } from '../../../services/utils';
import { BattlecryInput } from '../../../simulation/battlecries';
import { modifyStats } from '../../../simulation/stats';
import { BattlecryCard } from '../../card.interface';

export const SharpEyedSabretooth: BattlecryCard = {
	cardIds: [CardIds.SharpEyedSabretooth_BG33_846, CardIds.SharpEyedSabretooth_BG33_846_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const target = pickRandomAlive(input.board);
		if (!!target) {
			const mult = minion.cardId === CardIds.SharpEyedSabretooth_BG33_846_G ? 2 : 1;
			const baseValue = 1 + (input.hero.globalInfo.FriendlyMinionsDeadLastCombat ?? 0);
			const buff = 2 * mult * baseValue;
			modifyStats(target, minion, buff, buff, input.board, input.hero, input.gameState);
		}
		return true;
	},
};
