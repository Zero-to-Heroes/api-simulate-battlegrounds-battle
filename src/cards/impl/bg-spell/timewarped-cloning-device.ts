import { pickRandom } from '../../../services/utils';
import { removeAurasFromSelf } from '../../../simulation/add-minion-to-board';
import { spawnEntities } from '../../../simulation/deathrattle-spawns';
import { performEntitySpawns } from '../../../simulation/spawns';
import { TempCardIds } from '../../../temp-card-ids';
import { copyEntity } from '../../../utils';
import { CastSpellInput, SpellCard } from '../../card.interface';

export const TimewarpedCloningDevice: SpellCard = {
	cardIds: [TempCardIds.TimewarpedCloningDevice],
	castSpell: (spellCardId: string, input: CastSpellInput) => {
		const target = input.target ?? pickRandom(input.board);
		if (!!target) {
			const copy = copyEntity(target);
			copy.entityId = input.gameState.sharedState.currentEntityId++;
			removeAurasFromSelf(copy, input.board, input.hero, input.gameState);
			const newMinions = spawnEntities(
				copy.cardId,
				1,
				input.board,
				input.hero,
				input.otherBoard,
				input.otherHero,
				input.gameState,
				input.hero.friendly,
				false,
				false,
				false,
				copy,
			);
			const spawns = performEntitySpawns(
				newMinions,
				input.board,
				input.hero,
				target,
				input.board.length - input.board.indexOf(target) - 1,
				input.otherBoard,
				input.otherHero,
				input.gameState,
			);
			input.gameState.spectator.registerPowerTarget(
				input.source,
				target,
				input.board,
				input.hero,
				input.otherHero,
			);
		}
	},
};
