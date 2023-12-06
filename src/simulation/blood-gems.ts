import { AllCardsService, CardIds } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { pickRandom } from '../services/utils';
import { afterStatsUpdate, modifyAttack, modifyHealth, updateDivineShield } from '../utils';
import { Spectator } from './spectator/spectator';

export const playBloodGemsOn = (
	target: BoardEntity,
	quantity: number,
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	allCards: AllCardsService,
	spectator: Spectator,
) => {
	const bloodGemAttack = 1 + (hero.globalInfo?.BloodGemAttackBonus ?? 0);
	const bloodGemHealth = 1 + (hero.globalInfo?.BloodGemHealthBonus ?? 0);
	for (let i = 0; i < quantity; i++) {
		modifyAttack(target, bloodGemAttack, board, allCards);
		modifyHealth(target, bloodGemHealth, board, allCards);
		afterStatsUpdate(target, board, allCards);
	}
	switch (target.cardId) {
		case CardIds.ToughTusk_BG20_102:
		case CardIds.ToughTusk_BG20_102_G:
			updateDivineShield(target, board, true, allCards);
			spectator.registerPowerTarget(target, target, board);
			break;
		case CardIds.GeomagusRoogug_BG28_583:
		case CardIds.GeomagusRoogug_BG28_583_G:
			const roogugBuff = target.cardId === CardIds.GeomagusRoogug_BG28_583_G ? 2 : 1;
			const roogugTargets = board.filter(
				(e) => e.cardId !== CardIds.GeomagusRoogug_BG28_583 && e.cardId !== CardIds.GeomagusRoogug_BG28_583_G,
			);
			const roogugTarget = pickRandom(roogugTargets);
			if (roogugTarget) {
				playBloodGemsOn(roogugTarget, roogugBuff, board, hero, allCards, spectator);
			}
			break;
	}
};
