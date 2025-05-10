import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { handleSharptoothSnapperForPlayer } from '../../../simulation/summon-when-space';
import { StartOfCombatCard } from '../../card.interface';

// Use this instead of DefaultScriptDataNumCard so that it doesn't trigger before the Start of Combat minions phase
export const SharptoothSnapper: StartOfCombatCard = {
	cardIds: [CardIds.SharptoothSnapper_BG32_201, CardIds.SharptoothSnapper_BG32_201_G],
	startOfCombatTiming: 'start-of-combat',
	startOfCombat: (
		minion: BoardEntity,
		input: SoCInput,
	): { hasTriggered: boolean; shouldRecomputeCurrentAttacker: boolean } => {
		minion.scriptDataNum1 = minion.cardId === CardIds.SharptoothSnapper_BG32_201_G ? 2 : 1;
		handleSharptoothSnapperForPlayer(
			minion,
			input.playerBoard,
			input.playerEntity,
			input.opponentBoard,
			input.opponentEntity,
			input.gameState,
		);
		return { hasTriggered: false, shouldRecomputeCurrentAttacker: false };
	},
};
