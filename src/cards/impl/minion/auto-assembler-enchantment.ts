import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { TempCardIds } from '../../../temp-card-ids';
import { DeathrattleSpawnEnchantmentCard } from '../../card.interface';

export const AutoAssemblerEnchantment: DeathrattleSpawnEnchantmentCard = {
	cardIds: [TempCardIds.AutoAssembler_Enchantment, TempCardIds.AutoAssembler_Enchantment_G],
	deathrattleSpawnEnchantmentEffect: (
		minion: BoardEntity,
		input: DeathrattleTriggeredInput,
	): readonly BoardEntity[] => {
		const cardIdToSpawn =
			minion.cardId === TempCardIds.AutoAssembler_Enchantment_G
				? CardIds.AstralAutomaton_BG_TTN_401_G
				: CardIds.AstralAutomaton_BG_TTN_401;
		return simplifiedSpawnEntities(cardIdToSpawn, 1, input);
	},
};
