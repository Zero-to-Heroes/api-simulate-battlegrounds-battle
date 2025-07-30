import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { hasCorrectTribe } from '../../../utils';
import { BattlecryCard } from '../../card.interface';

export const CanopySwinger: BattlecryCard = {
	cardIds: [TempCardIds.CanopySwinger, TempCardIds.CanopySwinger_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput): boolean => {
		const mult = minion.cardId === TempCardIds.CanopySwinger_G ? 2 : 1;
		const targets = input.board.filter(
			(e) =>
				e !== minion &&
				hasCorrectTribe(e, input.hero, Race.MURLOC, input.gameState.anomalies, input.gameState.allCards),
		);
		for (const target of targets) {
			modifyStats(target, minion, 2 * mult, 0, input.board, input.hero, input.gameState);
		}
		return true;
	},
};
