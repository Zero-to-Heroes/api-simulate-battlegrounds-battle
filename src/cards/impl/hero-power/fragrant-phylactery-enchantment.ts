import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { modifyStats } from '../../../simulation/stats';
import { DeathrattleSpawnEnchantmentCard } from '../../card.interface';

export const FragrantPhylacteryEnchantment: DeathrattleSpawnEnchantmentCard = {
	cardIds: [CardIds.TamsinRoame_ImpendingSacrificeEnchantment_BG20_HERO_282e2],
	deathrattleSpawnEnchantmentEffect: (
		enchantment: { cardId: string; originEntityId?: number; repeats?: number },
		minion: BoardEntity | null | undefined,
		input: DeathrattleTriggeredInput,
	) => {
		// Doesn't resurrect dead minions
		// 33.4 https://replays.firestoneapp.com/?reviewId=44c91f87-17a0-462c-8f24-3002cbcd42d5&turn=21&action=1
		const targets = input.boardWithDeadEntity.filter(
			(e) => e.health > 0 && !e.definitelyDead && e !== enchantment && e !== minion,
		);
		for (const target of targets) {
			modifyStats(
				target,
				input.deadEntity,
				input.deadEntity.attack,
				input.deadEntity.maxHealth,
				input.boardWithDeadEntity,
				input.boardWithDeadEntityHero,
				input.gameState,
			);
		}
		return null;
	},
};
