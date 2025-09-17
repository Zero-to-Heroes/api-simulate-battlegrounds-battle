import { CardIds } from '../../../services/card-ids';
import { BgsPlayerEntity } from '../../../bgs-player-entity';
import { BoardEntity } from '../../../board-entity';
import { updateTaunt } from '../../../keywords/taunt';
import { pickRandom } from '../../../services/utils';
import { FullGameState } from '../../../simulation/internal-game-state';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { StartOfCombatCard } from '../../card.interface';

export const InterrogatorWhitemane: StartOfCombatCard = {
	cardIds: [CardIds.InterrogatorWhitemane_BG24_704, CardIds.InterrogatorWhitemane_BG24_704_G],
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		if (input.opponentBoard.length > 0) {
			const numberOfPicks = minion.cardId === CardIds.InterrogatorWhitemane_BG24_704_G ? 2 : 1;
			for (let i = 0; i < numberOfPicks; i++) {
				const validTargets = input.opponentBoard.filter(
					(e) => input.gameState.cardsData.getTavernLevel(e.cardId) >= 5 && !e.taunt,
				);
				const target = pickRandom(validTargets);
				if (!!target) {
					castImpure(
						target,
						minion,
						input.playerBoard,
						input.playerEntity,
						input.opponentEntity,
						input.gameState,
					);
					// const targetIndex = validTargets.findIndex((e) => e.entityId === target.entityId);
					// validTargets.splice(targetIndex, 1);
				}
			}
		}
		return true;
	},
};

const castImpure = (
	entity: BoardEntity,
	source: BoardEntity,
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	otherHero: BgsPlayerEntity,
	gameState: FullGameState,
) => {
	if (!entity) {
		return;
	}
	const multiplier = source.cardId === CardIds.InterrogatorWhitemane_BG24_704_G ? 3 : 2;
	updateTaunt(entity, true, board, hero, otherHero, gameState);
	entity.damageMultiplier = entity.damageMultiplier ?? 1;
	entity.damageMultiplier *= multiplier;
	gameState.spectator.registerPowerTarget(source, entity, board, null, null);
};
