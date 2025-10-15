import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { simplifiedSpawnEntitiesWithAddToBoard } from '../../../simulation/deathrattle-spawns';
import { OnAttackInput } from '../../../simulation/on-attack';
import { RallyCard } from '../../card.interface';

export const FriendlyBouncer: RallyCard = {
	cardIds: [CardIds.FriendlyBouncer_BG33_700, CardIds.FriendlyBouncer_BG33_700_G],
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		const loops = minion.cardId === CardIds.FriendlyBouncer_BG33_700_G ? 2 : 1;
		for (let i = 0; i < loops; i++) {
			const spawnId = input.gameState.cardsData.getRandomRally(input.attackingHero.tavernTier);
			if (!!spawnId) {
				simplifiedSpawnEntitiesWithAddToBoard(
					spawnId,
					1,
					{
						boardWithDeadEntity: input.attackingBoard,
						boardWithDeadEntityHero: input.attackingHero,
						gameState: input.gameState,
						deadEntity: input.attacker,
						otherBoard: input.defendingBoard,
						otherBoardHero: input.defendingHero,
					},
					input.attacker,
					input.attackingBoard.length - input.attackingBoard.indexOf(input.attacker) - 1,
				);
				addCardsInHand(input.attackingHero, input.attackingBoard, [spawnId], input.gameState);
			}
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
