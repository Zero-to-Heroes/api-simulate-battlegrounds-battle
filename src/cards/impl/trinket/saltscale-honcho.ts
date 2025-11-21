import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { OnOtherSpawnInput } from '../../../simulation/add-minion-to-board';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { AfterOtherSpawnedCard } from '../../card.interface';

export const SaltscaleHoncho: AfterOtherSpawnedCard = {
	cardIds: [CardIds.SaltscaleHoncho_BG21_008, CardIds.SaltscaleHoncho_BG21_008_G],
	afterOtherSpawned: (minion: BoardEntity, input: OnOtherSpawnInput) => {
		if (
			!hasCorrectTribe(
				input.spawned,
				input.hero,
				Race.MURLOC,
				input.gameState.anomalies,
				input.gameState.allCards,
			)
		) {
			return;
		}

		const candidates = input.board.filter(
			(e) =>
				e !== input.spawned &&
				hasCorrectTribe(e, input.hero, Race.MURLOC, input.gameState.anomalies, input.gameState.allCards),
		);
		const target = pickRandom(candidates);
		const mult = minion.cardId === CardIds.SaltscaleHoncho_BG21_008_G ? 2 : 1;
		if (!!target) {
			modifyStats(target, minion, 0, 2 * mult, input.board, input.hero, input.gameState);
		}
	},
};
