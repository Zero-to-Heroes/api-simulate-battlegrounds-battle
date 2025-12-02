import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { castTavernSpell } from '../../../mechanics/cast-tavern-spell';
import { CardIds } from '../../../services/card-ids';
import { OnAttackInput } from '../../../simulation/on-attack';
import { hasCorrectTribe } from '../../../utils';
import { DefaultChargesCard, OnWheneverAnotherMinionAttacksCard } from '../../card.interface';

export const BluesySiren: OnWheneverAnotherMinionAttacksCard & DefaultChargesCard = {
	cardIds: [CardIds.BluesySiren_BG34_931, CardIds.BluesySiren_BG34_931_G],
	defaultCharges: (entity: BoardEntity) => 3,
	onWheneverAnotherMinionAttacks: (minion: BoardEntity, input: OnAttackInput) => {
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
		const spellCast =
			minion.cardId === CardIds.BluesySiren_BG34_931_G
				? CardIds.DeepBlueCrooner_DeepBluesToken_BG26_502_Gt
				: CardIds.DeepBlueCrooner_DeepBluesToken_BG26_502t;
		castTavernSpell(spellCast, {
			spellCardId: spellCast,
			source: input.attackingHero,
			target: minion,
			board: input.attackingBoard,
			hero: input.attackingHero,
			otherBoard: input.defendingBoard,
			otherHero: input.defendingHero,
			gameState: input.gameState,
		});

		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
