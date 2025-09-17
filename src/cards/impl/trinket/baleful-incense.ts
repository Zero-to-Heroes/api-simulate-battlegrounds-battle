import { CardIds } from '../../../services/card-ids';
import { Race } from '@firestone-hs/reference-data';
import { BoardTrinket } from '../../../bgs-player-entity';
import { updateReborn } from '../../../keywords/reborn';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { hasCorrectTribe } from '../../../utils';
import { StartOfCombatCard } from '../../card.interface';

export const BalefulIncense: StartOfCombatCard = {
	cardIds: [CardIds.BalefulIncense_BG32_MagicItem_360],
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		const undead = input.playerBoard.filter(
			(e) =>
				!e.reborn &&
				hasCorrectTribe(
					e,
					input.playerEntity,
					Race.UNDEAD,
					input.gameState.anomalies,
					input.gameState.allCards,
				),
		);
		const left = undead[0];
		if (!!left) {
			updateReborn(left, true, input.playerBoard, input.playerEntity, input.opponentEntity, input.gameState);
			if (undead.length > 1) {
				const right = undead[undead.length - 1];
				updateReborn(right, true, input.playerBoard, input.playerEntity, input.opponentEntity, input.gameState);
			}
		}
		return true;
	},
};
