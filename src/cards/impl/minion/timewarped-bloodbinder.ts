import { BoardEntity } from '../../../board-entity';
import { onTavernSpellCast } from '../../../mechanics/cast-tavern-spell';
import { CardIds } from '../../../services/card-ids';
import { PlayedBloodGemsOnAnyInput } from '../../../simulation/blood-gems';
import { PlayedBloodGemsOnAnyCard } from '../../card.interface';

export const TimewarpedBloodbinder: PlayedBloodGemsOnAnyCard = {
	cardIds: [
		CardIds.TimewarpedBloodbinder_BG34_PreMadeChamp_076,
		CardIds.TimewarpedBloodbinder_BG34_PreMadeChamp_076_G,
	],
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
