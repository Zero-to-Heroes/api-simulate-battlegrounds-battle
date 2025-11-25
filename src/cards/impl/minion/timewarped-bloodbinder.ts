import { BoardEntity } from '../../../board-entity';
import { onTavernSpellCast } from '../../../mechanics/cast-tavern-spell';
import { CardIds } from '../../../services/card-ids';
import { PlayedBloodGemsOnAnyInput } from '../../../simulation/blood-gems';
import { TempCardIds } from '../../../temp-card-ids';
import { PlayedBloodGemsOnAnyCard } from '../../card.interface';

export const TimewarpedBloodbinder: PlayedBloodGemsOnAnyCard = {
	cardIds: [TempCardIds.TimewarpedBloodbinder, TempCardIds.TimewarpedBloodbinder_G],
	playedBloodGemsOnAny: (minion: BoardEntity, input: PlayedBloodGemsOnAnyInput) => {
		onTavernSpellCast(CardIds.BloodGem, {
			spellCardId: CardIds.BloodGem,
			source: input.source,
			target: input.target,
			board: input.board,
			hero: input.hero,
			otherBoard: input.otherBoard,
			otherHero: input.otherHero,
			gameState: input.gameState,
		});
	},
};
