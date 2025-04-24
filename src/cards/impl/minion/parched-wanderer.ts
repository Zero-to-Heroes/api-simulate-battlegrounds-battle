import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { updateTaunt } from '../../../keywords/taunt';
import { pickRandom } from '../../../services/utils';
import { BattlecryInput } from '../../../simulation/battlecries';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { BattlecryCard } from '../../card.interface';

export const ParchedWanderer: BattlecryCard = {
	cardIds: [CardIds.ParchedWanderer_BG30_756, CardIds.ParchedWanderer_BG30_756_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const allMinions = [...input.board, ...input.otherBoard];
		const wandererTarget = pickRandom(
			allMinions.filter((e) =>
				hasCorrectTribe(e, input.hero, Race.MURLOC, input.gameState.anomalies, input.gameState.allCards),
			),
		);
		if (!!wandererTarget) {
			const wandererMultiplier = minion.cardId === CardIds.ParchedWanderer_BG30_756 ? 1 : 2;
			const targetBoard = input.board.find((entity) => entity.entityId === wandererTarget.entityId)
				? input.board
				: input.otherBoard;
			const targetHero = targetBoard === input.board ? input.hero : input.otherHero;
			const otherHero = targetBoard === input.board ? input.otherHero : input.hero;
			updateTaunt(wandererTarget, true, targetBoard, targetHero, otherHero, input.gameState);
			modifyStats(
				wandererTarget,
				minion,
				wandererMultiplier * 2,
				wandererMultiplier * 3,
				targetBoard,
				targetHero,
				input.gameState,
			);
		}
	},
};
