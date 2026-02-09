import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { pickMultipleRandomDifferent } from '../../../services/utils';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { getMinionsOfDifferentTypes } from '../../../utils';
import { StartOfCombatCard } from '../../card.interface';

export const TimewarpedMythrax: StartOfCombatCard = {
	cardIds: [CardIds.TimewarpedMythrax_BG34_Giant_684, CardIds.TimewarpedMythrax_BG34_Giant_684_G],
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const mult = minion.cardId === CardIds.TimewarpedMythrax_BG34_Giant_684_G ? 2 : 1;
		for (let i = 0; i < mult; i++) {
			const candidates = getMinionsOfDifferentTypes(input.playerBoard, input.playerEntity, input.gameState);
			const targets = pickMultipleRandomDifferent(candidates, 3);
			const totalAttack = targets.reduce((acc, target) => acc + (target.attack ?? 0), 0);
			const totalHealth = targets.reduce((acc, target) => acc + (target.health ?? 0), 0);
			modifyStats(
				minion,
				minion,
				totalAttack,
				totalHealth,
				input.playerBoard,
				input.playerEntity,
				input.gameState,
			);
		}
		return true;
	},
};
