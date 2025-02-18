import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnOtherSpawnInput } from '../../../simulation/add-minion-to-board';
import { modifyStats } from '../../../simulation/stats';
import { OnOtherSpawnedCard } from '../../card.interface';

export const GentleStag: OnOtherSpawnedCard = {
	cardIds: [CardIds.GentleStag_BG31_369, CardIds.GentleStag_BG31_369_G],
	onOtherSpawned: (minion: BoardEntity, input: OnOtherSpawnInput) => {
		const mult = minion.cardId === CardIds.GentleStag_BG31_369_G ? 2 : 1;
		const target = input.board[input.board.length - 1];
		modifyStats(target, mult * 1, mult * 1, input.board, input.hero, input.gameState);
		input.gameState.spectator.registerPowerTarget(minion, target, input.board, input.hero, input.otherHero);
	},
};
