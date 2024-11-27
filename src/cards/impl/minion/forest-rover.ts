import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { spawnEntities } from '../../../simulation/deathrattle-spawns';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { BattlecryCard, DeathrattleSpawnCard } from '../../card.interface';

export const ForestRover: DeathrattleSpawnCard & BattlecryCard = {
	cardIds: [TempCardIds.ForestRover, TempCardIds.ForestRover_G],
	deathrattleSpawn: (deadEntity: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const numberOfSpawns = deadEntity.cardId === TempCardIds.ForestRover_G ? 2 : 1;
		return spawnEntities(
			TempCardIds.BeetleToken,
			numberOfSpawns,
			input.boardWithDeadEntity,
			input.boardWithDeadEntityHero,
			input.otherBoard,
			input.otherBoardHero,
			input.gameState.allCards,
			input.gameState.cardsData,
			input.gameState.sharedState,
			input.gameState.spectator,
			deadEntity.friendly,
			false,
		);
	},
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mult = minion.cardId === TempCardIds.ForestRover_G ? 2 : 1;
		input.hero.globalInfo.BeetleAttackBuff = input.hero.globalInfo.BeetleAttackBuff + 2 * mult;
		input.hero.globalInfo.BeetleHealthBuff = input.hero.globalInfo.BeetleHealthBuff + 1 * mult;
		input.board
			.filter((e) => [TempCardIds.BeetleToken, TempCardIds.BeetleToken_G].includes(e.cardId as TempCardIds))
			.forEach((e) => {
				modifyStats(e, 2 * mult, 1 * mult, input.board, input.hero, input.gameState);
			});
	},
};
