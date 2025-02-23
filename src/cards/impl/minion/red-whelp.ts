import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { dealDamageToRandomEnemy } from '../../../simulation/attack';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { hasCorrectTribe } from '../../../utils';

export const RedWhelp = {
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const damage = input.playerBoardBefore.filter((entity) =>
			hasCorrectTribe(
				entity,
				input.playerEntity,
				Race.DRAGON,
				input.gameState.anomalies,
				input.gameState.allCards,
			),
		).length;
		const loops = minion.cardId === CardIds.RedWhelp_TB_BaconUps_102 ? 2 : 1;
		for (let i = 0; i < loops; i++) {
			dealDamageToRandomEnemy(
				input.opponentBoard,
				input.opponentEntity,
				minion,
				damage,
				input.playerBoard,
				input.playerEntity,
				input.gameState,
			);
		}
		return true;
	},
};
