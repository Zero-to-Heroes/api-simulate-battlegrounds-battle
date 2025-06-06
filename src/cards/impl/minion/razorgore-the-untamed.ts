import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { EndOfTurnCard } from '../../card.interface';

export const RazorgoreTheUntamed: EndOfTurnCard = {
	cardIds: [CardIds.RazorgoreTheUntamed_BGS_036, CardIds.RazorgoreTheUntamed_TB_BaconUps_106],
	endOfTurn: (minion: BoardEntity, input: BattlecryInput) => {
		const otherDragons = input.board
			.filter((e) => e.entityId !== minion.entityId)
			.filter((e) =>
				hasCorrectTribe(e, input.hero, Race.DRAGON, input.gameState.anomalies, input.gameState.allCards),
			);
		const mult = minion.cardId === CardIds.RazorgoreTheUntamed_TB_BaconUps_106 ? 2 : 1;
		if (otherDragons.length) {
			modifyStats(
				minion,
				minion,
				mult * otherDragons.length,
				mult * 2 * otherDragons.length,
				input.board,
				input.hero,
				input.gameState,
			);
		}
	},
};
