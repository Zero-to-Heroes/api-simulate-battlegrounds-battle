import { BoardEntity } from '../../../board-entity';
import { castSpell } from '../../../mechanics/cast-spell';
import { PlayedBloodGemsOnMeInput } from '../../../simulation/blood-gems';
import { TempCardIds } from '../../../temp-card-ids';
import { DefaultChargesCard, PlayedBloodGemsOnMeCard } from '../../card.interface';

export const TimewarpedTwirler: PlayedBloodGemsOnMeCard & DefaultChargesCard = {
	cardIds: [TempCardIds.TimewarpedTwirler, TempCardIds.TimewarpedTwirler_G],
	defaultCharges: (entity: BoardEntity) => 2,
	playedBloodGemsOnMe: (entity: BoardEntity, input: PlayedBloodGemsOnMeInput) => {
		entity.memory = entity.memory ?? entity.scriptDataNum1 ?? 0;
		entity.memory++;
		if (entity.abiityChargesLeft <= 0) {
			return;
		}

		if (entity.memory % 2 === 0) {
			entity.abiityChargesLeft--;
			const mult = entity.cardId === TempCardIds.TimewarpedTwirler_G ? 2 : 1;
			for (let i = 0; i < mult; i++) {
				castSpell(TempCardIds.BloodGemBarrage, {
					source: entity,
					target: null,
					board: input.board,
					hero: input.hero,
					otherBoard: input.otherBoard,
					otherHero: input.otherHero,
					gameState: input.gameState,
				});
			}
		}
	},
};
