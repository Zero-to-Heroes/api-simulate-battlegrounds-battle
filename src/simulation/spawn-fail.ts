import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { CardIds } from '../services/card-ids';
import { addStatsToAliveBoard, addStatsToBoard } from '../utils';
import { FullGameState } from './internal-game-state';
import { modifyStats } from './stats';

export const onMinionFailedToSpawn = (
	entity: BoardEntity,
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	gameState: FullGameState,
) => {
	if (entity?.onCanceledSummon) {
		entity.onCanceledSummon();
	}

	hero.trinkets
		.filter((t) => t.cardId === CardIds.MugOfTheSireToken_BG30_MagicItem_438t)
		.forEach((t) => addStatsToBoard(t, board, hero, 5, 0, gameState));

	board
		.filter(
			(e) =>
				e.cardId === CardIds.ThunderingAbomination_BG30_124 ||
				e.cardId === CardIds.ThunderingAbomination_BG30_124_G,
		)
		.forEach((abom) => {
			const abomStatsMultiplier = abom.cardId === CardIds.ThunderingAbomination_BG30_124_G ? 2 : 1;
			modifyStats(abom, abom, abomStatsMultiplier * 3, abomStatsMultiplier * 3, board, hero, gameState);
		});
	board
		.filter((e) => e.cardId === CardIds.CatacombCrasher_BG30_129 || e.cardId === CardIds.CatacombCrasher_BG30_129_G)
		.forEach((crasher) => {
			const mult = crasher.cardId === CardIds.CatacombCrasher_BG30_129 ? 1 : 2;
			addStatsToAliveBoard(crasher, board, hero, 2 * mult, 1 * mult, gameState);
		});
};
