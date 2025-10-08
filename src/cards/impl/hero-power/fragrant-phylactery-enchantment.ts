import { CardIds } from '../../../services/card-ids';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { modifyStats } from '../../../simulation/stats';
import { DeathrattleSpawnEnchantmentCard } from '../../card.interface';

export const FragrantPhylacteryEnchantment: DeathrattleSpawnEnchantmentCard = {
	cardIds: [CardIds.FragrantPhylactery_FragrantEnchantment],
	deathrattleSpawnEnchantmentEffect: (
		minion: { cardId: string; originEntityId?: number; repeats?: number },
		input: DeathrattleTriggeredInput,
	) => {
		const targets = input.boardWithDeadEntity.filter((e) => e !== minion);
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
