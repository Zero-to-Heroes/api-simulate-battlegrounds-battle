import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { dealDamageToMinion } from '../../../simulation/attack';
import { OnAttackInput } from '../../../simulation/on-attack';
import { RallyCard } from '../../card.interface';

export const Rampager: RallyCard = {
	cardIds: [CardIds.Rampager_BG29_809, CardIds.Rampager_BG29_809_G],
	rally: (minion: BoardEntity, input: OnAttackInput): { dmgDoneByAttacker: number; dmgDoneByDefender: number } => {
		const loops = input.attacker.cardId === CardIds.Rampager_BG29_809_G ? 2 : 1;
		for (let i = 0; i < loops; i++) {
			// Don't include new spawns
			for (const entity of [...input.attackingBoard]) {
				if (entity.entityId === input.attacker.entityId) {
					continue;
				}
				const isSameSide = entity.friendly === input.attacker.friendly;
				const board = isSameSide ? input.attackingBoard : input.defendingBoard;
				const hero = isSameSide ? input.attackingHero : input.defendingHero;
				dealDamageToMinion(
					entity,
					board,
					hero,
					input.attacker,
					1,
					isSameSide ? input.defendingBoard : input.attackingBoard,
					isSameSide ? input.defendingHero : input.attackingHero,
					input.gameState,
				);
			}
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
