import { pickRandom } from '../../../services/utils';
import { removeAurasFromSelf } from '../../../simulation/add-minion-to-board';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { copyEntity } from '../../../utils';
import { CastSpellInput, TavernSpellCard } from '../../card.interface';

// Not a true implementation, but something that's close enough for now
export const TimewarpedThief: TavernSpellCard = {
	cardIds: [TempCardIds.TimewarpedThief],
	castTavernSpell: (spellCardId: string, input: CastSpellInput) => {
		const target = input.target ?? pickRandom(input.board);
		if (!!target) {
			const copy = copyEntity(target);
			copy.entityId = input.gameState.sharedState.currentEntityId++;
			removeAurasFromSelf(copy, input.board, input.hero, input.gameState);
			copy.attack = 20;
			copy.health = 20;
			copy.maxHealth = 20;
			copy.maxAttack = 20;
			addCardsInHand(input.hero, input.board, [copy], input.gameState);
		}
	},
};
