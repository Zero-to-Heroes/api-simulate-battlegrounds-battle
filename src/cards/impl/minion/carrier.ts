import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { AvengeInput } from '../../../simulation/avenge';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { modifyStats, setEntityStats } from '../../../simulation/stats';
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
		const singleStatBuff = minion.cardId === CardIds.Carrier_BG31_HERO_802pt1_G ? 10 : 5;
		const statBuff = minion.scriptDataNum1 ?? 0;
		const cardId =
			minion.cardId === CardIds.Carrier_BG31_HERO_802pt1_G
				? CardIds.Interceptor_BG31_HERO_802pt1t_G
				: CardIds.Carrier_InterceptorToken_BG31_HERO_802pt1t;
		const spawned = simplifiedSpawnEntities(cardId, 1, spawnInput);
		spawned.forEach((e) => {
			// Because the data in the files is still 3/3 or 6/6 for the golden version
			setEntityStats(e, singleStatBuff, singleStatBuff, input.board, input.hero, input.gameState);
			modifyStats(e, minion, statBuff, statBuff, input.board, input.hero, input.gameState, false);
		});
		minion.scriptDataNum1 = statBuff + singleStatBuff;
		return spawned;
	},
};
