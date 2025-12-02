import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { FullGameState } from '../simulation/internal-game-state';
import { modifyStats } from '../simulation/stats';
import { isVolumizer } from '../utils';

export const updateVolumizerBuffs = (
	hero: BgsPlayerEntity,
	board: BoardEntity[],
	attackBuff: number,
	healthBuff: number,
	gameState: FullGameState,
) => {
	hero.globalInfo.VolumizerAttackBuff += attackBuff;
	hero.globalInfo.VolumizerHealthBuff += healthBuff;
	for (const entity of board) {
		if (isVolumizer(entity.cardId, hero, gameState.anomalies, gameState.allCards)) {
			modifyStats(entity, hero, attackBuff, healthBuff, board, hero, gameState);
		}
		// for (const enchantment of entity.enchantments) {
		// 	const rootDbfId = gameState.allCards.getCard(enchantment.cardId).entityDbfIf;
		// 	if (isVolumizer(rootDbfId, hero, gameState.anomalies, gameState.allCards)) {
		// 		modifyStats(entity, hero, attackBuff, healthBuff, board, hero, gameState);
		// 	}
		// }
	}
};
