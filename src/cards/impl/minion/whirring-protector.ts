import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { OnAttackInput } from '../../../simulation/on-attack';
import { modifyStats } from '../../../simulation/stats';
import { RallyCard } from '../../card.interface';

export const WhirringProtector: RallyCard = {
	cardIds: [CardIds.WhirringProtector_BG33_807, CardIds.WhirringProtector_BG33_807_G],
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		const mult = minion.cardId === CardIds.WhirringProtector_BG33_807_G ? 2 : 1;
		const targets = input.attackingBoard.filter((e) => e !== input.attacker);
		for (const target of targets) {
			modifyStats(
				target,
				input.attacker,
				5 * mult,
				0,
				input.attackingBoard,
				input.attackingHero,
				input.gameState,
			);
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
