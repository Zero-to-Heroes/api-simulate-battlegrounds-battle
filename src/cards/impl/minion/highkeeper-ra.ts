import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { OnAttackInput } from '../../../simulation/on-attack';
import { TempCardIds } from '../../../temp-card-ids';
import { DeathrattleSpawnCard, RallyCard } from '../../card.interface';

export const HighkeeperRa: RallyCard & DeathrattleSpawnCard = {
	cardIds: [TempCardIds.HighkeeperRa, TempCardIds.HighkeeperRa_G],
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		const mult = minion.cardId === TempCardIds.HighkeeperRa_G ? 2 : 1;
		for (let i = 0; i < mult; i++) {
			const minion = input.gameState.cardsData.getRandomMinionForTavernTier(6);
			if (!!minion) {
				addCardsInHand(input.attackingHero, input.attackingBoard, [minion], input.gameState);
			}
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === TempCardIds.HighkeeperRa_G ? 2 : 1;
		for (let i = 0; i < mult; i++) {
			const minion = input.gameState.cardsData.getRandomMinionForTavernTier(6);
			if (!!minion) {
				addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, [minion], input.gameState);
			}
		}
		return [];
	},
};
