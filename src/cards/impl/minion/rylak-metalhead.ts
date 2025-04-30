import { CardIds, GameTag } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { pickRandom } from '../../../services/utils';
import { getNeighbours } from '../../../simulation/attack';
import { triggerBattlecry } from '../../../simulation/battlecries';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { hasMechanic } from '../../../utils';
import { DeathrattleSpawnCard } from '../../card.interface';

export const RylakMetalhead: DeathrattleSpawnCard = {
	cardIds: [CardIds.RylakMetalhead_BG26_801, CardIds.RylakMetalhead_BG26_801_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const debug = getNeighbours(input.boardWithDeadEntity, minion, input.deadEntityIndexFromRight).map(
			(e) => input.gameState.allCards.getCard(e.cardId).name,
		);
		const allNeighbours = getNeighbours(input.boardWithDeadEntity, minion, input.deadEntityIndexFromRight).filter(
			(e) => hasMechanic(input.gameState.allCards.getCard(e.cardId), GameTag[GameTag.BATTLECRY]),
		);
		const neighbours =
			minion.cardId === CardIds.RylakMetalhead_BG26_801_G
				? allNeighbours
				: [pickRandom(allNeighbours)].filter((e) => !!e);
		for (const neighbour of neighbours) {
			input.gameState.spectator.registerPowerTarget(
				minion,
				neighbour,
				input.boardWithDeadEntity,
				input.boardWithDeadEntityHero,
				input.otherBoardHero,
			);
			triggerBattlecry(
				input.boardWithDeadEntity,
				input.boardWithDeadEntityHero,
				neighbour,
				input.otherBoard,
				input.otherBoardHero,
				input.gameState,
			);
		}
		return [];
	},
};
