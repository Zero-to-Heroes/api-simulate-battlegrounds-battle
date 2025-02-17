import { BoardEntity } from '../../../board-entity';
import { OnOtherSpawnInput } from '../../../simulation/add-minion-to-board';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { OnOtherSpawnedCard } from '../../card.interface';

export const GentleStag: OnOtherSpawnedCard = {
	cardIds: [TempCardIds.GentleStag, TempCardIds.GentleStag_G],
	onOtherSpawned: (minion: BoardEntity, input: OnOtherSpawnInput) => {
		const mult = minion.cardId === TempCardIds.GentleStag_G ? 2 : 1;
		const target = input.board[input.board.length - 1];
		modifyStats(target, mult * 1, mult * 1, input.board, input.hero, input.gameState);
		input.gameState.spectator.registerPowerTarget(minion, target, input.board, input.hero, input.otherHero);
	},
};
