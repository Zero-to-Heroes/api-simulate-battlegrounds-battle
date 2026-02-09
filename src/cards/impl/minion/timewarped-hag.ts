import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { updateReborn } from '../../../keywords/reborn';
import { CardIds } from '../../../services/card-ids';
import { getNeighbours } from '../../../simulation/attack';
import { hasCorrectTribe, stringifySimple } from '../../../utils';
import { OnDamagedCard, OnDamagedInput } from '../../card.interface';

export const TimewarpedHag: OnDamagedCard = {
	cardIds: [CardIds.TimewarpedHag_BG34_Giant_342, CardIds.TimewarpedHag_BG34_Giant_342_G],
	onDamaged: (minion: BoardEntity, input: OnDamagedInput) => {
		const neighbours = getNeighbours(input.board, minion, null, true);
		if (neighbours.length !== 2) {
			console.warn(
				'TimewarpedHag: neighbours.length !== 2',
				stringifySimple(input.board, input.gameState.allCards),
			);
		}
		const targets = minion.cardId === CardIds.TimewarpedHag_BG34_Giant_342_G ? neighbours : [neighbours[1]];
		for (const target of targets) {
			if (
				!!target &&
				hasCorrectTribe(target, input.hero, Race.UNDEAD, input.gameState.anomalies, input.gameState.allCards)
			) {
				updateReborn(target, true, input.board, input.hero, input.otherHero, input.gameState);
				target.enchantments.push({
					cardId: CardIds.UltraCapacitor_UltraCapacitorEnchantment_BG31_HERO_801ptje,
					originEntityId: minion.entityId,
					timing: input.gameState.sharedState.currentEntityId++,
					repeats: 1,
				});
			}
		}
	},
};
