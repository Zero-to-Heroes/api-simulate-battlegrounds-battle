import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { OnAfterMagnetizeInput } from '../../../simulation/magnetize';
import { makeMinionGolden } from '../../../simulation/utils/golden';
import { hasCorrectTribe } from '../../../utils';
import { OnAfterMagnetizeCard } from '../../card.interface';

export const TimewarpedProbius: OnAfterMagnetizeCard = {
	cardIds: [CardIds.TimewarpedProbius_BG34_Giant_121, CardIds.TimewarpedProbius_BG34_Giant_121_G],
	onAfterMagnetize: (entity: BoardEntity, input: OnAfterMagnetizeInput) => {
		if (
			hasCorrectTribe(
				input.magnetizeTarget,
				input.hero,
				Race.MECH,
				input.gameState.anomalies,
				input.gameState.allCards,
			)
		) {
			makeMinionGolden(
				input.magnetizeTarget,
				entity,
				input.board,
				input.hero,
				input.otherBoard,
				input.otherHero,
				input.gameState,
			);
			input.gameState.spectator.registerPowerTarget(
				entity,
				input.magnetizeTarget,
				input.board,
				input.hero,
				input.otherHero,
			);
		}
	},
};
