import { CardIds } from '../../../services/card-ids';
import { BoardTrinket } from '../../../bgs-player-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { StartOfCombatCard } from '../../card.interface';

export const ArtisanalUrn: StartOfCombatCard = {
	cardIds: [CardIds.ArtisanalUrn_BG30_MagicItem_989, CardIds.ArtisanalUrn_ArtisanalUrnToken_BG30_MagicItem_989t],
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		// Not sure why this is not handled as part of the undead attack bonus
		const buff = trinket.cardId === CardIds.ArtisanalUrn_BG30_MagicItem_989 ? 4 : 8;
		input.playerEntity.globalInfo.UndeadAttackBonus += buff;
		return { hasTriggered: true, shouldRecomputeCurrentAttacker: false };
	},
};
