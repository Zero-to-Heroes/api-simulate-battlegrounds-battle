import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { BattlecryCard, hasCastSpell } from '../../card.interface';
import { cardMappings } from '../_card-mappings';

export const MagicfinApprentice: BattlecryCard = {
	cardIds: [CardIds.MagicfinApprenticeToken_BG33_890t],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const spell = input.gameState.allCards.getCard(minion.scriptDataNum1).id;
		const spellImpl = cardMappings[spell];
		if (hasCastSpell(spellImpl)) {
			spellImpl.castSpell(spell, {
				source: minion,
				board: input.board,
				hero: input.hero,
				otherBoard: input.otherBoard,
				otherHero: input.otherHero,
				gameState: input.gameState,
			});
		}
		return true;
	},
};
