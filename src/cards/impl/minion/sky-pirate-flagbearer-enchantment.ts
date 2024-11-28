import { CardIds } from '@firestone-hs/reference-data';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { DeathrattleSpawnEnchantmentCard } from '../../card.interface';

export const SkyPirateFlagbearerEnchantment: DeathrattleSpawnEnchantmentCard = {
	cardIds: [
		CardIds.SkyPirateFlagbearer_FlagbearingEnchantment_BG30_119e,
		CardIds.SkyPirateFlagbearer_FlagbearingEnchantment_BG30_119_Ge,
	],
	deathrattleSpawnEnchantmentEffect: (enchantment: { cardId: string }, input: DeathrattleTriggeredInput) => {
		return simplifiedSpawnEntities(
			enchantment.cardId === CardIds.SkyPirateFlagbearer_FlagbearingEnchantment_BG30_119e
				? CardIds.Scallywag_SkyPirateToken_BGS_061t
				: CardIds.Scallywag_SkyPirateToken_TB_BaconUps_141t,
			1,
			input,
		);
	},
};
