import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { OnAttackInput } from '../../../simulation/on-attack';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { OnWheneverAnotherMinionAttacksCard, RallyCard } from '../../card.interface';

export const TwilightWatcher: OnWheneverAnotherMinionAttacksCard & RallyCard = {
	cardIds: [CardIds.TwilightWatcher_BG33_245, CardIds.TwilightWatcher_BG33_245_G],
	onWheneverAnotherMinionAttacks: (minion: BoardEntity, input: OnAttackInput) => {
		return process(minion, input);
	},
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		return process(minion, input);
	},
};

const process = (minion: BoardEntity, input: OnAttackInput) => {
	if (
		!hasCorrectTribe(
			input.attacker,
			input.attackingHero,
			Race.DRAGON,
			input.gameState.anomalies,
			input.gameState.allCards,
		)
	) {
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	}

	const mult = minion.cardId === CardIds.TwilightWatcher_BG33_245_G ? 2 : 1;
	const candidates = input.attackingBoard.filter((e) =>
		hasCorrectTribe(e, input.attackingHero, Race.DRAGON, input.gameState.anomalies, input.gameState.allCards),
	);
	for (const target of candidates) {
		modifyStats(
			target,
			input.attacker,
			1 * mult,
			3 * mult,
			input.attackingBoard,
			input.attackingHero,
			input.gameState,
		);
	}
	return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
};
