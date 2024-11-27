import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { BattlecryCard } from '../../card.interface';

export const SilverHandedRecruit: BattlecryCard = {
	cardIds: [TempCardIds.SilverHandedRecruit, TempCardIds.SilverHandedRecruit_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mult = minion.cardId === TempCardIds.SilverHandedRecruit_G ? 2 : 1;
		input.board
			.filter((e) => input.gameState.cardsData.getTavernLevel(e.cardId) % 2 === 0)
			.forEach((e) => {
				modifyStats(e, 4 * mult, 4 * mult, input.board, input.hero, input.gameState);
				input.gameState.spectator.registerPowerTarget(minion, e, input.board, input.hero, null);
			});
	},
};
