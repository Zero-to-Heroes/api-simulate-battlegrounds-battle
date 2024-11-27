import { BoardEntity } from '../../../board-entity';
import { dealDamageToMinion } from '../../../simulation/attack';
import { OnAttackInput } from '../../../simulation/on-attack';
import { TempCardIds } from '../../../temp-card-ids';
import { OnAttackCard } from '../../card.interface';

export const ArcaneCannoneer: OnAttackCard = {
	cardIds: [TempCardIds.ArcaneCannoneer, TempCardIds.ArcaneCannoneer_G],
	onAttack: (minion: BoardEntity, input: OnAttackInput) => {
		const baseBuff = minion.scriptDataNum1;
		const mult = minion.cardId === TempCardIds.ArcaneCannoneer_G ? 2 : 1;
		const buff = baseBuff * mult;
		dealDamageToMinion(
			input.defendingEntity,
			input.opponentBoard,
			input.opponentEntity,
			minion,
			1 * buff,
			input.playerBoard,
			input.playerEntity,
			input.gameState,
		);
	},
};
