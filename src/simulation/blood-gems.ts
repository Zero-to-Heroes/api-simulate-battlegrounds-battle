import { CardIds } from '@firestone-hs/reference-data';
import { updateDivineShield } from 'src/divine-shield';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { pickRandom } from '../services/utils';
import { FullGameState } from './internal-game-state';
import { modifyStats } from './stats';

export const playBloodGemsOn = (
	source: BoardEntity,
	target: BoardEntity,
	quantity: number,
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	gameState: FullGameState,
	registerTarget = true,
) => {
	if (registerTarget) {
		gameState.spectator.registerPowerTarget(source, target, board, null, null);
	}
	const bloodGemAttack =
		1 +
		(hero.globalInfo?.BloodGemAttackBonus ?? 0) +
		hero.trinkets.filter((t) => t.cardId === CardIds.GreatBoarSticker).length * 3 +
		hero.trinkets.filter((t) => t.cardId === CardIds.GreatBoarStickerGreater).length * 4;
	const bloodGemHealth =
		1 +
		(hero.globalInfo?.BloodGemHealthBonus ?? 0) +
		hero.trinkets.filter((t) => t.cardId === CardIds.GreatBoarStickerGreater).length * 4;
	for (let i = 0; i < quantity; i++) {
		modifyStats(target, bloodGemAttack, bloodGemHealth, board, hero, gameState);
		// console.log(
		// 	'\t',
		// 	'playing blood gem',
		// 	gameState.allCards.getCard(source.cardId).name,
		// 	'->',
		// 	gameState.allCards.getCard(target.cardId).name,
		// 	board.map((e) => e.attack).reduce((a, b) => a + b, 0),
		// );
	}

	switch (target.cardId) {
		case CardIds.ToughTusk_BG20_102:
		case CardIds.ToughTusk_BG20_102_G:
			if (!target.divineShield) {
				updateDivineShield(target, board, hero, null, true, gameState);
				gameState.spectator.registerPowerTarget(target, target, board, null, null);
			}
			break;
		case CardIds.GeomagusRoogug_BG28_583:
		case CardIds.GeomagusRoogug_BG28_583_G:
			for (let i = 0; i < quantity; i++) {
				const roogugTargets = board.filter(
					(e) =>
						e.cardId !== CardIds.GeomagusRoogug_BG28_583 && e.cardId !== CardIds.GeomagusRoogug_BG28_583_G,
				);
				const roogugTarget = pickRandom(roogugTargets);
				if (roogugTarget) {
					const roogugBuff = target.cardId === CardIds.GeomagusRoogug_BG28_583_G ? 2 : 1;
					playBloodGemsOn(target, roogugTarget, roogugBuff, board, hero, gameState, false);
				}
			}
			break;
	}
};
