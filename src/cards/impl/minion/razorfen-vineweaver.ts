import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { playBloodGemsOn } from '../../../simulation/blood-gems';
import { OnAttackInput } from '../../../simulation/on-attack';
import { RallyCard } from '../../card.interface';

export const RazorfenVineweaver: RallyCard = {
	cardIds: [CardIds.RazorfenVineweaver_BG33_883, CardIds.RazorfenVineweaver_BG33_883_G],
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		const mult = minion.cardId === CardIds.RazorfenVineweaver_BG33_883_G ? 2 : 1;
		// Important to use this wheneevr possible because the "minion" can be an enchantment
		playBloodGemsOn(
			input.attacker,
			input.attacker,
			3 * mult,
			input.attackingBoard,
			input.attackingHero,
			input.defendingBoard,
			input.defendingHero,
			input.gameState,
		);
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
