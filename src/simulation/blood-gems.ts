import { CardIds } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { pickRandom } from '../services/utils';
import { updateDivineShield } from '../utils';
import { FullGameState } from './internal-game-state';
import { modifyAttack, modifyHealth, onStatsUpdate } from './stats';

export const playBloodGemsOn = (
	target: BoardEntity,
	quantity: number,
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	gameState: FullGameState,
) => {
	const bloodGemAttack = 1 + (hero.globalInfo?.BloodGemAttackBonus ?? 0);
	const bloodGemHealth = 1 + (hero.globalInfo?.BloodGemHealthBonus ?? 0);
	for (let i = 0; i < quantity; i++) {
		modifyAttack(target, bloodGemAttack, board, hero, gameState);
		modifyHealth(target, bloodGemHealth, board, hero, gameState);
		onStatsUpdate(target, board, hero, gameState);
	}
	switch (target.cardId) {
		case CardIds.ToughTusk_BG20_102:
		case CardIds.ToughTusk_BG20_102_G:
			if (!target.divineShield) {
				updateDivineShield(target, board, true, gameState.allCards);
				gameState.spectator.registerPowerTarget(target, target, board, null, null);
			}
			break;
		case CardIds.GeomagusRoogug_BG28_583:
		case CardIds.GeomagusRoogug_BG28_583_G:
			const roogugBuff = target.cardId === CardIds.GeomagusRoogug_BG28_583_G ? 2 : 1;
			const roogugTargets = board.filter(
				(e) => e.cardId !== CardIds.GeomagusRoogug_BG28_583 && e.cardId !== CardIds.GeomagusRoogug_BG28_583_G,
			);
			const roogugTarget = pickRandom(roogugTargets);
			if (roogugTarget) {
				playBloodGemsOn(roogugTarget, roogugBuff, board, hero, gameState);
			}
			break;
	}
};
