import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { playBloodGemsOn } from '../../../simulation/blood-gems';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { hasCorrectTribe } from '../../../utils';
import { DeathrattleEffectCard } from '../../card.interface';

export const ThreeLilQuilboar: DeathrattleEffectCard = {
	cardIds: [CardIds.ThreeLilQuilboar_BG26_867, CardIds.ThreeLilQuilboar_BG26_867_G],
	deathrattleEffect: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const numberOfBloodGems = minion.cardId === CardIds.ThreeLilQuilboar_BG26_867_G ? 6 : 3;
		for (const entity of input.boardWithDeadEntity.filter((e) =>
			hasCorrectTribe(e, input.boardWithDeadEntityHero, Race.QUILBOAR, input.gameState.allCards),
		)) {
			playBloodGemsOn(
				minion,
				entity,
				numberOfBloodGems,
				input.boardWithDeadEntity,
				input.boardWithDeadEntityHero,
				input.gameState,
			);
		}
	},
};