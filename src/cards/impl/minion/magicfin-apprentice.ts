import { BoardEntity } from '../../../board-entity';
import { castTavernSpell } from '../../../mechanics/cast-tavern-spell';
import { CardIds } from '../../../services/card-ids';
import { BattlecryInput } from '../../../simulation/battlecries';
import { BattlecryCard } from '../../card.interface';

export const MagicfinApprentice: BattlecryCard = {
	cardIds: [CardIds.MagicfinApprenticeToken_BG33_890t],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const spell = input.gameState.allCards.getCard(minion.scriptDataNum1).id;
		castTavernSpell(spell, {
			spellCardId: spell,
			source: minion,
			target: null, // Target is selected
			board: input.board,
			hero: input.hero,
			otherBoard: input.otherBoard,
			otherHero: input.otherHero,
			gameState: input.gameState,
		});
		return true;
	},
};
