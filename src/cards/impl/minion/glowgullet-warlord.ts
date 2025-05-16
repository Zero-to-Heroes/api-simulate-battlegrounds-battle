import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { playBloodGemsOn } from '../../../simulation/blood-gems';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { DeathrattleSpawnCard } from '../../card.interface';

export const GlowgulletWarlord: DeathrattleSpawnCard = {
	cardIds: [CardIds.GlowgulletWarlord_BG32_430, CardIds.GlowgulletWarlord_BG32_430_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const mult = minion.cardId === CardIds.GlowgulletWarlord_BG32_430_G ? 2 : 1;
		const cardId =
			minion.cardId === CardIds.GlowgulletWarlord_BG32_430_G
				? CardIds.GlowgulletSoldier_BG32_430t_G
				: CardIds.GlowgulletWarlord_GlowgulletSoldierToken_BG32_430t;
		const spawns = simplifiedSpawnEntities(cardId, 2, input);
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
