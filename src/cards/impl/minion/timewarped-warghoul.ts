import { BoardEntity } from '../../../board-entity';
import { pickRandom } from '../../../services/utils';
import { getNeighbours } from '../../../simulation/attack';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { processDeathrattleForMinion } from '../../../simulation/deathrattle-orchestration';
import { hasValidDeathrattle } from '../../../simulation/deathrattle-utils';
import { TempCardIds } from '../../../temp-card-ids';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TimewarpedWarghoul: DeathrattleSpawnCard = {
	cardIds: [TempCardIds.TimewarpedWarghoul, TempCardIds.TimewarpedWarghoul_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const allNeighbours = getNeighbours(input.boardWithDeadEntity, minion, input.deadEntityIndexFromRight).filter(
			(e) =>
				!!e &&
				hasValidDeathrattle(e, input.boardWithDeadEntityHero, input.gameState) &&
				!TimewarpedWarghoul.cardIds.includes(e.cardId),
		);
		const neighbours =
			minion.cardId === TempCardIds.TimewarpedWarghoul_G ? allNeighbours : [pickRandom(allNeighbours)];
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
