import { BoardEntity } from '../../../board-entity';
import { castTavernSpell } from '../../../mechanics/cast-tavern-spell';
import { CardIds } from '../../../services/card-ids';
import { PlayedBloodGemsOnMeInput } from '../../../simulation/blood-gems';
import { DefaultChargesCard, PlayedBloodGemsOnMeCard } from '../../card.interface';

export const TimewarpedTwirler: PlayedBloodGemsOnMeCard & DefaultChargesCard = {
	cardIds: [CardIds.TimewarpedTwirler_BG34_Giant_105, CardIds.TimewarpedTwirler_BG34_Giant_105_G],
	defaultCharges: (entity: BoardEntity) => 2,
	playedBloodGemsOnMe: (entity: BoardEntity, input: PlayedBloodGemsOnMeInput) => {
		entity.memory = entity.memory ?? entity.scriptDataNum1 ?? 0;
		entity.memory++;
		if (entity.abiityChargesLeft <= 0) {
			return;
		}

		if (entity.memory % 2 === 0) {
			entity.abiityChargesLeft--;
			const mult = entity.cardId === CardIds.TimewarpedTwirler_BG34_Giant_105_G ? 2 : 1;
			for (let i = 0; i < mult; i++) {
				castTavernSpell(CardIds.BloodGemBarrage_BG34_689, {
					spellCardId: CardIds.BloodGemBarrage_BG34_689,
					source: input.hero,
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
