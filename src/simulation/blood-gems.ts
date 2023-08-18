import { AllCardsService } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { afterStatsUpdate, modifyAttack, modifyHealth } from '../utils';
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
};
