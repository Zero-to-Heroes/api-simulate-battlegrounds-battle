import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { getNeighbours } from '../../../simulation/attack';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { StartOfCombatCard } from '../../card.interface';

export const MasterGadrin: StartOfCombatCard = {
	cardIds: [CardIds.MasterGadrin_BG20_HERO_201_Buddy, CardIds.MasterGadrin_BG20_HERO_201_Buddy_G],
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const minionIndex = input.playerBoard.indexOf(minion);
		const leftNeighbour = minionIndex - 1 >= 0 ? input.playerBoard[minionIndex - 1] : null;
		const targets =
			minion.cardId === CardIds.MasterGadrin_BG20_HERO_201_Buddy_G
				? getNeighbours(input.playerBoard, minion)
				: [leftNeighbour].filter((e) => !!e);
		for (const target of targets) {
			modifyStats(target, minion, 0, target.attack, input.playerBoard, input.playerEntity, input.gameState);
		}
		return true;
	},
};
