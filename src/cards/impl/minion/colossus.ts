import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { dealDamageToMinion, getNeighbours } from '../../../simulation/attack';
import { OnAttackInput } from '../../../simulation/on-attack';
import { RallyCard } from '../../card.interface';

export const Colossus: RallyCard = {
	cardIds: [CardIds.WarpGate_ColossusToken_BG31_HERO_802pt, CardIds.Colossus_BG31_HERO_802pt_G],
	rally: (minion: BoardEntity, input: OnAttackInput): { dmgDoneByAttacker: number; dmgDoneByDefender: number } => {
		let dmgDoneByAttacker = 0;
		const neighbours = getNeighbours(input.defendingBoard, input.defendingEntity);
		const damage = minion.scriptDataNum1 || 2;
		for (const target of neighbours) {
			const dmg = dealDamageToMinion(
				target,
				input.defendingBoard,
				input.defendingHero,
				input.attacker,
				damage,
				input.attackingBoard,
				input.attackingHero,
				input.gameState,
			);
			dmgDoneByAttacker += dmg;
		}
		return { dmgDoneByAttacker, dmgDoneByDefender: 0 };
	},
};
