import { GameTag } from '@firestone-hs/reference-data';
import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { triggerBattlecry } from '../../../simulation/battlecries';
import { hasEntityMechanic } from '../../../utils';
import { CastSpellInput, TavernSpellCard } from '../../card.interface';

export const SurgingScales: TavernSpellCard = {
	cardIds: [
		CardIds.DraconicDeathscale_SurgingScalesToken_BG29_870t,
		CardIds.DraconicDeathscale_SurgingScalesToken_BG29_870_Gt,
	],
	castTavernSpell: (spellCardId: string, input: CastSpellInput) => {
		const mult = spellCardId === CardIds.DraconicDeathscale_SurgingScalesToken_BG29_870_Gt ? 1 : 2;
		const target =
			input.target ??
			pickRandom(input.board.filter((e) => hasEntityMechanic(e, GameTag.BATTLECRY, input.gameState.allCards)));
		if (!!target) {
			for (let i = 0; i < mult; i++) {
				triggerBattlecry(input.board, input.hero, target, input.otherBoard, input.otherHero, input.gameState);
			}
		}
	},
};
