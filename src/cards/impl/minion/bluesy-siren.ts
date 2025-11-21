import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { castSpell } from '../../../mechanics/cast-spell';
import { CardIds } from '../../../services/card-ids';
import { OnAttackInput } from '../../../simulation/on-attack';
import { TempCardIds } from '../../../temp-card-ids';
import { hasCorrectTribe } from '../../../utils';
import { DefaultChargesCard, OnWheneverAnotherMinionAttacksCard } from '../../card.interface';

export const BluesySiren: OnWheneverAnotherMinionAttacksCard & DefaultChargesCard = {
	cardIds: [TempCardIds.BluesySiren, TempCardIds.BluesySiren_G],
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
			minion.cardId === TempCardIds.BluesySiren_G
				? CardIds.DeepBlueCrooner_DeepBluesToken_BG26_502_Gt
				: CardIds.DeepBlueCrooner_DeepBluesToken_BG26_502t;
		castSpell(spellCast, {
			source: minion,
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
