import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { pickRandomAlive } from '../../../services/utils';
import { BattlecryInput } from '../../../simulation/battlecries';
import { modifyStats } from '../../../simulation/stats';
import { BattlecryCard } from '../../card.interface';

export const WispInTheShell: BattlecryCard = {
	cardIds: [CardIds.WispInTheShell_BG31_841, CardIds.WispInTheShell_BG31_841_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const target = pickRandomAlive(input.board);
		if (!!target) {
			const mult = minion.cardId === CardIds.WispInTheShell_BG31_841 ? 1 : 2;
			const baseValue = 1 + (input.hero.globalInfo.FriendlyMinionsDeadLastCombat ?? 0);
			const buff = 2 * mult * baseValue;
			modifyStats(target, minion, buff, buff, input.board, input.hero, input.gameState);
		}
	},
};
