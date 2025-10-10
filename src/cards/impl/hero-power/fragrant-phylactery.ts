import { BoardTrinket } from '../../../bgs-player-entity';
import { CardIds } from '../../../services/card-ids';
import { pickRandomLowestAttack } from '../../../services/utils';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { StartOfCombatCard } from '../../card.interface';

export const FragrantPhylactery: StartOfCombatCard = {
	startOfCombatTiming: 'pre-combat',
	cardIds: [CardIds.TamsinRoame_FragrantPhylactery],
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		const lowestAttack = pickRandomLowestAttack(input.playerBoard);
		if (!!lowestAttack) {
			lowestAttack.enchantments.push({
				cardId: CardIds.TamsinRoame_ImpendingSacrificeEnchantment_BG20_HERO_282e2,
				originEntityId: trinket.entityId,
				timing: input.gameState.sharedState.currentEntityId++,
			});
			input.gameState.spectator.registerPowerTarget(
				input.playerEntity,
				lowestAttack,
				input.playerBoard,
				input.playerEntity,
				input.opponentEntity,
			);
		}
		return { hasTriggered: true, shouldRecomputeCurrentAttacker: false };
	},
};
