import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { modifyStats } from '../../../simulation/stats';
import { BattlecryCard } from '../../card.interface';

export const SilverHandedRecruit: BattlecryCard = {
	cardIds: [CardIds.SilverHandedRecruit_BG31_853, CardIds.SilverHandedRecruit_BG31_853_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mult = minion.cardId === CardIds.SilverHandedRecruit_BG31_853_G ? 2 : 1;
		input.board
			.filter((e) => input.gameState.cardsData.getTavernLevel(e.cardId) % 2 === 0)
			.forEach((e) => {
				modifyStats(e, minion, 4 * mult, 4 * mult, input.board, input.hero, input.gameState);
				input.gameState.spectator.registerPowerTarget(minion, e, input.board, input.hero, null);
			});
	},
};
