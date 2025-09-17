import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { DeathrattleSpawnCard } from '../../card.interface';

export const AutoAssembler: DeathrattleSpawnCard = {
	cardIds: [CardIds.AutoAssembler_BG32_172, CardIds.AutoAssembler_BG32_172_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const cardIdToSpawn =
			minion.cardId === CardIds.AutoAssembler_BG32_172_G
				? CardIds.AstralAutomaton_BG_TTN_401_G
				: CardIds.AstralAutomaton_BG_TTN_401;
		return simplifiedSpawnEntities(cardIdToSpawn, 1, input);
	},
};
