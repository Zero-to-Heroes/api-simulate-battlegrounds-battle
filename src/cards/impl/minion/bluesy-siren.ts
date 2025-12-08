import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { castTavernSpell } from '../../../mechanics/cast-tavern-spell';
import { CardIds } from '../../../services/card-ids';
import { OnAttackInput } from '../../../simulation/on-attack';
import { hasCorrectTribe } from '../../../utils';
import { DefaultChargesCard, OnWheneverAnotherMinionAttacksCard, RallyCard } from '../../card.interface';

export const BluesySiren: OnWheneverAnotherMinionAttacksCard & RallyCard & DefaultChargesCard = {
	cardIds: [CardIds.BluesySiren_BG34_931, CardIds.BluesySiren_BG34_931_G],
	defaultCharges: (entity: BoardEntity) => 3,
	onWheneverAnotherMinionAttacks: (minion: BoardEntity, input: OnAttackInput) => {
		return process(minion, input);
	},
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		return process(minion, input);
	},
};

const process = (minion: BoardEntity, input: OnAttackInput) => {
	if (minion.abiityChargesLeft <= 0) {
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	}

	if (
		!hasCorrectTribe(
			input.attacker,
			input.attackingHero,
			Race.NAGA,
			input.gameState.anomalies,
			input.gameState.allCards,
		)
	) {
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	}

	minion.abiityChargesLeft = minion.abiityChargesLeft - 1;
	const mult = minion.cardId === CardIds.BluesySiren_BG34_931_G ? 2 : 1;
	for (let i = 0; i < mult; i++) {
		const spellCast = CardIds.DeepBlueCrooner_DeepBluesToken_BG26_502t;
		castTavernSpell(spellCast, {
			spellCardId: spellCast,
			source: input.attackingHero,
			target: input.attacker,
			board: input.attackingBoard,
			hero: input.attackingHero,
			otherBoard: input.defendingBoard,
			otherHero: input.defendingHero,
			gameState: input.gameState,
		});
	}

	return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
};
