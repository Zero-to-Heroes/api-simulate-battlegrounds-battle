import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { copyEntity, getPlayerInitialState } from '../../../utils';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TimewarpedMagnanimoose: DeathrattleSpawnCard = {
	cardIds: [CardIds.TimewarpedMagnanimoose_BG34_Giant_619, CardIds.TimewarpedMagnanimoose_BG34_Giant_619_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const playerInitialState = getPlayerInitialState(input.gameState.gameState, input.boardWithDeadEntityHero);
		const loops = minion.cardId === CardIds.TimewarpedMagnanimoose_BG34_Giant_619_G ? 2 : 1;
		const spawned = [];
		for (let i = 0; i < loops; i++) {
			// We don't know the opponents warbands, so we pick something from our own warband instead, as a proxy
			const randomMinion = pickRandom(playerInitialState.board);
			const clone = copyEntity(randomMinion);
			spawned.push(...simplifiedSpawnEntities(clone.cardId, 1, input, clone));
		}
		return spawned;
	},
};
