import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TimewarpedIckyImp: DeathrattleSpawnCard = {
	cardIds: [CardIds.TimewarpedIckyImp_BG34_Giant_674, CardIds.TimewarpedIckyImp_BG34_Giant_674_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.TimewarpedIckyImp_BG34_Giant_674_G ? 2 : 1;
		const quantityToSpawn = mult * 2;
		const spawns = simplifiedSpawnEntities(
			CardIds.PiggybackImp_BackpiggyImpToken_BG_AV_309t,
			quantityToSpawn,
			input,
		);
		spawns.forEach((e) => {
			e.attack = minion.maxAttack;
			e.health = minion.maxHealth;
			e.maxAttack = minion.maxAttack;
			e.maxHealth = minion.maxHealth;
		});
		return spawns;
	},
};
