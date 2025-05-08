import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { DeathrattleSpawnCard } from '../../card.interface';

export const CorruptedBristler: DeathrattleSpawnCard = {
	cardIds: [CardIds.CorruptedBristler_BG32_431, CardIds.CorruptedBristler_BG32_431_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		// Looks like we only take the last enchantment into account
		// See corrupted-bristler.jsonc
		let bloodGemAttack = 0;
		let bloodGemHealth = 0;
		let bloodGemEnchantments = minion.enchantments?.filter(
			(e) => e.cardId === CardIds.BloodGem_BloodGemEnchantment,
		);
		if (!!bloodGemEnchantments?.length) {
			const lastEnchantment = bloodGemEnchantments[bloodGemEnchantments.length - 1];
			bloodGemAttack = lastEnchantment.tagScriptDataNum1 ?? 0;
			bloodGemHealth = lastEnchantment.tagScriptDataNum2 ?? 0;
		} else {
			bloodGemEnchantments = minion.enchantments?.filter(
				(e) => e.cardId === CardIds.BloodGem_BloodGemEnchantment,
			);
			bloodGemAttack = bloodGemEnchantments.map((e) => e.tagScriptDataNum1 ?? 0).reduce((a, b) => a + b, 0);
			bloodGemHealth = bloodGemEnchantments.map((e) => e.tagScriptDataNum2 ?? 0).reduce((a, b) => a + b, 0);
		}
		const allSpawns = [];
		if (bloodGemAttack > 0 || bloodGemHealth > 0) {
			const mult = minion.cardId === CardIds.CorruptedBristler_BG32_431_G ? 2 : 1;
			for (let i = 0; i < mult; i++) {
				const spawns = simplifiedSpawnEntities(
					CardIds.BloodGolemSticker_BloodGolemToken_BG30_MagicItem_442t,
					1,
					input,
				);
				spawns.forEach((b) => {
					b.attack = bloodGemAttack;
					b.health = bloodGemHealth;
				});
				allSpawns.push(...spawns);
			}
		}
		return allSpawns;
	},
};
