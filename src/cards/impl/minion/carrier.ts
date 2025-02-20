import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { AvengeInput } from '../../../simulation/avenge';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { modifyStats } from '../../../simulation/stats';
import { AvengeCard } from '../../card.interface';

export const Carrier: AvengeCard = {
	cardIds: [CardIds.WarpGate_CarrierToken_BG31_HERO_802pt1, CardIds.Carrier_BG31_HERO_802pt1_G],
	baseAvengeValue: (cardId: string) => 4,
	avenge: (minion: BoardEntity, input: AvengeInput): readonly BoardEntity[] => {
		const spawnInput: DeathrattleTriggeredInput = {
			boardWithDeadEntity: input.board,
			boardWithDeadEntityHero: input.hero,
			gameState: input.gameState,
			deadEntity: minion, // weird
			otherBoard: input.otherBoard,
			otherBoardHero: input.otherHero,
		};
		const statBuff = minion.scriptDataNum1;
		const numberOfSummons = minion.cardId === CardIds.Carrier_BG31_HERO_802pt1_G ? 2 : 1;
		const spawned = simplifiedSpawnEntities(
			CardIds.Carrier_InterceptorToken_BG31_HERO_802pt1t,
			numberOfSummons,
			spawnInput,
		);
		spawned.forEach((e) => {
			modifyStats(e, statBuff, statBuff, input.board, input.hero, input.gameState);
		});
		return spawned;
	},
};
