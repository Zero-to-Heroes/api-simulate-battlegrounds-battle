import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { TempCardIds } from '../../../temp-card-ids';
import { addStatsToBoard } from '../../../utils';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TimewarpedCaretaker: DeathrattleSpawnCard = {
	cardIds: [TempCardIds.TimewarpedCaretaker, TempCardIds.TimewarpedCaretaker_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const mult = minion.cardId === TempCardIds.TimewarpedCaretaker_G ? 2 : 1;
		const spawns = simplifiedSpawnEntities(CardIds.SkeletonToken, 6 * mult, input);
		spawns.forEach((e) => {
			e.onCanceledSummon = () => {
				input.boardWithDeadEntityHero.globalInfo.UndeadAttackBonus += 1;
				addStatsToBoard(
					minion,
					input.boardWithDeadEntity,
					input.boardWithDeadEntityHero,
					1,
					0,
					input.gameState,
					Race[Race.UNDEAD],
					false,
				);
			};
		});
		return spawns;
	},
};
