import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { modifyStats } from '../../../simulation/stats';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const EchoingRoar: EndOfTurnCard = {
	cardIds: [CardIds.EchoingRoar_EchoingRoarEnchantment_BG28_814e],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		modifyStats(minion, 2, 2, input.board, input.hero, input.gameState);
		input.gameState.spectator.registerPowerTarget(minion, minion, input.board, input.hero, input.otherHero);
	},
};
