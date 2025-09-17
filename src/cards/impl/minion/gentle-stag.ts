import { CardIds } from '../../../services/card-ids';
import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnOtherSpawnInput } from '../../../simulation/add-minion-to-board';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { OnOtherSpawnedCard } from '../../card.interface';

export const GentleStag: OnOtherSpawnedCard = {
	cardIds: [CardIds.GentleStag_BG31_369, CardIds.GentleStag_BG31_369_G],
	onOtherSpawned: (minion: BoardEntity, input: OnOtherSpawnInput) => {
		const mult = minion.cardId === CardIds.GentleStag_BG31_369_G ? 2 : 1;
		const beasts = input.board.filter((e) =>
			hasCorrectTribe(e, input.hero, Race.BEAST, input.gameState.anomalies, input.gameState.allCards),
		);
		const target = beasts[beasts.length - 1];
		if (target) {
			modifyStats(target, minion, 3 * mult, 3 * mult, input.board, input.hero, input.gameState);
		}
	},
};
