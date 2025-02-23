import { Race } from '@firestone-hs/reference-data';
import { BoardTrinket } from '../../../bgs-player-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { setEntityStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';

export const EmeraldDreamcatcher = {
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		const highestAttack = Math.max(...input.playerBoard.map((entity) => entity.attack));
		input.playerBoard
			.filter((e) =>
				hasCorrectTribe(
					e,
					input.playerEntity,
					Race.DRAGON,
					input.gameState.anomalies,
					input.gameState.allCards,
				),
			)
			.forEach((e) => {
				setEntityStats(e, highestAttack, null, input.playerBoard, input.playerEntity, input.gameState);
			});
		return true;
	},
};
