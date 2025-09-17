import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { getMinionsOfDifferentTypes } from '../../../utils';

export const ElderTaggawag = {
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const minionsOfDifferentTypes = getMinionsOfDifferentTypes(
			input.playerBoard,
			input.playerEntity,
			input.gameState,
		);
		if (minionsOfDifferentTypes.length >= 4) {
			const highestAttackOnBoard = Math.max(...input.playerBoard.map((entity) => entity.attack));
			const highestHealthOnBoard = Math.max(...input.playerBoard.map((entity) => entity.health));
			const multiplier = minion.cardId === CardIds.ElderTaggawag_TB_BaconShop_HERO_14_Buddy_G ? 2 : 1;
			modifyStats(
				minion,
				minion,
				highestAttackOnBoard * multiplier,
				highestHealthOnBoard * multiplier,
				input.playerBoard,
				input.playerEntity,
				input.gameState,
			);
		}
		return true;
	},
};
