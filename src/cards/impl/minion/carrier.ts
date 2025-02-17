import { BoardEntity } from '../../../board-entity';
import { AvengeInput } from '../../../simulation/avenge';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { AvengeCard } from '../../card.interface';

export const Carrier: AvengeCard = {
	cardIds: [TempCardIds.Carrier, TempCardIds.Carrier_G],
	baseAvengeValue: (cardId: string) => 4,
	avenge: (minion: BoardEntity, input: AvengeInput): void => {
		const spawnInput: DeathrattleTriggeredInput = {
			boardWithDeadEntity: input.board,
			boardWithDeadEntityHero: input.hero,
			gameState: input.gameState,
			deadEntity: minion, // weird
			otherBoard: input.otherBoard,
			otherBoardHero: input.otherHero,
		};
		const statBuff = minion.scriptDataNum1;
		const numberOfSummons = minion.cardId === TempCardIds.Carrier_G ? 2 : 1;
		const spawned = simplifiedSpawnEntities(TempCardIds.Interceptor_BG, numberOfSummons, spawnInput);
		spawned.forEach((e) => {
			modifyStats(e, statBuff, statBuff, input.board, input.hero, input.gameState);
		});
	},
};
