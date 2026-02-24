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

		const mult = minion.cardId === CardIds.TimewarpedJungleKing_BG34_PreMadeChamp_004_G ? 2 : 1;
		const atkBuff = minion.scriptDataNum1 ?? 4 * mult;
		const healthBuff = minion.scriptDataNum2 ?? 3 * mult;
		modifyStats(input.spawned, minion, atkBuff, healthBuff, input.board, input.hero, input.gameState);
	},
	afterTavernSpellCast: (entity: BoardEntity, input: CastSpellInput) => {
		const mult = entity.cardId === CardIds.TimewarpedJungleKing_BG34_PreMadeChamp_004_G ? 2 : 1;
		entity.scriptDataNum1 = entity.scriptDataNum1 ?? 0;
		entity.scriptDataNum1 += 4 * mult;
		entity.scriptDataNum2 = entity.scriptDataNum2 ?? 0;
		entity.scriptDataNum2 += 3 * mult;
	},
};
