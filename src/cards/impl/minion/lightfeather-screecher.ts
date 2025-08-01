import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { updateTaunt } from '../../../keywords/taunt';
import { updateWindfury } from '../../../keywords/windfury';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { hasCorrectTribe } from '../../../utils';
import { StartOfCombatCard } from '../../card.interface';

export const LightfeatherScreecher: StartOfCombatCard = {
	cardIds: [CardIds.LightfeatherScreecher_BG33_841, CardIds.LightfeatherScreecher_BG33_841_G],
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const mult = minion.cardId === CardIds.LightfeatherScreecher_BG33_841_G ? 2 : 1;
		const candidates = input.playerBoard.filter((e) =>
			hasCorrectTribe(e, input.playerEntity, Race.BEAST, input.gameState.anomalies, input.gameState.allCards),
		);
		for (let i = 0; i < mult; i++) {
			const target = candidates[i];
			if (!!target) {
				updateTaunt(target, true, input.playerBoard, input.playerEntity, input.opponentEntity, input.gameState);
				updateWindfury(
					target,
					true,
					input.playerBoard,
					input.playerEntity,
					input.opponentEntity,
					input.gameState,
				);
			}
		}
		return true;
	},
};
