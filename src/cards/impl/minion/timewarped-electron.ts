import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { magnetizeToTarget } from '../../../simulation/magnetize';
import { TempCardIds } from '../../../temp-card-ids';
import { hasCorrectTribe } from '../../../utils';
import { AfterTavernSpellCastCard, CastSpellInput } from '../../card.interface';

export const TimewarpedElectron: AfterTavernSpellCastCard = {
	cardIds: [TempCardIds.TimewarpedElectron, TempCardIds.TimewarpedElectron_G],
	afterTavernSpellCast: (entity: BoardEntity, input: CastSpellInput) => {
		const mult = entity.cardId === TempCardIds.TimewarpedElectron_G ? 2 : 1;
		entity.scriptDataNum1 = entity.scriptDataNum1 ?? 0;
		entity.scriptDataNum1++;
		if (entity.scriptDataNum1 % 2 === 0) {
			const targets = input.board.filter((e) =>
				hasCorrectTribe(e, input.hero, Race.MECH, input.gameState.anomalies, input.gameState.allCards),
			);
			for (const target of targets) {
				for (let i = 0; i < mult; i++) {
					magnetizeToTarget(
						target,
						entity,
						CardIds.MoonsteelJuggernaut_MoonsteelSatelliteToken_BG31_171t,
						input.board,
						input.hero,
						input.otherBoard,
						input.otherHero,
						input.gameState,
					);
				}
			}
		}
	},
};
