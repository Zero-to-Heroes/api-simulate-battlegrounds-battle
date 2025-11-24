import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { playBloodGemsOn } from '../../../simulation/blood-gems';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { TempCardIds } from '../../../temp-card-ids';
import { hasCorrectTribe } from '../../../utils';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TimewarpedLilQuilboar: DeathrattleSpawnCard = {
	cardIds: [TempCardIds.TimewarpedLilQuilboar, TempCardIds.TimewarpedLilQuilboar_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const numberOfBloodGems = minion.cardId === TempCardIds.TimewarpedLilQuilboar_G ? 6 : 3;
		for (const entity of input.boardWithDeadEntity.filter(
			(e) =>
				e.health > 0 &&
				!e.definitelyDead &&
				hasCorrectTribe(
					e,
					input.boardWithDeadEntityHero,
					Race.QUILBOAR,
					input.gameState.anomalies,
					input.gameState.allCards,
				),
		)) {
			playBloodGemsOn(
				minion,
				entity,
				numberOfBloodGems,
				input.boardWithDeadEntity,
				input.boardWithDeadEntityHero,
				input.otherBoard,
				input.otherBoardHero,
				input.gameState,
			);
		}
		return [];
	},
};
