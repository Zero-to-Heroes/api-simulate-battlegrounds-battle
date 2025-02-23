import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { pickRandom } from '../../../services/utils';
import { BattlecryInput } from '../../../simulation/battlecries';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { BattlecryCard } from '../../card.interface';

export const LovesickBalladist: BattlecryCard = {
	cardIds: [CardIds.LovesickBalladist_BG26_814, CardIds.LovesickBalladist_BG26_814_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const allMinions = [...input.board, ...input.otherBoard];
		const balladistMultiplier = minion.cardId === CardIds.LovesickBalladist_BG26_814 ? 1 : 2;
		const balladistStats = balladistMultiplier * (minion.scriptDataNum1 ?? 0);
		const balladistTargets = allMinions.filter((e) =>
			hasCorrectTribe(e, input.hero, Race.PIRATE, input.gameState.anomalies, input.gameState.allCards),
		);
		const balladistTarget = pickRandom(balladistTargets);
		if (balladistTarget) {
			const targetBoard = input.board.includes(balladistTarget) ? input.board : input.otherBoard;
			const targetHero = input.board.includes(balladistTarget) ? input.hero : input.otherHero;
			modifyStats(balladistTarget, 0, balladistStats, targetBoard, targetHero, input.gameState);
			input.gameState.spectator.registerPowerTarget(
				minion,
				balladistTarget,
				targetBoard,
				targetHero,
				input.otherHero,
			);
		}
	},
};
