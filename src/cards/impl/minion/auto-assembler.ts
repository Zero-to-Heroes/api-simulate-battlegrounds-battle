import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { TempCardIds } from '../../../temp-card-ids';
import { DeathrattleSpawnCard } from '../../card.interface';

export const AutoAssembler: DeathrattleSpawnCard = {
	cardIds: [TempCardIds.AutoAssembler, TempCardIds.AutoAssembler_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const cardIdToSpawn =
			minion.cardId === TempCardIds.AutoAssembler_G
				? CardIds.AstralAutomaton_BG_TTN_401_G
				: CardIds.AstralAutomaton_BG_TTN_401;
		return simplifiedSpawnEntities(cardIdToSpawn, 1, input);
	},
};
