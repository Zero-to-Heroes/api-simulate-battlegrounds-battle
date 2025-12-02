import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { OnAttackInput } from '../../../simulation/on-attack';
import { DeathrattleSpawnCard, RallyCard } from '../../card.interface';

export const HighkeeperRa: RallyCard & DeathrattleSpawnCard = {
	cardIds: [CardIds.HighkeeperRa_BG34_319, CardIds.HighkeeperRa_BG34_319_G],
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		const mult = minion.cardId === CardIds.HighkeeperRa_BG34_319_G ? 2 : 1;
		for (let i = 0; i < mult; i++) {
			const minion = input.gameState.cardsData.getRandomMinionForTavernTier(6);
			if (!!minion) {
				addCardsInHand(input.attackingHero, input.attackingBoard, [minion], input.gameState);
			}
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.HighkeeperRa_BG34_319_G ? 2 : 1;
		for (let i = 0; i < mult; i++) {
			const minion = input.gameState.cardsData.getRandomMinionForTavernTier(6);
			if (!!minion) {
				addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, [minion], input.gameState);
			}
		}
		return [];
	},
};
