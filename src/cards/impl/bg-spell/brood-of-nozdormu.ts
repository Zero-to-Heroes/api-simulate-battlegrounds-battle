import { BoardSecret } from '../../../board-secret';
import { CardIds } from '../../../services/card-ids';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { StartOfCombatCard } from '../../card.interface';

export const BroodOfNozdormu: StartOfCombatCard = {
	cardIds: [CardIds.BroodOfNozdormu_BG34_889],
	startOfCombatTiming: 'start-of-combat',
	startOfCombat: (secret: BoardSecret, input: SoCInput) => {
		const target = input.playerBoard[0];
		if (!!target) {
			modifyStats(target, secret, target.attack, 0, input.playerBoard, input.playerEntity, input.gameState);
		}
		return true;
	},
};
