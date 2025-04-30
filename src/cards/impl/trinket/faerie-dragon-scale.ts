import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardTrinket } from '../../../bgs-player-entity';
import { updateDivineShield } from '../../../keywords/divine-shield';
import { OnAttackInput } from '../../../simulation/on-attack';
import { hasCorrectTribe } from '../../../utils';
import { DefaultScriptDataNumCard, OnAttackCard } from '../../card.interface';

export const FaerieDragonScale: OnAttackCard & DefaultScriptDataNumCard = {
	cardIds: [CardIds.FaerieDragonScale_BG32_MagicItem_363],
	defaultScriptDataNum: (cardId: string) => 3,
	onAnyMinionAttack: (
		trinket: BoardTrinket,
		input: OnAttackInput,
	): { dmgDoneByAttacker: number; dmgDoneByDefender: number } => {
		if (trinket.scriptDataNum1 > 0) {
			if (
				!input.attacker.divineShield &&
				hasCorrectTribe(
					input.attacker,
					input.attackingHero,
					Race.DRAGON,
					input.gameState.anomalies,
					input.gameState.allCards,
				)
			) {
				updateDivineShield(
					input.attacker,
					input.attackingBoard,
					input.attackingHero,
					input.defendingHero,
					true,
					input.gameState,
				);
				trinket.scriptDataNum1--;
			}
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
