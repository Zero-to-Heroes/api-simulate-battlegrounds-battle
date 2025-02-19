import { CardIds } from '@firestone-hs/reference-data';
import { BoardTrinket } from '../../../bgs-player-entity';
import { BoardEntity } from '../../../board-entity';
import { pickRandom } from '../../../services/utils';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { addImpliedMechanics, getTeammateInitialState } from '../../../utils';
import { StartOfCombatCard } from '../../card.interface';

export const GloriousGloop: StartOfCombatCard = {
	cardIds: [CardIds.FlobbidinousFloop_GloriousGloop_BGDUO_HERO_101p],
	startOfCombatTiming: 'pre-combat',
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		for (const heroPower of input.playerEntity.heroPowers) {
			if (GloriousGloop.cardIds.includes(heroPower.cardId) && heroPower.used) {
				if (!input.playerBoard?.length) {
					return false;
				}
				const target = input.playerBoard.find((m) =>
					m.enchantments?.some(
						(e) => e.cardId === CardIds.GloriousGloop_InTheGloopEnchantment_BGDUO_HERO_101pe2,
					),
				);
				if (!target) {
					return false;
				}

				const teammateState = getTeammateInitialState(input.gameState.gameState, input.playerEntity);
				if (!teammateState?.board?.length) {
					return false;
				}
				const highestTier = Math.max(
					...teammateState.board.map((entity) => input.gameState.allCards.getCard(entity.cardId).techLevel),
				);
				const candidates = teammateState.board.filter(
					(entity) => input.gameState.allCards.getCard(entity.cardId).techLevel === highestTier,
				);
				if (!candidates.length) {
					return false;
				}
				const highestTierMinion = pickRandom(candidates);
				const clone: BoardEntity = addImpliedMechanics(
					{
						...highestTierMinion,
						entityId: input.gameState.sharedState.currentEntityId++,
						lastAffectedByEntity: null,
						definitelyDead: false,
						attackImmediately: false,
					},
					input.gameState.cardsData,
				);
				input.gameState.spectator.registerPowerTarget(
					input.playerEntity,
					target,
					input.playerBoard,
					input.playerEntity,
					input.opponentEntity,
				);
				// Replace the "target" minion with the "clone"
				const index = input.playerBoard.indexOf(target);
				input.playerBoard.splice(index, 1, clone);
				return true;
			}
		}
	},
};
