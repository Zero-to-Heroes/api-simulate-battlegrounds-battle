import { CardIds } from '../../../services/card-ids';
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
		const singleStatBuff = minion.cardId === CardIds.Carrier_BG31_HERO_802pt1_G ? 6 : 3;
		const statBuff = minion.scriptDataNum1 ?? 0;
		const cardId =
			minion.cardId === CardIds.Carrier_BG31_HERO_802pt1_G
				? CardIds.Interceptor_BG31_HERO_802pt1t_G
				: CardIds.Carrier_InterceptorToken_BG31_HERO_802pt1t;
		const spawned = simplifiedSpawnEntities(cardId, 1, spawnInput);
		spawned.forEach((e) => {
			modifyStats(e, minion, statBuff, statBuff, input.board, input.hero, input.gameState, false);
		});
		minion.scriptDataNum1 = statBuff + singleStatBuff;
		return spawned;
	},
};
