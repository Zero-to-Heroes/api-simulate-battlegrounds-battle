import { CardIds } from '../../../services/card-ids';
import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { pickRandom } from '../../../services/utils';
import { BattlecryInput } from '../../../simulation/battlecries';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { BattlecryCard } from '../../card.interface';

export const Smolderwing: BattlecryCard = {
	cardIds: [
		CardIds.GeneralDrakkisath_SmolderwingToken_BG25_309t,
		CardIds.GeneralDrakkisath_SmolderwingToken_BG25_309_Gt,
	],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const allMinions = [...input.board, ...input.otherBoard];
		const smolderwingTarget = pickRandom(
			allMinions.filter((e) =>
				hasCorrectTribe(e, input.hero, Race.DRAGON, input.gameState.anomalies, input.gameState.allCards),
			),
		);
		if (!!smolderwingTarget) {
			const targetBoard = input.board.includes(smolderwingTarget) ? input.board : input.otherBoard;
			const targetHero = input.board.includes(smolderwingTarget) ? input.hero : input.otherHero;
			const smolderwingMultiplier =
				minion.cardId === CardIds.GeneralDrakkisath_SmolderwingToken_BG25_309t ? 1 : 2;
			const smolderwingStats = 5 * smolderwingMultiplier;
			modifyStats(smolderwingTarget, minion, smolderwingStats, 0, targetBoard, targetHero, input.gameState);
		}
		return true;
	},
};
