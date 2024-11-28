import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { modifyStats } from '../../../simulation/stats';
import { BattlecryCard } from '../../card.interface';

export const InspiringUnderdog: BattlecryCard = {
	cardIds: [CardIds.InspiringUnderdog_BG30_127, CardIds.InspiringUnderdog_BG30_127_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const targets = input.board.filter((e) => input.gameState.cardsData.getTavernLevel(e.cardId) <= 3);
		if (targets.length > 0) {
			const multiplier = minion.cardId === CardIds.InspiringUnderdog_BG30_127 ? 1 : 2;
			targets.forEach((target) => {
				modifyStats(target, multiplier * 2, multiplier * 1, input.board, input.hero, input.gameState);
				input.gameState.spectator.registerPowerTarget(minion, target, input.board, input.hero, input.otherHero);
			});
		}
	},
};
