import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnBeforeMagnetizeInput } from '../../../simulation/magnetize';
import { OnBeforeMagnetizeCard } from '../../card.interface';

export const MechagnomeInterpreter: OnBeforeMagnetizeCard = {
	cardIds: [CardIds.MechagnomeInterpreter_BG31_177, CardIds.MechagnomeInterpreter_BG31_177_G],
	onBeforeMagnetize: (entity: BoardEntity, input: OnBeforeMagnetizeInput) => {
		const mult = entity.cardId === CardIds.MechagnomeInterpreter_BG31_177_G ? 2 : 1;
		input.magnetizedCard.attack += 2 * mult;
		input.magnetizedCard.health += 2 * mult;
	},
};
