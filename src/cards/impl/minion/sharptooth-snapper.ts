import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { handleSharptoothSnapperForPlayer } from '../../../simulation/summon-when-space';
import { DefaultChargesCard, StartOfCombatCard } from '../../card.interface';

export const SharptoothSnapper: StartOfCombatCard & DefaultChargesCard = {
	cardIds: [CardIds.SharptoothSnapper_BG32_201, CardIds.SharptoothSnapper_BG32_201_G],
	startOfCombatTiming: 'start-of-combat',
	// Use this instead of DefaultScriptDataNumCard so that it doesn't trigger before the Start of Combat minions phase
	// In fact this doesn't work, as it would allow it to trigger before some start of combat hero powers like Tentacular
	defaultCharges: (minion: BoardEntity) => {
		return 0;
	},
	startOfCombat: (
		minion: BoardEntity,
		input: SoCInput,
	): { hasTriggered: boolean; shouldRecomputeCurrentAttacker: boolean } => {
		minion.abiityChargesLeft = minion.cardId === CardIds.SharptoothSnapper_BG32_201_G ? 2 : 1;
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
