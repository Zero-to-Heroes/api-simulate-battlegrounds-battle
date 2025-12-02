import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { OnOtherSpawnInput } from '../../../simulation/add-minion-to-board';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { AfterOtherSpawnedCard, AfterTavernSpellCastCard, CastSpellInput } from '../../card.interface';

export const TimewarpedJungleKing: AfterOtherSpawnedCard & AfterTavernSpellCastCard = {
	cardIds: [CardIds.TimewarpedJungleKing_BG34_PreMadeChamp_004, CardIds.TimewarpedJungleKing_BG34_PreMadeChamp_004_G],
	afterOtherSpawned: (minion: BoardEntity, input: OnOtherSpawnInput) => {
		if (
			!hasCorrectTribe(input.spawned, input.hero, Race.BEAST, input.gameState.anomalies, input.gameState.allCards)
		) {
			return;
		}

		const baseBuff = minion.scriptDataNum1 ?? 1;
		const mult = minion.cardId === CardIds.TimewarpedJungleKing_BG34_PreMadeChamp_004_G ? 2 : 1;
		modifyStats(
			input.spawned,
			minion,
			2 * baseBuff * mult,
			1 * baseBuff * mult,
			input.board,
			input.hero,
			input.gameState,
		);
	},
	afterTavernSpellCast: (entity: BoardEntity, input: CastSpellInput) => {
		entity.scriptDataNum1 = entity.scriptDataNum1 ?? 0;
		entity.scriptDataNum1++;
	},
};
