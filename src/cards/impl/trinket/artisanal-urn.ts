import { CardIds } from '@firestone-hs/reference-data';
import { BoardTrinket } from '../../../bgs-player-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { StartOfCombatCard } from '../../card.interface';

export const ArtisanalUrn: StartOfCombatCard = {
	cardIds: [CardIds.ArtisanalUrn_ArtisanalUrnToken_BG30_MagicItem_989t],
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		// Not sure why this is not handled as part of the undead attack bonus
		input.playerEntity.globalInfo.UndeadAttackBonus += 8;
		return { hasTriggered: true, shouldRecomputeCurrentAttacker: false };
	},
};
