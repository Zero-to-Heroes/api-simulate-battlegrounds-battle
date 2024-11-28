import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { OnAttackInput } from '../../../simulation/on-attack';
import { TempCardIds } from '../../../temp-card-ids';
import { OnAttackCard } from '../../card.interface';

export const HoloRover: OnAttackCard = {
	cardIds: [TempCardIds.HoloRover, TempCardIds.HoloRover_G],
	onAttack: (minion: BoardEntity, input: OnAttackInput): { dmgDoneByAttacker: number; dmgDoneByDefender: number } => {
		if (minion !== input.attacker) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}
		const numberOfCard = minion.cardId === TempCardIds.HoloRover_G ? 2 : 1;
		for (let i = 0; i < numberOfCard; i++) {
			const magneticMech = input.gameState.cardsData.getRandomMechToMagnetize(input.attackingHero.tavernTier);
			addCardsInHand(input.attackingHero, input.attackingBoard, [magneticMech], input.gameState);
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
