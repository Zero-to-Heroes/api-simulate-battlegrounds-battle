import { AllCardsService, GameTag } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { modifyStats } from '../../../simulation/stats';
import { CastSpellInput, TavernSpellCard } from '../../card.interface';

export const NaturalBlessing: TavernSpellCard = {
	cardIds: [CardIds.NaturalBlessing_BG28_845],
	castTavernSpell: (spellCardId: string, input: CastSpellInput) => {
		const baseAttack = input.gameState.allCards.getCard(spellCardId).tags[GameTag[GameTag.TAG_SCRIPT_DATA_NUM_1]];
		const baseHealth = input.gameState.allCards.getCard(spellCardId).tags[GameTag[GameTag.TAG_SCRIPT_DATA_NUM_2]];
		const attack = baseAttack + input.hero.globalInfo.TavernSpellAttackBuff;
		const health = baseHealth + input.hero.globalInfo.TavernSpellHealthBuff;

		const allMinions = [...input.board, ...input.otherBoard];
		const target = pickRandom(allMinions);
		const minionsSharingType = allMinions.filter((e) => doMinionsShareType(e, target, input.gameState.allCards));
		for (const minion of minionsSharingType) {
			modifyStats(minion, input.source, attack, health, input.board, input.hero, input.gameState);
		}
	},
};

const doMinionsShareType = (minion: BoardEntity, target: BoardEntity, allCards: AllCardsService) => {
	const minionTypes = allCards.getCard(minion.cardId).races ?? [];
	const targetTypes = allCards.getCard(target.cardId).races ?? [];
	return minionTypes.some((type) => targetTypes.includes(type));
};
