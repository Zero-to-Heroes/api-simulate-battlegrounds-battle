import { BoardEntity } from '../../../board-entity';
import { updateTaunt } from '../../../keywords/taunt';
import { CardIds } from '../../../services/card-ids';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TwilightBroodmother: DeathrattleSpawnCard = {
	cardIds: [CardIds.TwilightBroodmother_BG34_731, CardIds.TwilightBroodmother_BG34_731_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const totalSpawns = minion.cardId === CardIds.TwilightBroodmother_BG34_731_G ? 4 : 2;
		const spawns = simplifiedSpawnEntities(
			CardIds.TwilightHatchling_TwilightWhelpToken_BG34_630t,
			totalSpawns,
			input,
		);
		spawns.forEach((e) => {
			updateTaunt(
				e,
				true,
				input.boardWithDeadEntity,
				input.boardWithDeadEntityHero,
				input.otherBoardHero,
				input.gameState,
			);
		});
		return spawns;
	},
};
