import { GameTag } from '@firestone-hs/reference-data';
import { CardIds } from '../../../services/card-ids';
import { addStatsToBoard } from '../../../utils';
import { CastSpellInput, TavernSpellCard } from '../../card.interface';

export const AzeriteEmpowerment: TavernSpellCard = {
	cardIds: [CardIds.AzeriteEmpowerment_BG28_169],
	castTavernSpell: (spellCardId: string, input: CastSpellInput) => {
		const baseAttack = input.gameState.allCards.getCard(spellCardId).tags[GameTag[GameTag.TAG_SCRIPT_DATA_NUM_1]];
		const baseHealth = input.gameState.allCards.getCard(spellCardId).tags[GameTag[GameTag.TAG_SCRIPT_DATA_NUM_2]];
		const attack = baseAttack + input.hero.globalInfo.TavernSpellAttackBuff;
		const health = baseHealth + input.hero.globalInfo.TavernSpellHealthBuff;
		addStatsToBoard(input.source, input.board, input.hero, attack, health, input.gameState);
	},
};
