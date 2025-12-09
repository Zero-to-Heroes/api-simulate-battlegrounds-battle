import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { PlayedBloodGemsOnMeInput } from '../../../simulation/blood-gems';
import { PlayedBloodGemsOnMeCard } from '../../card.interface';

export const TimewarpedTwirler: PlayedBloodGemsOnMeCard = {
	cardIds: [CardIds.TimewarpedTwirler_BG34_Giant_105, CardIds.TimewarpedTwirler_BG34_Giant_105_G],
	playedBloodGemsOnMe: (entity: BoardEntity, input: PlayedBloodGemsOnMeInput) => {
		// It only does something if the player plays a blood gem on this.
		// I'll implement it when I face an interaction that requires it
		return;
		// const mult = entity.cardId === CardIds.TimewarpedTwirler_BG34_Giant_105_G ? 2 : 1;
		// for (let i = 0; i < mult; i++) {
		// 	castTavernSpell(CardIds.BloodGemBarrage_BG34_689, {
		// 		spellCardId: CardIds.BloodGemBarrage_BG34_689,
		// 		source: input.hero,
		// 		target: null,
		// 		board: input.board,
		// 		hero: input.hero,
		// 		otherBoard: input.otherBoard,
		// 		otherHero: input.otherHero,
		// 		gameState: input.gameState,
		// 	});
		// }
	},
};
