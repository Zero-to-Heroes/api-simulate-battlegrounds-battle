import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { TempCardIds } from '../../../temp-card-ids';
import { DeathrattleSpawnCard } from '../../card.interface';

export const CorruptedBristler: DeathrattleSpawnCard = {
	cardIds: [TempCardIds.CorruptedBristler, TempCardIds.CorruptedBristler_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		let bloodGemEnchantments = minion.enchantments?.filter(
			(e) => e.cardId === CardIds.BloodGem_BloodGemsEnchantment,
		);
		if (bloodGemEnchantments?.length === 0) {
			bloodGemEnchantments = minion.enchantments?.filter(
				(e) => e.cardId === CardIds.BloodGem_BloodGemEnchantment,
			);
		}
		const allSpawns = [];
		if (bloodGemEnchantments?.length > 0) {
			const bloodGemAttack = bloodGemEnchantments.map((e) => e.tagScriptDataNum1 ?? 0).reduce((a, b) => a + b, 0);
			const bloodGemHealth = bloodGemEnchantments.map((e) => e.tagScriptDataNum2 ?? 0).reduce((a, b) => a + b, 0);
			if (bloodGemAttack > 0 || bloodGemHealth > 0) {
				const mult = minion.cardId === TempCardIds.CorruptedBristler_G ? 2 : 1;
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
		}
		return allSpawns;
	},
};
