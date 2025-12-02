import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { DeathrattleSpawnEnchantmentCard } from '../../card.interface';

export const SurfNSurfCrabRiding: DeathrattleSpawnEnchantmentCard = {
	cardIds: [CardIds.SurfNSurf_CrabRidingEnchantment_BG27_004e, CardIds.SurfNSurf_CrabRidingEnchantment_BG27_004_Ge],
	deathrattleSpawnEnchantmentEffect: (
		enchantment: { cardId: string },
		minion: BoardEntity | null | undefined,
		input: DeathrattleTriggeredInput,
	) => {
		const spawnId =
			enchantment.cardId === CardIds.SurfNSurf_CrabRidingEnchantment_BG27_004_Ge
				? CardIds.SurfNSurf_CrabToken_BG27_004_Gt2
				: CardIds.SurfNSurf_CrabToken_BG27_004t2;
		return simplifiedSpawnEntities(spawnId, 1, input);
	},
};
