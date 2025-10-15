import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { OnAttackInput } from '../../../simulation/on-attack';
import { modifyStats } from '../../../simulation/stats';
import { RallyCard } from '../../card.interface';

export const VengefulProtector: RallyCard = {
	cardIds: [CardIds.VengefulProtector_BG33_247, CardIds.VengefulProtector_BG33_247_G],
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		const mult = minion.cardId === CardIds.VengefulProtector_BG33_247_G ? 2 : 1;
		const candidates = input.attackingBoard.filter((e) => e !== input.attacker);
		for (const target of candidates) {
			modifyStats(
				target,
				input.attacker,
				3 * mult,
				3 * mult,
				input.attackingBoard,
				input.attackingHero,
				input.gameState,
			);
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
