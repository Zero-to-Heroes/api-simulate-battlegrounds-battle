import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { getNeighbours } from '../../../simulation/attack';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { processDeathrattleForMinion } from '../../../simulation/deathrattle-orchestration';
import { hasValidDeathrattle } from '../../../simulation/deathrattle-utils';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TimewarpedWarghoul: DeathrattleSpawnCard = {
	cardIds: [CardIds.TimewarpedWarghoul_BG34_Giant_331, CardIds.TimewarpedWarghoul_BG34_Giant_331_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const allNeighbours = getNeighbours(input.boardWithDeadEntity, minion, input.deadEntityIndexFromRight).filter(
			(e) =>
				!!e &&
				hasValidDeathrattle(e, input.boardWithDeadEntityHero, input.gameState) &&
				!TimewarpedWarghoul.cardIds.includes(e.cardId),
		);
		const neighbours =
			minion.cardId === CardIds.TimewarpedWarghoul_BG34_Giant_331_G ? allNeighbours : [pickRandom(allNeighbours)];
		for (const neighbour of neighbours) {
			input.gameState.spectator.registerPowerTarget(
				minion,
				neighbour,
				input.boardWithDeadEntity,
				input.boardWithDeadEntityHero,
				input.otherBoardHero,
			);
			const indexFromRight =
				input.boardWithDeadEntity.length - (input.boardWithDeadEntity.indexOf(neighbour) + 1);
			processDeathrattleForMinion(
				neighbour,
				indexFromRight,
				[neighbour],
				neighbour.friendly ? input.gameState.gameState.player : input.gameState.gameState.opponent,
				neighbour.friendly ? input.gameState.gameState.opponent : input.gameState.gameState.player,
				input.gameState,
				false,
			);
		}
		return [];
	},
};
