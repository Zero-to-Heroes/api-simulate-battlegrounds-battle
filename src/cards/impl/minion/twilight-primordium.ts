import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { pickRandom } from '../../../services/utils';
import { BattlecryInput } from '../../../simulation/battlecries';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { BattlecryCard } from '../../card.interface';

export const TwilightPrimordium: BattlecryCard = {
	cardIds: [CardIds.TwilightPrimordium_BG31_813, CardIds.TwilightPrimordium_BG31_813_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const currentBuffValue = minion.scriptDataNum1 ?? 1;
		const mult = minion.cardId === CardIds.TwilightPrimordium_BG31_813_G ? 2 : 1;
		const candidates = [
			...input.board.filter((e) =>
				hasCorrectTribe(e, input.hero, Race.ELEMENTAL, input.gameState.anomalies, input.gameState.allCards),
			),
			...input.otherBoard.filter((e) =>
				hasCorrectTribe(e, input.hero, Race.ELEMENTAL, input.gameState.anomalies, input.gameState.allCards),
			),
		];
		const target = pickRandom(candidates);
		if (!!target) {
			modifyStats(
				target,
				minion,
				2 * mult * currentBuffValue,
				2 * mult * currentBuffValue,
				input.board,
				input.hero,
				input.gameState,
			);
		}
	},
};
