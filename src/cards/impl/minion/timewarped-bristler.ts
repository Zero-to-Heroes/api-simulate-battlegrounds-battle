import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { pickMultipleRandom } from '../../../services/utils';
import { applyBloodGemEnchantment } from '../../../simulation/blood-gems';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TimewarpedBristler: DeathrattleSpawnCard = {
	cardIds: [CardIds.TimewarpedBristler_BG34_Giant_104, CardIds.TimewarpedBristler_BG34_Giant_104_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		let bloodGemAttack = 0;
		let bloodGemHealth = 0;
		let bloodGemEnchantments = minion.enchantments.filter(
			(e) => e.cardId === CardIds.BloodGem_BloodGemsEnchantment,
		);
		if (!!bloodGemEnchantments?.length) {
			const lastEnchantment = bloodGemEnchantments[bloodGemEnchantments.length - 1];
			bloodGemAttack = lastEnchantment.tagScriptDataNum1 ?? 0;
			bloodGemHealth = lastEnchantment.tagScriptDataNum2 ?? 0;
		} else {
			bloodGemEnchantments = minion.enchantments.filter((e) => e.cardId === CardIds.BloodGem_BloodGemEnchantment);
			bloodGemAttack = bloodGemEnchantments.map((e) => e.tagScriptDataNum1 ?? 0).reduce((a, b) => a + b, 0);
			bloodGemHealth = bloodGemEnchantments.map((e) => e.tagScriptDataNum2 ?? 0).reduce((a, b) => a + b, 0);
		}

		const candidates = input.boardWithDeadEntity.filter((e) =>
			hasCorrectTribe(
				e,
				input.boardWithDeadEntityHero,
				Race.QUILBOAR,
				input.gameState.anomalies,
				input.gameState.allCards,
			),
		);

		const mult = minion.cardId === CardIds.TimewarpedBristler_BG34_Giant_104_G ? 2 : 1;
		for (let i = 0; i < mult; i++) {
			const targets = pickMultipleRandom(candidates, 2);
			for (const target of targets) {
				// 2025-11-21: "It works like gem confiscation. So take the total combined blood gem stats on
				// this minion and copy that over to 2 other minions. So for example it doesn't matter if you
				// played 10x +1/+1 gems or 1x +10/+10 gem; it'll take its +10/+10 total and give +10/+10
				// to two different quilboar. It won't trigger "when a Blood Gem is played" effects"
				applyBloodGemEnchantment(
					CardIds.BloodGem_BloodGemsEnchantment,
					target,
					minion,
					1,
					bloodGemAttack,
					bloodGemHealth,
				);
				applyBloodGemEnchantment(
					CardIds.BloodGem_BloodGemEnchantment,
					target,
					minion,
					1,
					bloodGemAttack,
					bloodGemHealth,
				);

				modifyStats(
					target,
					minion,
					bloodGemAttack,
					bloodGemHealth,
					input.boardWithDeadEntity,
					input.boardWithDeadEntityHero,
					input.gameState,
					false,
				);
			}
		}
		return [];
	},
};
