import { CardIds, GameTag } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { updateDivineShield } from '../../../keywords/divine-shield';
import { updateReborn } from '../../../keywords/reborn';
import { updateStealth } from '../../../keywords/stealth';
import { updateTaunt } from '../../../keywords/taunt';
import { updateVenomous } from '../../../keywords/venomous';
import { updateWindfury } from '../../../keywords/windfury';
import { pickRandom } from '../../../services/utils';
import { BattlecryInput } from '../../../simulation/battlecries';
import { BattlecryCard } from '../../card.interface';
import { validBonusKeywords } from '../../cards-data';

export const BubbleGunner: BattlecryCard = {
	cardIds: [CardIds.BubbleGunner_BG31_149, CardIds.BubbleGunner_BG31_149_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		let possibleKeywords = [...validBonusKeywords];
		const iterations = minion.cardId === CardIds.BubbleGunner_BG31_149_G ? 2 : 1;
		for (let i = 0; i < iterations; i++) {
			const targetKeyword = pickRandom(possibleKeywords);
			possibleKeywords = possibleKeywords.filter((possibleKeyword) => possibleKeyword !== targetKeyword);
			switch (targetKeyword) {
				case GameTag.DIVINE_SHIELD:
					updateDivineShield(minion, input.board, input.hero, input.otherHero, true, input.gameState);
					break;
				case GameTag.TAUNT:
					updateTaunt(minion, true, input.board, input.hero, input.otherHero, input.gameState);
					break;
				case GameTag.VENOMOUS:
					updateVenomous(minion, true, input.board, input.hero, input.otherHero, input.gameState);
					break;
				case GameTag.WINDFURY:
					updateWindfury(minion, true, input.board, input.hero, input.otherHero, input.gameState);
					break;
				case GameTag.STEALTH:
					updateStealth(minion, true, input.board, input.hero, input.otherHero, input.gameState);
					break;
				case GameTag.REBORN:
					updateReborn(minion, true, input.board, input.hero, input.otherHero, input.gameState);
					break;
			}
		}
		return true;
	},
};
