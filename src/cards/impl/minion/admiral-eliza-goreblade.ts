import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnAttackInput } from '../../../simulation/on-attack';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { OnWheneverAnotherMinionAttacksCard, RallyCard } from '../../card.interface';

export const AdmiralElizaGoreblade: OnWheneverAnotherMinionAttacksCard & RallyCard = {
	cardIds: [CardIds.AdmiralElizaGoreblade_BG27_555, CardIds.AdmiralElizaGoreblade_BG27_555_G],
	onWheneverAnotherMinionAttacks: (minion: BoardEntity, input: OnAttackInput) => {
		return process(minion, input);
	},
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		return process(minion, input);
	},
};

const process = (minion: BoardEntity, input: OnAttackInput) => {
	if (
		hasCorrectTribe(
			input.attacker,
			input.attackingHero,
			Race.PIRATE,
			input.gameState.anomalies,
			input.gameState.allCards,
		)
	) {
		const mult = minion.cardId === CardIds.AdmiralElizaGoreblade_BG27_555_G ? 2 : 1;
		input.attackingBoard.forEach((entity) => {
			modifyStats(entity, minion, 3 * mult, 1 * mult, input.attackingBoard, input.attackingHero, input.gameState);
		});
	}
	return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
};
