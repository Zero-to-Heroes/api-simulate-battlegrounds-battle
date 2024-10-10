import { BoardTrinket } from '../../../bgs-player-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';

export const TinyfinOnesie = {
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		const highestHealthMinionInHand = input.playerEntity.hand?.sort((a, b) => b.health - a.health)[0];
		if (highestHealthMinionInHand && input.playerBoard.length > 0) {
			modifyStats(
				input.playerBoard[0],
				highestHealthMinionInHand.attack,
				highestHealthMinionInHand.health,
				input.playerBoard,
				input.playerEntity,
				input.gameState,
			);
			return true;
		}
	},
};
