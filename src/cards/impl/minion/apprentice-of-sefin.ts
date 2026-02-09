import { GameTag } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../../../bgs-player-entity';
import { BoardEntity } from '../../../board-entity';
import { updateDivineShield } from '../../../keywords/divine-shield';
import { updateReborn } from '../../../keywords/reborn';
import { updateStealth } from '../../../keywords/stealth';
import { updateTaunt } from '../../../keywords/taunt';
import { updateVenomous } from '../../../keywords/venomous';
import { updateWindfury } from '../../../keywords/windfury';
import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { FullGameState } from '../../../simulation/internal-game-state';
import { modifyStats } from '../../../simulation/stats';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';
import { validBonusKeywords } from '../../cards-data';

export const ApprenticeOfSefin: EndOfTurnCard = {
	cardIds: [CardIds.ApprenticeOfSefin_BG32_332, CardIds.ApprenticeOfSefin_BG32_332_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === CardIds.ApprenticeOfSefin_BG32_332_G ? 2 : 1;
		for (let i = 0; i < mult; i++) {
			grantRandomBonusKeywords(minion, mult, input.board, input.hero, input.otherHero, input.gameState);
		}
		modifyStats(minion, minion, 2 * mult, 2 * mult, input.board, input.hero, input.gameState);
		return true;
	},
};

export const grantRandomBonusKeywords = (
	target: BoardEntity,
	mult: number,
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	otherHero: BgsPlayerEntity,
	gameState: FullGameState,
) => {
	let possibleKeywords = [...validBonusKeywords];
	for (let i = 0; i < mult; i++) {
		if (target.divineShield) {
			possibleKeywords = possibleKeywords.filter((possibleKeyword) => possibleKeyword !== GameTag.DIVINE_SHIELD);
		}
		if (target.taunt) {
			possibleKeywords = possibleKeywords.filter((possibleKeyword) => possibleKeyword !== GameTag.TAUNT);
		}
		if (target.venomous) {
			possibleKeywords = possibleKeywords.filter((possibleKeyword) => possibleKeyword !== GameTag.VENOMOUS);
		}
		if (target.windfury) {
			possibleKeywords = possibleKeywords.filter((possibleKeyword) => possibleKeyword !== GameTag.WINDFURY);
		}
		if (target.stealth) {
			possibleKeywords = possibleKeywords.filter((possibleKeyword) => possibleKeyword !== GameTag.STEALTH);
		}
		if (target.reborn) {
			possibleKeywords = possibleKeywords.filter((possibleKeyword) => possibleKeyword !== GameTag.REBORN);
		}
		if (possibleKeywords.length === 0) {
			continue;
		}
		const targetKeyword = pickRandom(possibleKeywords);
		possibleKeywords = possibleKeywords.filter((possibleKeyword) => possibleKeyword !== targetKeyword);
		switch (targetKeyword) {
			case GameTag.DIVINE_SHIELD:
				updateDivineShield(target, board, hero, otherHero, true, gameState);
				break;
			case GameTag.TAUNT:
				updateTaunt(target, true, board, hero, otherHero, gameState);
				break;
			case GameTag.VENOMOUS:
				updateVenomous(target, true, board, hero, otherHero, gameState);
				break;
			case GameTag.WINDFURY:
				updateWindfury(target, true, board, hero, otherHero, gameState);
				break;
			case GameTag.STEALTH:
				updateStealth(target, true, board, hero, otherHero, gameState);
				break;
			case GameTag.REBORN:
				updateReborn(target, true, board, hero, otherHero, gameState);
				break;
		}
	}
};
