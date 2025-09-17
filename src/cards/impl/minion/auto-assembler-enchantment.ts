import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { DeathrattleSpawnEnchantmentCard } from '../../card.interface';

export const AutoAssemblerEnchantment: DeathrattleSpawnEnchantmentCard = {
	cardIds: [
		CardIds.AutoAssembler_AutoAssemblerEnchantment_BG32_172e,
		CardIds.AutoAssembler_AutoAssemblerEnchantment_BG32_172_Ge,
	],
	deathrattleSpawnEnchantmentEffect: (
		minion: BoardEntity,
		input: DeathrattleTriggeredInput,
	): readonly BoardEntity[] => {
		const cardIdToSpawn =
			minion.cardId === CardIds.AutoAssembler_AutoAssemblerEnchantment_BG32_172_Ge
				? CardIds.AstralAutomaton_BG_TTN_401_G
				: CardIds.AstralAutomaton_BG_TTN_401;
		return simplifiedSpawnEntities(cardIdToSpawn, 1, input);
	},
};
