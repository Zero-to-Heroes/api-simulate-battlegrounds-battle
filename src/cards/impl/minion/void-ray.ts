import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { OnAttackInput } from '../../../simulation/on-attack';
import { modifyStats } from '../../../simulation/stats';
import { OnWheneverAnotherMinionAttacksCard, RallyCard } from '../../card.interface';

export const VoidRay: OnWheneverAnotherMinionAttacksCard & RallyCard = {
	cardIds: [CardIds.WarpGate_VoidRayToken_BG31_HERO_802pt5, CardIds.VoidRay_BG31_HERO_802pt5_G],
	onWheneverAnotherMinionAttacks: (minion: BoardEntity, input: OnAttackInput) => {
		return process(minion, input);
	},
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		return process(minion, input);
	},
};

const process = (minion: BoardEntity, input: OnAttackInput) => {
	const mult = minion.cardId === CardIds.VoidRay_BG31_HERO_802pt5_G ? 2 : 1;
	modifyStats(
		input.attacker,
		input.attacker,
		5 * mult,
		0,
		input.attackingBoard,
		input.attackingHero,
		input.gameState,
	);
	modifyStats(
		input.attacker,
		input.attacker,
		5 * mult,
		0,
		input.attackingBoard,
		input.attackingHero,
		input.gameState,
	);
	return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
};
