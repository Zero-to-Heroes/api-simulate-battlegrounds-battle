import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { playBloodGemsOn } from '../../../simulation/blood-gems';
import { OnAttackInput } from '../../../simulation/on-attack';
import { OnAttackCard } from '../../card.interface';

export const RazorfenVineweaver: OnAttackCard = {
	cardIds: [CardIds.RazorfenVineweaver_BG33_883, CardIds.RazorfenVineweaver_BG33_883_G],
	onAnyMinionAttack: (minion: BoardEntity, input: OnAttackInput) => {
		if (input.attacker !== minion) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}

		const mult = minion.cardId === CardIds.RazorfenVineweaver_BG33_883_G ? 2 : 1;
		playBloodGemsOn(minion, minion, 3 * mult, input.attackingBoard, input.attackingHero, input.gameState);
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
