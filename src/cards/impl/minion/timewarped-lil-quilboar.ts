import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { playBloodGemsOn } from '../../../simulation/blood-gems';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { hasCorrectTribe } from '../../../utils';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TimewarpedLilQuilboar: DeathrattleSpawnCard = {
	cardIds: [CardIds.TimewarpedLilQuilboar_BG34_Giant_608, CardIds.TimewarpedLilQuilboar_BG34_Giant_608_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const numberOfBloodGems = minion.cardId === CardIds.TimewarpedLilQuilboar_BG34_Giant_608_G ? 6 : 3;
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
