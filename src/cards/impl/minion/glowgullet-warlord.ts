import { BoardEntity } from '../../../board-entity';
import { playBloodGemsOn } from '../../../simulation/blood-gems';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { TempCardIds } from '../../../temp-card-ids';
import { DeathrattleSpawnCard } from '../../card.interface';

export const GlowgulletWarlord: DeathrattleSpawnCard = {
	cardIds: [TempCardIds.GlowgulletWarlord, TempCardIds.GlowgulletWarlord_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const mult = minion.cardId === TempCardIds.GlowgulletWarlord_G ? 2 : 1;
		const spawns = simplifiedSpawnEntities(TempCardIds.GlowgulletWarlord_Token, 2, input);
		spawns.forEach((spawn) =>
			playBloodGemsOn(
				minion,
				spawn,
				1 * mult,
				input.boardWithDeadEntity,
				input.boardWithDeadEntityHero,
				input.gameState,
			),
		);
		return spawns;
	},
};
